package com.lunar_engine.champinchanted;

public class StartGameMessage {
    
    private String gameCode;
    private String player1Username;
    private int player1Character;
    private String player2Username;
    private int player2Character;
    private int mapId; 

    public StartGameMessage() {}

    public StartGameMessage(String gameCode, String player1Username, int player1Character,
    String player2Username, int player2Character, int mapId) {
        this.gameCode = gameCode;
        this.player1Username = player1Username;
        this.player1Character = player1Character;
        this.player2Username = player2Username;
        this.player2Character = player2Character;
        this.mapId = mapId;
    }

    // Getters y setters
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public String getPlayer1Username() { return player1Username; }
    public void setPlayer1Username(String player1Username) { this.player1Username = player1Username; }

    public int getPlayer1Character() { return player1Character; }
    public void setPlayer1Character(int player1Character) { this.player1Character = player1Character; }

    public String getPlayer2Username() { return player2Username; }
    public void setPlayer2Username(String player2Username) { this.player2Username = player2Username; }

    public int getPlayer2Character() { return player2Character; }
    public void setPlayer2Character(int player2Character) { this.player2Character = player2Character; }

    public int getMapId() { return mapId; }
    public void setMapId(int mapId) { this.mapId = mapId; }

    @Override
    public String toString() {
        return "StartGameMessage{" +
               "gameCode='" + gameCode + '\'' +
               ", player1Username='" + player1Username + '\'' +
               ", player1Character=" + player1Character +
               ", player2Username='" + player2Username + '\'' +
               ", player2Character=" + player2Character +
               ", mapId=" + mapId +
               '}';
    }
}
