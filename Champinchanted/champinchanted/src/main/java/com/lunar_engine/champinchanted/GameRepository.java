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
    private final String gamesPath;
    private final ObjectMapper objectMapper;

    @Autowired
    public GameRepository(@Qualifier("gamesPath") String gamesPath, ObjectMapper objectMapper) {
        this.gamesPath = gamesPath;
        this.objectMapper = objectMapper;
        try {
            Files.createDirectories(Paths.get(gamesPath));
        } catch (IOException e) {
            System.err.println("Error al crear el directorio de partidas: " + e.getMessage());
        }
    }

    public List<GameLobbyData> getGames() throws IOException {
        Path path = Paths.get(gamesPath);
        if (!Files.exists(path)) return new ArrayList<>();
        try (var stream = Files.list(path)) {
            return stream
                .filter(Files::isRegularFile)
                .filter(file -> file.toString().endsWith(".json"))
                .map(file -> {
                    try {
                        return objectMapper.readValue(file.toFile(), GameLobbyData.class);
                    } catch (IOException e) {
                        e.printStackTrace();
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
        }
    }

    public Optional<GameLobbyData> getGame(String code) {
        File file = new File(gamesPath, code + ".json");
        if (!file.exists()) return Optional.empty();
        try {
            return Optional.of(objectMapper.readValue(file, GameLobbyData.class));
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    public boolean saveGame(GameLobbyData lobbyData) {
        try {
            File file = new File(gamesPath, lobbyData.getCode() + ".json");
            objectMapper.writeValue(file, lobbyData);
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteGame(String code) {
        try {
            File file = new File(gamesPath, code + ".json");
            return file.exists() && file.delete();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
