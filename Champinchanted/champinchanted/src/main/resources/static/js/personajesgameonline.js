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
        this.playerSlots = {};
    }

    init(data) {
        this.stompClient = data.stompClient;
        this.gameCode = data.gameCode;
        this.username = data.username;

        this.isHost = data.isHost;
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
        this.add.image(0, 0, "background2").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
        this.add.text(this.scale.width / 2, 60, `Sala: ${this.gameCode}`, { fontFamily: 'FantasyFont', fontSize: '52px', color: '#FEEFD8' }).setOrigin(0.5);

        // --- DIBUJAR LA INTERFAZ GRÁFICA ---
        this.createPlayerSlot(this.player1Username, this.scale.width * 0.25, 'P1');
        this.createPlayerSlot(this.player2Username || "Esperando...", this.scale.width * 0.75, 'P2');
        this.createCharacterSelectionGrid();

        // --- LÓGICA DE WEBSOCKETS ---
        this.subscribeToGameUpdates();
    }

    createPlayerSlot(playerName, positionX, playerKey) {
        const slotY = 350;
        const nameText = this.add.text(positionX, slotY - 180, playerName, { fontFamily: 'FantasyFont', fontSize: '40px', color: '#FEEFD8' }).setOrigin(0.5);

        const readyButton = this.add.image(positionX, slotY + 180, 'ready_button1').setScale(0.25);

        if (playerName === this.username || (playerKey === 'P1' && this.isHost)) {
            // Permite hacer clic si es nuestro propio slot
            readyButton.setInteractive().on('pointerdown', () => {
                this.stompClient.send("/app/game.ready", {}, JSON.stringify({ gameCode: this.gameCode, username: this.username }));
                readyButton.disableInteractive().setTint(0x808080);
            });
        } else {
            // Botón del otro jugador, no interactivo
            readyButton.setAlpha(0.6);
        }

        this.playerSlots[playerKey] = {
            nameText: nameText, // Guardamos la referencia al texto del nombre
            characterImage: this.add.image(positionX, slotY, null).setScale(1).setVisible(false),
            readyButton: readyButton,
            readyCheck: this.add.text(positionX, slotY + 180, '¡LISTO!', { fontFamily: 'FantasyFont', fontSize: '40px', color: '#90EE90' }).setOrigin(0.5).setVisible(false)
        };
    }

    createCharacterSelectionGrid() {
        const characterData = [
            { id: 3, key: 'character1' }, { id: 1, key: 'character2' }, { id: 2, key: 'character3' },
            { id: 4, key: 'character4' }, { id: 5, key: 'character5' }
        ];
        const startX = this.scale.width / 2 - (characterData.length * 180) / 2 + 90;
        const yPos = 800;

        characterData.forEach((char, index) => {
            const charImage = this.add.image(startX + (index * 180), yPos, char.key).setScale(0.8).setInteractive();
            charImage.on('pointerdown', () => this.selectCharacter(char.id));
            this.characters[char.id] = { image: charImage };
        });
    }

    subscribeToGameUpdates() {
        this.stompClient.subscribe(`/topic/games/${this.gameCode}`, (message) => {
            const lobbyData = JSON.parse(message.body);
            this.updateUI(lobbyData);
        });

        this.stompClient.subscribe(`/topic/games/${this.gameCode}/gameplay_start`, (message) => {
            const gameData = JSON.parse(message.body);

            // CAMBIO
            this.scene.start('GameSceneOnline', {
                stompClient: this.stompClient,
                gameCode: this.gameCode,
                username: this.username,
                player1Username: gameData.player1Username,
                player2Username: gameData.player2Username,
                j1: gameData.player1Character,
                j2: gameData.player2Character,
                mapa: this.registry.get('mapa')
            });
        });
    }

    updateUI(lobbyData) {
        // --- Actualizar Imagen de Personaje del Jugador 1 ---
        if (lobbyData.player1Character && lobbyData.player1Character > 0) {
            const charAssetP1 = this.characters[lobbyData.player1Character];
            if (charAssetP1) {
                this.playerSlots.P1.characterImage.setTexture(charAssetP1.image.texture.key).setVisible(true);
            }
        }

        // --- Actualizar Imagen de Personaje del Jugador 2 ---
        // ¡VERSIÓN CORREGIDA! Usando "usernamePlayer2" con "P" mayúscula.
        if (lobbyData.usernamePlayer2 && lobbyData.player2Character && lobbyData.player2Character > 0) {
            const charAssetP2 = this.characters[lobbyData.player2Character];
            if (charAssetP2) {
                this.playerSlots.P2.characterImage.setTexture(charAssetP2.image.texture.key).setVisible(true);
            }
        }

        // --- Actualizar Estado "LISTO" del Jugador 1 ---
        if (lobbyData.player1Ready) {
            this.playerSlots.P1.readyButton.setVisible(false);
            this.playerSlots.P1.readyCheck.setVisible(true);
        }

        // --- Actualizar Estado "LISTO" del Jugador 2 ---
        if (lobbyData.player2Ready) {
            this.playerSlots.P2.readyButton.setVisible(false);
            this.playerSlots.P2.readyCheck.setVisible(true);
        }
    }

    // Método para seleccionar un personaje
    selectCharacter(characterId) {
        this.stompClient.send(`/app/game.selectCharacter`, {}, JSON.stringify({
            gameCode: this.gameCode,
            username: this.username,
            characterId: characterId
        }));
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