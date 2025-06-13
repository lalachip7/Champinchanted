package com.lunar_engine.champinchanted;

public class ChatMessage {
    private String sender;
    private String content;
    private String gameCode;

    // Constructores, Getters y Setters
    public ChatMessage() {}

    public ChatMessage(String sender, String content, String gameCode) {
        this.sender = sender;
        this.content = content;
        this.gameCode = gameCode;
    }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }
}