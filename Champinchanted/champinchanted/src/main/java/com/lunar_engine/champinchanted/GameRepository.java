package com.lunar_engine.champinchanted;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.ObjectMapper;

@Repository
public class GameRepository {
    
    // CONSTRUCTOR
    @Autowired
    @Qualifier("gamesPath")
    private final String gamesPath;

    public GameRepository(String gamesPath) {
        this.gamesPath = gamesPath;
    }


    // MÉTODO QUE CARGA Y DESERIALIZA TODOS LOS ARCHIVOS JSON DE PARTIDAS
    @Autowired
    private ObjectMapper objectMapper;

    @SuppressWarnings("CallToPrintStackTrace")
    public List<Game> getGames() throws IOException {
        var localOjectMapper = new ObjectMapper();

        Path path = Paths.get(gamesPath);

        try {
            return Files.list(path)
            .filter(Files::isRegularFile)
            .filter(file -> file.toString().endsWith(".json"))
            .map(file -> {
                try {
                    return localOjectMapper.readValue(file.toFile(), Game.class);
                } catch (IOException e) {
                    e.printStackTrace();
                    return null;
                }
            })
            .filter(game -> game != null)
            .collect(Collectors.toList());
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    // MÉTODO QUE RECUPERA UNA PARTIDA EN ESPECÍFICO
    public Optional<Game> getGame(String code) {
        try {
            String filePath = this.gamesPath + "/" + code + ".json";
            File file = new File(filePath);
            return Optional.of(objectMapper.readValue(file, Game.class));
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    // MÉTODO QUE ELIMINA UNA PARTIDA   
    @SuppressWarnings("CallToPrintStackTrace")
    public boolean deleteGame(int code) {
        try {
            String filePath = this.gamesPath + "/" + code + ".json";
            File file = new File(filePath);

            if (!file.exists()) {
                return false;
            }

            boolean isDeleted = file.delete();
            return isDeleted;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @SuppressWarnings("CallToPrintStackTrace")
    public boolean createGame(Game game) {
        try {
            String filePath = this.gamesPath + "/" + game.getCode() + ".json";
            File file = new File(filePath);

            objectMapper.writeValue(file, game);
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }
}
