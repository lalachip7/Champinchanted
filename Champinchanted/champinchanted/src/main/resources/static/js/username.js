class UsernameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UsernameScene' });   // Asigna la clave "Username" a esta escena
    }

    preload() {     // CARGA DE ARCHIVOS ---------------------------------------------------------------------------------------------
        
        this.load.audio("background", 'assets/Sonidos/musica.mp3');

        this.load.image("background_image", "assets/Fondos/fondo.png");                         // Imagen de fondo

        this.load.image("create_game_button", "assets/Interfaz/botonCrearPartida.png");         // Botón de crear partida
        this.load.image("join_game_button", "assets/Interfaz/botonUnirsePartida.png");          // Botón de unirse a partida
        this.load.image("return_button", "assets/Interfaz/botonVolver.png");                    // Botón de volver
        this.load.image("submit_button", "assets/Interfaz/botonConfirmar.png");                 // Botón de confirmar

        // Fuentes
        const font = new FontFace('FantasyFont', 'url(assets/Fuentes/CATChilds.ttf)');

        font.load().then((loadedFont) => {             // Carga la fuente y la añade al documento
            document.fonts.add(loadedFont);
            console.log('Fuente FantasyFont cargada');
        }).catch((err) => {
            console.error('Error al cargar la fuente FantasyFont:', err);
        });
    }

    create() {      // CREACIÓN DE CONTENIDOS ----------------------------------------------------------------------------------------
        
        this.configText = {
            fontFamily: 'FantasyFont, Calibri',
            fontSize: '40px',
            color: '#ffffff'
        }; 
        
        const background = this.add.image(0, 0, "background_image")
            .setOrigin(0)                                                                          // Alinea la esquina superior izquierda al (0,0)
            background.setScale(this.scale.width / background.width, this.scale.height / background.height);
            background.setDepth(-1); // Usa capas para que fondo este nivel más bajo

        const buttonSpacing = 200;                          // Espaciado entre botones
        const centerX = this.scale.width / 2;               // Centro horizontal de la pantalla

        this.formUtil = new FormUtil({
            scene: this,
            rows: 22,
            cols: 22
        });

        this.formUtil.addElement("username", "input", {
            type: "text",
            width: 250,
            height: 30,
            fontSize: 20,
            padding: 10,
            placeholder: "Introduce tu nombre de usuario",
            fontFamily: 'FantasyFont, Calibri'
        });

        const inputElement = document.getElementById("username");
        inputElement.style.fontFamily = "FantasyFont, sans-serif";
        inputElement.style.border = "0px solid #ffffff";          // Borde blanco de 2px
        inputElement.style.backgroundColor = "#333333";             // Color de fondo oscuro
        inputElement.style.color = "#ffffff";                       // Color del texto (blanco)
        inputElement.style.borderRadius = "50px";                   // Bordes redondeados
        inputElement.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)"; // Sombra suave

        // Ubicar el campo de texto en la escena
        this.formUtil.placeElementAt(229, "username", true);

        // Escalar el campo de texto para que se ajuste al tamaño de la pantalla
        this.formUtil.scaleToGameW("username", 0.3);
     
        const submitButton = this.add.image(centerX, 635, "submit_button")      // Añade el botón de confirmar nombre de usuario
            .setScale(0.15)                                                     // Reducir tamaño a la mitad  
            .setInteractive()                                                   // Hace que seea interactivo y que pueda responder a eventos
            .setDepth(1)                                                        // Botones en una capa más alta
            .on('pointerdown', async() => {                                     // Al hacer click 
                const username = this.formUtil.getTextAreaValue("username");    // Obtiene el valor del campo de texto
                console.log("El nombre de usuario es: " + username);
                this.formUtil.hideElement("username");                  // Oculta el campo de texto
                submitButton.setVisible(false);                         // Oculta el botón de aceptar

                // Petición HTTP POST .......................................................................................
                if (!username || username.trim() === "") {              // Verifica si el campo está vacío
                    console.log("El nombre de usuario no puede estar vacío");
                    return; 
                }
            
                console.log("Intentando crear usuario con nombre: " + username);
            
                try {
                    const response = await fetch("https://localhost.com/api/users", { 
                        method: "POST", 
                        headers: {
                            "Content-Type": "application/json"  // Indica que se enviará JSON
                        },
                        body: JSON.stringify({ username })      // Convierte los datos en JSON
                    });
            
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("Error al crear el usuario:", errorData.message);
                        alert("Hubo un problema al crear el usuario: " + errorData.message);
                        return;
                    }
            
                    // Si todo va bien, procesa la respuesta
                    const responseData = await response.json();
                    console.log("Usuario creado con éxito:", responseData);
                    alert("Usuario creado exitosamente: " + responseData.username);
                    
                } catch (error) {
                    // Maneja errores de red o del cliente
                    console.error("Error en la solicitud POST:", error);
                    alert("No se pudo conectar con el servidor.");
                }
        });

        // Botón de crear partida
        const create_game_button = this.add.image(centerX - buttonSpacing, 790, "create_game_button")   // Añade el botón de comenzar partida en local
            .setScale(0.2)                                              // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .setDepth(1)                                                // Botones en una capa más alta
            .on('pointerdown', () => {                                  // Al hacer click 
                this.scene.stop("UsernameScene");                          // Detiene la escena actual
                this.scene.start("PersonajesGame");                     // Cambia a la escena de selección de personajes
        });

        // Botón de comenzar partida en línea
        const join_game_button = this.add.image(centerX + buttonSpacing, 790, "join_game_button")   // Añade el botón de comenzar partida en red
            .setScale(0.2)                                              // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .setDepth(1)                                                // Botones en una capa más alta
            .on('pointerdown', () => {                                  // Al hacer click 
        });

        // Botón de volver
        const exit_button = this.add.image(centerX, 900, "return_button") // Añade el botón de comenzar partida
            .setScale(0.2)                                              // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .on('pointerdown', () => {                                  // Al hacer click 
                this.scene.stop("UsernameScene");                       // Detiene la escena actual
                this.scene.start("IntroScene");                         // Cambia a la escena de inicio
                console.log(game.scene.keys);
        }); 
    }

    update() { }     // En cada frame actualiza la lógica interactiva

    textAreaChanged() {
        var text = this.formUtil.getTextAreaValue("username");
        console.log(text);
    }

}
