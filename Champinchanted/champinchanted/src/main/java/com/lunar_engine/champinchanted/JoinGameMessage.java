package com.lunar_engine.champinchanted;

public class JoinGameMessage {
    
    private String username;
    private String gameCode;

    public JoinGameMessage() {}     // Constructor vacío

    // Constructor con todos los parámetros
    public JoinGameMessage(String username, String gameCode) {
        this.username = username;
        this.gameCode = gameCode;
    }

    // Getters y setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }
}
