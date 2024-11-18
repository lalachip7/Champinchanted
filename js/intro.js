class IntroGame extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroGame' });   // Asigna la clave "IntroGame" a esta escena
    }

    preload() {     // CARGA DE ARCHIVOS ---------------------------------------------------------------------------------------------
		this.load.audio("Wandering Stars", 'assets/Wandering Stars.mp3');   // Música del juego
        this.load.audio("background", 'assets/Wandering Stars.mp3');        
        
        this.load.image("start_button", "assets/start-button.svg");         // Botón de comenzar partida
        this.load.image("options_button", "assets/red-brick.svg");           // Botón de ajustes
        
    }

    create() {      // CREACIÓN DE CONTENIDOS ----------------------------------------------------------------------------------------
        const hello_text = this.add.text(990, 50, 'Champichanted', {        // Título del juego
            align: 'center',
            fill: '#0f0', 
            fontSize: 38 
        }).setOrigin(0.5);

        this.bgMusic = this.sound.add('background');    // Añade la música de fondo,
        this.bgMusic.loop = true;                       // la configura para que se reproduzca en bucle
        this.bgMusic.play();                            // e inicia la reproducción

        const start_button = this.add.image(990, 300, "start_button")   // Añade el botón de comenzar partida
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .on('pointerdown', () => {                                  // Al hacer click 
                this.sound.play("Wandering Stars");                     // Reproduce la música
                this.scene.stop("IntroScene");                          // Detiene la escena actual
                this.scene.start("PersonajesGame");                     // Cambia a la escena de selección de personajes
        });
        
        const options_button = this.add.image(990, 600, "options_button")   // Añade el botón de configuración
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.play("Wandering Stars");
                this.scene.stop("IntroScene");
                this.scene.start("AjustesScene");                           // Cambia a la escena de ajustes
        });
        

        this.events.on('shutdown', () => {      // Cuando la escena se detiene
            this.bgMusic.stop();                // Para la música de fondo 
        });
        
    }

    update() {}     // En cada frame actualiza la lógica interactiva

}
