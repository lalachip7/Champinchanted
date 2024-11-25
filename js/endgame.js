class EndGame extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    preload() {
        // Cargar imágenes o gráficos para los botones si los necesitas.
        this.load.image('endBackground', 'assets/Fondos/InterfazEnd.jpg');
        this.load.image('champichip', 'assets/Personajes/champichip.png');
        this.load.image('champistar', 'assets/Personajes/champistar.png');
        this.load.image('perretxiko', 'assets/Personajes/perretxiko.png');
        this.load.image('buttonPlayAgain', 'assets/Interfaz/botonJugarOtraVez.png');
        this.load.image('buttonExit', 'assets/Interfaz/Salir.png');
        this.load.image('victory1', 'assets/Interfaz/Victoria1.png');
        this.load.image('victory2', 'assets/Interfaz/Victoria2.png');
    }

    create(data) {

        // Fondo de la escena
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'endBackground')
        .setOrigin(0.5, 0.5) // Centra la imagen
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height); // Ajusta la imagen al tamaño del canvas



        // Puntuaciones de los jugadores.
        const player1Score = 1 ;  //Tengo que mirar como pasar las puntuaciones a esta pantalla
        const player2Score = 2 ;

        // Determina el ganador.
        if (player1Score > player2Score) {
            this.add.image(960, 250, 'victory1');
            this.add.image(970, 510, 'champichip').setScale(2); //Aqui tengo que ver como hacer para que pille el personaje elegido por jugador 1
        } else if (player2Score > player1Score) {
            this.add.image(960, 250, 'victory2');
            this.add.image(970, 510, 'perretxiko').setScale(2);//Aqui tengo que ver como hacer para que pille el personaje elegido por jugador 2
        }

        // Crear el botón "Volver a jugar".
        const playAgainText = this.add.image(970, 850, 'buttonPlayAgain').setOrigin(0.5).setInteractive();
        
        playAgainText.on('pointerdown', () => {
            this.scene.stop('EndScene');
            this.scene.start('GameScene'); //Empieza una partida nueva
        });
        
        const exitButton = this.add.image(325, 650, 'buttonExit').setOrigin(-2.0).setInteractive(); // Crea el botón "Salir"

        exitButton.on('pointerdown', () => {
            this.scene.stop('EndScene');
            this.scene.start('IntroGame'); // Vuelve a la pantalla de intro
        });
        
        // Agrega un hover visual para los botones
        playAgainButton.on('pointerover', () => buttonPlayAgain.setScale(0.55));
        playAgainButton.on('pointerout', () => buttonPlayAgain.setScale(0.5));

        exitButton.on('pointerover', () => buttonExit.setScale(0.55));
        exitButton.on('pointerout', () => buttonExit.setScale(0.5));
    }

    update() {
        // Actualizaciones en tiempo real si son necesarias.
    }
}
