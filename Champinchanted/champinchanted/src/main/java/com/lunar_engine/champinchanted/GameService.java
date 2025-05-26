package com.lunar_engine.champinchanted;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class GameService {

    private final Map<String, Game> activeGames;    // Almacena las partidas activas en memoria
    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.activeGames = new ConcurrentHashMap<>();
        this.gameRepository = gameRepository;
    }

    /**
     * Se ejecuta automáticamente después de que se construya el bean GameService
     */
    @PostConstruct
    public void loadGamesOnStartup() {
        System.err.println("Cargando partidas existentes desde el repositorio...");
        try {
            gameRepository.getGames().forEach(game -> {
                // Solo carga partidas que tengan al menos 1 usuario conectado.
                // Si una partida guardada tenía 0 usuarios, no la carga como activa.
                if (game.getUsersConnected() > 0 || game.getUsernamePlayer1() != null || game.getUsernamePlayer2() != null) {
                    activeGames.put(game.getCode(), game);
                    System.out.println("Partida '" + game.getCode() + "' cargada con " + game.getUsersConnected() + " usuarios.");
                } else {
                    // Si una partida guardada no tiene usuarios conectados y no está "pendiente", la podemos eliminar del disco.
                    gameRepository.deleteGame(game.getCode());
                    System.out.println("Partida inactiva '" + game.getCode() + "' eliminada del disco.");
                }
            });
            System.out.println("Carga de partidas completada. Partidas activas en memoria: " + activeGames.size());
        } catch (IOException e) {
            System.err.println("Error al cargar partidas en el inicio: " + e.getMessage());
        }
    }


    /**
     * Crea una nueva partida y la añade a las partidas activas
     * @param username Nombre de usuario del creador de la partida
     * @return El objeto Game creaado o null si hay un error
     */
    public Game createGame(String username) {
        String code = generateUniqueGameCode();
        Game game = new Game(username, code); 
        activeGames.put(code, game);
        gameRepository.createGame(game);
        System.out.println("Partida creada: " + game.getCode() + " por " + username);
        return game;
    }

      /**
     * Añade una partida existente al mapa de partidas activas en memoria.
     * Útil para cargar partidas desde el repositorio.
     * @param game El objeto Game a añadir.
     */
    public void addGame(Game game) {
        activeGames.put(game.getCode(), game);
        System.out.println("Partida '" + game.getCode() + "' añadida a la memoria de partidas activas.");
    }

    /**
     * Intenta unir un usuario a una partiida existente
     * @param gameCode Código de la partida
     * @param username Nombre del usuario que se une
     * @param characterId
     * @return El objeto Game actualizado su la unión fue exitosa
     */
    public Game joinGame(String gameCode, String usernamePlayer2) {
        Game game = activeGames.get(gameCode);  

        if (game != null && game.getUsernamePlayer2() == null) {    
            game.setUsernamePlayer2(usernamePlayer2);   
            game.setUsersConnected(game.getUsersConnected() + 1);   
            gameRepository.saveGame(game);  
            System.out.println("User " + usernamePlayer2 + " joined game " + gameCode);
            return game;   
        }
        System.out.println("Failed to join game " + gameCode + " for user " + usernamePlayer2);
        return null;    
    }


    /****************************************************************************************
     * Establece el personaje para un jugador en una partida existente
     * @param gameCode Código de la partida
     * @param username Nombre de usuario del jugador
     * @param characterId ID del personaje
     * @return true si el personaje fue establecido con éxito, false en caso contrario
     */
    public boolean setPlayerCharacter(String gameCode, String username, int characterId) {
        Game game = activeGames.get(gameCode);
        if (game == null) {
            return false;
        }

        boolean updated = false;
        if (game.getUsernamePlayer1() != null && game.getUsernamePlayer1().equals(username)) {
            game.setPlayer1(characterId);
            updated = true;
        } else if (game.getUsernamePlayer2() != null && game.getUsernamePlayer2().equals(username)) {
            game.setPlayer2(characterId);
            updated = true;
        }

        if (updated) {
            gameRepository.saveGame(game);
            System.out.println("Character " + characterId + " set for user " + username + " in game " + gameCode);
            return true;
        }
        return false;
    }

    /****************************************************************************************
     * Establece el ID del mapa para una partida
     * @param gameCode Código de la partida
     * @param mapId ID del mapa
     * @return true si el mapa fue establecido con éxito, false en caso contrario
     */
    public boolean setGameMap(String gameCode, int mapId) {
        Game game = activeGames.get(gameCode);
        if (game != null) {
            game.setMap(mapId);
            gameRepository.saveGame(game);
            System.out.println("Map " + mapId + " set for game " + gameCode);
            return true;
        }
        System.out.println("Failed to set map for game " + gameCode + ": game not found.");
        return false;
    }

    /****************************************************************************************
     * Recupera una partida específica dado su código
     * @param gameCode Código de la partida
     * @return Un Optional que contiene el objeto Game si se encuentra, o un Optional vacío
     * si no
     */
    public Optional<Game> getGame(String gameCode) {
        // Primero busca en las partidas activas en memoria
        Game game = activeGames.get(gameCode);
        if (game != null) {
            return Optional.of(game);
        }
        // Si no está en memoria, intenta cargarlo desde el repositorio
        Optional<Game> storedGame = gameRepository.getGame(gameCode);
        storedGame.ifPresent(g -> activeGames.put(gameCode, g)); // Carga la partida en memoria si se encuentra
        return storedGame;
    }

    /****************************************************************************************
     * Actualiza el estado de una partida en memoria y la persiste en el repositorio
     * @param game El objeto Game con el estado actualizado
     */
    public void updateGame(Game game) {
        activeGames.put(game.getCode(), game);  // Actualiza el mapa de partidas activas
        gameRepository.saveGame(game);          // Persiste el cambio en el repositorio
    }

    /**
     * Actualiza el personaje de un jugador en una partida
     * @param gameCode Código de la partida
     * @param username Nombre de usuario del jugador
     * @param characterId ID del personaje seleccionado
     * @return true si se actualizó con éxito, false si no
     
    public boolean updatePlayerCharacter(String gameCode, String username, int characterId) {
        Game game = activeGames.get(gameCode);
        if (game != null) {
            synchronized (game) {
                if (username.equals(game.getUsernamePlayer1())) {
                    game.setPlayer1(characterId);
                    System.out.println("Player1 character set to " + characterId + " in game " + gameCode);
                    return true;
                } else if (username.equals(game.getUsernamePlayer2())) {
                    game.setPlayer2(characterId);
                    System.out.println("Player2 character set to " + characterId + " in game " + gameCode);
                    return true;
                }
            }
        }
        System.out.println("Failed to set character " + characterId + " for user " + username + " in game " + gameCode);
        return false;
    }*/

    /**
     * Actualiza el mapa de una partida
     * @param gameCode Código de la partida
     * @param mapId ID del mapa seleccionado
     * @return true si se actualizó con éxito, false si no
     
    public boolean updateGameMap(String gameCode, int mapId) {
        Game game = activeGames.get(gameCode);
        if (game != null) {
            synchronized (game) {
                game.setMap(mapId);
                System.out.println("Map set to " + mapId + " in game " + gameCode);
                return true;
            }
        }
        System.out.println("Failed to set map " + mapId + " in game " + gameCode);
        return false;
    }*/

    /**
     * Actualiza el estado de un jugador dentro de una partida
     * @param gameUpdate Mensaje GameUpdateMessage
     * @return Objeto Game actualizado si existe o null
     
    public Game updateGameState(GameUpdateMessage gameUpdate) {
        Game game = activeGames.get(gameUpdate.getGameCode());
        if (game != null) {
            synchronized (game) {
                if (gameUpdate.getUsername().equals(game.getUsernamePlayer1())) {
                    game.setPlayer1PositionX(gameUpdate.getPositionX());
                    game.setPlayer1PositionY(gameUpdate.getPositionY());
                    game.setPlayer1Score(gameUpdate.getScore());
                    game.setPlayer1Lives(gameUpdate.getLives());
                    game.setPlayer1SpellUsed(gameUpdate.getSpellUsed());
                    game.setPlayer1FlagStatus(gameUpdate.getFlagStatus());
                    System.out.println("Player1 state updated for game " + game.getCode());
                } else if (gameUpdate.getUsername().equals(game.getUsernamePlayer2())) {
                    game.setPlayer2PositionX(gameUpdate.getPositionX());
                    game.setPlayer2PositionY(gameUpdate.getPositionY());
                    game.setPlayer2Score(gameUpdate.getScore());
                    game.setPlayer2Lives(gameUpdate.getLives());
                    game.setPlayer2SpellUsed(gameUpdate.getSpellUsed());
                    game.setPlayer2FlagStatus(gameUpdate.getFlagStatus());
                    System.out.println("Player2 state updated for game " + game.getCode());
                } else {
                    System.out.println("GameUpdateMessage received from invalid user " + gameUpdate.getUsername() + " for game " + game.getCode());
                    return null; // El usuario no pertenece a esta partida
                }
                return game; // Devuelve la partida con el estado actualizado
            }
        }
        System.out.println("Game not found for update: " + gameUpdate.getGameCode());
        return null;
    }*/

    /****************************************************************************************
     * Elimina una partida de las partidas activas y del repositorio
     * @param gameCode Código de la partida a eliminar
     */
    public void removeGame(String gameCode) {
        activeGames.remove(gameCode);       // Elimina la partida del mapa de partidas activas
        gameRepository.deleteGame(gameCode);    // Elimina la partida del repositorio
        System.out.println("Partida " + gameCode + " eliminada.");
    }

     /****************************************************************************************
     * Desconecta a un usuario de una partida, actualizando su estado en la partida
     * @param gameCode Código de la partida
     * @param username Nombre de usuario del jugador a desconectar
     * @return El objeto Game actualizado después de la desconexión, o null si la partida se
     * eliminó porque no quedan usuarios
     */
    public Game disconnectUserFromGame(String gameCode, String username) {
        Game game = activeGames.get(gameCode);
        if (game != null) {
            synchronized (game) {   // Sincroniza sobre el objeto de juego para evitar condiciones de carrera
                boolean userFound = false;
                if (username.equals(game.getUsernamePlayer1())) {
                    game.setUsernamePlayer1(null);                  // Marcar como desconectado
                    game.setPlayer1(-1);                            // Reiniciar personaje
                    game.setUsersConnected(game.getUsersConnected() - 1);
                    userFound = true;
                } else if (username.equals(game.getUsernamePlayer2())) {
                    game.setUsernamePlayer2(null);                 // Marcar como desconectado
                    game.setPlayer2(-1);                                    // Reiniciar personaje
                    game.setUsersConnected(game.getUsersConnected() - 1);
                    userFound = true;
                }

                if (userFound) {
                    if (game.getUsersConnected() <= 0) {
                        removeGame(gameCode);               // Si no quedan usuarios, eliminar la partida
                        return null;                        // La partida se eliminó
                    }
                    gameRepository.saveGame(game);          // Persiste el cambio de estado
                    System.out.println("User " + username + " disconnected from game " + gameCode + ". Users remaining: " + game.getUsersConnected());
                    return game;        // Devuelve el estado actualizado de la partida
                }
            }
        }
        System.out.println("Attempted to disconnect user " + username + " from non-existent/invalid game " + gameCode);
        return null;
    }

    // Método auxiliar para generar códigos de partida únicos
    private String generateUniqueGameCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (activeGames.containsKey(code) || gameRepository.getGame(code).isPresent());
        return code;
    }
}
