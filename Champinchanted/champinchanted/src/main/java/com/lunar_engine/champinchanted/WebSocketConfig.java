package com.lunar_engine.champinchanted;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker       // Habilita el manejo de mensajes de WebSocket con un 
                                    // broker de mensajes
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // Habilita un broker de mensajes en memoria para enviar mensajes a los clientes
        config.enableSimpleBroker("/topic", "/queue");

        // Prefijo para los destinos de las aplicaciones donde el cliente envía mensajes al servidor
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        // Registra el punto final WebSocket que los clientes usarán para conectarse
        registry.addEndpoint("/ws").withSockJS();   // Se utiliza SockJS para que sea compa-
                                                    // tible con navegadores que no soportan
                                                    // WebSockets
    }
}