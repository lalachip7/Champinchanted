package com.lunar_engine.champinchanted;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Controller
public class GameWebSocketController {
    
    @Autowired
    private final SimpMessageSendingOperations messagingTemplate; // Para enviar mensajes a destinos específicos

    @Autowired
    private final GameService gameService;    // Para la gestión de partidas en memoria

    public GameWebSocketController(SimpMessageSendingOperations messagingTemplate, GameService gameService) {
        this.messagingTemplate = messagingTemplate;
        this.gameService = gameService;
    }

   /****************************************************************************************
     * Maneja los mensajes entrantes de los clientes para actualizar el estado del juego.
     * El cliente enviará mensajes a /app/game.update
     * @param gameUpdate El mensaje con las actualizaciones del juego
     * @param headerAccessor Accesor para obtener información de la sesión, como el ID
     */
    @MessageMapping("/game.update")
    public void updateGameState(@Payload GameUpdateMessage gameUpdate, SimpMessageHeaderAccessor headerAccessor) {
        String gameCode = gameUpdate.getGameCode();
        String username = gameUpdate.getUsername();

        // Obtener la partida del servicio
        Optional<Game> optionalGame = gameService.getGame(gameCode);

        if (optionalGame.isPresent()) {
            Game game = optionalGame.get();
            boolean updated = false;

            // Actualizar el estado del jugador 1
            if (game.getUsernamePlayer1() != null && game.getUsernamePlayer1().equals(username)) {
                game.setPlayer1PositionX(gameUpdate.getPositionX());
                game.setPlayer1PositionY(gameUpdate.getPositionY());
                game.setPlayer1Score(gameUpdate.getScore());
                game.setPlayer1Lives(gameUpdate.getLives());
                game.setPlayer1SpellUsed(gameUpdate.getSpellUsed());
                game.setPlayer1FlagStatus(gameUpdate.getFlagStatus());
                updated = true;
            } 
            // Actualizar el estado del jugador 2
            else if (game.getUsernamePlayer2() != null && game.getUsernamePlayer2().equals(username)) {
                game.setPlayer2PositionX(gameUpdate.getPositionX());
                game.setPlayer2PositionY(gameUpdate.getPositionY());
                game.setPlayer2Score(gameUpdate.getScore());
                game.setPlayer2Lives(gameUpdate.getLives());
                game.setPlayer2SpellUsed(gameUpdate.getSpellUsed());
                game.setPlayer2FlagStatus(gameUpdate.getFlagStatus());
                updated = true;
            }

            if (updated) {
                gameService.updateGame(game);
                // Enviar el estado actualizado de la partida a todos los suscriptores del tema de la partida
                messagingTemplate.convertAndSend("/topic/games/" + gameCode, game.toGameStateMessage());
            }
        } else {
            System.err.println("Game not found for code: " + gameCode);
        }
    }

     /****************************************************************************************
     * Maneja la solicitud de un cliente para unirse a una partida.
     * El cliente enviará mensajes a /app/game.join
     * @param joinMessage El mensaje con el nombre de usuario y el código de partida
     * @param headerAccessor Accesor para obtener información de la sesión, como el ID
     */
    @MessageMapping("/game.join")
    public void joinGame(@Payload JoinGameMessage joinMessage, SimpMessageHeaderAccessor headerAccessor) {
        String username = joinMessage.getUsername();
        String gameCode = joinMessage.getGameCode();
        System.out.println("User " + username + " attempting to join game " + gameCode);

        // Almacenar el username y gameCode en los atributos de la sesión WebSocket
        headerAccessor.getSessionAttributes().put("username", username);
        headerAccessor.getSessionAttributes().put("gameCode", gameCode);

        // Unir al usuario a la partida a través del GameService
        Game game = gameService.joinGame(gameCode, username);

        if (game != null) {
            System.out.println("User " + username + " joined game " + gameCode + ". Users connected: " + game.getUsersConnected());

            // Enviar el estado actual de la partida al unirse
            messagingTemplate.convertAndSend("/topic/games/" + gameCode, game.toGameStateMessage());

            // Si ambos jugadores están presentes, la partida está lista para empezar
            if (game.getUsernamePlayer1() != null && game.getUsernamePlayer2() != null) {
                System.out.println("Game " + gameCode + " is now full. Waiting for character/map selection...");
                // No se inicia aquí, se espera la selección de personajes y mapa.
                // El inicio real se manejará cuando ambos estén "listos" en PersonajesGameOnline.
            }
        } else {
            System.err.println("Failed to join game: " + gameCode + " for user: " + username);
            messagingTemplate.convertAndSendToUser(username, "/queue/errors", "Failed to join game " + gameCode);
        }
    }

