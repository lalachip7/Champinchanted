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
        this.load.spritesheet('champichip', 'assets/Sprites/champichip.png', {frameWidth: 183, frameHeight: 157});
        this.load.spritesheet('champistar', 'assets/Sprites/champistar.png', {frameWidth: 181.55, frameHeight: 151});
        this.load.spritesheet('perretxiko', 'assets/Sprites/perretxiko.png', {frameWidth: 178, frameHeight: 155});
        this.load.spritesheet('mariñon', 'assets/Sprites/mariñon.png', {frameWidth: 182.36, frameHeight: 185});
        this.load.spritesheet('biblioseta', 'assets/Sprites/biblioseta.png', {frameWidth: 177.55, frameHeight: 163});
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
        this.load.spritesheet('bouncy_o', 'assets/Sprites/SetaSaltarinaOtoño.png', {frameWidth: 98, frameHeight: 89});   
        this.load.spritesheet('poisonous_o', 'assets/Sprites/SetaVenenosaOtoño.png', {frameWidth: 98.4, frameHeight: 95}); 
        this.load.spritesheet('bouncy_i', 'assets/Sprites/SetaSaltarinaInvierno.png', {frameWidth: 98, frameHeight: 89});   
        this.load.spritesheet('poisonous_i', 'assets/Sprites/SetaVenenosaInvierno.png', {frameWidth: 98.4, frameHeight: 95}); 
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
        else if (mundo === 4) { fondo = 'background_v'; suelo = 'ground_v'; bandera = 'flag_v'; casa = 'house_v'; pared = 'wall_o'; pequena = 'side_leaf2'; mediana = 'medium_v'; grande = 'large_v';}

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

        // --- CREACIÓN DE LOS JUGADORES ---
        const j1_id = this.registry.get('personajeJ1');
        const j2_id = this.registry.get('personajeJ2');
        const personajeKey1 = this.getCharacterKey(j1_id);
        const personajeKey2 = this.getCharacterKey(j2_id);
        
        if (this.username === this.player1Username) {
            this.player = this.physics.add.sprite(180, 700, personajeKey1);
            this.opponent = this.add.sprite(1750, 700, personajeKey2); // El oponente es un sprite simple
            this.playerState.username = this.player1Username;
        } else {
            this.player = this.physics.add.sprite(1750, 700, personajeKey2);
            this.opponent = this.add.sprite(180, 700, personajeKey1);
            this.playerState.username = this.player2Username;
        }

        this.player.setBounce(0.1).setCollideWorldBounds(true);
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.player, platforms);
        
        // --- DEFINICIÓN DE TECLAS ---
        this.keys = this.input.keyboard.createCursorKeys();
        const wasd = this.input.keyboard.addKeys('W,A,D');
        if (this.username === this.player1Username) {
            this.keys.up = wasd.W;
            this.keys.left = wasd.A;
            this.keys.right = wasd.D;
        }
        
        // --- CREACIÓN DE LA INTERFAZ (UI) ---
        this.createUI();

        // --- LÓGICA DE RED ---
        this.subscribeToGameUpdates();
        this.time.addEvent({ delay: 50, callback: this.sendPlayerState, callbackScope: this, loop: true }); // 20 updates/sec
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

    updateVisuals() {
        if (!this.serverState.player1State || !this.serverState.player2State) return;

        const { player1State, player2State } = this.serverState;
        const opponentState = (this.username === player1State.username) ? player2State : p1State;

        // Mover oponente suavemente a su nueva posición
        if (this.opponent && opponentState) {
            this.tweens.add({
                targets: this.opponent,
                x: opponentState.positionX,
                y: opponentState.positionY,
                duration: 60, // Duración corta para que el movimiento sea rápido
                ease: 'Linear'
            });
            // Girar el sprite del oponente basándose en nuestra posición relativa
            this.opponent.flipX = this.player.x > this.opponent.x;
        }

        // Actualizar la puntuación y las vidas
        this.scoreText.setText(`${player1State.score} / ${player2State.score}`);
        this.updatePlayerLives(this.player1LifeImages, player1State.lives);
        this.updatePlayerLives(this.player2LifeImages, player2State.lives);
    }
    
    // --- FUNCIONES AUXILIARES (iguales que en local) ---
    createUI() {
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