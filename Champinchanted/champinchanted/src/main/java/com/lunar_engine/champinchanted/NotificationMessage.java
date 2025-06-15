package com.lunar_engine.champinchanted;

public class NotificationMessage {
    private String content;
    private int playerCount;

    public NotificationMessage(String content, int playerCount) {
        this.content = content;
        this.playerCount = playerCount;
    }

    // Getters y Setters
    public String getContent() {
        return this.content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getPlayerCount() {
        return this.playerCount;
    }

    public void setPlayerCount(int playerCount) {
        this.playerCount = playerCount;
    }
}
