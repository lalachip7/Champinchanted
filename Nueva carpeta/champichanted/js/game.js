class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.paddle_speed = 400;
        this.gameStarted = false;
        this.score = 0;
    }

    preload() {
        // Load game assets
        this.load.svg('brick-blue', 'assets/blue-brick.svg');
        this.load.svg('brick-red', 'assets/red-brick.svg');
        this.load.svg('paddle', 'assets/paddle.svg');
        this.load.audio('explode', 'assets/explode.mp3');
        this.load.svg('ball', 'assets/ball.svg');
        this.load.image("terrain", "assets/terrain.jpeg");
    }

    create() {

        // Set debug mode for the physics engine (shows the bounding boxes)
        this.physics.world.createDebugGraphic();


        // Create paddle
        this.paddle = this.add.rectangle(400, 550, 100, 20, 0x00ff00);
        this.physics.add.existing(this.paddle); // Enable physics on the rectangle
        this.paddle.body.setImmovable(true); // Make the paddle immovable
        this.paddle.body.setCollideWorldBounds(true); // Prevent paddle from moving off-screen
        this.paddle.body.setAllowGravity(false);

        // Create power-up more speed
        this.morespeed = this.add.rectangle(400, 250, 100, 20, 0xff00f0);
        this.physics.add.existing(this.morespeed);
        this.morespeed.body.setImmovable(true); // Make the paddle immovable
        this.morespeed.body.setAllowGravity(false);


        // Create ball
        this.ball = this.physics.add.sprite(400, 530, 'ball');
        this.ball.setCollideWorldBounds(true);
        this.ball.setBounce(1);

        this.terrain = this.physics.add.sprite(400, 585, 'terrain');
        this.terrain.body.setImmovable(true);
        this.terrain.body.setAllowGravity(false);
        this.terrain.setScale(800 / this.terrain.width, 30 / this.terrain.height);
        
        // Create bricks
        this.createBricks();

        // Add colliders
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.terrain, this.hitGround, null, this);

        // Add score text
        this.scoreText = this.add.text(8, 8, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff'
        });

        const hello_text = this.add.text(250, 350, 'Press space to start!', { fill: '#0f0', fontSize: 24 });
        this.input.keyboard.on("keydown-SPACE", () => {
            if (!this.gameStarted) {
                hello_text.destroy();
                this.startGame();
            }

        });

        this.physics.add.overlap(this.ball, this.morespeed, () => {
            this.paddle_speed *= 1.7;
            this.morespeed.x = Phaser.Math.Between(0, 700);
        });

        this.setupPaddleControllers();
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

    createBricks() {
        this.bricks = this.physics.add.staticGroup();

        const rows = 5;
        const cols = 8;
        const brickWidth = 80;
        const brickHeight = 30;
        const padding = 10;
        const offsetX = (this.sys.game.config.width - (cols * (brickWidth + padding))) / 2 + brickWidth / 2;
        const offsetY = 60;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = offsetX + j * (brickWidth + padding);
                const y = offsetY + i * (brickHeight + padding);
                // Alternate between red and blue bricks
                const brickType = (i + j) % 2 === 0 ? 'brick-red' : 'brick-blue';
                const brick = this.bricks.create(x, y, brickType);
            }
        }
    }

    hitGround() {
        this.scene.stop("IntroScene");
        this.scene.start("EndScene", { remaining_bricks: this.bricks.countActive() })
    }

    startGame() {
        this.gameStarted = true;
        this.ball.setVelocity(-200, -200);
    }

    hitBrick(ball, brick) {
        brick.destroy();
        this.updateScore(10);
        this.checkWinCondition();
        this.sound.play('explode')
    }

    hitPaddle(ball, paddle) {

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