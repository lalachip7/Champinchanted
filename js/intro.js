class IntroGame extends Phaser.Scene {
    static bgMusic
    constructor() {
        super({ key: 'IntroGame' });   // Asigna la clave "IntroGame" a esta escena
    }

    preload() {     // CARGA DE ARCHIVOS ---------------------------------------------------------------------------------------------
        
        this.load.audio("background", 'assets/Sonidos/musica.mp3');

        this.load.image("background_image", "assets/Fondos/fondo.png");                        // Imagen de fondo


        this.load.image("start_button", "assets/Interfaz/botonJugar.png");                       // Botón de comenzar partida
        this.load.image("options_button", "assets/Interfaz/ajustes.png");                        // Botón de ajustes
        this.load.image("exit_button", "assets/Interfaz/botonSalir.png");                        // Botón de ajustes

    }

    create() {      // CREACIÓN DE CONTENIDOS ----------------------------------------------------------------------------------------
        //const hello_text = this.add.text(990, 50, 'Champichanted', {        // Título del juego
        //    align: 'center',
        //    fill: '#0f0', 
        //    fontSize: 38 
        //}).setOrigin(0.5);

         const background = this.add.image(0, 0, "background_image")
         .setOrigin(0)                                                                                   // Alinea la esquina superior izquierda al (0,0)
         background.setScale(this.scale.width / background.width, this.scale.height / background.height);
         background.setDepth(-1); // Usa capas para que fondo este nivel más bajo
         

        // Música de fondo
        IntroGame.bgMusic = this.sound.add('background');    // Añade la música de fondo,
        IntroGame.bgMusic.loop = true;                       // la configura para que se reproduzca en bucle
        IntroGame.bgMusic.play();                                  // e inicia la reproducción


        const buttonSpacing = 600; // Espaciado entre botones
        const centerX = this.scale.width / 2; // Centro horizontal de la pantalla
        const centerY = 950; // Altura fija para ambos botones


        // Botón de comenzar partida
        const start_button = this.add.image(centerX - buttonSpacing / 2, centerY, "start_button")   // Añade el botón de comenzar partida
            .setScale(0.25) // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .setDepth(1) // Botones en una capa más alta
            .on('pointerdown', () => {                                  // Al hacer click 
                this.scene.stop("IntroScene");                          // Detiene la escena actual
                this.scene.start("PersonajesGame");                     // Cambia a la escena de selección de personajes
            });

        // Botón de salir
        const exit_button = this.add.image(centerX + buttonSpacing / 2, centerY, "exit_button")   // Añade el botón de comenzar partida
            .setScale(0.25) // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            
            .on('pointerdown', () => {                                  // Al hacer click 
                window.close();                                         // Cierra la ventana si es posible
                //this.scene.stop("IntroScene");                        // Detiene la escena actual                
            });

        // Botón de configuración
        const options_button = this.add.image(this.scale.width - 50, 50, "options_button")   // Añade el botón de configuración
            .setOrigin(0.75, 0.25) // Ajustar el punto de anclaje (derecha, arriba)
            .setScale(0.15) // Reducir tamaño a la mitad    
            .setInteractive()
            .setDepth(1) // Botones en una capa más alta
            .on('pointerdown', () => {
                this.scene.stop("IntroScene");
                this.scene.start("AjustesScene");                           // Cambia a la escena de ajustes
            });


    }

    update() { }     // En cada frame actualiza la lógica interactiva

}
