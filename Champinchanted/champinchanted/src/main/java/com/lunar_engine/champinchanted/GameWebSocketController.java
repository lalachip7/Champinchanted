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
        gameService.setGameMap(message.getGameCode(), message.getMapId()).ifPresent(updatedGame -> {
            StartGameMessage proceedMessage = new StartGameMessage();
            proceedMessage.setGameCode(updatedGame.getCode());
            proceedMessage.setMapId(updatedGame.getMap());
            messagingTemplate.convertAndSend("/topic/games/" + updatedGame.getCode() + "/mapSelected", proceedMessage);
        });
    }
}
