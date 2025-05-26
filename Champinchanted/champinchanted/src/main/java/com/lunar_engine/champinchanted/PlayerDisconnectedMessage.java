package com.lunar_engine.champinchanted;


public class PlayerDisconnectedMessage {
    
    private String gameCode;
    private String username;    // Username del jugador que se desconectó

    public PlayerDisconnectedMessage() {}   // Constructor vacío

     // Constructor con todos los campos
     public PlayerDisconnectedMessage(String gameCode, String username) {
        this.gameCode = gameCode;
        this.username = username;
    }

    // Getters y Setters
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    @Override
    public String toString() {
        return "PlayerDisconnectedMessage{" +
               "gameCode='" + gameCode + '\'' +
               ", username='" + username + '\'' +
               '}';
    }
}
