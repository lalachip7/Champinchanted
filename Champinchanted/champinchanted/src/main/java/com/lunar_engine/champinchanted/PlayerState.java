package com.lunar_engine.champinchanted;

public class PlayerState {
    
    private String username;
    private float positionX;
    private float positionY;
    private int score;
    private int lives;
    private boolean spellUsed;
    private boolean flagStatus;
    private int characterId;
    private boolean isReady;

    public PlayerState() {}

    // Constructor con todos los parámetros
    public PlayerState(String username, float positionX, float positionY, int score, int lives, boolean spellUsed, boolean flagStatus, int characterId, boolean isReady) {
        this.username = username;
        this.positionX = positionX;
        this.positionY = positionY;
        this.score = score;
        this.lives = lives;
        this.spellUsed = spellUsed;
        this.flagStatus = flagStatus;
        this.characterId = characterId;
        this.isReady = isReady; 
    }

    // Getters y setters
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

    public boolean isSpellUsed() { return spellUsed; }
    public void setSpellUsed(boolean spellUsed) { this.spellUsed = spellUsed; }

    public boolean isFlagStatus() { return flagStatus; }
    public void setFlagStatus(boolean flagStatus) { this.flagStatus = flagStatus; }

    public int getCharacterId() { return characterId; }
    public void setCharacterId(int characterId) { this.characterId = characterId; }

    public boolean isReady() { return isReady; } // Getter para isReady
    public void setReady(boolean ready) { isReady = ready; } // Setter para isReady
}
