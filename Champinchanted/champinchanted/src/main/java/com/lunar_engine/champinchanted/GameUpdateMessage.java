package com.lunar_engine.champinchanted;

public class GameUpdateMessage {
    private String gameCode;
    private String username;
    private float positionX;
    private float positionY;
    private int score;
    private int lives;
    private boolean spellUsed;
    private boolean flagStatus;

    public GameUpdateMessage() {}   // Constructor vacío

    // Constructor con todos los campos
    public GameUpdateMessage(String gameCode, String username, float positionX, float positionY,
    int score, int lives, boolean spellUsed, boolean flagStatus) {
        this.gameCode = gameCode;
        this.username = username;
        this.positionX = positionX;
        this.positionY = positionY;
        this.score = score;
        this.lives = lives;
        this.spellUsed = spellUsed;
        this.flagStatus = flagStatus;
    }

    // Getters y Setters
    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public float getPositionX() { return positionX; }
    public void setPositionX(float positionX) { this.positionX = positionX; }
    
    public float getPositionY() { return positionY; }
    public void setPositionY(float positionY) { this.positionY = positionY; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getLives() { return lives; }
    public void setLives(int lives) { this.lives = lives; }

    public boolean getSpellUsed() { return spellUsed; }
    public void setSpellUsed( boolean spellUsed ) { this.spellUsed = spellUsed; }

    public boolean getFlagStatus() { return flagStatus; }
    public void setFlagStatus( boolean flagStatus ) { this.flagStatus = flagStatus; }
}


