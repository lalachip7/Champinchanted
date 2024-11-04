class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.paddle_speed = 400;    // velocidad de la paleta 
        this.gameStarted = false;   // booleano si juego ha empezado
        this.score = 0;             // puntuacion del juagador
    }

    preload() {
        // carga los assets
        
    }

    create(data) {

        // Set debug mode for the physics engine (shows the bounding boxes)
        this.physics.world.createDebugGraphic();


       

        // Create power-up more speed
        // this.morespeed = this.add.rectangle(400, 250, 100, 20, 0xff00f0);
        // this.physics.add.existing(this.morespeed);
        // this.morespeed.body.setImmovable(true); // Make the paddle immovable
        // this.morespeed.body.setAllowGravity(false);


    }

    setupPaddleControllers() {
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


    startGame() {
        this.gameStarted = true;
        this.ball.setVelocity(-200, -200);
    }


    updateScore(points) {
        this.score += points;
        this.scoreText.setText('Score: ' + this.score);
    }

    checkWinCondition() {
        if (this.bricks.countActive() === 0) {
            this.scene.stop("IntroScene");
            this.scene.start("EndScene", { remaining_bricks: this.bricks.countActive() })
        }
    }

    update(time, delta) {

    }
}