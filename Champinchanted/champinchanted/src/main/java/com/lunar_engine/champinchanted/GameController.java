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
    private final GameRepository gameRepository;    // Servicio para la lógica de negocio de las partidas

    @Autowired
    private final GameService gameService;          // Repositorio para la persistencia de partidas

    // CONSTRUCTOR ..........................................................................
    public GameController(GameService gameService, GameRepository gameRepository) {
        this.gameService = gameService;
        this.gameRepository = gameRepository;
    }

    /****************************************************************************************
     * Recupera una partida específica dado su código
     * GET /api/games/{code}
     * @param code Código único de la partida
     * @return La parte encontrada o 404 si no existe
     */
    @GetMapping("/{code}")
    public ResponseEntity<Game> getGame(@PathVariable String code) {
        Optional<Game> game = gameService.getGame(code); // Buscar en el servicio (memoria)
        if (game.isPresent()) {
            return ResponseEntity.ok(game.get());
        } else {
            // Si no está en memoria, intentar cargarla del repositorio (disco)
            Optional<Game> persistedGame = gameRepository.getGame(code);
            if (persistedGame.isPresent()) {
                // Si se encuentra en disco, añadirla al servicio para futuras operaciones
                gameService.addGame(persistedGame.get());
                return ResponseEntity.ok(persistedGame.get());
            }
            return ResponseEntity.notFound().build();
        }
    }

    /****************************************************************************************
     * Elimina una partida por su código
     * DELETE /api/games/{code}
     * @param code Código de la partida a eliminar
     * @return 200 OK si se elimina correctamente o 404 si la partida no existe
     */
    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteGame(@PathVariable String code) {
        if (gameService.removeGame(code)) { // Eliminar de la memoria
            gameRepository.deleteGame(code); // Eliminar del repositorio (disco)
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Partida no encontrada."));
    }
    
    /****************************************************************************************
     * Crea una nueva partida
     * POST /api/games/create
     * @param request Un mapa que contiene el nombre de usuario del creador
     * @return 201 Created y el objeto Game si se crea correctamente, o 400 Bad Request si el username no es válido
     */
    @PostMapping("/create")
    public ResponseEntity<?> createGame(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username no puede estar vacío."));
        }

        Game newGame = gameService.createGame(username);
        if (newGame != null) {
            // Persistir la nueva partida en el repositorio
            gameRepository.createGame(newGame);
            return ResponseEntity.status(HttpStatus.CREATED).body(newGame);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "No se pudo crear la partida."));
    }

    /****************************************************************************************
     * Une un usuario a una partida existente
     * POST /api/games/join
     * @param joinMessage Mensaje con el código de partida y el nombre de usuario
     * @return 200 OK y el objeto Game actualizado si la unión fue exitosa, o 404/400 si la partida no existe o está llena
     */
    @PostMapping("/join")
    public ResponseEntity<?> joinGame(@RequestBody JoinGameMessage joinMessage) {
        Optional<Game> updatedGame = gameService.joinGame(joinMessage.getGameCode(), joinMessage.getUsername());
        if (updatedGame.isPresent()) {
            // Persistir el cambio en el repositorio
            gameRepository.saveGame(updatedGame.get());
            return ResponseEntity.ok(updatedGame.get());
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "No se pudo unir a la partida. Podría no existir o ya estar llena."));
        }
    }

    /****************************************************************************************
     * Actualiza el personaje del jugador 1 en una partida
     * PUT /api/games/{code}/player1Character
     * @param characterId ID del personaje
     * @param gameCode Código de la partida
     * @return 200 OK si se actualiza correctamente o 404 si la partida no existe
     */
    @PutMapping("/{code}/player1Character")
    public ResponseEntity<?> putPlayer1Character(@RequestBody int characterId, @PathVariable("code") String gameCode) {
        Optional<Game> optionalGame = gameService.getGame(gameCode);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
        }

        Game game = optionalGame.get();
        game.setPlayer1(characterId);
        gameService.updateGame(game);   // Actualiza en el servicio (memoria)
        gameRepository.saveGame(game);  // Persiste el cambio en el repositorio
        System.out.println("Personaje del jugador 1 asignado: " + characterId);
        return ResponseEntity.ok().build();
    }

    /****************************************************************************************
     * Actualiza el personaje del jugador 2 en una partida
     * PUT /api/games/{code}/player2Character
     * @param characterId ID del personaje
     * @param gameCode Código de la partida
     * @return 200 OK si se actualiza correctamente o 404 si la partida no existe
     */
    @PutMapping("/{code}/player2Character")
    public ResponseEntity<?> putPlayer2Character(@RequestBody int characterId, @PathVariable("code") String gameCode) {
        Optional<Game> optionalGame = gameService.getGame(gameCode);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
        }

        Game game = optionalGame.get();
        game.setPlayer2(characterId);
        gameService.updateGame(game);   
        gameRepository.saveGame(game); 
        System.out.println("Personaje del jugador 2 asignado: " + characterId);
        return ResponseEntity.ok().build();
    }

     /****************************************************************************************
     * Actualiza el mapa de una partida
     * PUT /api/games/{code}/map
     * @param map ID del mapa
     * @param gameCode Código de la partida
     * @return 200 OK si se actualiza correctamente o 404 si la partida no existe
     */
    @PutMapping("/{code}/map")
    public ResponseEntity<?> putMap(@RequestBody int map, @PathVariable("code") String gameCode) {
        Optional<Game> optionalGame = gameService.getGame(gameCode);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
        }

        Game game = optionalGame.get();
        game.setMap(map);
        gameService.updateGame(game);   
        gameRepository.saveGame(game); 
        System.out.println("Mapa asignado: " + map);
        return ResponseEntity.ok().build();
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
        Optional<Game> optionalGame = gameService.getGame(gameCode);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
        }

        Game game = optionalGame.get();
        game.setUsersConnected(number);
        gameService.updateGame(game); // Actualizar en el servicio (memoria)
        gameRepository.saveGame(game); // Persistir el cambio en el repositorio
        System.out.println("Número de usuarios: " + number);
        return ResponseEntity.ok().build();
    }

    /****************************************************************************************
     * Actualiza el estado completo de un jugador en una partida
     * PUT /api/games/{gameCode}/playerState/{username}
     * @param gameCode Código de la partida
     * @param username Nombre de usuario del jugador a actualizar
     * @param playerState Objeto PlayerState con los datos actualizados del jugador
     * @return 200 OK si se actualiza correctamente o 404 si la partida o el jugador no existen
     */
    @PutMapping("/{gameCode}/playerState/{username}")
    public ResponseEntity<?> updatePlayerState(@PathVariable String gameCode, @PathVariable String username, @RequestBody PlayerState playerState) {
        Optional<Game> optionalGame = gameService.getGame(gameCode);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Partida no encontrada."));
        }

        Game game = optionalGame.get();
        boolean updated = false;

        if (game.getUsernamePlayer1() != null && game.getUsernamePlayer1().equals(username)) {
            game.setPlayer1PositionX(playerState.getPositionX());
            game.setPlayer1PositionY(playerState.getPositionY());
            game.setPlayer1Score(playerState.getScore());
            game.setPlayer1Lives(playerState.getLives());
            game.setPlayer1SpellUsed(playerState.isSpellUsed());
            game.setPlayer1FlagStatus(playerState.isFlagStatus());
            updated = true;
        } else if (game.getUsernamePlayer2() != null && game.getUsernamePlayer2().equals(username)) {
            game.setPlayer2PositionX(playerState.getPositionX());
            game.setPlayer2PositionY(playerState.getPositionY());
            game.setPlayer2Score(playerState.getScore());
            game.setPlayer2Lives(playerState.getLives());
            game.setPlayer2SpellUsed(playerState.isSpellUsed());
            game.setPlayer2FlagStatus(playerState.isFlagStatus());
            updated = true;
        }

        if (updated) {
            gameService.updateGame(game); 
            gameRepository.saveGame(game); 
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Jugador no encontrado en la partida."));
        }
    }
}
