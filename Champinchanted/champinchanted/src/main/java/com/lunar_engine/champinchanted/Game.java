package com.lunar_engine.champinchanted;

public class Game {
    private String usernamePlayer1;     // Nombre de usuario del jugador 1
    private String usernamePlayer2;     // Nombre de usuario del jugador 2
    private int map;                    // Mapa elegido
    private int player1;                // Personaje elegido por el jugador 1
    private int player2;                // Personaje elegido por el jugador 2
    private String code;                // Código de partida
    private int usersConnected;         // Número de usuarios en la partida

    private float player1PositionX;     // Posición x del jugador 1
    private float player1PositionY;     // Posición y del jugador 1
    private int player1Score;           // Puntuación del jugador 1
    private int player1Lives;           // Vidas del jugador 1
    private boolean player1SpellUsed;   // Almacena si tiene hechizos el jugador 1
    private boolean player1FlagStatus;  // Almacena si tiene la bandera el jugador 1
    private boolean player1Ready;

    private float player2PositionX;     // Posición x del jugador 2
    private float player2PositionY;     // Posición y del jugador 2
    private int player2Score;           // Puntuación del jugador 2
    private int player2Lives;           // Vidas del jugador 2
    private boolean player2SpellUsed;   // Almacena si tiene hechizos el jugador 2
    private boolean player2FlagStatus;  // Almacena si tiene la bandera el jugador 2
    private boolean player2Ready;

    // CONSTRUCTOR ..........................................................................
    public Game() {}    // Constructor vacío
    
    // Constructor para inicializar una nueva partida
    public Game(String usernamePlayer1, String code) {
        this.usernamePlayer1 = usernamePlayer1;
        this.code = code;
        this.usersConnected = 1;        // Al crear la partida, hay un usuario conectado
        this.player1 = -1;              // Valor por defecto para el personaje del jugador 1
        this.player2 = -1;              // Valor por defecto para el personaje del jugador 2
        this.map = -1;                  // Valor por defecto para el mapa

        // Valores por defecto para el estado dinámico de los jugadores
        this.player1PositionX = 0.0f;
        this.player1PositionY = 0.0f;
        this.player1Score = 0;
        this.player1Lives = 5;
        this.player1SpellUsed = false;
        this.player1FlagStatus = false;
        this.player1Ready = false; 

        this.player2PositionX = 0.0f;
        this.player2PositionY = 0.0f;
        this.player2Score = 0;
        this.player2Lives = 5;
        this.player2SpellUsed = false;
        this.player2FlagStatus = false;
        this.player2Ready = false; 
    }

   // GETTERS ..............................................................................
   public String getUsernamePlayer1() { return usernamePlayer1; }
   public String getUsernamePlayer2() { return usernamePlayer2; }
   public int getMap() { return map; }
   public int getPlayer1() { return player1; }
   public int getPlayer2() { return player2; }
   public String getCode() { return code; }
   public int getUsersConnected() { return usersConnected; }

   // Getters para el estado dinámico del jugador 1
   public float getPlayer1PositionX() { return player1PositionX; }
   public float getPlayer1PositionY() { return player1PositionY; }
   public int getPlayer1Score() { return player1Score; }
   public int getPlayer1Lives() { return player1Lives; }
   public boolean isPlayer1SpellUsed() { return player1SpellUsed; }
   public boolean isPlayer1FlagStatus() { return player1FlagStatus; }
   public boolean isPlayer1Ready() { return player1Ready; }

   // Getters para el estado dinámico del jugador 2
   public float getPlayer2PositionX() { return player2PositionX; }
   public float getPlayer2PositionY() { return player2PositionY; }
   public int getPlayer2Score() { return player2Score; }
   public int getPlayer2Lives() { return player2Lives; }
   public boolean isPlayer2SpellUsed() { return player2SpellUsed; }
   public boolean isPlayer2FlagStatus() { return player2FlagStatus; }
   public boolean isPlayer2Ready() { return player2Ready; }


   // SETTERS ..............................................................................
   public void setUsernamePlayer1(String usernamePlayer1) { this.usernamePlayer1 = usernamePlayer1; }
   public void setUsernamePlayer2(String usernamePlayer2) { this.usernamePlayer2 = usernamePlayer2; }
   public void setMap(int map) { this.map = map; }
   public void setPlayer1(int player1) { this.player1 = player1; }
   public void setPlayer2(int player2) { this.player2 = player2; }
   public void setCode(String code) { this.code = code; }
   public void setUsersConnected(int usersConnected) { this.usersConnected = usersConnected; }

   // Setters para el estado dinámico del jugador 1
   public void setPlayer1PositionX(float player1PositionX) { this.player1PositionX = player1PositionX; }
   public void setPlayer1PositionY(float player1PositionY) { this.player1PositionY = player1PositionY; }
   public void setPlayer1Score(int player1Score) { this.player1Score = player1Score; }
   public void setPlayer1Lives(int player1Lives) { this.player1Lives = player1Lives; }
   public void setPlayer1SpellUsed(boolean player1SpellUsed) { this.player1SpellUsed = player1SpellUsed; }
   public void setPlayer1FlagStatus(boolean player1FlagStatus) { this.player1FlagStatus = player1FlagStatus; }
   public void setPlayer1Ready(boolean player1Ready) { this.player1Ready = player1Ready; }

   // Setters para el estado dinámico del jugador 2
   public void setPlayer2PositionX(float player2PositionX) { this.player2PositionX = player2PositionX; }
   public void setPlayer2PositionY(float player2PositionY) { this.player2PositionY = player2PositionY; }
   public void setPlayer2Score(int player2Score) { this.player2Score = player2Score; }
   public void setPlayer2Lives(int player2Lives) { this.player2Lives = player2Lives; }
   public void setPlayer2SpellUsed(boolean player2SpellUsed) { this.player2SpellUsed = player2SpellUsed; }
   public void setPlayer2FlagStatus(boolean player2FlagStatus) { this.player2FlagStatus = player2FlagStatus; }
   public void setPlayer2Ready(boolean player2Ready) { this.player2Ready = player2Ready; }

    /****************************************************************************************
     * Crea un objeto GameStateMessage combinando el estado de ambos jugadores y el mapa.
     * @return Un objeto GameStateMessage
     */
    public GameStateMessage toGameStateMessage() {
        PlayerState p1State = new PlayerState(
            this.usernamePlayer1,
            this.player1PositionX,
            this.player1PositionY,
            this.player1Score,
            this.player1Lives,
            this.player1SpellUsed,
            this.player1FlagStatus,
            this.player1, // characterId
            this.player1Ready // isReady
        );

        PlayerState p2State = new PlayerState(
            this.usernamePlayer2,
            this.player2PositionX,
            this.player2PositionY,
            this.player2Score,
            this.player2Lives,
            this.player2SpellUsed,
            this.player2FlagStatus,
            this.player2, // characterId
            this.player2Ready // isReady
        );

        return new GameStateMessage(this.code, p1State, p2State, this.map);
    }
}
