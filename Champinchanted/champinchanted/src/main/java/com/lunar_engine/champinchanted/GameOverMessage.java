package com.lunar_engine.champinchanted;

public class GameOverMessage {
    private String winnerUsername;
    private int finalScoreP1;
    private int finalScoreP2;

    // Es necesario un constructor vacío para la deserialización
    public GameOverMessage() {
    }

    public GameOverMessage(String winnerUsername, int finalScoreP1, int finalScoreP2) {
        this.winnerUsername = winnerUsername;
        this.finalScoreP1 = finalScoreP1;
        this.finalScoreP2 = finalScoreP2;
    }

    // Getters y Setters
    public String getWinnerUsername() { return winnerUsername; }
    public void setWinnerUsername(String winnerUsername) { this.winnerUsername = winnerUsername; }
    
    public int getFinalScoreP1() { return finalScoreP1; }
    public void setFinalScoreP1(int finalScoreP1) { this.finalScoreP1 = finalScoreP1; }
    
    public int getFinalScoreP2() { return finalScoreP2; }
    public void setFinalScoreP2(int finalScoreP2) { this.finalScoreP2 = finalScoreP2; }
}
