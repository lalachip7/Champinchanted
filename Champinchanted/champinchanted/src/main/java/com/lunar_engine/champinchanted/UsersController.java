package com.lunar_engine.champinchanted;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
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
    public ResponseEntity<Void> heartbeat(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        if (username != null && !username.trim().isEmpty()) {
            // Usas un método que ya existe en tu ApiStatusService
            apiStatusService.hasSeen(username);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}
