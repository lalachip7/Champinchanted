package com.lunar_engine.champinchanted;

import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping("/create")
    public ResponseEntity<Object> createGame(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username no puede estar vacío."));
        }
        Game newGame = gameService.createGame(username);
        if (newGame != null) {
            System.out.println("Servidor a punto de enviar el objeto Game: " + newGame.toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(newGame);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "No se pudo crear la partida."));
    }

    @PostMapping("/join")
    public ResponseEntity<Object> joinGame(@RequestBody JoinGameMessage joinMessage) {
        Optional<Game> updatedGameOpt = gameService.joinGame(joinMessage.getGameCode(), joinMessage.getUsername());
        
        return updatedGameOpt
                .<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "No se pudo unir a la partida. Podría no existir o ya estar llena.")));
    }
}
