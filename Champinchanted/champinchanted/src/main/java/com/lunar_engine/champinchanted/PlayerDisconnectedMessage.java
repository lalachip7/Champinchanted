package com.lunar_engine.champinchanted;

public class PlayerDisconnectedMessage {
    
    private String gameCode;
    private String username;
    private String status; 

    public PlayerDisconnectedMessage() {}

     public PlayerDisconnectedMessage(String gameCode, String username, String status) {
        this.gameCode = gameCode;
        this.username = username;
        this.status = status;
    }

    // Getters y Setters
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return "PlayerDisconnectedMessage{" + "gameCode='" + gameCode + '\'' + ", username='" + username + '\'' + ", status='" + status + '\'' + '}';
    }
}
