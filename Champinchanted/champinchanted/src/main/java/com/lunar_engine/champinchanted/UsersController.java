package com.lunar_engine.champinchanted;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    private final UserRepository userRep;
    private final ApiStatusService apiStatusService;

    private final PasswordEncoder passwordEncoder;

    public UsersController(UserRepository userRep, ApiStatusService apiStatusService, PasswordEncoder passwordEncoder) {
        this.userRep = userRep;
        this.apiStatusService = apiStatusService;
        this.passwordEncoder = passwordEncoder; // Añadirlo al constructor
    }

    /**
     * Registra un nuevo usuario con su contraseña.
     */
    @PostMapping
    public ResponseEntity<Object> registerUser(@RequestBody User user) {
        String username = user.getUsername();
        String password = user.getPassword();

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "El nombre de usuario y la contraseña no pueden estar vacíos."));
        }

        if (this.userRep.getUser(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "El nombre de usuario ya está en uso."));
        }

        String encodedPassword = this.passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);

        this.userRep.updateUser(user);
        this.apiStatusService.setActive(username);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Usuario registrado con éxito."));
    }

    /**
     * NUEVO ENDPOINT: Inicia sesión con un usuario existente.
     */
    @PostMapping("/login")
    public ResponseEntity<Object> loginUser(@RequestBody User loginAttempt) {
        String username = loginAttempt.getUsername();
        String password = loginAttempt.getPassword(); // La variable se llama "password"

        Optional<User> userOpt = this.userRep.getUser(username);

        // Usa "password" aquí, no "rawPassword"
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            this.apiStatusService.setActive(username);
            return ResponseEntity.ok(Map.of("message", "Inicio de sesión exitoso."));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Usuario o contraseña incorrectos."));
        }
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Void> handleHeartbeat(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");

        if (username == null || username.trim().isEmpty()) {
            // Si no se proporciona un nombre de usuario, es una mala petición.
            return ResponseEntity.badRequest().build();
        }

        // Se utiliza el servicio ApiStatusService, que ya está inyectado en el
        // controlador,
        // para registrar la actividad del usuario.
        this.apiStatusService.hasSeen(username);

        // Se devuelve una respuesta HTTP 200 OK sin contenido para indicar que todo ha
        // ido bien.
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{username}")
    public ResponseEntity<Object> updatePassword(
            @PathVariable String username,
            @RequestBody Map<String, String> payload) {

        // 1. Buscamos si el usuario existe en el repositorio.
        Optional<User> userOpt = this.userRep.getUser(username); //

        if (userOpt.isEmpty()) {
            // Si el usuario no existe, devolvemos un error 404 (Not Found).
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "El usuario no fue encontrado."));
        }

        // 2. Extraemos la nueva contraseña del cuerpo de la petición.
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");
        if (newPassword == null || newPassword.trim().isEmpty()) {
            // Si no se envía una contraseña, devolvemos un error 400 (Bad Request).
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "La nueva contraseña no puede estar vacía."));
        }

        // 3. Obtenemos el usuario y actualizamos su contraseña.
        User userToUpdate = userOpt.get();

        if (!passwordEncoder.matches(oldPassword, userToUpdate.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "La contraseña antigua es incorrecta."));
        }

        // Es MUY IMPORTANTE codificar la nueva contraseña antes de guardarla.
        String encodedPassword = this.passwordEncoder.encode(newPassword);
        userToUpdate.setPassword(encodedPassword);
        this.userRep.updateUser(userToUpdate);

        // 4. Guardamos los cambios en el repositorio.
        this.userRep.updateUser(userToUpdate); //

        // 5. Devolvemos una respuesta de éxito.
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada con éxito."));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<Object> deleteUser(
            @PathVariable String username,
            @RequestBody Map<String, String> payload) { // Pedimos el cuerpo de la petición

        // Buscamos al usuario
        Optional<User> userOpt = this.userRep.getUser(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "El usuario no fue encontrado."));
        }

        // Verificamos la contraseña
        String password = payload.get("password");
        if (password == null || !passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // Error 401 No Autorizado
                    .body(Map.of("message", "La contraseña es incorrecta."));
        }

        // Si la contraseña es correcta, procedemos a borrar
        boolean isDeleted = this.userRep.deleteUser(username);
        if (isDeleted) {
            this.apiStatusService.setInactive(username);
            return ResponseEntity.ok(Map.of("message", "Usuario eliminado correctamente."));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "No se pudo eliminar el usuario."));
        }
    }
}
