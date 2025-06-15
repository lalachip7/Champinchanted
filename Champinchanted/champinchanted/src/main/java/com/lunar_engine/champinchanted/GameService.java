package com.lunar_engine.champinchanted;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class GameService {

    private final Map<String, Game> activeGames;
    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.activeGames = new ConcurrentHashMap<>();
        this.gameRepository = gameRepository;
    }

    @PostConstruct
    public void loadGamesOnStartup() {
        System.out.println("[DEBUG] GameService: Iniciando carga de partidas guardadas...");
        try {
            List<GameLobbyData> games = gameRepository.getGames();
            System.out.println("[DEBUG] GameService: Se encontraron " + games.size() + " ficheros de partidas.");
            games.forEach(lobbyData -> {
                System.out.println("[DEBUG] GameService: Cargando partida con código '" + lobbyData.getCode() + "' y " + lobbyData.getUsersConnected() + " usuarios.");
                activeGames.put(lobbyData.getCode(), new Game(lobbyData));
            });
        } catch (IOException e) {
            System.err.println("[ERROR] GameService: Error de IO al cargar partidas en el inicio: " + e.getMessage());
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
            game.addSystemEvent("El usuario " + usernamePlayer2 + " se ha unido.");
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
            String eventMessage = "El usuario " + username + " se ha desconectado.";
            
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
                game.addSystemEvent(eventMessage);
                if (game.getUsersConnected() <= 0) {
                    System.out.println("[DEBUG] GameService: La partida '" + gameCode + "' se quedó vacía. Eliminando...");
                    activeGames.remove(gameCode);
                    gameRepository.deleteGame(gameCode);
                    return null;
                } 
                else {
                    updateGame(game);
                    System.out.println("Jugador " + username + " desconectado de " + gameCode + ". Jugadores restantes: " + game.getUsersConnected());
                    return game;
                }
            }
        }
        return null;
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

    public Collection<Game> getActiveGames() {
        return activeGames.values();
    }
}