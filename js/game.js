class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.movement_speed = 600;  // Velocidad de los personajes
        this.gameStarted = false;   // Indica si el juego ha empezado
        this.score = 0;             // Puntuación del jugador
    }

    preload() {     // CARGA DE ARCHIVOS --------------------------------------------------------------------------------------
        this.load.image('background', 'assets/mapagame/Mapa_de_otoño.png'); 
        this.load.image('player1', 'assets/personajesgame/champichip.png');   // Jugador 1
        this.load.image('player2', 'assets/personajesgame/perretxiko.png');   // Jugador 2
        this.load.image('ground', 'assets/ground.png');     // Suelo
        
    }

    create(data) {  // AÑADE LOS OBJETOS A LA ESCENA --------------------------------------------------------------------------

        // Creación del mundo del juego
        this.add.image(960, 540, 'background');
        //this.groung = this.physics.add.image(960, 900, 'ground').setImmovable();
        //this.ground.body.allowGravity = false;     // No está influido por la gravedad

        // Creación de los personajes
        this.player1 = this.physics.add.image(900, 460, 'player1');
        this.player1.body.allowGravity = false;     // No está influido por la gravedad
        this.player1.setCollideWorldBounds(true);   // Colisión con los límites

        this.player2 = this.physics.add.image(1200, 460, 'player2');
        this.player2.body.allowGravity = false;     // No está influido por la gravedad
        this.player2.setCollideWorldBounds(true);   // Colisión con los límites

        // Colisiones
        this.physics.add.collider(this.player1, this.ground);
        this.physics.add.collider(this.player2, this.ground);

        // Creación de la bandera
        

        // Creación de la puntuación (texto)

        // Create power-up more speed
        // this.morespeed = this.add.rectangle(400, 250, 100, 20, 0xff00f0);
        // this.physics.add.existing(this.morespeed);
        // this.morespeed.body.setImmovable(true); // Make the paddle immovable
        // this.morespeed.body.setAllowGravity(false);


    }

    updatePlayerMovement() {  // ACTUALIZA EL MOVIMIENTO DE LOS PERSONAJES CON ENTRADAS POR TECLADO ----------------------------------------------------
        this.input.keyboard.on('keydown-LEFT', () => {          
            this.player1.body.setVelocityX(-this.movement_speed);
        });

        this.input.keyboard.on('keyup-LEFT', () => {
            this.player1.body.setVelocityX(0);
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            this.player1.body.setVelocityX(this.movement_speed);
        });

        this.input.keyboard.on('keyup-RIGHT', () => {
            this.player1.body.setVelocityX(0);
        });

        this.input.keyboard.on('keydown-UP', () => {
            
        });

        this.input.keyboard.on('keydown-A', () => {          
            this.player2.body.setVelocityX(-this.movement_speed);
        });

        this.input.keyboard.on('keyup-A', () => {
            this.player2.body.setVelocityX(0);
        });

        this.input.keyboard.on('keydown-D', () => {
            this.player2.body.setVelocityX(this.movement_speed);
        });

        this.input.keyboard.on('keyup-D', () => {
            this.player2.body.setVelocityX(0);
        });

        this.input.keyboard.on('keydown-W', () => {
            
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
        this.updatePlayerMovement();
    }
}