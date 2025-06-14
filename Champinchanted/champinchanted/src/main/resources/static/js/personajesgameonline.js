class PersonajesGameOnline extends Phaser.Scene {
    constructor() {
        super({ key: 'PersonajesGameOnline' });
        this.stompClient = null;
        this.gameCode = null;
        this.username = null;

        this.player1Character = -1; // -1 significa no seleccionado
        this.player2Character = -1; // -1 significa no seleccionado

        this.isPlayer1Ready = false;
        this.isPlayer2Ready = false;

        this.readyButtonP1 = null;
        this.readyButtonP2 = null;

        this.characters = {};
    }

    init(data) {
        this.stompClient = data.stompClient;
        this.gameCode = data.gameCode;
        this.username = data.username;

        // En la función init() de personajesgameonline.js
        this.player1Username = data.player1Username;
        this.player2Username = data.player2Username;

        // Limpiar el estado de los personajes al iniciar la escena
        this.registry.set('personajeJ1', -1);
        this.registry.set('personajeJ2', -1);
        this.player1Character = -1;
        this.player2Character = -1;
        this.isPlayer1Ready = false;
        this.isPlayer2Ready = false;
    }

    preload() {
        // Cargar recursos
        this.load.image("background2", "assets/Fondos/fondoPersonajesOnline.png");
        this.load.image("ready_button1", "assets/Interfaz/botonListo.png");


        // Personajes
        this.load.image('character1', 'assets/Personajes/perretxiko.png');
        this.load.image('character2', 'assets/Personajes/champichip.png');
        this.load.image('character3', 'assets/Personajes/champistar.png');
        this.load.image('character4', 'assets/Personajes/mariñon.png');
        this.load.image('character5', 'assets/Personajes/biblioseta.png');
        this.load.image("highlight", "assets/Botones/highlight.png");
        this.load.image("highlight", "assets/Interfaz/highlight.png");

        // Fuentes
        const font = new FontFace('FantasyFont', 'url(assets/Fuentes/CATChilds.ttf)');

        font.load().then((loadedFont) => {                      // Carga la fuente y la añade al documento
            document.fonts.add(loadedFont);
            console.log('Fuente FantasyFont cargada');
        }).catch((err) => {
            console.error('Error al cargar la fuente FantasyFont:', err);
        });
    }

    create() {
        // Fondo
        this.add.image(0, 0, "background2")
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);

        // Crear highlights ocultos inicialmente
        this.highlightP1 = this.add.image(0, 0, "highlight").setVisible(false).setScale(0.8);
        this.highlightP2 = this.add.image(0, 0, "highlight").setVisible(false).setScale(0.8);

        // Posiciones de los personajes
        const charPositions = [
            { id: 1, key: 'character2', x: 200, y: 300 }, // Champichip
            { id: 2, key: 'character3', x: 450, y: 300 }, // Champistar
            { id: 3, key: 'character1', x: 700, y: 300 }, // Perretxiko
            { id: 4, key: 'character4', x: 950, y: 300 }, // Mariñon
            { id: 5, key: 'character5', x: 1200, y: 300 } // Biblioseta
        ];

        // Añadir personajes y hacerlos interactivos
        charPositions.forEach(char => {
            const characterImage = this.add.image(char.x, char.y, char.key)
                .setScale(0.5)
                .setInteractive()
                .on('pointerdown', () => this.selectCharacter(char.id, characterImage));
            this.characters[char.id] = { image: characterImage, x: char.x, y: char.y };
        });

        // Botones de listo para cada jugador
        // El botón del jugador actual será interactivo, el del otro jugador no
        this.readyButtonP1 = this.add.image(this.scale.width / 2.5, this.scale.height - 100, "ready_button")
            .setScale(0.20)
            .setInteractive()
            .on('pointerdown', () => this.setPlayerReady());

        this.readyButtonP2 = this.add.image(this.scale.width / 1.5, this.scale.height - 100, "ready_button")
            .setScale(0.20)
            .setAlpha(0.5); // Inicialmente semitransparente, no interactivo

        // Texto de información de la partida
        this.add.text(this.scale.width / 2, 50, `Sala: ${this.gameCode}`, {
            fontFamily: 'FantasyFont',
            fontSize: '60px',
            color: '#FEEFD8'
        }).setOrigin(0.5);

        // Suscribirse al tema de la partida para recibir actualizaciones de personajes
        this.stompClient.subscribe(`/topic/games/${this.gameCode}`, (message) => {
            const gameState = JSON.parse(message.body);
            console.log("Estado de partida recibido en PersonajesGameOnline:", gameState);

            // Determinar si somos el jugador 1 o el jugador 2 para actualizar el estado del otro
            if (gameState.player1State.username === this.username) {
                // Somos el jugador 1, actualizamos el estado del jugador 2
                this.player2Character = gameState.player2State.characterId;
                this.isPlayer2Ready = gameState.player2State.isReady; // Asume un campo 'isReady' en PlayerState
                this.updateCharacterSelectionDisplay(this.player2Character, this.highlightP2);
                this.updateReadyButtonDisplay(this.readyButtonP2, this.isPlayer2Ready);
            } else if (gameState.player2State.username === this.username) {
                // Somos el jugador 2, actualizamos el estado del jugador 1
                this.player1Character = gameState.player1State.characterId;
                this.isPlayer1Ready = gameState.player1State.isReady; // Asume un campo 'isReady' en PlayerState
                this.updateCharacterSelectionDisplay(this.player1Character, this.highlightP1);
                this.updateReadyButtonDisplay(this.readyButtonP1, this.isPlayer1Ready);
            } else {
                // Esto puede ocurrir si un tercer jugador se une o si hay una desincronización
                console.warn("Mensaje de estado de juego recibido sin un username coincidente.");
            }

            // Si ambos jugadores están listos, iniciar el juego
            if (this.isPlayer1Ready && this.isPlayer2Ready) {
                console.log("Ambos jugadores están listos. Iniciando GameScene...");
                this.registry.set('personajeJ1', this.player1Character);
                this.registry.set('personajeJ2', this.player2Character);
                this.scene.stop("PersonajesGameOnline");
                this.scene.start("GameScene", {
                    stompClient: this.stompClient,
                    gameCode: this.gameCode,
                    username: this.username,
                    player1Character: this.player1Character,
                    player2Character: this.player2Character,
                    mapId: this.registry.get('mapa') // Asegúrate de que el mapa ya se haya establecido
                });
            }
        });

        // Suscribirse al tema de inicio de partida (en caso de que el otro jugador ya estuviera listo)
        this.stompClient.subscribe(`/topic/games/${this.gameCode}/start`, (message) => {
            const startGameMessage = JSON.parse(message.body);
            console.log("Mensaje de inicio de partida recibido:", startGameMessage);
            // Esto es redundante con el chequeo de isPlayer1Ready && isPlayer2Ready, pero asegura el inicio
            this.registry.set('personajeJ1', startGameMessage.player1Character);
            this.registry.set('personajeJ2', startGameMessage.player2Character);
            this.registry.set('mapa', startGameMessage.mapId);
            this.scene.stop("PersonajesGameOnline");
            this.scene.start("GameScene", {
                stompClient: this.stompClient,
                gameCode: this.gameCode,
                username: this.username,
                player1Character: startGameMessage.player1Character,
                player2Character: startGameMessage.player2Character,
                mapId: startGameMessage.mapId
            });
        });

        // Solicitar el estado actual de la partida al iniciar la escena para sincronizar
        // Esto es útil si un jugador se une a una partida ya existente
        this.stompClient.send(`/app/game.requestState`, {}, JSON.stringify({ gameCode: this.gameCode }));
    }

    // Método para seleccionar un personaje
    selectCharacter(characterId, characterImage) {
        if (this.username === this.player1Username) {
            this.player1Character = characterId;
            this.updateCharacterSelectionDisplay(this.player1Character, this.highlightP1);
            this.sendCharacterSelection(characterId);
        } else if (this.username === this.player2Username) {
            this.player2Character = characterId;
            this.updateCharacterSelectionDisplay(this.player2Character, this.highlightP2);
            this.sendCharacterSelection(characterId);
        }
    }

    // Actualiza la posición del highlight para el personaje seleccionado
    updateCharacterSelectionDisplay(characterId, highlightObject) {
        if (characterId !== -1 && this.characters[characterId]) {
            const char = this.characters[characterId];
            highlightObject.setPosition(char.x, char.y).setVisible(true);
        } else {
            highlightObject.setVisible(false);
        }
    }

    // Marca al jugador actual como listo y envía el mensaje
    setPlayerReady() {
        let isReady = false;
        if (this.username === this.registry.get('player1Username')) {
            if (this.player1Character !== -1) {
                this.isPlayer1Ready = true;
                isReady = true;
            } else {
                alert("Por favor, selecciona un personaje antes de estar listo.");
                return;
            }
        } else if (this.username === this.registry.get('player2Username')) {
            if (this.player2Character !== -1) {
                this.isPlayer2Ready = true;
                isReady = true;
            } else {
                alert("Por favor, selecciona un personaje antes de estar listo.");
                return;
            }
        }

        if (isReady) {
            this.sendReadyStatus(true);
            // Deshabilitar el propio botón de listo
            this.updateReadyButtonDisplay(this.readyButtonP1, this.isPlayer1Ready);
            this.updateReadyButtonDisplay(this.readyButtonP2, this.isPlayer2Ready);
            this.readyButtonP1.setInteractive(false).setAlpha(0.5); // Deshabilita el botón de este jugador
        }
    }

    // Envía el estado de selección de personaje al servidor
    sendCharacterSelection(characterId) {
        const selectCharacterMessage = {
            gameCode: this.gameCode,
            username: this.username,
            characterId: characterId,
            isReady: (this.username === this.registry.get('player1Username') ? this.isPlayer1Ready : this.isPlayer2Ready)
        };
        this.stompClient.send(`/app/game.selectCharacter`, {}, JSON.stringify(selectCharacterMessage));
    }

    // Envía el estado de "listo" al servidor
    sendReadyStatus(isReady) {
        const readyMessage = {
            gameCode: this.gameCode,
            username: this.username,
            characterId: (this.username === this.registry.get('player1Username') ? this.player1Character : this.player2Character),
            isReady: isReady
        };
        this.stompClient.send(`/app/game.readyStatus`, {}, JSON.stringify(readyMessage));
    }

    // Actualiza la visualización del botón de listo
    updateReadyButtonDisplay(button, readyStatus) {
        if (readyStatus) {
            button.setAlpha(1); // Opaco si está listo
        } else {
            button.setAlpha(0.5); // Semitransparente si no está listo
        }
    }
}