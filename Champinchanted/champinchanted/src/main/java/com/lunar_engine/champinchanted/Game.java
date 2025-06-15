package com.lunar_engine.champinchanted;
import java.util.Timer;
import java.util.concurrent.locks.ReentrantLock;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class Game {
    // Atributos del lobby y de la partida en tiempo real
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

    private float flagPositionX, flagPositionY;
    private boolean flagVisible = true;
    private String flagHolderUsername = null; // Quién tiene la bandera

    private float venomSpellX, venomSpellY;
    private boolean venomSpellVisible = true;

    private float dazerSpellX, dazerSpellY;
    private boolean dazerSpellVisible = true;

    private boolean player1Frozen = false;
    private boolean player2Frozen = false;

    private boolean player1Poisoned = false;
    private boolean player2Poisoned = false;
    private transient Timer player1PoisonTimer; // transient para no guardarlo en JSON
    private transient Timer player2PoisonTimer;

    private int player1HeldSpell = 0; // 0:ninguno, 1:venom, 2:dazer, etc.
    private int player2HeldSpell = 0;

    private static final float P1_START_X = 250; 
    private static final float P1_START_Y = 700;
    private static final float P2_START_X = 1670; 
    private static final float P2_START_Y = 700;

    private final transient ReentrantLock gameLock = new ReentrantLock();

    public Game() {
    }

    public Game(String usernamePlayer1, String code) {
        this.usernamePlayer1 = usernamePlayer1;
        this.code = code;
        this.usersConnected = 1;
        this.player1PositionX = P1_START_X;
        this.player1PositionY = P1_START_Y;
        this.player2PositionX = P2_START_X;
        this.player2PositionY = P2_START_Y;
        resetInGameStats(); // Inicializa vidas y puntuaciones
        initializeRound();
    }

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
        this.player1PositionX = P1_START_X;
        this.player1PositionY = P1_START_Y;
        this.player2PositionX = P2_START_X;
        this.player2PositionY = P2_START_Y;
        resetInGameStats();
        initializeRound();
    }

    public void initializeRound() {
        this.flagPositionX = 960;
        this.flagPositionY = 150;
        this.flagVisible = true;
        this.flagHolderUsername = null;
        this.venomSpellX = 400;
        this.venomSpellY = 500;
        this.venomSpellVisible = true;
        this.dazerSpellX = 1500;
        this.dazerSpellY = 500;
        this.dazerSpellVisible = true;
        this.player1HeldSpell = 0;
        this.player2HeldSpell = 0;
    }

    public void resetForNewRound() {
        initializeRound();
        this.player1PositionX = P1_START_X;
        this.player1PositionY = P1_START_Y;
        this.player2PositionX = P2_START_X;
        this.player2PositionY = P2_START_Y;
        if (this.player1PoisonTimer != null) {
            this.player1PoisonTimer.cancel();
            this.player1PoisonTimer = null;
        }
        if (this.player2PoisonTimer != null) {
            this.player2PoisonTimer.cancel();
            this.player2PoisonTimer = null;
        }
        this.player1Poisoned = false;
        this.player2Poisoned = false;
    }

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
        return lobbyData;
    }

    public void resetInGameStats() {
        this.player1Score = 0;
        this.player1Lives = 5;
        this.player1SpellUsed = false;
        this.player1FlagStatus = false;
        this.player2Score = 0;
        this.player2Lives = 5;
        this.player2SpellUsed = false;
        this.player2FlagStatus = false;
    }

    public int getPlayerCount() {
        int count = 0;
        if (this.usernamePlayer1 != null && !this.usernamePlayer1.isEmpty()) count++;
        if (this.usernamePlayer2 != null && !this.usernamePlayer2.isEmpty()) count++;
        return count;
    }

    // --- GETTERS & SETTERS ---
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
    public void setPlayer1PositionX(float x) { this.player1PositionX = x; }
    public void setPlayer1PositionY(float y) { this.player1PositionY = y; }
    public void setPlayer2PositionX(float x) { this.player2PositionX = x; }
    public void setPlayer2PositionY(float y) { this.player2PositionY = y; }
    public float getFlagPositionX() { return flagPositionX; }
    public void setFlagPositionX(float flagPositionX) { this.flagPositionX = flagPositionX; }
    public float getFlagPositionY() { return flagPositionY; }
    public void setFlagPositionY(float flagPositionY) { this.flagPositionY = flagPositionY; }
    public boolean isFlagVisible() { return flagVisible; }
    public void setFlagVisible(boolean flagVisible) { this.flagVisible = flagVisible; }
    public String getFlagHolderUsername() { return flagHolderUsername; }
    public void setFlagHolderUsername(String flagHolderUsername) { this.flagHolderUsername = flagHolderUsername; }
    public float getVenomSpellX() { return venomSpellX; }
    public void setVenomSpellX(float venomSpellX) { this.venomSpellX = venomSpellX; }
    public float getVenomSpellY() { return venomSpellY; }
    public void setVenomSpellY(float venomSpellY) { this.venomSpellY = venomSpellY; }
    public boolean isVenomSpellVisible() { return venomSpellVisible; }
    public void setVenomSpellVisible(boolean venomSpellVisible) { this.venomSpellVisible = venomSpellVisible; }
    public int getPlayer1HeldSpell() { return player1HeldSpell; }
    public void setPlayer1HeldSpell(int spellId) { this.player1HeldSpell = spellId; }
    public int getPlayer2HeldSpell() { return player2HeldSpell; }
    public void setPlayer2HeldSpell(int spellId) { this.player2HeldSpell = spellId; }
    public int getPlayer1Score() { return player1Score; }
    public void setPlayer1Score(int score) { this.player1Score = score; }
    public int getPlayer2Score() { return player2Score; }
    public void setPlayer2Score(int score) { this.player2Score = score; }
    public float getPlayer1PositionX() { return player1PositionX; }
    public float getPlayer1PositionY() { return player1PositionY; }
    public float getPlayer2PositionX() { return player2PositionX; }
    public float getPlayer2PositionY() { return player2PositionY; }
    public float getDazerSpellX() { return dazerSpellX; }
    public void setDazerSpellX(float dazerSpellX) { this.dazerSpellX = dazerSpellX; }
    public float getDazerSpellY() { return dazerSpellY; }
    public void setDazerSpellY(float dazerSpellY) { this.dazerSpellY = dazerSpellY; }
    public boolean isDazerSpellVisible() { return dazerSpellVisible; }
    public void setDazerSpellVisible(boolean dazerSpellVisible) { this.dazerSpellVisible = dazerSpellVisible; }
    public boolean isPlayer1Frozen() { return player1Frozen; }
    public void setPlayer1Frozen(boolean frozen) { this.player1Frozen = frozen; }
    public boolean isPlayer2Frozen() { return player2Frozen; }
    public void setPlayer2Frozen(boolean frozen) { this.player2Frozen = frozen; }
    public boolean isPlayer1Poisoned() { return player1Poisoned; }
    public void setPlayer1Poisoned(boolean poisoned) { this.player1Poisoned = poisoned; }
    public boolean isPlayer2Poisoned() { return player2Poisoned; }
    public void setPlayer2Poisoned(boolean poisoned) { this.player2Poisoned = poisoned; }
    public Timer getPlayer1PoisonTimer() { return player1PoisonTimer; }
    public void setPlayer1PoisonTimer(Timer timer) { this.player1PoisonTimer = timer; }
    public Timer getPlayer2PoisonTimer() { return player2PoisonTimer; }
    public void setPlayer2PoisonTimer(Timer timer) { this.player2PoisonTimer = timer; }
    public int getPlayer1Lives() { return this.player1Lives; }
    public int getPlayer2Lives() { return this.player2Lives; }

    // ▼▼▼ MÉTODOS SETTER AÑADIDOS ▼▼▼
    public void setPlayer1Lives(int lives) { this.player1Lives = lives; }
    public void setPlayer2Lives(int lives) { this.player2Lives = lives; }
    
    @JsonIgnore
    public ReentrantLock getLock() { return this.gameLock; }

    @JsonIgnore
    public GameStateMessage toGameStateMessage() {
        PlayerState p1State = new PlayerState(this.usernamePlayer1, this.player1PositionX, this.player1PositionY,
                this.player1Score, this.player1Lives, this.player1SpellUsed, this.player1FlagStatus,
                this.player1Character, this.player1Ready, this.player1Frozen, this.player1Poisoned);
        PlayerState p2State = new PlayerState(this.usernamePlayer2, this.player2PositionX, this.player2PositionY,
                this.player2Score, this.player2Lives, this.player2SpellUsed, this.player2FlagStatus,
                this.player2Character, this.player2Ready, this.player2Frozen, this.player2Poisoned);
        GameStateMessage message = new GameStateMessage(this.code, p1State, p2State, this.map);
        message.setPlayer1HeldSpell(this.player1HeldSpell);
        message.setPlayer2HeldSpell(this.player2HeldSpell);
        message.setFlagPositionX(this.flagPositionX);
        message.setFlagPositionY(this.flagPositionY);
        message.setFlagVisible(this.flagVisible);
        message.setFlagHolderUsername(this.flagHolderUsername);
        message.setVenomSpellX(this.venomSpellX);
        message.setVenomSpellY(this.venomSpellY);
        message.setVenomSpellVisible(this.venomSpellVisible);
        message.setDazerSpellX(this.dazerSpellX);
        message.setDazerSpellY(this.dazerSpellY);
        message.setDazerSpellVisible(this.dazerSpellVisible);
        return message;
    }
}