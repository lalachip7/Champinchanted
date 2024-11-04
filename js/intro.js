class IntroGame extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload() {
		this.load.audio("Wandering Stars", 'assets/Wandering Stars.mp3');   // musica del juego
        this.load.audio("background", 'assets/Wandering Stars.mp3');
        
        this.load.image("start_button", "assets/start-button.svg");
        this.load.image("options_button", "assets/red-bricksvg");
        
    }

    create() {
        const hello_text = this.add.text(990, 50, 'Champichanted', { 
            align: 'center',
            fill: '#0f0', 
            fontSize: 38 
        }).setOrigin(0.5);

        this.bgMusic = this.sound.add('background');
        this.bgMusic.loop = true;
        this.bgMusic.play();

        const start_button = this.add.image(990, 300, "start_button")   //  regular hecho el acceso
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play("Wandering Stars");
                this.scene.stop("IntroScene");
                this.scene.start("PersonajesGame");
        });
        
        const options_button = this.add.image(990, 600, "options_button")
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play("Wandering Stars");
                this.scene.stop("IntroScene");
                this.scene.start("AjustesScene");
        });
        

        this.events.on('shutdown', () => {
            this.bgMusic.stop();
        });
        
    }

    update() {}

}
