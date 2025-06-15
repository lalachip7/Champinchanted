package com.lunar_engine.champinchanted;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class AppConfig {

    @Bean
    public long seenThreshold() {
        return 10000;
    }

    @Bean
    public String usersPath() {
        // Los usuarios se guardarán en: /tu-proyecto/data/users/
        return "data/users";
    }

    @Bean
    public String gamesPath() {
        // Las partidas se guardarán en: /tu-proyecto/data/games/
        return "data/games";
    }

    @Bean 
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}