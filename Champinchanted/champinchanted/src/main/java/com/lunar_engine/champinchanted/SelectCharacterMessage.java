package com.lunar_engine.champinchanted;

public class SelectCharacterMessage {
    private String gameCode;
    private String username;
    private int characterId;

    public SelectCharacterMessage() {}

    public SelectCharacterMessage(String gameCode, String username, int characterId) {
        this.gameCode = gameCode;
        this.username = username;
        this.characterId = characterId;
    }

    // Getters y setters
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public int getCharacterId() { return characterId; }
    public void setCharacterId(int characterId) { this.characterId = characterId; }

    @Override
    public String toString() {
        return "SelectCharacterMessage{" +
               "gameCode='" + gameCode + '\'' +
               ", username='" + username + '\'' +
               ", characterId=" + characterId +
               '}';
    }
}