    /****************************************************************************************
     * Maneja la solicitud de un cliente para seleccionar un mapa.
     * El cliente enviará mensajes a /app/game.selectMap
     * @param selectMapMessage El mensaje con el código de partida, el nombre de usuario y el ID del mapa
     */
    @MessageMapping("/game.selectMap")
    public void selectMap(@Payload SelectMapMessage selectMapMessage) {
        String gameCode = selectMapMessage.getGameCode();
        String username = selectMapMessage.getUsername();
        int mapId = selectMapMessage.getMapId();

        Optional<Game> optionalGame = gameService.getGame(gameCode);

        if (optionalGame.isPresent()) {
            Game game = optionalGame.get();
            // Solo permite al jugador 1 (o al host inicial) seleccionar el mapa
            if (game.getUsernamePlayer1() != null && game.getUsernamePlayer1().equals(username)) {
                if (game.getMap() == -1) { // Solo si el mapa no ha sido seleccionado aún
                    game.setMap(mapId);
                    gameService.updateGame(game); // Actualizar en el servicio (y repositorio)
                    System.out.println("User " + username + " selected map " + mapId + " for game " + gameCode);
                    // Notificar a todos los suscriptores del tema de la partida el mapa seleccionado
                    messagingTemplate.convertAndSend("/topic/games/" + gameCode, game.toGameStateMessage());
                } else {
                    System.out.println("Map already selected for game " + gameCode + " by " + game.getUsernamePlayer1());
                }
            } else {
                System.out.println("User " + username + " is not authorized to select map for game " + gameCode);
            }
        } else {
            System.err.println("Game not found for code: " + gameCode + " for map selection.");
        }
    }

    /****************************************************************************************
     * Maneja la solicitud de un cliente para seleccionar un personaje.
     * El cliente enviará mensajes a /app/game.selectCharacter
     * @param selectCharacterMessage El mensaje con el código de partida, el nombre de usuario y el ID del personaje
     */
    @MessageMapping("/game.selectCharacter")
    public void selectCharacter(@Payload SelectCharacterMessage selectCharacterMessage) {
        String gameCode = selectCharacterMessage.getGameCode();
        String username = selectCharacterMessage.getUsername();
        int characterId = selectCharacterMessage.getCharacterId();

        Optional<Game> optionalGame = gameService.getGame(gameCode);

        if (optionalGame.isPresent()) {
            Game game = optionalGame.get();
            boolean updated = false;

            if (game.getUsernamePlayer1() != null && game.getUsernamePlayer1().equals(username)) {
                game.setPlayer1(characterId);
                System.out.println("Player 1 (" + username + ") selected character " + characterId + " for game " + gameCode);
                updated = true;
            } else if (game.getUsernamePlayer2() != null && game.getUsernamePlayer2().equals(username)) {
                game.setPlayer2(characterId);
                System.out.println("Player 2 (" + username + ") selected character " + characterId + " for game " + gameCode);
                updated = true;
            }

            if (updated) {
                gameService.updateGame(game); // Actualizar en el servicio (y repositorio)
                // Notificar a todos los suscriptores del tema de la partida el personaje seleccionado
                messagingTemplate.convertAndSend("/topic/games/" + gameCode, game.toGameStateMessage());
            }
        } else {
            System.err.println("Game not found for code: " + gameCode + " for character selection.");
        }
    }

