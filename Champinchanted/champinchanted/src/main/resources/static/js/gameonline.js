class GameSceneOnline extends Phaser.Scene {
    constructor() {
        // CAMBIO 1: Clave única para la escena online para evitar conflictos.
        super({ key: 'GameSceneOnline' });
    }

    // CAMBIO 2: Inicialización con todos los datos de red y de juego.
    init(data) {
        this.stompClient = data.stompClient;
        this.gameCode = data.gameCode;
        this.username = data.username;
        this.player1Username = data.player1Username;
        this.player2Username = data.player2Username;

        this.registry.set('mapa', data.mapa);
        this.registry.set('personajeJ1', data.j1);
        this.registry.set('personajeJ2', data.j2);

        // Variables de estado del juego
        this.player = null;      // Nuestro personaje (con físicas)
        this.opponent = null;    // El personaje del oponente (sin físicas locales)
        this.playerState = {};   // Nuestro estado para enviar al servidor
        this.serverState = {};   // El estado completo que recibimos del servidor

        this.keys = null;
        this.isMovementEnabled = true;

        this.flagSprite = null;
        this.house1Sprite = null;
        this.house2Sprite = null;
        this.venomSpellSprite = null;
        this.dazerSpellSprite = null;
        this.flagHolderSprite = null;
        this.isScoring = false;

        this.player1SpellUI = {};
        this.player2SpellUI = {};

        this.roundResetting = false;
    }

    preload() {
        // --- COPIA COMPLETA DE TU PRELOAD ORIGINAL ---
        this.load.audio("background2", 'assets/Sonidos/game.mp3');
        this.load.audio("spellPickup", 'assets/Sonidos/hechizo.mp3');
        this.load.audio("playerDeath", 'assets/Sonidos/cogerBandera.mp3');
        this.load.image('background_o', 'assets/Fondos/Mapa_de_otoño.png');
        this.load.image('background_i', 'assets/Fondos/Mapa_de_invierno.png');
        this.load.image('background_p', 'assets/Fondos/Mapa_de_primavera.png');
        this.load.image('background_v', 'assets/Fondos/Mapa_de_verano.png');
        this.load.image('ground_o', 'assets/Fondos/SueloOtoño.png');
        this.load.image('ground_i', 'assets/Fondos/SueloInvierno.png');
        this.load.image('ground_p', 'assets/Fondos/sueloPrimavera.png');
        this.load.image('ground_v', 'assets/Fondos/sueloVerano.png');
        this.load.image('flag_o', 'assets/Sprites/Bandera_otoño.png');
        this.load.image('flag_i', 'assets/Sprites/Bandera_invierno.png');
        this.load.image('flag_p', 'assets/Sprites/Bandera_primavera.png');
        this.load.image('flag_v', 'assets/Sprites/Bandera_verano.png');
        this.load.image('house_o', 'assets/Sprites/Casa_otoño.png');
        this.load.image('house_i', 'assets/Sprites/Casa_invierno.png');
        this.load.image('house_p', 'assets/Sprites/Casa_primavera.png');
        this.load.image('house_v', 'assets/Sprites/Casa_verano.png');
        this.load.spritesheet('champichip', 'assets/Sprites/champichip.png', { frameWidth: 183, frameHeight: 157 });
        this.load.spritesheet('champistar', 'assets/Sprites/champistar.png', { frameWidth: 181.55, frameHeight: 151 });
        this.load.spritesheet('perretxiko', 'assets/Sprites/perretxiko.png', { frameWidth: 178, frameHeight: 155 });
        this.load.spritesheet('mariñon', 'assets/Sprites/mariñon.png', { frameWidth: 182.36, frameHeight: 185 });
        this.load.spritesheet('biblioseta', 'assets/Sprites/biblioseta.png', { frameWidth: 177.55, frameHeight: 163 });
        this.load.image('venom', 'assets/Sprites/Venom.png');
        this.load.image('dazer', 'assets/Sprites/Dazer.png');
        this.load.image('dalsy', 'assets/Sprites/Dalsy.png');
        this.load.image('dash', 'assets/Sprites/Dash.png');
        this.load.image('monster', 'assets/Sprites/Monster.png');
        this.load.image('teleport', 'assets/Sprites/Teleport.png');
        this.load.image('timeMachine', 'assets/Sprites/Time_machine.png');
        this.load.image('wall_o', 'assets/Sprites/ParedOtoño.png');
        this.load.image('wall_i', 'assets/Sprites/ParedInvierno.png');
        this.load.image('small_o', 'assets/Sprites/SetaPequeñaOtoño.png');
        this.load.image('medium_o', 'assets/Sprites/SetaMedianaOtoño.png');
        this.load.image('large_o', 'assets/Sprites/SetaGrandeOtoño.png');
        this.load.image('small_i', 'assets/Sprites/SetaPequeñaInvierno.png');
        this.load.image('medium_i', 'assets/Sprites/SetaMedianaInvierno.png');
        this.load.image('large_i', 'assets/Sprites/SetaGrandeInvierno.png');
        this.load.image('rose', 'assets/Sprites/rosa.png');
        this.load.image('poppy', 'assets/Sprites/amapola.png');
        this.load.image('medium_p', 'assets/Sprites/setoMedianoPrimavera.png');
        this.load.image('large_p', 'assets/Sprites/setoGrandePrimavera.png');
        this.load.image('front_leaf', 'assets/Sprites/hojaFrontal.png');
        this.load.image('side_leaf1', 'assets/Sprites/hojaLateral1.png');
        this.load.image('side_leaf2', 'assets/Sprites/hojaLateral2.png');
        this.load.image('side_leaf3', 'assets/Sprites/hojaLateral3.png');
        this.load.image('clover', 'assets/Sprites/trebol.png');
        this.load.image('medium_v', 'assets/Sprites/setoMedianoVerano.png');
        this.load.image('large_v', 'assets/Sprites/setoGrandeVerano.png');
        this.load.spritesheet('bouncy_o', 'assets/Sprites/SetaSaltarinaOtoño.png', { frameWidth: 98, frameHeight: 89 });
        this.load.spritesheet('poisonous_o', 'assets/Sprites/SetaVenenosaOtoño.png', { frameWidth: 98.4, frameHeight: 95 });
        this.load.spritesheet('bouncy_i', 'assets/Sprites/SetaSaltarinaInvierno.png', { frameWidth: 98, frameHeight: 89 });
        this.load.spritesheet('poisonous_i', 'assets/Sprites/SetaVenenosaInvierno.png', { frameWidth: 98.4, frameHeight: 95 });
        this.load.image('heart', 'assets/Interfaz/vida.png');
        this.load.image('star', 'assets/Interfaz/puntuación.png');
        this.load.image('rectangle', 'assets/Interfaz/recuadro_info_jugador.png');
        this.load.image('champichip_i', 'assets/Interfaz/champichip_i.png');
        this.load.image('champistar_i', 'assets/Interfaz/champistar_i.png');
        this.load.image('perretxiko_i', 'assets/Interfaz/perretxiko_i.png');
        this.load.image('mariñon_i', 'assets/Interfaz/mariñon_i.png');
        this.load.image('biblioseta_i', 'assets/Interfaz/biblioseta_i.png');
        this.load.image('venom_i', 'assets/Interfaz/Venom_i.png');
        this.load.image('dazer_i', 'assets/Interfaz/Dazer_i.png');
        this.load.image('dalsy_i', 'assets/Interfaz/Dalsy_i.png');
        this.load.image('dash_i', 'assets/Interfaz/Dash_i.png');
        this.load.image('monster_i', 'assets/Interfaz/Monster_i.png');
        this.load.image('teleport_i', 'assets/Interfaz/Teleport_i.png');
        this.load.image('timeMachine_i', 'assets/Interfaz/Time_machine_i.png');
        this.load.image('BotonSalirPausa', 'assets/Interfaz/botonSalir.PNG');
        this.load.image('BotonReanudarPausa', 'assets/Interfaz/botonReanudar.png');
        this.load.image('FondoPausa', 'assets/Fondos/FondoPausa.png');
    }

    create() {
        // --- CREACIÓN DEL MUNDO (igual que en local) ---
        const mundo = this.registry.get('mapa');
        let fondo = 'background_o', suelo = 'ground_o', bandera = 'flag_o', casa = 'house_o', pared = 'wall_o', pequena = 'small_o', mediana = 'medium_o', grande = 'large_o';

        if (mundo === 2) { fondo = 'background_i'; suelo = 'ground_i'; bandera = 'flag_i'; casa = 'house_i'; pared = 'wall_i'; pequena = 'small_i'; mediana = 'medium_i'; grande = 'large_i'; }
        else if (mundo === 3) { fondo = 'background_p'; suelo = 'ground_p'; bandera = 'flag_p'; casa = 'house_p'; pared = 'wall_o'; pequena = 'rose'; mediana = 'medium_p'; grande = 'large_p'; }
        else if (mundo === 4) { fondo = 'background_v'; suelo = 'ground_v'; bandera = 'flag_v'; casa = 'house_v'; pared = 'wall_o'; pequena = 'side_leaf2'; mediana = 'medium_v'; grande = 'large_v'; }

        this.add.image(960, 540, fondo).setAlpha(0.5);
        const ground = this.physics.add.staticImage(960, 1045, suelo).setScale(2).refreshBody();
        const platforms = this.physics.add.staticGroup();
        platforms.create(450, 800, pared).setSize(30, 190).setOffset(10, 15).refreshBody();
        platforms.create(960, 400, pequena).setSize(70, 40).setOffset(10, 15).refreshBody();
        platforms.create(300, 350, mediana).setSize(150, 40).refreshBody();
        platforms.create(800, 600, mediana).setSize(150, 40).refreshBody();
        platforms.create(600, 750, grande).setSize(230, 40).setOffset(10, 25).refreshBody();
        platforms.create(1500, 800, pared).setSize(30, 190).setOffset(10, 15).refreshBody();
        platforms.create(1350, 750, grande).setSize(230, 40).setOffset(10, 25).refreshBody();
        platforms.create(1150, 600, mediana).setSize(150, 40).refreshBody();
        platforms.create(960, 950, pequena).setSize(70, 40).setOffset(10, 15).refreshBody();
        platforms.create(1600, 350, mediana).setSize(150, 40).refreshBody();

        // --- CORRECCIÓN: Crear casas como sprites no sólidos ---
        let casaKey = this.getAssetKey('house');
        this.house1Sprite = this.physics.add.sprite(100, 875, casaKey).setScale(0.4); // X antes era 175
        this.house1Sprite.body.setAllowGravity(false).setImmovable(true);
        this.house1Sprite.body.setSize(this.house1Sprite.width * 0.5, this.house1Sprite.height * 0.5, true); // Ajuste de collider

        this.house2Sprite = this.physics.add.sprite(1820, 875, casaKey).setScale(0.4); // X antes era 1750
        this.house2Sprite.body.setAllowGravity(false).setImmovable(true);
        this.house2Sprite.body.setSize(this.house2Sprite.width * 0.5, this.house2Sprite.height * 0.5, true); // Ajuste de collider

        // --- Crear bandera y hechizos con físicas ---
        let flagKey = this.getAssetKey('flag');
        this.flagSprite = this.physics.add.sprite(0, 0, flagKey).setScale(0.2).setVisible(false);
        this.flagSprite.body.setAllowGravity(false);

        this.venomSpellSprite = this.physics.add.sprite(0, 0, 'venom').setScale(0.1).setVisible(false);
        this.venomSpellSprite.body.setAllowGravity(false);
        this.dazerSpellSprite = this.physics.add.sprite(0, 0, 'dazer').setScale(0.1).setVisible(false);
        this.dazerSpellSprite.body.setAllowGravity(false);

        // --- CREACIÓN DE LOS JUGADORES ---
        const j1_id = this.registry.get('personajeJ1');
        const j2_id = this.registry.get('personajeJ2');
        const personajeKey1 = this.getCharacterKey(j1_id);
        const personajeKey2 = this.getCharacterKey(j2_id);

        if (this.username === this.player1Username) {
            this.player = this.physics.add.sprite(250, 700, personajeKey1);   // X antes era 180
            this.opponent = this.add.sprite(1670, 700, personajeKey2);        // X antes era 1750
            this.playerState.username = this.player1Username;
        } else {
            this.player = this.physics.add.sprite(1670, 700, personajeKey2);  // X antes era 1750
            this.opponent = this.add.sprite(250, 700, personajeKey1);         // X antes era 180
            this.playerState.username = this.player2Username;
        }

        const myCharacterId = (this.username === this.player1Username) ? j1_id : j2_id;

        //////////////////////////////////////////////////

        let sizeX, sizeY, offsetXR, offsetXL, offsetY;

        switch (myCharacterId) {
            case 2: // Champistar
                sizeX = 85; sizeY = 120; offsetXR = 48; offsetXL = 50; offsetY = 25;
                break;
            case 3: // Perretxiko
                sizeX = 70; sizeY = 125; offsetXR = 55; offsetXL = 55; offsetY = 28;
                break;
            case 4: // Mariñon
                sizeX = 80; sizeY = 145; offsetXR = 50; offsetXL = 55; offsetY = 35;
                break;
            case 5: // Biblioseta
                sizeX = 75; sizeY = 125; offsetXR = 48; offsetXL = 55; offsetY = 30;
                break;
            case 1: // Champichip (y por defecto)
            default:
                sizeX = 80; sizeY = 120; offsetXR = 50; offsetXL = 55; offsetY = 30;
                break;
        }

        this.player.body.setSize(sizeX, sizeY);
        // Guardamos los offsets para usarlos en update()
        this.player.offsets = { xl: offsetXL, xr: offsetXR, y: offsetY };
        this.player.body.setOffset(this.player.offsets.xl, this.player.offsets.y);

        /////////////////////////////////////////

        // --- CONFIGURACIÓN DE FÍSICAS Y COLISIONES (AHORA EN EL ORDEN CORRECTO) ---
        this.player.setBounce(0.1).setCollideWorldBounds(true);
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.player, platforms);

        // --- CORRECCIÓN: Asignar la casa correcta y crear la superposición DESPUÉS de crear al jugador ---
        let myHouse;
        if (this.username === this.player1Username) {
            myHouse = this.house1Sprite;
        } else {
            myHouse = this.house2Sprite;
        }

        this.physics.add.overlap(this.player, myHouse, () => {
            // CONDICIÓN: ¿Tengo la bandera Y NO estoy ya en proceso de puntuar?
            if (!this.isScoring && this.serverState && this.serverState.flagHolderUsername === this.username) {

                // ¡CERROJO ACTIVADO!
                this.isScoring = true;

                // Envía el mensaje al servidor SOLO UNA VEZ
                this.stompClient.send("/app/game.scorePoint", {}, JSON.stringify({
                    gameCode: this.gameCode,
                    username: this.username
                }));
            }
        }, null, this);

        // Superposiciones con bandera y hechizo
        this.physics.add.overlap(this.player, this.flagSprite, () => {
            if (this.flagSprite.visible) {
                this.stompClient.send("/app/game.collectFlag", {}, JSON.stringify({
                    gameCode: this.gameCode,
                    username: this.username
                }));
            }
        }, null, this);

        this.physics.add.overlap(this.player, this.venomSpellSprite, () => {
            if (this.venomSpellSprite.visible) {
                this.stompClient.send("/app/game.collectSpell", {}, JSON.stringify({
                    gameCode: this.gameCode,
                    username: this.username,
                    spellType: "venom"
                }));
            }
        }, null, this);

        this.physics.add.overlap(this.player, this.dazerSpellSprite, () => {
            if (this.dazerSpellSprite.visible) {
                this.stompClient.send("/app/game.collectSpell", {}, JSON.stringify({
                    gameCode: this.gameCode,
                    username: this.username,
                    spellType: "dazer" // El tipo ahora es "dazer"
                }));
            }
        }, null, this);

        // --- DEFINICIÓN DE TECLAS ---
        this.keys = this.input.keyboard.createCursorKeys();
        const wasd = this.input.keyboard.addKeys('W,A,D');
        if (this.username === this.player1Username) {
            this.keys.up = wasd.W;
            this.keys.left = wasd.A;
            this.keys.right = wasd.D;
        }

        // --- CREACIÓN DE LA INTERFAZ (UI) Y RED ---
        this.createSpellUI();
        this.createMainUI();
        this.subscribeToGameUpdates();
        this.time.addEvent({ delay: 50, callback: this.sendPlayerState, callbackScope: this, loop: true });
    }

    update() {
        if (!this.player) return;

        // --- LÓGICA DE MOVIMIENTO LOCAL ---
        if (this.isMovementEnabled) {
            if (this.keys.left.isDown) {
                this.player.setVelocityX(-600);
                this.player.flipX = false;
            } else if (this.keys.right.isDown) {
                this.player.setVelocityX(600);
                this.player.flipX = true;
            } else {
                this.player.setVelocityX(0);
            }

            if (this.keys.up.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-1200);
            }
        } else {
            this.player.setVelocityX(0);
        }
        if (this.flagHolderSprite && this.flagSprite) {
            // Hacemos que la bandera siga al sprite que la tiene
            this.flagSprite.setPosition(
                this.flagHolderSprite.x + (this.flagHolderSprite.flipX ? -25 : 25),
                this.flagHolderSprite.y - 40
            );
        }
    }

    // --- FUNCIONES DE RED ---
    subscribeToGameUpdates() {
        this.stompClient.subscribe(`/topic/gameplay/${this.gameCode}`, (message) => {
            const gameState = JSON.parse(message.body);
            this.serverState = gameState;
            this.updateVisuals();
        });
    }

    sendPlayerState() {
        if (this.stompClient && this.stompClient.connected && this.player) {
            const updateMessage = {
                gameCode: this.gameCode,
                username: this.username,
                positionX: this.player.x,
                positionY: this.player.y,
                // Puedes añadir más datos aquí (vidas, puntuación, etc.)
            };
            this.stompClient.send(`/app/game.updateState`, {}, JSON.stringify(updateMessage));
        }
    }

    resetPlayerPosition() {
        const startX = (this.username === this.player1Username) ? 180 : 1750;
        const startY = 700;
        this.player.setPosition(startX, startY);
        console.log("Posición del jugador reseteada al inicio de la ronda.");
    }

    updateVisuals() {
        const gameState = this.serverState;
        if (!gameState || !gameState.player1State || !gameState.player2State || !this.opponent) {
            return;
        }

        // --- Comprobar si se ha reiniciado la ronda ---
        const wasFlagHeld = this.flagHolderSprite !== null;
        const isFlagNowOnMap = gameState.flagVisible && gameState.flagHolderUsername === null;
        if (wasFlagHeld && isFlagNowOnMap) {
            this.resetPlayerPosition();
            this.isScoring = false;
        }

        // --- Actualizar Oponente y UI (vidas, puntuación) ---
        const { player1State, player2State } = gameState;
        const opponentState = (this.username === player1State.username) ? player2State : player1State;

        this.tweens.add({
            targets: this.opponent,
            x: opponentState.positionX,
            y: opponentState.positionY,
            duration: 60,
            ease: 'Linear'
        });

        if (this.opponent.x < opponentState.positionX) { this.opponent.flipX = true; }
        else if (this.opponent.x > opponentState.positionX) { this.opponent.flipX = false; }

        if (this.scoreText) { this.scoreText.setText(`${player1State.score} / ${player2State.score}`); }
        if (this.player1LifeImages) { this.updatePlayerLives(this.player1LifeImages, player1State.lives); }
        if (this.player2LifeImages) { this.updatePlayerLives(this.player2LifeImages, player2State.lives); }

        // --- LÓGICA DE VISIBILIDAD DE LA BANDERA (LA CORRECCIÓN) ---
        if (this.flagSprite) {
            if (gameState.flagHolderUsername) {
                // Alguien tiene la bandera
                this.flagSprite.setVisible(true); // ¡Nos aseguramos de que sea visible!
                if (gameState.flagHolderUsername === this.username) {
                    this.flagHolderSprite = this.player; // La tenemos nosotros
                } else {
                    this.flagHolderSprite = this.opponent; // La tiene el oponente
                }
            } else if (gameState.flagVisible) {
                // La bandera está en el mapa
                this.flagHolderSprite = null;
                this.flagSprite.setVisible(true);
                this.flagSprite.setPosition(gameState.flagPositionX, gameState.flagPositionY);
            } else {
                // La bandera no está en juego (ronda terminada, etc.)
                this.flagHolderSprite = null;
                this.flagSprite.setVisible(false);
            }
        }

        // --- Actualizar hechizos y su UI ---
        if (this.venomSpellSprite) {
            this.venomSpellSprite.setVisible(gameState.venomSpellVisible);
            if (gameState.venomSpellVisible) {
                this.venomSpellSprite.setPosition(gameState.venomSpellX, gameState.venomSpellY);
            }
        }
        if (this.dazerSpellSprite) {
            this.dazerSpellSprite.setVisible(gameState.dazerSpellVisible);
            if (gameState.dazerSpellVisible) {
                this.dazerSpellSprite.setPosition(gameState.dazerSpellX, gameState.dazerSpellY);
            }
        }
        this.updatePlayerSpellUI(this.player1SpellUI, gameState.player1HeldSpell);
        this.updatePlayerSpellUI(this.player2SpellUI, gameState.player2HeldSpell);
    }
    getAssetKey(baseName) {
        const mundo = this.registry.get('mapa');
        const suffixMap = { 1: '_o', 2: '_i', 3: '_p', 4: '_v' };
        return baseName + (suffixMap[mundo] || '_o');
    }

    createSpellUI() {
        const p1_ui = {
            rect: this.add.image(160, 200, 'rectangle').setScale(0.8).setVisible(false),
            icon: this.add.image(75, 200, null).setScale(0.5).setVisible(false),
            text: this.add.text(135, 145, '', { fontFamily: 'FantasyFont', color: '#35221E', fontSize: '25px' }).setVisible(false)
        };
        this.player1SpellUI = p1_ui;

        const p2_ui = {
            rect: this.add.image(1760, 200, 'rectangle').setScale(0.8).setVisible(false),
            icon: this.add.image(1685, 200, null).setScale(0.5).setVisible(false),
            text: this.add.text(1735, 145, '', { fontFamily: 'FantasyFont', color: '#35221E', fontSize: '25px' }).setVisible(false)
        };
        this.player2SpellUI = p2_ui;
    }

    // Muestra u oculta la UI de hechizo de un jugador y la configura
    updatePlayerSpellUI(spellUI, spellId) {
        const spellData = {
            1: { key: 'venom_i', text: 'Poción veneno:\nquita 1 vida\ncada 5 seg.' },
            2: { key: 'dazer_i', text: 'Dazer: congela\nal enemigo por\n3 segundos' }
        };

        if (spellId > 0 && spellData[spellId]) {
            const data = spellData[spellId];
            spellUI.rect.setVisible(true);
            spellUI.icon.setTexture(data.key).setVisible(true);
            spellUI.text.setText(data.text).setVisible(true);
        } else {
            spellUI.rect.setVisible(false);
            spellUI.icon.setVisible(false);
            spellUI.text.setVisible(false);
        }
    }

    // --- FUNCIONES AUXILIARES (iguales que en local) ---
    createMainUI() {
        const j1_id = this.registry.get('personajeJ1');
        const j2_id = this.registry.get('personajeJ2');
        const p1_icon_key = this.getCharacterKey(j1_id) + '_i';
        const p2_icon_key = this.getCharacterKey(j2_id) + '_i';

        this.scoreText = this.add.text(this.scale.width / 2, 50, '0 / 0', { fontFamily: 'FantasyFont, calibri', color: '#ffffff', fontSize: '40px' }).setOrigin(0.5);
        this.add.image(75, 75, p1_icon_key).setScale(0.5);
        this.player1LifeImages = Array(5).fill(null).map((_, i) => this.add.image(140 + (i * 40), 75, 'heart').setScale(0.7));
        this.add.image(1845, 75, p2_icon_key).setScale(0.5);
        this.player2LifeImages = Array(5).fill(null).map((_, i) => this.add.image(1785 - (i * 40), 75, 'heart').setScale(0.7));
    }

    updatePlayerLives(lifeImages, currentLives) {
        lifeImages.forEach((heart, index) => heart.setVisible(index < currentLives));
    }

    getCharacterKey(id) {
        const characterMap = { 1: 'champichip', 2: 'champistar', 3: 'perretxiko', 4: 'mariñon', 5: 'biblioseta' };
        return characterMap[id] || 'champichip';
    }
}