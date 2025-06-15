package com.lunar_engine.champinchanted;

// Esta clase representa un único mensaje de chat.
public class ChatMessageDTO {
    private String sender;
    private String content;

    // Constructor vacío necesario para la deserialización de JSON
    public ChatMessageDTO() {}

    public ChatMessageDTO(String sender, String content) {
        this.sender = sender;
        this.content = content;
    }

    // Getters y Setters
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}