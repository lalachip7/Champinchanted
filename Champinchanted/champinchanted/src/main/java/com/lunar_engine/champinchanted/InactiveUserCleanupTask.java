package com.lunar_engine.champinchanted;

import java.util.Collection;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InactiveUserCleanupTask {

    private final GameService gameService;
    private final ApiStatusService apiStatusService;
    private final long seenThreshold;

    public InactiveUserCleanupTask(GameService gameService, ApiStatusService apiStatusService, long seenThreshold) {
        this.gameService = gameService;
        this.apiStatusService = apiStatusService;
        this.seenThreshold = seenThreshold;
    }

    // Esta tarea se ejecutará cada 15 segundos (15000 milisegundos)
    @Scheduled(initialDelay = 30000, fixedRate = 15000)
    public void cleanupInactivePlayersInGames() {
        System.out.println("\n--- [TASK] Ejecutando tarea de limpieza de usuarios inactivos ---");
        List<String> activeUsers = apiStatusService.isConnected(this.seenThreshold);
        System.out.println("[TASK] Usuarios considerados activos ahora mismo: " + activeUsers);

        Collection<Game> gamesToCheck = List.copyOf(gameService.getActiveGames());
        System.out.println("[TASK] Revisando " + gamesToCheck.size() + " partidas activas.");

        for (Game game : gamesToCheck) {
            String player1 = game.getUsernamePlayer1();
            String player2 = game.getUsernamePlayer2();

            if (player1 != null && !activeUsers.contains(player1)) {
                System.out.println("[TASK] Jugador INACTIVO detectado: " + player1 + " en partida " + game.getCode() + ". Desconectando...");
                gameService.disconnectUserFromGame(game.getCode(), player1);
            }

            if (player2 != null && !activeUsers.contains(player2)) {
                System.out.println("[TASK] Jugador INACTIVO detectado: " + player2 + " en partida " + game.getCode() + ". Desconectando...");
                gameService.disconnectUserFromGame(game.getCode(), player2);
            }
        }
        System.out.println("--- [TASK] Tarea de limpieza finalizada ---\n");
    }
}