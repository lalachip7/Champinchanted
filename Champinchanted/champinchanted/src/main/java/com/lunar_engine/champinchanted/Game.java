package com.lunar_engine.champinchanted;

public class Game {
    private String usernamePlayer1;     // Nombre de usuario del jugador 1
    private String usernamePlayer2;     // Nombre de usuario del jugador 2
    private int map;                    // Mapa elegido
    private int player1;                // Personaje elegido por el jugador 1
    private int player2;                // Personaje elegido por el jugador 2
    private String code;                // Código de partida
    private int usersConnected;         // Número de usuarios en la partida

    // CONSTRUCTOR
    public Game(String usernamePlayer1, String usernamePlayer2, int map, int player1, int player2, String code, int usersConnected) {
        this.usernamePlayer1 = usernamePlayer1;
        this.usernamePlayer2 = usernamePlayer2;
        this.map = map;
        this.player1 = player1;
        this.player2 = player2;
        this.code = code;
        this.usersConnected = usersConnected;
    }

    // GETTERS
    public String getUsernamePlayer1() {
        return this.usernamePlayer1;
    }

    public String getUsernamePlayer2() {
        return this.usernamePlayer2;
    }

    public int getMap() {
        return this.map;
    }

    public int getPlayer1() {
        return this.player1;
    }

    public int getPlayer2() {
        return this.player2;
    }

    public String getCode() {
        return this.code;
    }

    public int getUsersConnected() {
        return this.usersConnected;
    }

    // SETTERS
    public void setUsernamePlayer1(String username) {
        this.usernamePlayer1 = username;
    }

    public void setUsernamePlayer2(String username) {
        this.usernamePlayer2 = username;
    }

    public void setMap(int map) {
        this.map = map;
    }

    public void setPlayer1(int player) {
        this.player1 = player;
    }

    public void setPlayer2(int player) {
        this.player2 = player;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setUsersConnected(int usersConnected) {
        this.usersConnected = usersConnected;
    }
}
