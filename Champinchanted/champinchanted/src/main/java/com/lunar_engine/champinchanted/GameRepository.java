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
            System.out.println("[DEBUG] GameRepository: Asegurando que el directorio '" + gamesPath + "' existe.");
            Files.createDirectories(Paths.get(gamesPath));
        } catch (IOException e) {
            System.err.println("[ERROR] GameRepository: No se pudo crear el directorio de partidas: " + e.getMessage());
        }
    }

    public List<GameLobbyData> getGames() throws IOException {
        Path path = Paths.get(gamesPath);
        if (!Files.exists(path)) {
            System.out.println("[DEBUG] GameRepository: El directorio de partidas no existe, devolviendo lista vacía.");
            return new ArrayList<>();
        }
        System.out.println("[DEBUG] GameRepository: Leyendo todos los ficheros de partidas desde '" + gamesPath + "'.");
        try (var stream = Files.list(path)) {
            return stream
                .filter(Files::isRegularFile)
                .filter(file -> file.toString().endsWith(".json"))
                .map(file -> {
                    try {
                        return objectMapper.readValue(file.toFile(), GameLobbyData.class);
                    } catch (IOException e) {
                        System.err.println("[ERROR] GameRepository: Fallo al leer el fichero de partida: " + file.toString());
                        e.printStackTrace();
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
        }
    }

    public boolean saveGame(GameLobbyData lobbyData) {
        File file = new File(gamesPath, lobbyData.getCode() + ".json");
        System.out.println("[DEBUG] GameRepository: Intentando guardar partida '" + lobbyData.getCode() + "' en el fichero: " + file.getAbsolutePath());
        try {
            objectMapper.writeValue(file, lobbyData);
            System.out.println("[SUCCESS] GameRepository: Partida '" + lobbyData.getCode() + "' guardada con éxito.");
            return true;
        } catch (IOException e) {
            System.err.println("[ERROR] GameRepository: No se pudo guardar la partida '" + lobbyData.getCode() + "'.");
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteGame(String code) {
        File file = new File(gamesPath, code + ".json");
        System.out.println("[DEBUG] GameRepository: Intentando borrar el fichero de partida: " + file.getAbsolutePath());
        try {
            boolean deleted = file.exists() && file.delete();
            if (deleted) {
                System.out.println("[SUCCESS] GameRepository: Fichero de partida '" + code + "' borrado.");
            } else {
                System.err.println("[WARN] GameRepository: No se pudo borrar el fichero de partida '" + code + "' (quizás ya no existía).");
            }
            return deleted;
        } catch (Exception e) {
            System.err.println("[ERROR] GameRepository: Excepción al borrar la partida '" + code + "'.");
            e.printStackTrace();
            return false;
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
}
