package com.lunar_engine.champinchanted;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Habilita nuestro servidor de WebSockets
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Este es el "endpoint" HTTP al que el cliente se conectará inicialmente para la comunicación WebSocket.
        // Por ejemplo: http://localhost:8080/ws
        // .withSockJS() es una opción de fallback para navegadores que no soportan WebSockets nativamente.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // --- ¡¡ESTA ES LA LÍNEA CLAVE QUE FALTABA!! ---
        // Define que los mensajes enviados desde el cliente a destinos que empiecen con "/app"
        // deben ser enrutados a los métodos anotados con @MessageMapping en tus controladores.
        registry.setApplicationDestinationPrefixes("/app");

        // Define que los mensajes a los que los clientes se pueden suscribir (para recibir datos)
        // deben empezar con "/topic". Esto habilita un "broker" de mensajes en memoria.
        registry.enableSimpleBroker("/topic");
    }
}
