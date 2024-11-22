class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.movement_speed = 600;  // Velocidad de los personajes
        this.gameStarted = false;   // Indica si el juego ha empezado
        this.scorePlayer1 = 0;      // Puntuación del jugador 1
        this.scorePlayer2 = 0;      // Puntuación del jugador 2
        this.isJumpingPlayer1 = false;
        this.isJumpingPlayer2 = false;

        // provisional
        this.point = false;
        
    }

    preload() {     // CARGA DE ARCHIVOS --------------------------------------------------------------------------------------
        this.load.image('background', 'assets/Fondos/Mapa_de_otoño.png');   // fondo
        this.load.image('ground', 'assets/Fondos/suelo.png');               // Suelo
        this.load.image('flag', 'assets/Sprites/Bandera_otoño.png');        // Bandera
        this.load.image('house', 'assets/Sprites/Casa_otoño.png');          // Casa
        this.load.spritesheet('champichip', 'assets/Sprites/champichip.png', {frameWidth: 183, frameHeight: 157});
        this.load.spritesheet('champistar', 'assets/Sprites/champistar.png', {frameWidth: 181.55, frameHeight: 151});
        this.load.spritesheet('perretxiko', 'assets/Sprites/perretxiko.png', {frameWidth: 178, frameHeight: 155});
        // mariñón
    }

    create(data) {  // AÑADE LOS OBJETOS A LA ESCENA --------------------------------------------------------------------------

        // Creación del mundo del juego
        this.background = this.add.image(960, 540, 'background');
        this.background.alpha = 0.5;

        this.ground = this.physics.add.image(960, 1080, 'ground').setImmovable();
        this.ground.setScale(2.5);
        this.ground.body.allowGravity = false;     // No está influido por la gravedad

        

        // Creación de la bandera
        this.flag = this.physics.add.image(700, 400, 'flag');
        this.flag.setScale(0.2);
        this.flag.body.allowGravity = false;
        this.flag.setCollideWorldBounds(true);

        // Creación de las casas
        this.housePlayer1 = this.physics.add.image(175, 875, 'house').setImmovable();
        this.housePlayer1.body.allowGravity = false;
        this.housePlayer1.setScale(0.4);
        
        this.housePlayer2 = this.physics.add.image(1750, 875, 'house').setImmovable();
        this.housePlayer2.body.allowGravity = false;
        this.housePlayer2.setScale(0.4);

        // Creación de los personajes
        this.player1 = this.physics.add.sprite(900, 800, 'champichip');
        this.player1.setCollideWorldBounds(true);   // Colisión con los límites

        this.anims.create({
            key: 'saltar1',
            frames: this.anims.generateFrameNumbers('champichip', {start:0, end: 4}),
            frameRate: 10,
            repeat: 0
        })

        this.anims.create({
            key: 'morir1',
            frames: this.anims.generateFrameNumbers('champichip', {start:5, end: 10}),
            frameRate: 6,
            repeat: 0
        })

        this.player2 = this.physics.add.sprite(1200, 800, 'perretxiko');
        this.player2.setCollideWorldBounds(true);   // Colisión con los límites

        this.anims.create({
            key: 'saltar2',
            frames: this.anims.generateFrameNumbers('perretxiko', {start:0, end: 4}),
            frameRate: 10,
            repeat: 0
        })

        this.anims.create({
            key: 'morir2',
            frames: this.anims.generateFrameNumbers('perretxiko', {start:5, end: 10}),
            frameRate: 6,
            repeat: 0
        })


        // Colisiones
        this.physics.add.collider(this.player1, this.ground);
        this.physics.add.collider(this.player2, this.ground);

        this.physics.add.overlap(
            this.player1, 
            this.housePlayer1, 
            (player, house) => this.playerToHouse(player, house), 
            () => this.playerHasFlag(this.player1), 
            this
        );
        
        this.physics.add.overlap(
            this.player2, 
            this.housePlayer2, 
            (player, house) => this.playerToHouse(player, house), 
            () => this.playerHasFlag(this.player2), 
            this
        );        

        // Creación de la puntuación (texto)

        // Create power-up more speed
        // this.morespeed = this.add.rectangle(400, 250, 100, 20, 0xff00f0);
        // this.physics.add.existing(this.morespeed);
        // this.morespeed.body.setImmovable(true); // Make the paddle immovable
        // this.morespeed.body.setAllowGravity(false);

        this.leftKeyPlayer1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKeyPlayer1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKeyPlayer1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);

        this.leftKeyPlayer2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKeyPlayer2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.upKeyPlayer2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);   

    }

    playerHasFlag(player) {
        return true; // Devuelve true si el jugador tiene la bandera
    }

    playerToHouse(player, house) {
        if (this.playerHasFlag(player) && this.point === false) {
            if (player === this.player1) {
                this.scorePlayer1++;
                console.log('Score Player 1: ${this.scorePlayer1}');
                this.point = true;
                this.nextRound();

            } else if (player === this.player2) {
                this.scorePlayer2++;
                console.log('Score Player 2: ${this.scorePlayer2}');
                this.point = true;
                this.nextRound();
            }
        }
    }

    nextRound() {
        
    }

    updatePlayerMovement() {  // ACTUALIZA EL MOVIMIENTO DE LOS PERSONAJES CON ENTRADAS POR TECLADO ----------------------------------------------------
        
        // Movimiento del jugador 1
        if (this.leftKeyPlayer1.isDown) {
            this.player1.body.setVelocityX(-this.movement_speed);
            this.player1.flipX = false;
        } else if (this.rightKeyPlayer1.isDown) {
            this.player1.body.setVelocityX(this.movement_speed);
            this.player1.flipX = true;
        } else {
            this.player1.body.setVelocityX(0);
        }

        // Salto del jugador 1
        if (this.upKeyPlayer1.isDown && this.player1.body.touching.down) {
            this.player1.body.setVelocityY(-1200);
            this.player1.anims.play('saltar1', true);
            this.isJumpingPlayer1 = true;
        }

        // Movimiento del jugador 2
        if (this.leftKeyPlayer2.isDown) {
            this.player2.body.setVelocityX(-this.movement_speed);
            this.player2.flipX = false;
        } else if (this.rightKeyPlayer2.isDown) {
            this.player2.body.setVelocityX(this.movement_speed);
            this.player2.flipX = true;
        } else {
            this.player2.body.setVelocityX(0);
        }

        // Salto del jugador 2
        if (this.upKeyPlayer2.isDown && this.player2.body.touching.down) {
            this.player2.body.setVelocityY(-1200);
            this.player2.anims.play('saltar2', true);
            this.isJumpingPlayer2 = true;
        }
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