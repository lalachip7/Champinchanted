class EndGame extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    preload() {}

    create(data) {
        const remaining_bricks = data.remaining_bricks;

        const message = remaining_bricks == 0? "You win!": "You loose :(";

        const messageText = this.add.text(400, 300, message + '\nClick to restart', {
            fontSize: '64px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start("IntroScene");
        });

    }

    update() {}

}
