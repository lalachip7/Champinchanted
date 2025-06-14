package com.lunar_engine.champinchanted;

public class GameStateMessage {

    private String gameCode;
    private PlayerState player1State;
    private PlayerState player2State;
    private int mapId;

    private float flagPositionX, flagPositionY;
    private boolean flagVisible;
    private String flagHolderUsername;
    private float venomSpellX, venomSpellY;
    private boolean venomSpellVisible;

    private int player1HeldSpell;
    private int player2HeldSpell;

    public GameStateMessage() {
    }

    // Constructor con todos los parámetros
    public GameStateMessage(String gameCode, PlayerState player1State, PlayerState player2State, int mapId) {
        this.gameCode = gameCode;
        this.player1State = player1State;
        this.player2State = player2State;
        this.mapId = mapId;
    }

    // Getters y setters
    public String getGameCode() {
        return gameCode;
    }

    public void setGameCode(String gameCode) {
        this.gameCode = gameCode;
    }

    public PlayerState getPlayer1State() {
        return player1State;
    }

    public void setPlayer1State(PlayerState player1State) {
        this.player1State = player1State;
    }

    public PlayerState getPlayer2State() {
        return player2State;
    }

    public void setPlayer2State(PlayerState player2State) {
        this.player2State = player2State;
    }

    public int getMapId() {
        return mapId;
    }

    public void setMapId(int mapId) {
        this.mapId = mapId;
    }

    public float getFlagPositionX() {
        return flagPositionX;
    }

    public void setFlagPositionX(float flagPositionX) {
        this.flagPositionX = flagPositionX;
    }

    public float getFlagPositionY() {
        return flagPositionY;
    }

    public void setFlagPositionY(float flagPositionY) {
        this.flagPositionY = flagPositionY;
    }

    public boolean isFlagVisible() {
        return flagVisible;
    }

    public void setFlagVisible(boolean flagVisible) {
        this.flagVisible = flagVisible;
    }

    public String getFlagHolderUsername() {
        return flagHolderUsername;
    }

    public void setFlagHolderUsername(String flagHolderUsername) {
        this.flagHolderUsername = flagHolderUsername;
    }

    public float getVenomSpellX() {
        return venomSpellX;
    }

    public void setVenomSpellX(float venomSpellX) {
        this.venomSpellX = venomSpellX;
    }

    public float getVenomSpellY() {
        return venomSpellY;
    }

    public void setVenomSpellY(float venomSpellY) {
        this.venomSpellY = venomSpellY;
    }

    public boolean isVenomSpellVisible() {
        return venomSpellVisible;
    }

    public void setVenomSpellVisible(boolean venomSpellVisible) {
        this.venomSpellVisible = venomSpellVisible;
    }

    public int getPlayer1HeldSpell() {
        return player1HeldSpell;
    }

    public void setPlayer1HeldSpell(int spellId) {
        this.player1HeldSpell = spellId;
    }

    public int getPlayer2HeldSpell() {
        return player2HeldSpell;
    }

    public void setPlayer2HeldSpell(int spellId) {
        this.player2HeldSpell = spellId;
    }
}
