class PersonajesGame extends Phaser.Scene {
    constructor() {
        super({ key: 'PersonajesGame' });
    }


    preload() {
        // vacio
        this.load.image('character1', 'assets/personajesgame/');
        this.load.image('character2', 'assets/personajesgame/');
        this.load.image('character3', 'assets/personajesgame/');
        this.load.image('character4', 'assets/personajesgame/');
        this.load.image('character3', 'assets/personajesgame/');
        this.load.image('character4', 'assets/personajesgame/');

        this.load.image("ready_button", "assets/personajesgame/");
    }

    create() {
        const ready_button = this.add.image(990, 300, "ready_button")   //  regular hecho el acceso
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop("PersonajesGame");
                this.scene.start("MapaGame");
        });

        // nombres de las claves de las imágenes
        this.characters = ['character1', 'character2', 'character3', 'character4'];

        
        this.playerSelections = [
            { x: 200, y: 300, currentIndex: 0, text: null, image: null, ready: false },
            { x: 600, y: 300, currentIndex: 0, text: null, image: null, ready: false }
        ];

        // Crear los cuadros de selección para cada jugador
        this.playerSelections.forEach((player, index) => {
            
            player.image = this.add.image(player.x, player.y, this.characters[player.currentIndex]).setScale(1.5);

            // READY
            player.text = this.add.text(player.x, player.y + 150, 'Press SELECT to Ready', {
                fontSize: '20px',
                fill: index === 0 ? '#ff00ff' : '#00ffff', // Color para cada jugador
                align: 'center'
            }).setOrigin(0.5);

            
            this.add.text(player.x - 80, player.y, '<', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
            this.add.text(player.x + 80, player.y, '>', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        });

        // Configurar controles de teclado para cada jugador
        this.controls = {
            player1: {
                left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                select: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
            },
            player2: {
                left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
                right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
                select: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
            }
        };
    }

    update() {
        // Controles de Player 1
        if (Phaser.Input.Keyboard.JustDown(this.controls.player1.left)) {
            this.changeCharacter(0, -1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.controls.player1.right)) {
            this.changeCharacter(0, 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.controls.player1.select)) {
            this.toggleReady(0);
        }

        // Controles de Player 2
        if (Phaser.Input.Keyboard.JustDown(this.controls.player2.left)) {
            this.changeCharacter(1, -1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.controls.player2.right)) {
            this.changeCharacter(1, 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.controls.player2.select)) {
            this.toggleReady(1);
        }
    }

    changeCharacter(playerIndex, direction) {
        const player = this.playerSelections[playerIndex];

        if (!player.ready) { 
            player.currentIndex = (player.currentIndex + direction + this.characters.length) % this.characters.length;
            player.image.setTexture(this.characters[player.currentIndex]);
        }
    }

    toggleReady(playerIndex) {
        const player = this.playerSelections[playerIndex];

        
        player.ready = !player.ready;
        player.text.setText(player.ready ? 'READY!' : 'Press SELECT to Ready');
        player.text.setColor(player.ready ? '#00ff00' : (playerIndex === 0 ? '#ff00ff' : '#00ffff'));
    }
};









