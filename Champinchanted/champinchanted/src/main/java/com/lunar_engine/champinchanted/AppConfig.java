package com.lunar_engine.champinchanted;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
public class AppConfig {

    @Bean
    public long seenThreshold() {
        return 10000;  
    }

    @Bean
    public String usersPath() {
        return "src/main/resources/users";  
    }

    @Bean
    public String gamesPath() {
        return "src/main/resources/games";  
    }

    @Bean 
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}

