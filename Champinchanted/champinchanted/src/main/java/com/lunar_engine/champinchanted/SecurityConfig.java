package com.lunar_engine.champinchanted;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Desactiva CSRF, necesario para que las APIs funcionen sin configuración extra
            .authorizeHttpRequests(auth -> auth
                // Permite el acceso a TODAS las rutas sin necesidad de autenticación.
                // Esta es la línea clave que elimina el formulario de login por defecto.
                .anyRequest().permitAll()
            );
        return http.build();
    }
}