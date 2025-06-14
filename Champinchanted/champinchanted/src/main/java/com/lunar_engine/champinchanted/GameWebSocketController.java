package com.lunar_engine.champinchanted;

import java.util.Map;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Controller
public class GameWebSocketController {
    private final SimpMessageSendingOperations messagingTemplate;
    private final GameService gameService;

    public GameWebSocketController(SimpMessageSendingOperations messagingTemplate, GameService gameService) {
        this.messagingTemplate = messagingTemplate;
        this.gameService = gameService;
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("gameCode", chatMessage.getGameCode());

        Game game = gameService.getGame(chatMessage.getGameCode()).orElseThrow();
        int playerCount = game.getPlayerCount();

        String notificationContent = chatMessage.getSender() + " se ha unido a la sala.";

        NotificationMessage notification = new NotificationMessage(notificationContent, playerCount);

        messagingTemplate.convertAndSend("/topic/notifications/" + chatMessage.getGameCode(), notification);
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getGameCode(), chatMessage);
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String gameCode = (String) headerAccessor.getSessionAttributes().get("gameCode");

        if (username != null && gameCode != null) {
            Game gameAfterDisconnect = gameService.disconnectUserFromGame(gameCode, username);

            int playerCount = (gameAfterDisconnect != null) ? gameAfterDisconnect.getPlayerCount() : 0;

            String notificationContent = username + " se ha desconectado.";
            NotificationMessage notification = new NotificationMessage(notificationContent, playerCount);

            messagingTemplate.convertAndSend("/topic/notifications/" + gameCode, notification);

            String status = (gameAfterDisconnect == null) ? "Game Over" : "Player Disconnected";
            PlayerDisconnectedMessage disconnectedMessage = new PlayerDisconnectedMessage(gameCode, username, status);
            messagingTemplate.convertAndSend("/topic/games/" + gameCode, disconnectedMessage);
        }
    }

    @MessageMapping("/game.selectMap")
    public void selectMap(@Payload SelectMapMessage message) {
        // Guarda el mapa elegido en el servidor
        gameService.setGameMap(message.getGameCode(), message.getMapId()).ifPresent(updatedGame -> {

            // --- ESTA ES LA LÍNEA CLAVE DE LA CORRECCIÓN ---
            // Creamos el mensaje con TODOS los datos necesarios para la siguiente pantalla
            StartGameMessage proceedMessage = new StartGameMessage(
                    updatedGame.getCode(),
                    updatedGame.getUsernamePlayer1(),
                    -1, // El personaje P1 aún no se ha elegido
                    updatedGame.getUsernamePlayer2(),
                    -1, // El personaje P2 aún no se ha elegido
                    updatedGame.getMap());

            // Envía el mensaje completo al topic "start"
            messagingTemplate.convertAndSend("/topic/games/" + updatedGame.getCode() + "/start", proceedMessage);
        });
    }

    /**
     * Se ejecuta cuando un jugador selecciona un personaje.
     */
    @MessageMapping("/game.selectCharacter")
    public void selectCharacter(@Payload SelectCharacterMessage message) {
        gameService.getGame(message.getGameCode()).ifPresent(game -> {

            // --- LÓGICA CORREGIDA Y MÁS SEGURA ---
            int playerNumber = 0; // Por defecto es 0 (inválido)

            if (message.getUsername().equals(game.getUsernamePlayer1())) {
                playerNumber = 1;
            } else if (message.getUsername().equals(game.getUsernamePlayer2())) {
                playerNumber = 2;
            }

            // Solo procedemos si hemos identificado al jugador correctamente
            if (playerNumber > 0) {
                // Actualizamos la selección en el estado del juego en el servidor
                gameService.setPlayerCharacter(message.getGameCode(), playerNumber, message.getCharacterId());

                // ¡CLAVE! Retransmitimos el estado actualizado a TODOS en la sala.
                // Así, el otro jugador se entera de la selección.
                messagingTemplate.convertAndSend("/topic/games/" + game.getCode(), game.toLobbyData());
            } else {
                System.err.println("Error: No se pudo identificar al jugador '" + message.getUsername()
                        + "' en la partida " + message.getGameCode());
            }
        });
    }

    /**
     * Se ejecuta cuando un jugador pulsa el botón "Listo".
     */
    @MessageMapping("/game.ready")
    public void setPlayerReady(@Payload Map<String, String> payload) {
        String gameCode = payload.get("gameCode");
        String username = payload.get("username");

        gameService.getGame(gameCode).ifPresent(game -> {
            if (username.equals(game.getUsernamePlayer1())) {
                game.setPlayer1Ready(true);
            } else if (username.equals(game.getUsernamePlayer2())) {
                game.setPlayer2Ready(true);
            }
            gameService.updateGame(game);

            // Notificamos a todos que un jugador está listo
            messagingTemplate.convertAndSend("/topic/games/" + game.getCode(), game.toLobbyData());

            // Si AMBOS están listos, se inicia la partida
            if (game.isPlayer1Ready() && game.isPlayer2Ready()) {
                StartGameMessage startGameMessage = new StartGameMessage(
                        game.getCode(),
                        game.getUsernamePlayer1(), game.getPlayer1Character(),
                        game.getUsernamePlayer2(), game.getPlayer2Character(),
                        game.getMap());
                // Enviamos a un topic diferente para que los clientes sepan que empieza el
                // juego real
                messagingTemplate.convertAndSend("/topic/games/" + game.getCode() + "/gameplay_start",
                        startGameMessage);
            }
        });
    }
}
