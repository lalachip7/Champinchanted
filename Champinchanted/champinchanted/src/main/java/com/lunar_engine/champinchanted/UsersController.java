package com.lunar_engine.champinchanted;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;




@RestController         // Controlador 
@RequestMapping("/api/users")
public class UsersController {
    
    @Autowired
    private final UserRepository userRep;                     // Repositorio que maneja las operaciones de los usuarios

    @Autowired
    private final ApiStatusService apiStatusService;    // Servicio que gestiona el estado de conexión de los usuarios
    

    // CONSTRUCTOR
    public UsersController(UserRepository userRep, ApiStatusService apiStatusService) {
        this.userRep = userRep;
        this.apiStatusService = apiStatusService;
    }

    /**
     * GET /api/users/{username}
     * @param username
     * @return
     */
    @GetMapping("/{username}")
    public ResponseEntity<User> getUser(@PathVariable String username) {
        synchronized (this.userRep) {   // Para el manejo de la concurrencia
            Optional<User> user = this.userRep.getUser(username);   // Llamada al repositorio para buscar al usuario por su nombre de usuario
            // El método optional permite manejar la posibilidad de que el método no exista

            if (user.isPresent()) {     // Si encuentra al usuario
                return ResponseEntity.ok(user.get());    // devuelve un 200 con el usuario
            } else {
                return ResponseEntity.notFound().build();   // y si no devuelve 404 (Not Found)
            }
        }
    }

    /**
     * DELETE /api/users/{username}
     * @param username
     * @return
     */
    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        synchronized (this.userRep) {
            boolean removed = this.userRep.deleteUser(username);    // Llama al repositorio para eliminar el usuario
            if (removed) {                                  // Si lo ha eliminado 
                this.apiStatusService.setInactive(username);
                return ResponseEntity.ok().build();         // Devuelve 200
            } else {                                        // Y si no
                return ResponseEntity.notFound().build();   // Devuelve 404
            }
        }
    }

    /**
     * POST /api/users
     * @param user
     * @return
     */
    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("Intentando registrar usuario: " + user.getUsername());
        synchronized (this.userRep) {
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {     // Si el nombre de usuario o la contraseña están vacíos
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "El nombre de usuario no puede estar vacío."));  // Devuelve una respuesta HTTP 400
            } 

            Optional<User> other = this.userRep.getUser(user.getUsername());    
            if (other.isPresent()) {                                            // Verifica si ya existe un usuario con ese nombre de usuario
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "El nombre de usuario ya está en uso."));  // Y si existe devuelve un código 409 (Conflict)
            }

            this.userRep.updateUser(user);                          // Actualiza el repositorio de usuarios
            this.apiStatusService.setActive(user.getUsername());    // Lo marca como activo

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Usuario registrado con éxito."));
        }
    }
    
    /**
     * PUT /api/users/{username}
     * @param username
     * @param newUsernameRequest
     * @return
     */
    @PutMapping("/{username}")
    public ResponseEntity<?> updateUsername(@PathVariable String username, @RequestBody UsernameUpdateRequest newUsernameRequest) {
        synchronized (this.userRep) {
            Optional<User> user = this.userRep.getUser(username);
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Usuario no encontrado."));
            }

            String newUsername = newUsernameRequest.newUser();

            if (newUsername == null) {
                return ResponseEntity.badRequest().build();
            }

            Optional<User> conflictUser = this.userRep.getUser(newUsername);
            if(conflictUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            User updatedUser = user.get();
            updatedUser.setUsername(newUsername);

            boolean updated = this.userRep.updateUser(updatedUser);
            if(!updated) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "No se pudo actualizar el nombre de usuario."));
            }

            return ResponseEntity.ok().build();
        }
    }

    /**
     * POST /api/users/{username}/disconnect    Maneja la desconexión de un usuario
     * @param username
     * @return
     */
    @PostMapping("/{username}/disconnect")
    public ResponseEntity<?> disconnectUser(@PathVariable String username) {
        // Desactiva el usuario cuando se desconecta (por ejemplo, cuando se cierra la sesión o se recarga la página)
        synchronized (this.userRep) {
            Optional<User> user = this.userRep.getUser(username);
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Usuario no encontrado."));
            }

            this.apiStatusService.setInactive(username);  // Marca al usuario como desconectado
            return ResponseEntity.ok().body(Map.of("message", "Usuario desconectado correctamente."));
        }
    }
    
    public static record UsernameUpdateRequest(String newUser) {}
}