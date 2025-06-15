package com.lunar_engine.champinchanted;

import java.util.ArrayList;
import java.util.List;

public class Game {
    private String usernamePlayer1, usernamePlayer2;
    private int map = -1;
    private int player1Character = -1, player2Character = -1;
    private String code;
    private int usersConnected;
    private boolean player1Ready = false, player2Ready = false;
    private float player1PositionX, player1PositionY;
    private int player1Score, player1Lives;
    private boolean player1SpellUsed, player1FlagStatus;
    private float player2PositionX, player2PositionY;
    private int player2Score, player2Lives;
    private boolean player2SpellUsed, player2FlagStatus;

    // Esta es la única lista que necesitamos. No tiene @JsonIgnore para que se guarde.
    private List<DisplayableEventDTO> timeline = new ArrayList<>();

    public Game() {
        this.timeline = new ArrayList<>();
    }

    public Game(String usernamePlayer1, String code) {
        this.usernamePlayer1 = usernamePlayer1;
        this.code = code;
        this.usersConnected = 1;
        this.timeline = new ArrayList<>();
        this.addSystemEvent("La sala ha sido creada por " + usernamePlayer1);
        resetInGameStats();
    }

    // CORREGIDO: El constructor ahora carga la timeline desde el fichero guardado.
    public Game(GameLobbyData lobbyData) {
        this.code = lobbyData.getCode();
        this.usernamePlayer1 = lobbyData.getUsernamePlayer1();
        this.usernamePlayer2 = lobbyData.getUsernamePlayer2();
        this.map = lobbyData.getMap();
        this.player1Character = lobbyData.getPlayer1Character();
        this.player2Character = lobbyData.getPlayer2Character();
        this.player1Ready = lobbyData.isPlayer1Ready();
        this.player2Ready = lobbyData.isPlayer2Ready();
        this.usersConnected = lobbyData.getUsersConnected();
        // Cargamos la timeline guardada, si no existe, creamos una nueva.
        this.timeline = new ArrayList<>(lobbyData.getTimeline() != null ? lobbyData.getTimeline() : List.of());
        resetInGameStats();
    }

    // CORREGIDO: El método para guardar ahora incluye la timeline.
    public GameLobbyData toLobbyData() {
        GameLobbyData lobbyData = new GameLobbyData();
        lobbyData.setCode(this.code);
        lobbyData.setUsernamePlayer1(this.usernamePlayer1);
        lobbyData.setUsernamePlayer2(this.usernamePlayer2);
        lobbyData.setMap(this.map);
        lobbyData.setPlayer1Character(this.player1Character);
        lobbyData.setPlayer2Character(this.player2Character);
        lobbyData.setPlayer1Ready(this.player1Ready);
        lobbyData.setPlayer2Ready(this.player2Ready);
        lobbyData.setUsersConnected(this.usersConnected);
        lobbyData.setTimeline(this.timeline); // <-- Se guarda la timeline
        return lobbyData;
    }
    
    // --- Métodos para la Línea de Tiempo Unificada ---
    public List<DisplayableEventDTO> getTimeline() { return timeline; }
    public void addSystemEvent(String content) { this.timeline.add(new DisplayableEventDTO(content)); }
    public void addChatMessage(ChatMessageDTO message) { this.timeline.add(new DisplayableEventDTO(message.getSender(), message.getContent())); }
    
    // El resto del fichero (resetInGameStats, getPlayerCount, getters/setters) no cambia.
    public void resetInGameStats() { this.player1PositionX = 0.0f; this.player1PositionY = 0.0f; this.player1Score = 0; this.player1Lives = 5; this.player1SpellUsed = false; this.player1FlagStatus = false; this.player2PositionX = 0.0f; this.player2PositionY = 0.0f; this.player2Score = 0; this.player2Lives = 5; this.player2SpellUsed = false; this.player2FlagStatus = false; }
    public int getPlayerCount() { int count = 0; if (this.usernamePlayer1 != null && !this.usernamePlayer1.isEmpty()) count++; if (this.usernamePlayer2 != null && !this.usernamePlayer2.isEmpty()) count++; return count; }
    public String getUsernamePlayer1() { return usernamePlayer1; }
    public void setUsernamePlayer1(String u) { this.usernamePlayer1 = u; }
    public String getUsernamePlayer2() { return usernamePlayer2; }
    public void setUsernamePlayer2(String u) { this.usernamePlayer2 = u; }
    public int getMap() { return map; }
    public void setMap(int m) { this.map = m; }
    public int getPlayer1Character() { return player1Character; }
    public void setPlayer1Character(int c) { this.player1Character = c; }
    public int getPlayer2Character() { return player2Character; }
    public void setPlayer2Character(int c) { this.player2Character = c; }
    public String getCode() { return code; }
    public void setCode(String c) { this.code = c; }
    public int getUsersConnected() { return usersConnected; }
    public void setUsersConnected(int u) { this.usersConnected = u; }
    public boolean isPlayer1Ready() { return player1Ready; }
    public void setPlayer1Ready(boolean r) { this.player1Ready = r; }
    public boolean isPlayer2Ready() { return player2Ready; }
    public void setPlayer2Ready(boolean r) { this.player2Ready = r; }
}