package com.lunar_engine.champinchanted;

public class SelectMapMessage {
    private String gameCode;
    private String username;
    private int mapId;

    public SelectMapMessage() {}

    public SelectMapMessage(String gameCode, String username, int mapId) {
        this.gameCode = gameCode;
        this.username = username;
        this.mapId = mapId;
    }

    // Getters y setters
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
 
    public int getMapId() { return mapId; }
    public void setMapId(int mapId) { this.mapId = mapId; }

    @Override
    public String toString() {
        return "SelectMapMessage{" +
               "gameCode='" + gameCode + '\'' +
               ", username='" + username + '\'' +
               ", mapId=" + mapId +
               '}';
    }
}
