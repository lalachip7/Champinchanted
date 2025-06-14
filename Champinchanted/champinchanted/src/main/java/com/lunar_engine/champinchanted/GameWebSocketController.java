package com.lunar_engine.champinchanted;

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
        // -- LOG 1: Para ver si el método se está ejecutando --
        System.out.println(
                "LOG 1: Recibido selectMap para partida " + message.getGameCode() + " con mapa " + message.getMapId());

        // Guarda el mapa elegido en el servidor
        gameService.setGameMap(message.getGameCode(), message.getMapId()).ifPresent(updatedGame -> {

            // -- LOG 2: Para ver si la partida se encontró y actualizó --
            System.out.println("LOG 2: Partida encontrada. Preparando mensaje de inicio...");

            StartGameMessage proceedMessage = new StartGameMessage();
            proceedMessage.setGameCode(updatedGame.getCode());
            proceedMessage.setMapId(updatedGame.getMap());
            // Necesitamos pasar los nombres de usuario para la siguiente pantalla
            proceedMessage.setPlayer1Username(updatedGame.getUsernamePlayer1());
            proceedMessage.setPlayer2Username(updatedGame.getUsernamePlayer2());

            // -- LOG 3: Para ver si el mensaje está a punto de ser enviado --
            System.out.println("LOG 3: Enviando mensaje de inicio a /topic/games/" + updatedGame.getCode() + "/start");

            // Envía un mensaje al topic "start". Ambos jugadores lo recibirán y avanzarán.
            messagingTemplate.convertAndSend("/topic/games/" + updatedGame.getCode() + "/start", proceedMessage);
        });
    }
}
