package com.lunar_engine.champinchanted;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/{gameCode}/status")
    public ResponseEntity<Object> getGameStatus(@PathVariable String gameCode) {
        Optional<Game> gameOpt = gameService.getGame(gameCode);

        if (gameOpt.isPresent()) {
            Game game = gameOpt.get();
            Map<String, Object> gameStatus = Map.of(
                "gameCode", game.getCode(),
                "playerCount", game.getUsersConnected()
            );
            return ResponseEntity.ok(gameStatus);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "La partida no fue encontrada."));
        }
    }

    @PostMapping("/{gameCode}/chat")
    public ResponseEntity<Void> postChatMessage(@PathVariable String gameCode, @RequestBody ChatMessageDTO message) {
        Optional<Game> gameOpt = gameService.getGame(gameCode);
        if (gameOpt.isPresent()) {
            Game game = gameOpt.get();
            game.addChatMessage(message);
            
            // Forzamos el guardado de la partida en el fichero.
            gameService.updateGame(game);
            
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{gameCode}/timeline")
    public ResponseEntity<List<DisplayableEventDTO>> getGameTimeline(@PathVariable String gameCode) {
        Optional<Game> gameOpt = gameService.getGame(gameCode);
        if (gameOpt.isPresent()) {
            return ResponseEntity.ok(gameOpt.get().getTimeline());
        }
        return ResponseEntity.ok(Collections.emptyList());
    }
}