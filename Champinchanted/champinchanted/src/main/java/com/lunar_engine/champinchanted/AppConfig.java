package com.lunar_engine.champinchanted;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
}

