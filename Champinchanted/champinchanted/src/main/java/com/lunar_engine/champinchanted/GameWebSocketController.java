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
        // --- LOG DE DEPURACIÓN EN EL SERVIDOR ---
        System.out.println(">>> RECIBIDO en /chat.addUser: Usuario '" + chatMessage.getSender() + "' se une a la sala '" + chatMessage.getGameCode() + "'");

        // 1. Guarda los datos del usuario en la sesión.
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("gameCode", chatMessage.getGameCode());

        // 2. Crea y envía el AVISO DE CONEXIÓN al nuevo canal de notificaciones.
        String notificationContent = chatMessage.getSender() + " se ha unido a la sala.";
        NotificationMessage notification = new NotificationMessage(notificationContent);
        
        // --- LOG DE DEPURACIÓN EN EL SERVIDOR ---
        System.out.println(">>> ENVIANDO a /topic/notifications/" + chatMessage.getGameCode() + " | Contenido: " + notificationContent);

        messagingTemplate.convertAndSend("/topic/notifications/" + chatMessage.getGameCode(), notification);
    }
    
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/topic/chat/" + chatMessage.getGameCode(), chatMessage);
    }

    @MessageMapping("/game.readyStatus")
    public void setReadyStatus(@Payload ReadyStatusMessage readyMessage) {
        gameService.getGame(readyMessage.getGameCode()).ifPresent(game -> {
            if (readyMessage.getUsername().equals(game.getUsernamePlayer1())) {
                game.setPlayer1Ready(readyMessage.isReady());
            } else if (readyMessage.getUsername().equals(game.getUsernamePlayer2())) {
                game.setPlayer2Ready(readyMessage.isReady());
            }
            gameService.updateGame(game);
            messagingTemplate.convertAndSend("/topic/games/" + game.getCode(), game.toGameStateMessage());

            if (game.isPlayer1Ready() && game.isPlayer2Ready() && game.getPlayer1Character() != -1 && game.getPlayer2Character() != -1 && game.getMap() != -1) {
                StartGameMessage startGameMessage = new StartGameMessage(
                        game.getCode(), game.getUsernamePlayer1(), game.getPlayer1Character(),
                        game.getUsernamePlayer2(), game.getPlayer2Character(), game.getMap()
                );
                messagingTemplate.convertAndSend("/topic/games/" + game.getCode() + "/start", startGameMessage);
            }
        });
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String gameCode = (String) headerAccessor.getSessionAttributes().get("gameCode");
        
        if (username != null && gameCode != null) {
            // --- LOG DE DEPURACIÓN EN EL SERVIDOR ---
            System.out.println(">>> DESCONEXIÓN: Usuario '" + username + "' de la sala '" + gameCode + "'");
            
            String notificationContent = username + " se ha desconectado.";
            NotificationMessage notification = new NotificationMessage(notificationContent);
            
            // --- LOG DE DEPURACIÓN EN EL SERVIDOR ---
            System.out.println(">>> ENVIANDO a /topic/notifications/" + gameCode + " | Contenido: " + notificationContent);

            messagingTemplate.convertAndSend("/topic/notifications/" + gameCode, notification);

            // Actualizar el estado del juego.
            Game gameAfterDisconnect = gameService.disconnectUserFromGame(gameCode, username);
            String status = (gameAfterDisconnect == null) ? "Game Over" : "Player Disconnected";
            PlayerDisconnectedMessage disconnectedMessage = new PlayerDisconnectedMessage(gameCode, username, status);
            messagingTemplate.convertAndSend("/topic/games/" + gameCode, disconnectedMessage);
        }
    }
}
