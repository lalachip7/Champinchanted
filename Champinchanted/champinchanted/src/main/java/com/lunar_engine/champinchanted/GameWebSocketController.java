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
        System.out.println("\n--- [DEBUG] Se recibió un mensaje de selección de personaje ---");
        System.out.println("[DEBUG] Partida: " + message.getGameCode() + ", Usuario del mensaje: '"
                + message.getUsername() + "', Personaje ID: " + message.getCharacterId());

        gameService.getGame(message.getGameCode()).ifPresentOrElse(game -> {
            System.out.println("[DEBUG] Partida encontrada. Estado actual en el servidor:");
            System.out.println("  - Jugador 1 guardado: '" + game.getUsernamePlayer1() + "'");
            System.out.println(
                    "  - Jugador 2 guardado: '" + game.getUsernamePlayer2() + "'   <-- ¡¡ESTA LÍNEA ES CLAVE!!");

            boolean identified = false;

            // Comparamos con el jugador 1
            if (message.getUsername().equals(game.getUsernamePlayer1())) {
                System.out.println("[DEBUG] >> Coincidencia: El usuario es el Jugador 1.");
                game.setPlayer1Character(message.getCharacterId());
                identified = true;
            }
            // Comparamos con el jugador 2
            else if (message.getUsername().equals(game.getUsernamePlayer2())) {
                System.out.println("[DEBUG] >> Coincidencia: El usuario es el Jugador 2.");
                game.setPlayer2Character(message.getCharacterId());
                identified = true;
            }

            if (identified) {
                System.out.println("[DEBUG] >> Jugador identificado. Guardando y retransmitiendo estado...");
                gameService.updateGame(game);
                messagingTemplate.convertAndSend("/topic/games/" + game.getCode(), game.toLobbyData());
                System.out.println("[DEBUG] >> Estado retransmitido con éxito.");
            } else {
                System.err.println("[DEBUG] !! ERROR CRÍTICO: No se pudo identificar al jugador '"
                        + message.getUsername() + "' en la partida. No se retransmite nada.");
            }
        },
                () -> {
                    System.err.println("[DEBUG] !! ERROR CRÍTICO: No se encontró ninguna partida con el código: "
                            + message.getGameCode());
                });
        System.out.println("--- [DEBUG] Fin del procesamiento del mensaje ---\n");
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

        @MessageMapping("/game.collectFlag")
    public void collectFlag(@Payload Map<String, String> payload) {
        String gameCode = payload.get("gameCode");
        String username = payload.get("username");
        gameService.collectFlag(gameCode, username);
    }

    // ▼▼▼ AÑADE ESTE MÉTODO ▼▼▼
    @MessageMapping("/game.collectSpell")
    public void collectSpell(@Payload Map<String, String> payload) {
        String gameCode = payload.get("gameCode");
        String username = payload.get("username");
        String spellType = payload.get("spellType");
        gameService.collectSpell(gameCode, username, spellType);
    }

    @MessageMapping("/game.updateState")
    public void updateState(@Payload GameUpdateMessage message) {
        // Usamos el GameService para actualizar el estado del jugador en el servidor
        gameService.updatePlayerState(message.getGameCode(), message.getUsername(), message.toPlayerState());

        // Retransmitimos el estado COMPLETO y actualizado de la partida a ambos
        // jugadores
        gameService.getGame(message.getGameCode()).ifPresent(game -> {
            messagingTemplate.convertAndSend("/topic/gameplay/" + game.getCode(), game.toGameStateMessage());
        });
    }
}
