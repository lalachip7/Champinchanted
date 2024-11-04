class PersonajesGame extends Phaser.Scene {
    constructor() {
        super({ key: 'PersonajesGame' });
    }

    preload() {
        // Cargar las imágenes de los personajes y el botón de "ready"
        this.load.image('character1', 'assets/personajesgame/character1.png');
        this.load.image('character2', 'assets/personajesgame/character2.png');
        this.load.image('character3', 'assets/personajesgame/character3.png');
        this.load.image('character4', 'assets/personajesgame/character4.png');
        this.load.image('character5', 'assets/personajesgame/character5.png');
        this.load.image("ready_button", "assets/personajesgame/ready_button.png");
    }

    create() {
        const ready_button = this.add.image(990, 300, "ready_button")
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop("PersonajesGame");
                this.scene.start("MapaGame", {
                    p1: {
                        number: 1
                    },
                    p2: {
                        number: 2
                    }
                });
            });

        // Nombres de las claves de las imágenes de los personajes
        this.characters = ['character1', 'character2', 'character3', 'character4', 'character5'];

        this.playerSelections = [
            { x: 200, y: 300, currentIndex: 0, text: null, image: null, ready: false, clicks: 0 },
            { x: 600, y: 300, currentIndex: 0, text: null, image: null, ready: false, clicks: 0 }
        ];

        // Crear los cuadros de selección para cada jugador
        this.playerSelections.forEach((player, index) => {
            player.image = this.add.image(player.x, player.y, this.characters[player.currentIndex]).setScale(1.5);
            player.text = this.add.text(player.x, player.y + 150, 'Press SELECT to Ready', {
                fontSize: '20px',
                fill: index === 0 ? '#ff00ff' : '#00ffff',
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
            // Incrementar o decrementar el contador de clics
            if (direction === 1 && player.clicks < 5) {
                player.clicks++;
                player.currentIndex = (player.currentIndex + 1) % this.characters.length;
            } else if (direction === -1 && player.clicks > 0) {
                player.clicks--;
                player.currentIndex = (player.currentIndex - 1 + this.characters.length) % this.characters.length;
            }

            // Cambiar la imagen del personaje
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

//  no lo he hecho pero lo suyo es que haya como un ''contador'' que cada vez que le da a la flecha derecha le suma 1 y si le da a la izq le resta 1 entonces en elegir[2] podra el personaje y asi elige el personaje hay un tope de 5 clicks que le puedes dar a la derecha