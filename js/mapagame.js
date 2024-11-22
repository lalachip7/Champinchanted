class MapaGame extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaGame' });
    }

    preload() {
        // imágenes de los mapas
        this.load.image('invierno', 'assets/Mapas/');
        this.load.image('primavera', 'assets/Mapas/');
        this.load.image('otoño', 'assets/Mapas/Mapa_de_otoño');
        this.load.image('verano', 'assets/Mapas/');

        this.load.image("ready_button", "assets/Botones/");
    }

    create() {
        const ready_button = this.add.image(990, 300, "ready_button")   //  regular hecho el acceso
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop("MapaGame");
                this.scene.start("GameScene");
        });


        this.maps = ['invierno', 'primavera', 'otoño', 'verano'];
        this.currentMapIndex = 0;

        this.add.text(400, 50, 'SELECT MAP', {
            fontSize: '32px',
            fill: '#ff9900'
        }).setOrigin(0.5);

        // Mostrar el mapa actual
        this.mapDisplay = this.add.image(400, 300, this.maps[this.currentMapIndex]).setScale(1.5);

        // Botones izq y derech
        this.leftArrow = this.add.text(100, 300, '<', {
            fontSize: '48px',
            fill: '#ff9900'
        }).setOrigin(0.5).setInteractive();

        this.rightArrow = this.add.text(700, 300, '>', {
            fontSize: '48px',
            fill: '#ff9900'
        }).setOrigin(0.5).setInteractive();


        this.leftArrow.on('pointerdown', () => this.changeMap(-1));
        this.rightArrow.on('pointerdown', () => this.changeMap(1));


        this.readyText = this.add.text(400, 500, 'Ready', {
            fontSize: '24px',
            fill: '#ff0000',
            backgroundColor: '#ffff00'
        }).setOrigin(0.5).setInteractive();

        this.readyText.on('pointerdown', () => {

            this.scene.start('GameScene', { selectedMap: this.maps[this.currentMapIndex] });
        });
    }

    changeMap(direction) {

        this.currentMapIndex = (this.currentMapIndex + direction + this.maps.length) % this.maps.length;
        this.mapDisplay.setTexture(this.maps[this.currentMapIndex]);
    }
};










