package com.lunar_engine.champinchanted;

public class ReadyStatusMessage {
    private String gameCode;
    private String username;
    private boolean isReady;

    public ReadyStatusMessage() {}

    // Getters y Setters
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public boolean isReady() { return isReady; }
    public void setReady(boolean ready) { isReady = ready; }
}