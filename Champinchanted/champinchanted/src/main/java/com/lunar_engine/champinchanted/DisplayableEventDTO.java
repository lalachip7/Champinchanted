package com.lunar_engine.champinchanted;

public class DisplayableEventDTO {
    
    public enum EventType {
        CHAT_MESSAGE,
        SYSTEM_NOTIFICATION
    }

    private EventType type;
    private String content;
    private String sender;
    private long timestamp;

    // --- AÑADIR ESTE CONSTRUCTOR VACÍO ---
    public DisplayableEventDTO() {}
    // ------------------------------------

    // Constructor para mensajes del sistema
    public DisplayableEventDTO(String content) {
        this.type = EventType.SYSTEM_NOTIFICATION;
        this.content = content;
        this.sender = "Sistema";
        this.timestamp = System.currentTimeMillis();
    }

    // Constructor para mensajes de chat
    public DisplayableEventDTO(String sender, String content) {
        this.type = EventType.CHAT_MESSAGE;
        this.content = content;
        this.sender = sender;
        this.timestamp = System.currentTimeMillis();
    }

    // Getters
    public EventType getType() { return type; }
    public String getContent() { return content; }
    public String getSender() { return sender; }
    public long getTimestamp() { return timestamp; }
}