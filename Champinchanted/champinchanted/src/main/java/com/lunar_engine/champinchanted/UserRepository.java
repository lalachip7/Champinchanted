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

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.databind.ObjectMapper;

@Repository
public class UserRepository { 

    private final String usersPath;
    private final ObjectMapper objectMapper;

    public UserRepository(@Qualifier("usersPath") String usersPath, ObjectMapper objectMapper) {
        this.usersPath = usersPath;
        this.objectMapper = objectMapper;

        try {
            Files.createDirectories(Paths.get(usersPath));
        } catch (IOException e) {
            System.err.println("Error al crear el directorio de usuarios: " + e.getMessage());
        }
    }
    
    @SuppressWarnings("CallToPrintStackTrace")
    public List<User> getAllUsers() {
        Path path = Paths.get(usersPath);
        try {
            return Files.list(path)
            .filter(Files::isRegularFile)
            .filter(file -> file.toString().endsWith(".json"))
            .map(file -> {
                try {
                    return this.objectMapper.readValue(file.toFile(), User.class);   
                } catch (IOException e) {
                    e.printStackTrace();
                    return null;
                }
            })
            .filter(java.util.Objects::nonNull)
            .collect(Collectors.toList());
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    public Optional<User> getUser(String username) {
        try {
            String filePath = this.usersPath + "/" + username + ".json";
            File file = new File(filePath);
            return Optional.of(objectMapper.readValue(file, User.class));
        } catch (IOException e) {   
            return Optional.empty();
        }
    }

    @SuppressWarnings("CallToPrintStackTrace")
    public boolean updateUser(User updatedUser) {
        try {
            String filePath = this.usersPath + "/" + updatedUser.getUsername() + ".json";
            File file = new File (filePath);
            objectMapper.writeValue(file, updatedUser);
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    @SuppressWarnings("CallToPrintStackTrace")
    public boolean deleteUser(String username) {
        try {
            String filePath = this.usersPath + "/" + username + ".json";
            File file = new File(filePath);
            
            if (!file.exists()) {
                return false;
            }
            return file.delete();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}