    /****************************************************************************************
     * Maneja la solicitud de un cliente para establecer su estado de "listo".
     * El cliente enviará mensajes a /app/game.readyStatus
     * @param readyMessage El mensaje con el código de partida, el nombre de usuario y el estado de listo
     */
    @MessageMapping("/game.readyStatus")
    public void setReadyStatus(@Payload SelectCharacterMessage readyMessage) { // Reutilizamos SelectCharacterMessage
        String gameCode = readyMessage.getGameCode();
        String username = readyMessage.getUsername();
        boolean isReady = readyMessage.isReady(); // Asumiendo que SelectCharacterMessage ahora tiene isReady

        Optional<Game> optionalGame = gameService.getGame(gameCode);

        if (optionalGame.isPresent()) {
            Game game = optionalGame.get();
            boolean updated = false;

            if (game.getUsernamePlayer1() != null && game.getUsernamePlayer1().equals(username)) {
                game.setPlayer1Ready(isReady); // Necesitarás un setPlayer1Ready en tu clase Game
                updated = true;
            } else if (game.getUsernamePlayer2() != null && game.getUsernamePlayer2().equals(username)) {
                game.setPlayer2Ready(isReady); // Necesitarás un setPlayer2Ready en tu clase Game
                updated = true;
            }

            if (updated) {
                gameService.updateGame(game);
                messagingTemplate.convertAndSend("/topic/games/" + gameCode, game.toGameStateMessage());

                // Lógica para iniciar la partida si ambos están listos y con personajes seleccionados
                if (game.isPlayer1Ready() && game.isPlayer2Ready() && game.getPlayer1() != -1 && game.getPlayer2() != -1 && game.getMap() != -1) {
                    System.out.println("Ambos jugadores listos y personajes/mapa seleccionados. Iniciando partida " + gameCode);
                    StartGameMessage startGameMessage = new StartGameMessage(
                        game.getCode(),
                        game.getUsernamePlayer1(),
                        game.getPlayer1(),
                        game.getUsernamePlayer2(),
                        game.getPlayer2(),
                        game.getMap()
                    );
                    messagingTemplate.convertAndSend("/topic/games/" + gameCode + "/start", startGameMessage);
                }
            }
        } else {
            System.err.println("Game not found for code: " + gameCode + " for ready status update.");
        }
    }

    /****************************************************************************************
     * Maneja la solicitud de un cliente para obtener el estado actual de la partida.
     * Esto es útil para sincronizar clientes que se unen a una partida existente.
     * El cliente enviará mensajes a /app/game.requestState
     * @param message El mensaje con el código de partida
     */
    @MessageMapping("/game.requestState")
    public void requestGameState(@Payload GameUpdateMessage message) { // Reutilizamos GameUpdateMessage para gameCode
        String gameCode = message.getGameCode();
        Optional<Game> optionalGame = gameService.getGame(gameCode);

        if (optionalGame.isPresent()) {
            Game game = optionalGame.get();
            messagingTemplate.convertAndSend("/topic/games/" + gameCode, game.toGameStateMessage());
            System.out.println("Estado de partida solicitado para " + gameCode + " enviado.");
        } else {
            System.err.println("No se encontró la partida para la solicitud de estado: " + gameCode);
        }
    }

    /****************************************************************************************
     * Maneja el evento de desconexión de una sesión WebSocket.
     * @param event El evento de desconexión de la sesión
     */
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.wrap(event.getMessage());

        String username = (String) headerAccessor.getSessionAttributes().get("username");
        String gameCode = (String) headerAccessor.getSessionAttributes().get("gameCode");

        if (username != null && gameCode != null) {
            System.out.println("User Disconnected: " + username + " from game " + gameCode);

            // Actualizar el estado de la partida en el servicio
            Game game = gameService.disconnectUserFromGame(gameCode, username);

            if (game == null) {     // Si la partida ha sido eliminada del servicio (0 usuarios)
                System.out.println("Game " + gameCode + " is now empty and removed.");
                // Notifica a los clientes restantes que la partida se ha vaciado
                messagingTemplate.convertAndSend("/topic/games/" + gameCode, new PlayerDisconnectedMessage(gameCode, username));
            } else {                // Si la partida aún existe con al menos un usuario
                System.out.println("Game " + gameCode + " now has " + game.getUsersConnected() + " user(s).");
                PlayerDisconnectedMessage disconnectedMessage = new PlayerDisconnectedMessage(gameCode, username);
                messagingTemplate.convertAndSend("/topic/games/" + gameCode, disconnectedMessage);
            }
        }
    }
}
