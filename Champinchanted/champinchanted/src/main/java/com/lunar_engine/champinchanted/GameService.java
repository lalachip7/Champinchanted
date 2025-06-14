package com.lunar_engine.champinchanted;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class GameService {

    private final Map<String, Game> activeGames;
    private final GameRepository gameRepository;
    private final SimpMessageSendingOperations messagingTemplate;

    public GameService(GameRepository gameRepository, SimpMessageSendingOperations messagingTemplate) {
        this.activeGames = new ConcurrentHashMap<>();
        this.gameRepository = gameRepository;
        this.messagingTemplate = messagingTemplate; // Asignarlo aquí
    }

    @PostConstruct
    public void loadGamesOnStartup() {
        System.err.println("Cargando lobbies existentes desde el repositorio...");
        try {
            gameRepository.getGames().forEach(lobbyData -> {
                if (lobbyData.getUsersConnected() > 0) {
                    activeGames.put(lobbyData.getCode(), new Game(lobbyData));
                    System.out.println("Lobby '" + lobbyData.getCode() + "' cargado en memoria.");
                } else {
                    gameRepository.deleteGame(lobbyData.getCode());
                }
            });
        } catch (IOException e) {
            System.err.println("Error al cargar partidas en el inicio: " + e.getMessage());
        }
    }

    public Game createGame(String username) {
        String code = generateUniqueGameCode();
        Game game = new Game(username, code);
        activeGames.put(code, game);
        gameRepository.saveGame(game.toLobbyData());
        System.out.println("Partida creada: " + game.getCode());
        return game;
    }

    public Optional<Game> joinGame(String gameCode, String usernamePlayer2) {
        Game game = activeGames.get(gameCode);
        if (game != null && game.getUsernamePlayer2() == null) {
            game.setUsernamePlayer2(usernamePlayer2);
            game.setUsersConnected(2);
            updateGame(game);
            return Optional.of(game);
        }
        return Optional.empty();
    }

    public void updateGame(Game game) {
        if (game != null) {
            activeGames.put(game.getCode(), game);
            gameRepository.saveGame(game.toLobbyData());
        }
    }

    public Game disconnectUserFromGame(String gameCode, String username) {
        Game game = activeGames.get(gameCode);
        if (game != null) {
            boolean playerLeft = false;
            // Si se va el jugador 1
            if (username.equals(game.getUsernamePlayer1())) {
                game.setUsernamePlayer1(null);
                game.setUsersConnected(game.getUsersConnected() - 1);
                playerLeft = true;
            }
            // Si se va el jugador 2
            else if (username.equals(game.getUsernamePlayer2())) {
                game.setUsernamePlayer2(null);
                game.setUsersConnected(game.getUsersConnected() - 1);
                playerLeft = true;
            }

            if (playerLeft) {
                // Si no quedan jugadores, se borra la partida de la memoria y del disco.
                if (game.getUsersConnected() <= 0) {
                    activeGames.remove(gameCode);
                    gameRepository.deleteGame(gameCode);
                    System.out.println("Partida " + gameCode + " eliminada por estar vacía.");
                    return null; // Devuelve null para indicar que la partida ya no existe.
                }
                // Si queda al menos un jugador, se actualiza el estado en memoria y en disco.
                else {
                    updateGame(game);
                    System.out.println("Jugador " + username + " desconectado de " + gameCode
                            + ". Jugadores restantes: " + game.getUsersConnected());
                    return game;
                }
            }
        }
        return null; // Devuelve null si la partida no se encontró o el jugador no estaba en ella.
    }

    private String generateUniqueGameCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (gameRepository.getGame(code).isPresent());
        return code;
    }

    public Optional<Game> getGame(String gameCode) {
        return Optional.ofNullable(activeGames.get(gameCode));
    }

    public Optional<Game> setGameMap(String gameCode, int mapId) {
        return getGame(gameCode).map(game -> {
            game.setMap(mapId);
            updateGame(game);
            return game;
        });
    }

    public void updatePlayerState(String gameCode, String username, PlayerState playerState) {
        getGame(gameCode).ifPresent(game -> {
            
            // --- INICIO DE DEPURACIÓN ---
            // Imprimimos la información que recibimos y la que tenemos guardada
            System.out.println("--- Recibida actualización de estado ---");
            System.out.println("Partida: " + gameCode);
            System.out.println("Usuario que envía: '" + username + "'");
            System.out.println("Posición enviada: X=" + playerState.getPositionX() + ", Y=" + playerState.getPositionY());
            System.out.println("Servidor tiene a P1 como: '" + game.getUsernamePlayer1() + "'");
            System.out.println("Servidor tiene a P2 como: '" + game.getUsernamePlayer2() + "'");
            // --- FIN DE DEPURACIÓN ---

            boolean playerRecognized = false;

            // Comprueba si el update es del Jugador 1
            if (username.equals(game.getUsernamePlayer1())) {
                game.setPlayer1PositionX(playerState.getPositionX());
                game.setPlayer1PositionY(playerState.getPositionY());
                System.out.println(">> Jugador 1 reconocido y actualizado.");
                playerRecognized = true;

            // Comprueba si el update es del Jugador 2
            } else if (username.equals(game.getUsernamePlayer2())) {
                game.setPlayer2PositionX(playerState.getPositionX());
                game.setPlayer2PositionY(playerState.getPositionY());
                System.out.println(">> Jugador 2 reconocido y actualizado.");
                playerRecognized = true;
            }

            if (!playerRecognized) {
                System.err.println("!! ADVERTENCIA: El usuario '" + username + "' no coincide con ningún jugador de la partida.");
            }
        });
    }

    public void collectFlag(String gameCode, String username) {
        getGame(gameCode).ifPresent(game -> {
            // Solo se puede coger si está visible y nadie la tiene
            if (game.isFlagVisible() && game.getFlagHolderUsername() == null) {
                game.setFlagHolderUsername(username);
                game.setFlagVisible(false); // La bandera ya no está en el mapa, la tiene el jugador

                // Retransmitimos el nuevo estado a todos
                broadcastGameState(gameCode);
                System.out.println("Jugador " + username + " ha cogido la bandera en la partida " + gameCode);
            }
        });
    }

    // Helper para no repetir código
    public void broadcastGameState(String gameCode) {
        getGame(gameCode).ifPresent(game -> {
            messagingTemplate.convertAndSend("/topic/gameplay/" + game.getCode(), game.toGameStateMessage());
        });
    }
}