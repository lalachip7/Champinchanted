package com.lunar_engine.champinchanted;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private final GameRepository gameRep;

    // CONSTRUCTOR
    public GameController(GameRepository gameRep) {
        this.gameRep = gameRep;
    }

    /**
     * GET /api/games/{code}
     * @param code
     * @return
     */
    @GetMapping("/{code}")
    public ResponseEntity<Game> getGame(@PathVariable String code) {
        synchronized (this.gameRep) {
            Optional<Game> game = this.gameRep.getGame(code);

            if (game.isPresent()) {
                return ResponseEntity.ok(game.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        }
    }

    /**
     * DELETE /api/games/{code}
     * @param code
     * @return
     */
    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteGame(@PathVariable int code) {
        synchronized (this.gameRep) {
            boolean removed = this.gameRep.deleteGame(code);
            if (removed) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        }
    }
    

    @PostMapping("/")
    public ResponseEntity<?> createGame(@RequestBody Game game) {
        synchronized (this.gameRep) {
            if (game.getCode() == null) {
                return ResponseEntity.badRequest().build();
            }

            Optional<Game> other = this.gameRep.getGame(game.getCode());
            if (other.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            boolean saved = this.gameRep.createGame(game);
            if (saved) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }  
        }
    }
}
