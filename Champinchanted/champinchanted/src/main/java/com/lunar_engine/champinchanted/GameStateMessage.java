package com.lunar_engine.champinchanted;

public class GameStateMessage {
    
    private String gameCode;
    private PlayerState player1State;
    private PlayerState player2State;
    private int mapId;

    public GameStateMessage() {}

    // Constructor con todos los parámetros
    public GameStateMessage(String gameCode, PlayerState player1State, PlayerState player2State, int mapId) {
        this.gameCode = gameCode;
        this.player1State = player1State;
        this.player2State = player2State;
        this.mapId = mapId;
    }

    // Getters y setters
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public PlayerState getPlayer1State() { return player1State; }
    public void setPlayer1State(PlayerState player1State) { this.player1State = player1State; }

    public PlayerState getPlayer2State() { return player2State; }
    public void setPlayer2State(PlayerState player2State) { this.player2State = player2State; }

    public int getMapId() { return mapId; }
    public void setMapId(int mapId) { this.mapId = mapId; }
}
