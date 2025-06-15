package com.lunar_engine.champinchanted;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ChampinchantedApplication {

	public static void main(String[] args) {
		SpringApplication.run(ChampinchantedApplication.class, args);
	}

}
