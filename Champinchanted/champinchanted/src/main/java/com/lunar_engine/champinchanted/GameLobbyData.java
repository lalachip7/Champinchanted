package com.lunar_engine.champinchanted;

public class GameLobbyData {
    private String code;
    private String usernamePlayer1;
    private String usernamePlayer2;
    private int map;
    private int player1Character;
    private int player2Character;
    private boolean player1Ready;
    private boolean player2Ready;
    private int usersConnected;

    // Getters y Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getUsernamePlayer1() { return usernamePlayer1; }
    public void setUsernamePlayer1(String usernamePlayer1) { this.usernamePlayer1 = usernamePlayer1; }
    public String getUsernamePlayer2() { return usernamePlayer2; }
    public void setUsernamePlayer2(String usernamePlayer2) { this.usernamePlayer2 = usernamePlayer2; }
    public int getMap() { return map; }
    public void setMap(int map) { this.map = map; }
    public int getPlayer1Character() { return player1Character; }
    public void setPlayer1Character(int player1Character) { this.player1Character = player1Character; }
    public int getPlayer2Character() { return player2Character; }
    public void setPlayer2Character(int player2Character) { this.player2Character = player2Character; }
    public boolean isPlayer1Ready() { return player1Ready; }
    public void setPlayer1Ready(boolean player1Ready) { this.player1Ready = player1Ready; }
    public boolean isPlayer2Ready() { return player2Ready; }
    public void setPlayer2Ready(boolean player2Ready) { this.player2Ready = player2Ready; }
    public int getUsersConnected() { return usersConnected; }
    public void setUsersConnected(int usersConnected) { this.usersConnected = usersConnected; }
}
