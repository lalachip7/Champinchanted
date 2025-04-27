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

@Repository     // Esta clase es un componente (bean) que accede a datos DAO
public class UserRepository { 

    // CONSTRUCTOR 
    @Autowired         // Spring debe inyectar automáticamente un usersPath en el constructor 
    @Qualifier("usersPath")  // Dependencia a inyectar
    private final String usersPath;   // ruta donde se almacenan los usuarios

    public UserRepository(String usersPath) {
        this.usersPath = usersPath;
    }

    @Autowired                          // Gestiona el objectMapper como un bean
    private ObjectMapper objectMapper;  // Convierte objetos JSON a clases Java y viceversa

    /****************************************************************************************
     * Recupera todos los usuarios desde archivos JSON
     * @return Lista de objetos User deserializados desde los archivos JSON
     * @throws IOException Si ocurre un error al leer los archivos
     */
    @SuppressWarnings("CallToPrintStackTrace")
    public List<User> getAllUsers() throws IOException {
        var localOjectMapper = new ObjectMapper();

        Path path = Paths.get(usersPath);   // Convierte la cadena usersPath a un objeto Path

        try {
            return Files.list(path)         // Genera un flujo (Stream) de archivos en el 
                                            // directorio
            .filter(Files::isRegularFile)   // Filtro para procesar solamente archivos
            .filter(file -> file.toString().endsWith(".json"))   // Filtro para proce-
            // sar solo archivos json
            .map(file -> {                // Mapeo de archivos a objetos User con objectMapper
                try {
                    return localOjectMapper.readValue(file.toFile(), User.class);   
                    // Se deserializa el archivo 
                } catch (IOException e) {
                    e.printStackTrace();    // Si ocurre un error en la deserialización se 
                                            // captura
                    return null;            // y se devuelve null
                }
            })
            .filter(user -> user != null)   // Filtro para eliminar valores nulos
            .collect(Collectors.toList());  // Se recogen los elementos resultantes del stream 
                                            // en una lista
        } catch (IOException e) {
            return new ArrayList<>();       // Si ocurre un error, devuelve una lista vacía
        }
    }

    /****************************************************************************************
     * Recupera un usuario específico por su nombre de usuario
     * @param username Nombre de usuario único
     * @return Un objeto Optional que contiene el usuario encontrado o está vacío si no existe 
     */
    public Optional<User> getUser(String username) {  // Recibe un nombre de usuario
        try {
            String filePath = this.usersPath + "/" + username + ".json";    
            // Se compone la ruta del archivo con el nombre de usuario

            File file = new File(filePath);     
            // Se crea un objeto File que representa el archivo JSON asociado al usuario

            return Optional.of(objectMapper.readValue(file, User.class)); 
            // Se intenta deserializar el archivo
        } catch (IOException e) {   
            return Optional.empty();            // Si ocurre una excepción se devuelve vacío
        }
    }

    /****************************************************************************************
     * Actualiza los datos de usuario existente, sobrescribiendo su archivo JSON
     * @param updatedUser Objeto User con los datos actualizados del usuario
     * @return true si el usuario fue actualizado exitosamente, false si ocurrió un error
     */
    @SuppressWarnings("CallToPrintStackTrace")
    public boolean updateUser(User updatedUser) {   // Recibe un usuario con los datos nuevos
        try {
            String filePath = this.usersPath + "/" + updatedUser.getUsername() + ".json";   
            // Se construye la ruta del archivo

            File file = new File (filePath);

            objectMapper.writeValue(file, updatedUser);   // Se sobreescribe el archivo con 
            // los nuevos datos del usuario convirtiendo el objeto updatedUser en formato JSON
            return true;                // Y devuelve true si todo ha ido bien
        } catch (IOException e) {
            e.printStackTrace();        // Si da error, lo imprime
            return false;               // Y devuelve false
        }
    }

    /****************************************************************************************
     * Elimina un usuario específico por su nombre de usuario
     * @param username Nombre de usuario único
     * @return true si el usuario fue eliminado con éxito, false si no se encontró o hubo un error
     */
    @SuppressWarnings("CallToPrintStackTrace")
    public boolean deleteUser(String username) {    // Recibe el usuario a eliminar
        try {
            String filePath = this.usersPath + "/" + username + ".json";     
            // Construye la ruta del archivo

            File file = new File(filePath);
            
            if (!file.exists()) {       // Si el archivo no existe
                return false;           // Devuelve false
            }

            boolean isDeleted = file.delete();  // Y si existe, intenta eliminarlo 
            return isDeleted;
        } catch (Exception e) {
            e.printStackTrace();        // Si ocurre un error, lo imprime
            return false;               // Y devuelve false
        }
    }
}
