package com.lunar_engine.champinchanted;

// Una clase simple para enviar mensajes de notificación del sistema.
public class NotificationMessage {
    private String content;

    public NotificationMessage(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
