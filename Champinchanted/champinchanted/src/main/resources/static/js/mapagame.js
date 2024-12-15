class MapaGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaGame' });
    }

    preload() {
        // Fondo e imágenes de los mapas
        this.load.image("background2_image", "assets/Fondos/fondoMapas.png");

        this.load.image('invierno', 'assets/Fondos/Mapa_de_invierno.png');
        this.load.image('primavera', 'assets/Fondos/Mapa_de_primavera.png');
        this.load.image('otoño', 'assets/Fondos/Mapa_de_otoño.png');
        this.load.image('verano', 'assets/Fondos/Mapa_de_verano.png');

        this.load.image("options_button", "assets/Interfaz/ajustes.png");
        this.load.image("readyMapa1_button", "assets/Interfaz/botonVeranoMapa.png");
        this.load.image("readyMapa2_button", "assets/Interfaz/botonOtoñoMapa.png");
        this.load.image("readyMapa3_button", "assets/Interfaz/botonInviernoMapa.png");
        this.load.image("readyMapa4_button", "assets/Interfaz/botonPrimaveraMapa.png");
    }

    create() {
        // Fondo
        this.add.image(0, 0, "background2_image")
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);

        const mapas = [
            { key: 'otoño', x: this.scale.width / 3.45, y: this.scale.height / 3.5 },
            { key: 'invierno', x: (this.scale.width / 1.41), y: this.scale.height / 3.5 },
            { key: 'verano', x: this.scale.width / 3.45, y: (this.scale.height / 2.75) * 2 },
            { key: 'primavera', x: (this.scale.width / 1.41) , y: (this.scale.height / 2.75) * 2 }
        ];

        mapas.forEach((mapa) => {
            this.add.image(mapa.x, mapa.y, mapa.key)
                .setScale(0.30); // Ajustar tamaño de las imágenes
        });

        this.add.image(this.scale.width / 2.5, this.scale.height - 600, "readyMapa2_button")    // Mapa otoño
        .setScale(0.20)
        .setInteractive()
        .on('pointerdown', () => {
            this.registry.set('mapa', 1);
            this.scene.stop("MapaGame"); 
            this.scene.start("GameScene");
            IntroGame.bgMusic.stop();                // Para la música de fondo 
        });   
        
        this.add.image(this.scale.width / 1.22, this.scale.height - 600, "readyMapa3_button")   // Mapa invierno
        .setScale(0.20)
        .setInteractive()
        .on('pointerdown', () => {
            this.registry.set('mapa', 2);
            this.scene.stop("MapaGame");
            this.scene.start("GameScene");
            IntroGame.bgMusic.stop();                // Para la música de fondo 
        });

        this.add.image(this.scale.width / 1.22, this.scale.height - 110, "readyMapa4_button")   // Mapa primavera
        .setScale(0.20)
        .setInteractive()
        .on('pointerdown', () => {
            this.registry.set('mapa', 3);
            this.scene.stop("MapaGame");
            this.scene.start("GameScene");
            IntroGame.bgMusic.stop();                // Para la música de fondo 
        });

        this.add.image(this.scale.width / 2.5, this.scale.height - 110, "readyMapa1_button")    // Mapa verano
        .setScale(0.20)
        .setInteractive()
        .on('pointerdown', () => {
            this.registry.set('mapa', 4);
            this.scene.stop("MapaGame");
            this.scene.start("GameScene");
            IntroGame.bgMusic.stop();                // Para la música de fondo 
        });
    }
}
