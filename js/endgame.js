class EndGame extends Phaser.Scene {
    constructor() {
        super({ key: 'EndScene' });
    }

    init() {
        // Puntuaciones de los jugadores
        this.scorePlayer1 = this.registry.get('player1Score');
        this.scorePlayer2 = this.registry.get('player2Score');

        this.j1 = this.registry.get('personajeJ1'); // Personaje elegido por el jugador 1                   
        this.j2 = this.registry.get('personajeJ2'); // Personaje elegido por el jugador 2
    }

    preload() {
        // Cargar imágenes o gráficos para los botones si los necesitas.
        this.load.image('endBackground', 'assets/Fondos/InterfazEnd.jpg');
        this.load.image('champichip', 'assets/Personajes/champichip.png');
        this.load.image('champistar', 'assets/Personajes/champistar.png');
        this.load.image('perretxiko', 'assets/Personajes/perretxiko.png');
        this.load.image('mariñon', 'assets/Personajes/mariñon.png');
        this.load.image('biblioseta', 'assets/Personajes/biblioseta.png');

        this.load.image('buttonPlayAgain', 'assets/Interfaz/botonJugarOtraVez.png');
        this.load.image('buttonExit', 'assets/Interfaz/Salir.png');
        this.load.image('victory1', 'assets/Interfaz/Victoria1.png');
        this.load.image('victory2', 'assets/Interfaz/Victoria2.png');

        // Fuentes
        const font = new FontFace('FantasyFont', 'url(assets/Fuentes/CATChilds.ttf)');

        font.load().then((loadedFont) => {                      // Carga la fuente y la añade al documento
            document.fonts.add(loadedFont);
            console.log('Fuente FantasyFont cargada');
        }).catch((err) => {
            console.error('Error al cargar la fuente FantasyFont:', err);
        });
    }

    create(data) {

        // Fondo de la escena
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'endBackground')
        .setOrigin(0.5, 0.5) // Centra la imagen
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height); // Ajusta la imagen al tamaño del canvas


        
        let personaje1 = 'champichip';           // Champichip por defecto
        if (this.j1 === 2) {                     // Champistar
            personaje1 = 'champistar';
        } else if (this.j1 === 3) {              // Perretxiko
            personaje1 = 'perretxiko';
        } else if (this.j1 === 4) {              // Mariñon
            personaje1 = 'mariñon';
        } else if (this.j1 === 5) {              // Biblioseta
            personaje1 = 'biblioseta';
        }
       
        let personaje2 = 'champichip';           // Champichip por defecto
        if (this.j2 === 2) {                     // Champistar
            personaje2 = 'champistar';
        } else if (this.j2 === 3) {              // Perretxiko
            personaje2 = 'perretxiko';
        } else if (this.j2 === 4) {              // Mariñon
            personaje2 = 'mariñon';
        } else if (this.j2 === 5) {              // Biblioseta
            personaje2 = 'biblioseta';
        }


        // Determina el ganador.
        if (this.scorePlayer1 > this.scorePlayer2) {
            this.add.image(960, 250, 'victory1');
            this.add.image(970, 510, personaje1).setScale(2); //Aqui tengo que ver como hacer para que pille el personaje elegido por jugador 1
        } else if (this.scorePlayer2 > this.scorePlayer1) {
            this.add.image(960, 250, 'victory2'); 
            this.add.image(970, 510, personaje2).setScale(2);//Aqui tengo que ver como hacer para que pille el personaje elegido por jugador 2
        }

        // Crear el botón "Volver a jugar".
        this.playAgainText = this.add.image(970, 850, 'buttonPlayAgain').setOrigin(0.5).setInteractive();
        
        this.playAgainText.on('pointerdown', () => {
            this.scene.stop('EndScene');
            this.scene.start('GameScene'); //Empieza una partida nueva
            GameScene.bgMusic.stop();
        });
        
        this.exitButton = this.add.image(325, 650, 'buttonExit').setOrigin(-2.0).setInteractive(); // Crea el botón "Salir"

        this.exitButton.on('pointerdown', () => {
            this.scene.stop('EndScene');
            this.scene.start('IntroGame'); // Vuelve a la pantalla de intro
            GameScene.bgMusic.stop();
        });
    }

    update() {
        // Actualizaciones en tiempo real si son necesarias.
    }
}
