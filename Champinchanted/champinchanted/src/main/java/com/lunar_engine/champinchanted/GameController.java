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


@RestController
@RequestMapping("/api/games")
public class GameController {

    @Autowired
    private final GameRepository gameRep;

    // CONSTRUCTOR ..........................................................................
    public GameController(GameRepository gameRep) {
        this.gameRep = gameRep;
    }

    /****************************************************************************************
     * Recupera una partida específica dado su código
     * GET /api/games/{code}
     * @param code Código único de la partida
     * @return La parte encontrada o 404 si no existe
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

    /****************************************************************************************
     * Elimina una partida específica dado su código
     * DELETE /api/games/{code}
     * @param code Código único de la partida
     * @return 200 OK si se eliminó, 404 Not Found si no existía
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
    
    /****************************************************************************************
     * Crea una nueva partida si no existe otra con el mismo código
     * POST
     * @param game Objeto partida recibido en el cuerpo de la petición
     * @return 200 OK si se crea, 409 Conflict si ya existe, o 400 Bad Request si el código
     * es inválido
     */
    @PostMapping
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

    /****************************************************************************************
     * Asocia un usuario a una partida en uno de los dos slots disponibles
     * PUT /api/games/{code}/user
     * @param username Nombre del usuario a registrar
     * @param gameCode Código de la partida
     * @return 201 Created si se registra, o error si la partida no exsite o ya tiene 2 jugadores
     */
    @PutMapping("/{code}/user")
    public ResponseEntity<?> putUser(@RequestBody String username, @PathVariable("code") 
    String gameCode) {
        synchronized (this.gameRep) {
            System.out.println("Recibido PUT con username: " + username + 
                               " y código de partida: " + gameCode);

            Optional<Game> optionalGame = this.gameRep.getGame(gameCode);
            if (optionalGame.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
            }

            Game game = optionalGame.get();
            if (game.getUsernamePlayer1() == null) {
                game.setUsernamePlayer1(username);
            } else if (game.getUsernamePlayer2() == null){
                game.setUsernamePlayer2(username);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Ya hay dos jugadores en la partida. " + 
                                 "No se pueden agregar más jugadores."));
            }

            this.gameRep.saveGame(game);

            System.out.println("Usuario asignado: " + username);
            return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("message", "Usuario registrado en game con éxito."));
        }
    }

    /****************************************************************************************
     * Asigna el personaje elegido por un jugador en la partida
     * PUT /api/games/{code}/character
     * @param playerCharacter ID del personaje seleccionado
     * @param gameCode Código de la partida
     * @return 200 OK si se asigna correctamente o 404 si la partida no existe
     */
    @PutMapping("/{code}/character")
    public ResponseEntity<?> putUserCharacter(@RequestBody int playerCharacter, 
    @PathVariable("code") String gameCode) {
        synchronized (this.gameRep) {
            Optional<Game> optionalGame = this.gameRep.getGame(gameCode);
            if (optionalGame.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
            }

            Game game = optionalGame.get();
            if (game.getPlayer1() == 0) {
                game.setPlayer1(playerCharacter);
            } else {
                game.setPlayer2(playerCharacter);
            }

            System.out.println("Personaje asignado: " + playerCharacter);
            this.gameRep.saveGame(game);

            System.out.println("Personaje asignado: " + playerCharacter);
            return ResponseEntity.ok().build();
        }
    }

    /****************************************************************************************
     * Asigna el mapa seleccionado para una partida
     * PUT /api/games/{code}/map
     * @param map ID del mapa elegido
     * @param gameCode Código de la partida
     * @return 200 OK si se actualiza correctamente o 404 si la partida no existe
     */
    @PutMapping("/{code}/map")
    public ResponseEntity<?> putMap(@RequestBody int map, @PathVariable("code") String 
    gameCode) {
        synchronized (this.gameRep) {
            System.out.println("Recibido PUT con mapa: " + map + " y código de partida: " + 
            gameCode);
            Optional<Game> optionalGame = this.gameRep.getGame(gameCode);
            if (optionalGame.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
            }

            Game game = optionalGame.get();
            game.setMap(map);   

            System.out.println("Mapa asignado: " + map);
            this.gameRep.saveGame(game);

            return ResponseEntity.ok().build();
        }
    }

    /****************************************************************************************
     * Actualiza el número de usuarios conectados
     * PUT /api/games/{code}/usersConnected
     * @param number Número de usuarios conectados
     * @param gameCode Código de la partida
     * @return 200 OK si se actualiza correctamente o 404 si la partida no existe
     */
    @PutMapping("/{code}/usersConnected")
    public ResponseEntity<?> putUsersConnected(@RequestBody int number, @PathVariable("code") 
    String gameCode) {
        synchronized (this.gameRep) {
            Optional<Game> optionalGame = this.gameRep.getGame(gameCode);
            if (optionalGame.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
            }

            Game game = optionalGame.get();
            game.setUsersConnected(number);   

            System.out.println("Número de usuarios: " + number);
            this.gameRep.saveGame(game);

            return ResponseEntity.ok().build();
        }
    }
}
