package com.lunar_engine.champinchanted;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public long seenThreshold() {
        return 10000;  // El valor que desees
    }

    @Bean
    public String usersPath() {
        return "src/main/resources/users";  // O cualquier otro valor que necesites
    }

    @Bean
    public String gamesPath() {
        return "src/main/resources/games";  // O cualquier otro valor que necesites
    }
}
