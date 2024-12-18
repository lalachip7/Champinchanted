class UsernameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UsernameScene' });   // Asigna la clave "Username" a esta escena
    }

    init() {
        this.usernameEntered = false;
        this.username = null;
        this.sessionManager = new SessionManager();
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
            .setOrigin(0)                                    
            background.setScale(this.scale.width / background.width, this.scale.height / background.height);
            background.setDepth(-1); 

        const buttonSpacing = 200;                          // Espaciado entre botones
        const centerX = this.scale.width / 2;               // Centro horizontal de la pantalla
        const centerY = this.scale.height / 2;              // Centro vertical de la pantalla

        // Crear el campo de texto (input) y el botón
        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.id = 'username-input';
        usernameInput.placeholder = 'Introduce tu nombre de usuario';
        usernameInput.style.position = 'absolute';
        usernameInput.style.left = `${centerX - 170}px`;           
        usernameInput.style.top = `${centerY - 100}px`;          
        usernameInput.style.padding = '10px';
        usernameInput.style.fontSize = '20px';
        usernameInput.style.width = '300px';
        usernameInput.style.fontFamily = 'FantasyFont, Calibri';
        usernameInput.style.border = "0px solid #ffffff";                     // Sin borde
        usernameInput.style.backgroundColor = "#333333";                        // Color de fondo oscuro
        usernameInput.style.color = "#ffffff";                                  // Color del texto (blanco)
        usernameInput.style.borderRadius = "50px";                              // Bordes redondeados
        usernameInput.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";    // Sombra suave
        document.body.appendChild(usernameInput);

        // Crear el botón
        const submitButton = this.add.image(centerX, centerY + 100, "submit_button")
            .setScale(0.15)
            .setInteractive()
            .on('pointerdown', async () => {
                const enteredUsername = usernameInput.value.trim();
                if (!enteredUsername) {
                    alert('Por favor, introduce un nombre de usuario.');
                    return;
                }

                try {
                    const response = await fetch("/api/users", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ username: enteredUsername })
                    })

                    if (!response.ok) {
                        if (response.status === 409) {
                            const errorData =  await response.json();
                            alert(errorData.message || "El nombre de usuario ya existe. Introduce uno distinto");
                            return;
                        } else {
                            console.error(`Error en la respuesta del servidor: ${response.status}`);
                            alert(`Hubo un problema con el servidor. Código de estado: ${response.status}`);
                        }
                        return;
                    }

                    const contentType = response.headers.get("Content-Type");
                    let data = null;
                    if (contentType && contentType.includes("application/json")) {
                        data = await response.json();
                        
                        console.log("Usuario creado con éxito:", data);
                    } else {
                        console.log("Respuesta exitosa sin contenido JSON.");
                    }

                    
                    this.usernameEntered = true;
                    this.username = enteredUsername;
                    this.sessionManager.startHeartbeat(this.username);     // Inicia el heartbeat
                    this.shutdown(username-input)
                    submitButton.setVisible(false); 
                    
                    
                } catch (error) {
                    console.error("Error en la solicitud POST: ", error);
                    alert("Hubo un problema con la conexión. Inténtalo de nuevo");
                }
                
                try {
                    const newUsername = this.username;
                    const response = await fetch(`/api/games/${window.gameCode}/user`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(newUsername)
                    })

                    if (!response.ok) {
                        console.error(`Error en la respuesta del servidor: ${response.status}`);
                        alert(`Hubo un problema con el servidor. Código de estado: ${response.status}`);
                    } else{
                        console.log('Usuario añadido a la partida con éxito.');
                    }

                } catch (error) {
                    console.error("Error en la solicitud PUT: ", error);
                    alert("Hubo un problema con la conexión. Inténtalo de nuevo");
                }

                try {
                    const response = await fetch(`/api/games/${window.gameCode}/usersConnected`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(1)
                    })

                    if (!response.ok) {
                        console.error(`Error en la respuesta del servidor: ${response.status}`);
                        alert(`Hubo un problema con el servidor. Código de estado: ${response.status}`);
                    } else{
                        console.log('Número de usuarios añadido a la partida con éxito.');
                    }

                } catch (error) {
                    console.error("Error en la solicitud PUT: ", error);
                    alert("Hubo un problema con la conexión. Inténtalo de nuevo");
                }
            });

        // Lógica para enviar el nombre de usuario al servidor
        // Base URL para hacer la llamada al servidor
        const baseUrl = `${window.location.origin}/api/users`; 
    
        // Botón de crear partida
        const create_game_button = this.add.image(centerX - buttonSpacing, 790, "create_game_button")   // Añade el botón de comenzar partida en local
            .setScale(0.2)                                              // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .setDepth(1)                                                // Botones en una capa más alta
            .on('pointerdown', () => {                                  // Al hacer click 
                if (!this.usernameEntered) {
                    alert('Por favor, introduce un nombre de usuario.');
                    return;
                } else {
                    this.shutdown(username-input);
                    this.scene.stop("UsernameScene");                       // Detiene la escena actual
                    this.scene.start("MapaGameOnline");                     // Cambia a la escena de selección de personajes
                } 
        });

        // Botón de unirse a partida con código
        const join_game_button = this.add.image(centerX + buttonSpacing, 790, "join_game_button")   // Añade el botón de comenzar partida en red
            .setScale(0.2)                                              // Reducir tamaño a la mitad  
            .setInteractive()                                           // Hace que seea interactivo y que pueda responder a eventos
            .setDepth(1)                                                // Botones en una capa más alta
            .on('pointerdown', () => {                                  // Al hacer click 
                if (!this.usernameEntered) {
                    alert('Por favor, introduce un nombre de usuario.');
                } else {
                    this.shutdown(username-input);
                    const codeInput = document.createElement('input');
                    codeInput.type = 'text';
                    codeInput.id = 'code-input';
                    codeInput.placeholder = 'Introduce el código de partida';
                    codeInput.style.position = 'absolute';
                    codeInput.style.left = `${centerX - 170}px`;           
                    codeInput.style.top = `${centerY - 100}px`;          
                    codeInput.style.padding = '10px';
                    codeInput.style.fontSize = '20px';
                    codeInput.style.width = '300px';
                    codeInput.style.fontFamily = 'FantasyFont, Calibri';
                    codeInput.style.border = "0px solid #ffffff";                     // Sin borde
                    codeInput.style.backgroundColor = "#333333";                        // Color de fondo oscuro
                    codeInput.style.color = "#ffffff";                                  // Color del texto (blanco)
                    codeInput.style.borderRadius = "50px";                              // Bordes redondeados
                    codeInput.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";    // Sombra suave
                    document.body.appendChild(codeInput);

                    const submitButton = this.add.image(centerX, centerY + 100, "submit_button")
                    .setScale(0.15)
                    .setInteractive()
                    .on('pointerdown', async () => {
                        const enteredCode = codeInput.value.trim();
                        if (!enteredCode) {
                            alert('Por favor, introduce un código de partida.');
                            return;
                        }
                        if (enteredCode == window.gameCode) {
                            this.scene.stop("UsernameScene"); 
                            this.scene.start("PersonajesGameOnline");
                            IntroGame.bgMusic.stop();                // Para la música de fondo 
                            this.shutdown(code-input);
                        }
                    });
                } 
        });

        // Botón de volver
        const exit_button = this.add.image(centerX, 900, "return_button")   // Añade el botón de comenzar partida
            .setScale(0.2)                                                  // Reducir tamaño a la mitad  
            .setInteractive()                                               // Hace que seea interactivo y que pueda responder a eventos
            .on('pointerdown', async () => {                                // Al hacer click 
                
                // Eliminar el usuario del servidor
                if (this.username) {
                    try {
                        const response = await fetch(`/api/users/${this.username}`, {
                            method: "DELETE",
                        });
                        if (response.ok) {
                            console.log("Usuario eliminado con éxito");
                        } else {
                            const errorData = await response.json();
                            console.error("Error al eliminar el usuario: ", errorData);
                        }
                    } catch (error) {
                        console.error("Error en la solicitud DELETE: ", error);
                    }
                }

                // Cambiar la escena
                this.scene.stop("UsernameScene");                       // Detiene la escena actual
                this.scene.start("IntroGame");                         // Cambia a la escena de inicio
                this.shutdown(username-input);                                        // Elimina el cuadro de texto
                this.sessionManager.stopHeartbeat();        // Detiene el heartbeat del usuario
        }); 
    }

    shutdown(Input) {
        // Eliminar el cuadro de texto al cambiar de escena
        const input = document.getElementById('Input');
        if (input) {
            input.remove(); // Elimina el cuadro de texto del DOM
        }
    }

    update() { }     // En cada frame actualiza la lógica interactiva
}