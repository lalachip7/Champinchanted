class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.paddle_speed = 400;    // Velocidad de la paleta 
        this.gameStarted = false;   // Indica si el juego ha empezado
        this.score = 0;             // Puntuación del jugador
    }

    preload() {     // CARGA DE ARCHIVOS --------------------------------------------------------------------------------------
        this.load.image('player1', 'assets/player1.png');   // Jugador 1
        this.load.image('player2', 'assets/player2.png');   // Jugador 2
        this.load.image('ground', 'assets/ground.png');     // Suelo
        
    }

    create(data) {  // AÑADE LOS OBJETOS A LA ESCENA --------------------------------------------------------------------------

        // QUITAR CUANDO TEMINEMOS EL JUEGO *********************************************************
        this.physics.world.createDebugGraphic();    // Activa el modo de depuración que dibuja cajas
                                                    // de colisión alrededor de los objetos

        // Creación de los personajes

        // Creación de la bandera

        // Creación de la puntuación (texto)

        // Create power-up more speed
        // this.morespeed = this.add.rectangle(400, 250, 100, 20, 0xff00f0);
        // this.physics.add.existing(this.morespeed);
        // this.morespeed.body.setImmovable(true); // Make the paddle immovable
        // this.morespeed.body.setAllowGravity(false);


    }

    setupPaddleControllers() {  // CONFIGURA LOS CONTROLES DE LOS PERSONAJES ----------------------------------------------------
        this.input.keyboard.on('keydown-LEFT', () => {          
            this.paddle.body.setVelocityX(-this.paddle_speed);
        });

        this.input.keyboard.on('keyup-LEFT', () => {
            this.paddle.body.setVelocityX(0);
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.paddle.body.setVelocityX(this.paddle_speed);
        });

        this.input.keyboard.on('keyup-RIGHT', () => {
            this.paddle.body.setVelocityX(0);
        });
    }


    startGame() {   // COMIENZA EL JUEGO --------------------------------------------------------------------------------------
        this.gameStarted = true;            
        this.ball.setVelocity(-200, -200);  // Qué pelota???
    }


    updateScore(points) {   // ACTUALIZA LA PUNTUACIÓN ------------------------------------------------------------------------
        this.score += points;                           // Suma los puntos
        this.scoreText.setText('Score: ' + this.score); // Actualiza la puntuación que aparece en pantalla
    }

    checkWinCondition() {   // COMPRUEBA SI SE CUMPLE LA CONDICIÓN DE FIN DE PARTIDA ------------------------------------------
        if (this.bricks.countActive() === 0) {  // Qué bloques???
            this.scene.stop("IntroScene");      // Para la escena actual
            this.scene.start("EndScene", { remaining_bricks: this.bricks.countActive() })  // Carga la escena de fin de partida
        }
    }

    update(time, delta) {   // ACTUALIZA EL JUEGO -----------------------------------------------------------------------------

    }
}