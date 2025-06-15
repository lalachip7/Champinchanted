package com.lunar_engine.champinchanted;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.Timer;
import java.util.TimerTask;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class GameService {

    private final Map<String, Game> activeGames;
    private final GameRepository gameRepository;
    private final SimpMessageSendingOperations messagingTemplate;
    private static final double PLAYER_COLLISION_DISTANCE = 75.0;

    public GameService(GameRepository gameRepository, SimpMessageSendingOperations messagingTemplate) {
        this.activeGames = new ConcurrentHashMap<>();
        this.gameRepository = gameRepository;
        this.messagingTemplate = messagingTemplate;
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
            if (username.equals(game.getUsernamePlayer1())) {
                game.setUsernamePlayer1(null);
                game.setUsersConnected(game.getUsersConnected() - 1);
                playerLeft = true;
            } else if (username.equals(game.getUsernamePlayer2())) {
                game.setUsernamePlayer2(null);
                game.setUsersConnected(game.getUsersConnected() - 1);
                playerLeft = true;
            }

            if (playerLeft) {
                if (game.getUsersConnected() <= 0) {
                    activeGames.remove(gameCode);
                    gameRepository.deleteGame(gameCode);
                    System.out.println("Partida " + gameCode + " eliminada por estar vacía.");
                    return null;
                } else {
                    updateGame(game);
                    System.out.println("Jugador " + username + " desconectado de " + gameCode
                            + ". Jugadores restantes: " + game.getUsersConnected());
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

    public Optional<Game> setGameMap(String gameCode, int mapId) {
        return getGame(gameCode).map(game -> {
            game.setMap(mapId);
            updateGame(game);
            return game;
        });
    }

    public void updatePlayerState(String gameCode, String username, PlayerState playerState) {
        getGame(gameCode).ifPresent(game -> {
            boolean playerRecognized = false;
            if (username.equals(game.getUsernamePlayer1())) {
                game.setPlayer1PositionX(playerState.getPositionX());
                game.setPlayer1PositionY(playerState.getPositionY());
                playerRecognized = true;
            } else if (username.equals(game.getUsernamePlayer2())) {
                game.setPlayer2PositionX(playerState.getPositionX());
                game.setPlayer2PositionY(playerState.getPositionY());
                playerRecognized = true;
            }
            if (playerRecognized) {
                checkPlayerCollisionAndSteal(game);
            }
        });
    }

    public void collectFlag(String gameCode, String username) {
        getGame(gameCode).ifPresent(game -> {
            if (game.isFlagVisible() && game.getFlagHolderUsername() == null) {
                game.setFlagHolderUsername(username);
                game.setFlagVisible(false);
                broadcastGameState(gameCode);
                System.out.println("Jugador " + username + " ha cogido la bandera en la partida " + gameCode);
            }
        });
    }

    public void broadcastGameState(String gameCode) {
        getGame(gameCode).ifPresent(game -> {
            messagingTemplate.convertAndSend("/topic/gameplay/" + game.getCode(), game.toGameStateMessage());
        });
    }

    public void collectSpell(String gameCode, String username, String spellType) {
        getGame(gameCode).ifPresent(game -> {
            boolean isPlayer1 = username.equals(game.getUsernamePlayer1());
            if (spellType.equals("venom") && game.isVenomSpellVisible()) {
                game.setVenomSpellVisible(false);
                if (isPlayer1) game.setPlayer1HeldSpell(1); else game.setPlayer2HeldSpell(1);
                System.out.println("Jugador " + username + " ha cogido VENOM.");
            } else if (spellType.equals("dazer") && game.isDazerSpellVisible()) {
                game.setDazerSpellVisible(false);
                if (isPlayer1) game.setPlayer1HeldSpell(2); else game.setPlayer2HeldSpell(2);
                System.out.println("Jugador " + username + " ha cogido DAZER.");
            }
            broadcastGameState(gameCode);
        });
    }

    private void checkPlayerCollisionAndSteal(Game game) {
        if (game.getFlagHolderUsername() == null) {
            return;
        }
        double dx = game.getPlayer1PositionX() - game.getPlayer2PositionX();
        double dy = game.getPlayer1PositionY() - game.getPlayer2PositionY();
        double distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < PLAYER_COLLISION_DISTANCE) {
            String holder = game.getFlagHolderUsername();
            String p1 = game.getUsernamePlayer1();
            if (holder.equals(p1)) {
                game.setFlagHolderUsername(game.getUsernamePlayer2());
                System.out.println("Partida " + game.getCode() + ": Jugador 2 ha robado la bandera.");
            } else {
                game.setFlagHolderUsername(p1);
                System.out.println("Partida " + game.getCode() + ": Jugador 1 ha robado la bandera.");
            }
            broadcastGameState(game.getCode());
        }
    }

    public void scorePointAndResetRound(String gameCode, String username) {
        getGame(gameCode).ifPresent(game -> {
            if (username.equals(game.getFlagHolderUsername())) {
                game.setFlagHolderUsername(null);
                if (username.equals(game.getUsernamePlayer1())) {
                    game.setPlayer1Score(game.getPlayer1Score() + 1);
                    System.out.println("Partida " + game.getCode() + ": Punto para el Jugador 1.");
                } else {
                    game.setPlayer2Score(game.getPlayer2Score() + 1);
                    System.out.println("Partida " + game.getCode() + ": Punto para el Jugador 2.");
                }
                game.resetForNewRound();
                broadcastGameState(gameCode);
            }
        });
    }

    public void useSpell(String gameCode, String username) {
        getGame(gameCode).ifPresent(game -> {
            boolean isPlayer1 = username.equals(game.getUsernamePlayer1());
            int spellId = isPlayer1 ? game.getPlayer1HeldSpell() : game.getPlayer2HeldSpell();

            if (spellId == 2) { // Dazer
                if (isPlayer1) {
                    game.setPlayer2Frozen(true);
                    game.setPlayer1HeldSpell(0);
                } else {
                    game.setPlayer1Frozen(true);
                    game.setPlayer2HeldSpell(0);
                }
                System.out.println(username + " ha congelado a su oponente.");
                broadcastGameState(gameCode);
                new Timer().schedule(new TimerTask() {
                    @Override
                    public void run() {
                        if (isPlayer1) game.setPlayer2Frozen(false); else game.setPlayer1Frozen(false);
                        System.out.println("Efecto de congelación terminado para la partida " + gameCode);
                        broadcastGameState(gameCode);
                    }
                }, 3000);
            } else if (spellId == 1) { // Venom
                final boolean targetIsP1 = !isPlayer1;
                if ((targetIsP1 && game.getPlayer1PoisonTimer() != null) || (!targetIsP1 && game.getPlayer2PoisonTimer() != null)) {
                    return;
                }
                if (isPlayer1) {
                    game.setPlayer2Poisoned(true);
                    game.setPlayer1HeldSpell(0);
                } else {
                    game.setPlayer1Poisoned(true);
                    game.setPlayer2HeldSpell(0);
                }
                System.out.println(username + " ha envenenado a su oponente.");
                broadcastGameState(gameCode);

                Timer poisonTimer = new Timer();
                if (targetIsP1) game.setPlayer1PoisonTimer(poisonTimer); else game.setPlayer2PoisonTimer(poisonTimer);

                AtomicInteger ticks = new AtomicInteger(0);
                TimerTask poisonTask = new TimerTask() {
                    @Override
                    public void run() {
                        if (ticks.incrementAndGet() > 3 || (targetIsP1 && game.getPlayer1Lives() <= 1) || (!targetIsP1 && game.getPlayer2Lives() <= 1)) {
                            if (targetIsP1) {
                                game.setPlayer1Poisoned(false);
                                if(game.getPlayer1PoisonTimer() != null) game.getPlayer1PoisonTimer().cancel();
                                game.setPlayer1PoisonTimer(null);
                            } else {
                                game.setPlayer2Poisoned(false);
                                if(game.getPlayer2PoisonTimer() != null) game.getPlayer2PoisonTimer().cancel();
                                game.setPlayer2PoisonTimer(null);
                            }
                            System.out.println("Efecto de veneno terminado.");
                            broadcastGameState(gameCode);
                            this.cancel(); // Detiene esta tarea
                            return;
                        }
                        if (targetIsP1) {
                            game.setPlayer1Lives(game.getPlayer1Lives() - 1);
                        } else {
                            game.setPlayer2Lives(game.getPlayer2Lives() - 1);
                        }
                        System.out.println("Daño de veneno aplicado.");
                        broadcastGameState(gameCode);
                    }
                };
                poisonTimer.schedule(poisonTask, 5000, 5000);
            }
        });
    }
}
