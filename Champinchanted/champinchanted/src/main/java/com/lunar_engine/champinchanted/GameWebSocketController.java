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

    /****************************************************************************************
     * NUEVO MÉTODO PARA EL CHAT
     * Maneja un mensaje de chat enviado por un cliente.
     * El cliente enviará mensajes a /app/chat.sendMessage
     * @param chatMessage El mensaje de chat que contiene el remitente, el contenido y el código de la partida.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // Retransmite el mensaje recibido al topic de chat específico de la partida.
        // Todos los clientes suscritos a /topic/chat/{gameCode} recibirán este mensaje.
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
            System.out.println("WebSocket Disconnected: " + username + " from game " + gameCode);
            Game gameAfterDisconnect = gameService.disconnectUserFromGame(gameCode, username);
            
            // Notifica a los clientes sobre la desconexión
            String status = (gameAfterDisconnect == null) ? "Game Over" : "Player Disconnected";
            PlayerDisconnectedMessage disconnectedMessage = new PlayerDisconnectedMessage(gameCode, username, status);
            messagingTemplate.convertAndSend("/topic/games/" + gameCode, disconnectedMessage);
        }
    }
    
    // El resto de los métodos (@MessageMapping) pueden quedarse como estaban en la versión anterior.
    // Asegúrate de que llaman a los métodos correspondientes en el GameService.
}
