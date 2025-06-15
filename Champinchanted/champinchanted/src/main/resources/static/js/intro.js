class IntroGame extends Phaser.Scene {
    static bgMusic
    constructor() {
        super({ key: 'IntroGame' });   // Asigna la clave "IntroGame" a esta escena
    }

    preload() {     // CARGA DE ARCHIVOS 
        //hola
        this.load.audio("background", 'assets/Sonidos/musica.mp3');

        this.load.image("background_image", "assets/Fondos/fondo.png");                         // Imagen de fondo

        this.load.image("start_button_local", "assets/Interfaz/botonJugarLocal.png");           // Botón de comenzar partida en local
        this.load.image("start_button_online", "assets/Interfaz/botonJugarOnline.png");         // Botón de comenzar partida en red
        this.load.image("exit_button", "assets/Interfaz/botonSalir.png");                       // Botón de ajustes
        this.load.image("credits_button", "assets/Interfaz/botonCreditos.png");                 // Botón de créditos
        this.load.image("tutorial_button", "assets/Interfaz/botonTutorial.png");                // Botón de tutorial



        // Fuentes
        const font = new FontFace('FantasyFont', 'url(assets/Fuentes/CATChilds.ttf)');

        font.load().then((loadedFont) => {             // Carga la fuente y la añade al documento
            document.fonts.add(loadedFont);
            console.log('Fuente FantasyFont cargada');
        }).catch((err) => {
            console.error('Error al cargar la fuente FantasyFont:', err);
        });
    }

    create() {      // CREACIÓN DE CONTENIDOS 
        this.configText = {
            fontFamily: 'FantasyFont, Calibri',
            fontSize: '40px',
            color: '#ffffff'
        }; 
        
        const background = this.add.image(0, 0, "background_image")
         .setOrigin(0)                                                                          // Alinea la esquina superior izquierda al (0,0)
         background.setScale(this.scale.width / background.width, this.scale.height / background.height);
         background.setDepth(-1); // Usa capas para que fondo este nivel más bajo
         

        // Música de fondo
        IntroGame.bgMusic = this.sound.add('background', { volume: 0.5});   // Añade la música de fondo
        IntroGame.bgMusic.loop = true;                      // La configura para que se reproduzca en bucle
        IntroGame.bgMusic.play();                           // Inicia la reproducción

        const sliderWidth = 300;                            // Ancho del deslizador
        const sliderHeight = 15;                            // Altura del deslizador
        const sliderX = 1700;                                // Posición X
        const sliderY = 120;                                // Posición Y
        const handleSize = 20;                              // Tamaño del "controlador"

        const bar = this.add.graphics();                    // Barra del deslizador
        bar.fillStyle(0xffffff, 1);                         // Color de la barra
        bar.lineStyle(4, 0xffffff);                         // Borde de 4 píxeles
        bar.strokeRoundedRect(sliderX - sliderWidth / 2, sliderY - sliderHeight / 2, sliderWidth, sliderHeight, 20);  // Bordes redondeados del rectángulo  

        const handle = this.add.circle(sliderX , sliderY, handleSize, 0xffffff)    // Deslizador
            .setOrigin(0.5)  
            .setInteractive({ draggable: true });           // Hace que sea arrastrable

        // Valor del volumen
        const volumeText = this.add.text(sliderX, sliderY - 50, 'Volumen: 50%', this.configText).setOrigin(0.5);

        // Evento de arrastre del controlador
        handle.on('drag', (pointer, dragX) => {
            const minX = sliderX - sliderWidth / 2;         // Límite izquierdo de la barra
            const maxX = sliderX + sliderWidth / 2;         // Límite derecho de la barra

            handle.x = Phaser.Math.Clamp(dragX, minX, maxX);    // Restringir el "handle" al rango de la barra

            const volume = (handle.x - minX) / sliderWidth;     // Normalizar el valor entre 0 y 1
            IntroGame.bgMusic.setVolume(volume);                // Ajustar el volumen de la música según la posición del controlador

            volumeText.setText(`Volumen: ${Math.round(volume * 100)}%`);    // Actualizar el texto del volumen
        });


        const buttonSpacing = 200;                          // Espaciado entre botones
        const centerX = this.scale.width / 2;               // Centro horizontal de la pantalla


        // Botón de comenzar partida en local
        const start_button_local = this.add.image(centerX - buttonSpacing, 680, "start_button_local")   // Añade el botón de comenzar partida en local
            .setScale(0.2)                                              // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .setDepth(1)                                                // Botones en una capa más alta
            .on('pointerdown', () => {                                  // Al hacer click 
                this.scene.stop("IntroScene");                          // Detiene la escena actual
                this.scene.start("MapaGame");                           // Cambia a la escena de selección de mapa
        });

        // Botón de comenzar partida en línea
        const start_button_red = this.add.image(centerX + buttonSpacing, 680, "start_button_online")   // Añade el botón de comenzar partida en red
            .setScale(0.2)                                              // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .setDepth(1)                                                // Botones en una capa más alta
            .on('pointerdown', () => {                                  // Al hacer click 
                this.scene.stop("IntroScene");                         // Detiene la escena actual
                this.scene.start("UsernameScene");                     // Cambia a la escena de introducir el nombre de usuario
        });

        // Botón de créditos
        const credits_button = this.add.image(centerX + buttonSpacing, 790, "credits_button")   // Añade el botón de ver créditos
            .setScale(0.2)
            .setInteractive()
            .on('pointerdown', () => {                                  // Al hacer click 
                this.scene.pause("IntroScene"); 
                this.scene.launch("CreditsScene");                      // Cambia a la escena de créditos
        });

        // Botón de tutorial
        const tutorial_button = this.add.image(centerX - buttonSpacing, 790, "tutorial_button")   // Añade el botón de ver créditos
            .setScale(0.2)
            .setInteractive()
            .on('pointerdown', () => {                                  // Al hacer click 
                this.scene.pause("IntroScene"); 
                this.scene.launch("TutorialScene");                      // Cambia a la escena de créditos
        });


        this.buttons = [start_button_red, start_button_local, credits_button, tutorial_button];

    }

    pauseScene() {       // Desactivar los botones cuando la escena se pausa
        this.buttons.forEach(button => {
            button.setInteractive(false);  // Desactiva la interactividad de los botones
        });
    }

    resumeScene() {     // Reactivar los botones cuando la escena se reanuda
        this.buttons.forEach(button => {
            button.setInteractive();  // Reactiva la interactividad de los botones
        });
    }

    update() { }     // En cada frame actualiza la lógica interactiva

}
