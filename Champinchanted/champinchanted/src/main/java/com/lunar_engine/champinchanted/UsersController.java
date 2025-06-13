package com.lunar_engine.champinchanted;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UsersController {
    
    private final UserRepository userRep;
    private final ApiStatusService apiStatusService;
    
    public UsersController(UserRepository userRep, ApiStatusService apiStatusService) {
        this.userRep = userRep;
        this.apiStatusService = apiStatusService;
    }

    /**
     * Registra un nuevo usuario con su contraseña.
     */
    @PostMapping
    public ResponseEntity<Object> registerUser(@RequestBody User user) {
        String username = user.getUsername();
        String password = user.getPassword();

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {     
            return ResponseEntity.badRequest().body(Map.of("message", "El nombre de usuario y la contraseña no pueden estar vacíos."));
        } 

        if (this.userRep.getUser(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "El nombre de usuario ya está en uso."));
        }

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
        String password = loginAttempt.getPassword();

        Optional<User> userOpt = this.userRep.getUser(username);

        // Comprueba si el usuario existe y si la contraseña coincide.
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            // Si todo es correcto, lo marca como activo y devuelve OK.
            this.apiStatusService.setActive(username);
            return ResponseEntity.ok(Map.of("message", "Inicio de sesión exitoso."));
        } else {
            // Si el usuario no existe o la contraseña es incorrecta, devuelve un error.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Usuario o contraseña incorrectos."));
        }
    }
}
