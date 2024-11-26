class GameScene extends Phaser.Scene {
    static bgMusic
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.movement_speed = 600;  // Velocidad de los personajes
        this.movement_jump = 1200;  // Velocidad de los personajes
        this.gameStarted = false;   // Indica si el juego ha empezado
        this.lifePlayer1 = 25;      // Vida del jugador 1
        this.lifePlayer2 = 25;      // Vida del jugador 2
        this.scorePlayer1 = 0;      // Rondas ganadas por el jugador 1
        this.scorePlayer2 = 0;      // Rondas ganadas por el jugador 2
        this.rounds = 0;            // Número de rondas jugadas

        this.mundo = this.registry.get('mapa');     // Mundo elegido
        this.j1 = this.registry.get('personajeJ1'); // Personaje elegido por el jugador 1                   
        this.j2 = this.registry.get('personajeJ2'); // Personaje elegido por el jugador 2

        this.player1HasFlag = false;   // Indica si el jugador 1 tiene la bandera
        this.player2HasFlag = false;   // Indica si el jugador 2 tiene la bandera
        this.isCaptured = false;

        this.isMovementEnabled = true;
        this.dead = true;

        this.player1HasSpell = false;   // Indica si el jugador 1 tiene la bandera
        this.player2HasSpell = false;   // Indica si el jugador 2 tiene la bandera
        this.isCaptured = false;


        this.sizeX1 = 120;          
        this.sizeY1 = 119;
        this.offsetXR1 = 28;
        this.offsetXL1 = 39;
        this.offsetY1 = 39.25;

        this.sizeX2 = 120;
        this.sizeY2 = 119;
        this.offsetXR2 = 28;
        this.offsetXL2 = 39;
        this.offsetY2 = 39.25;
    }

    preload() {     // CARGA DE ARCHIVOS --------------------------------------------------------------------------------------
        // Musica
        this.load.audio("background2", 'assets/Sonidos/game.mp3');
        
        // Fondos
        this.load.image('background_o', 'assets/Fondos/Mapa_de_otoño.png');   
        this.load.image('background_i', 'assets/Fondos/Mapa_de_invierno.png');  
        this.load.image('background_p', 'assets/Fondos/Mapa_de_primavera.png');  
        this.load.image('background_v', 'assets/Fondos/Mapa_de_verano.png');  

        // Suelos
        this.load.image('ground_o', 'assets/Fondos/SueloOtoño.png');          
        this.load.image('ground_i', 'assets/Fondos/SueloInvierno.png'); 
        //this.load.image('ground_p', 'assets/Fondos/SueloPrimavera.png'); 
        //this.load.image('ground_v', 'assets/Fondos/SueloVerano.png');  

        // Banderas
        this.load.image('flag_o', 'assets/Sprites/Bandera_otoño.png');        
        this.load.image('flag_i', 'assets/Sprites/Bandera_invierno.png');
        this.load.image('flag_p', 'assets/Sprites/Bandera_primavera.png');
        this.load.image('flag_v', 'assets/Sprites/Bandera_verano.png');

        // Casas
        this.load.image('house_o', 'assets/Sprites/Casa_otoño.png');  
        this.load.image('house_i', 'assets/Sprites/Casa_invierno.png');
        this.load.image('house_p', 'assets/Sprites/Casa_primavera.png');
        this.load.image('house_v', 'assets/Sprites/Casa_verano.png');        

        // Personajes
        this.load.spritesheet('champichip', 'assets/Sprites/champichip.png', {frameWidth: 183, frameHeight: 157});
        this.load.spritesheet('champistar', 'assets/Sprites/champistar.png', {frameWidth: 181.55, frameHeight: 151});
        this.load.spritesheet('perretxiko', 'assets/Sprites/perretxiko.png', {frameWidth: 178, frameHeight: 155});
        this.load.spritesheet('mariñon', 'assets/Sprites/mariñon.png', {frameWidth: 182.36, frameHeight: 185});
        this.load.spritesheet('biblioseta', 'assets/Sprites/biblioseta.png', {frameWidth: 177.55, frameHeight: 163});

        // Hechizos
        this.load.image('venom', 'assets/Sprites/Venom.png');
        this.load.image('dacer', 'assets/Sprites/Dacer.png');
        this.load.image('dalsy', 'assets/Sprites/Dalsy.png');
        this.load.image('dash', 'assets/Sprites/Dash.png');
        this.load.image('monster', 'assets/Sprites/Monster.png');
        this.load.image('teleport', 'assets/Sprites/Teleport.png');
        this.load.image('timeMachine', 'assets/Sprites/Time_machine.png');

        // Plataformas
        this.load.image('wall_o', 'assets/Sprites/ParedOtoño.png');   
        this.load.image('wall_i', 'assets/Sprites/ParedInvierno.png'); 
        //this.load.image('wall_p', 'assets/Sprites/ParedPrimavera.png');     
        //this.load.image('wall_v', 'assets/Sprites/ParedVerano.png');   

        this.load.image('small_o', 'assets/Sprites/SetaPequeñaOtoño.png');   
        this.load.image('medium_o', 'assets/Sprites/SetaMedianaOtoño.png');  
        this.load.image('large_o', 'assets/Sprites/SetaGrandeOtoño.png'); 

        this.load.image('small_i', 'assets/Sprites/SetaPequeñaInvierno.png');   
        this.load.image('medium_i', 'assets/Sprites/SetaMedianaInvierno.png');  
        this.load.image('large_i', 'assets/Sprites/SetaGrandeInvierno.png'); 

        //this.load.image('small_p', 'assets/Sprites/SetaPequeñaPrimavera.png');   
        //this.load.image('medium_p', 'assets/Sprites/SetaMedianaPrimavera.png');  
        //this.load.image('large_p', 'assets/Sprites/SetaGrandePrimavera.png'); 

        //this.load.image('small_v', 'assets/Sprites/SetaPequeñaVerano.png');   
        //this.load.image('medium_v', 'assets/Sprites/SetaMedianaVerano.png');  
        //this.load.image('large_v', 'assets/Sprites/SetaGrandeVerano.png'); 

        this.load.spritesheet('bouncy_o', 'assets/Sprites/SetaSaltarinaOtoño.png', {frameWidth: 98, frameHeight: 89});   
        this.load.spritesheet('poisonous_o', 'assets/Sprites/SetaVenenosaOtoño.png', {frameWidth: 98.4, frameHeight: 95}); 

        this.load.spritesheet('bouncy_i', 'assets/Sprites/SetaSaltarinaInvierno.png', {frameWidth: 98, frameHeight: 89});   
        this.load.spritesheet('poisonous_i', 'assets/Sprites/SetaVenenosaInvierno.png', {frameWidth: 98.4, frameHeight: 95}); 

        //this.load.spritesheet('bouncy_p', 'assets/Sprites/SetaSaltarinaPrimavera.png', {frameWidth: 98, frameHeight: 89});   
        //this.load.spritesheet('poisonous_p', 'assets/Sprites/SetaVenenosaPrimavera.png', {frameWidth: 98.4, frameHeight: 95}); 

        //this.load.spritesheet('bouncy_v', 'assets/Sprites/SetaSaltarinaVerano.png', {frameWidth: 98, frameHeight: 89});   
        //this.load.spritesheet('poisonous_v', 'assets/Sprites/SetaVenenosaVerano.png', {frameWidth: 98.4, frameHeight: 95}); 

        // Interfaz
        this.load.image('heart', 'assets/Interfaz/vida.png');
        this.load.image('star', 'assets/Interfaz/puntuación.png');
        this.load.image('rectangle', 'assets/Interfaz/recuadro_info_jugador.png');

        this.load.image('champichip_i', 'assets/Interfaz/champichip_i.png');
        this.load.image('champistar_i', 'assets/Interfaz/champistar_i.png');
        this.load.image('perretxiko_i', 'assets/Interfaz/perretxiko_i.png');
        this.load.image('mariñon_i', 'assets/Interfaz/mariñon_i.png');
        this.load.image('biblioseta_i', 'assets/Interfaz/biblioseta_i.png');

        this.load.image('venom_i', 'assets/Interfaz/Venom_i.png');
        this.load.image('dacer_i', 'assets/Interfaz/Dacer_i.png');
        this.load.image('dalsy_i', 'assets/Interfaz/Dalsy_i.png');
        this.load.image('dash_i', 'assets/Interfaz/Dash_i.png');
        this.load.image('monster_i', 'assets/Interfaz/Monster_i.png');
        this.load.image('teleport_i', 'assets/Interfaz/Teleport_i.png');
        this.load.image('timeMachine_i', 'assets/Interfaz/Time_machine_i.png');
    }

    create(data) {  // AÑADE LOS OBJETOS A LA ESCENA --------------------------------------------------------------------------

        // Musica
        GameScene.bgMusic = this.sound.add('background2');    // Añade la música de fondo,
        GameScene.bgMusic.loop = true;                        // la configura para que se reproduzca en bucle
        GameScene.bgMusic.play();                             // e inicia la reproducción


        // ELECCIÓN PERSONAJE JUGADOR 1 .......................................................................................
        
        let personaje1 = 'champichip';          // Champichip por defecto
        let personaje1i = 'champichip_i';       
        
        if (this.j1 === 2) {                     // Champistar
            personaje1 = 'champistar';
            personaje1i = 'champistar_i'; 
            this.sizeX1 = 140;
            this.sizeY1 = 119;
            this.offsetXR1 = 20;
            this.offsetXL1 = 25;
            this.offsetY1 = 28;


        } else if (this.j1 === 3) {              // Perretxiko
            personaje1 = 'perretxiko';
            personaje1i = 'perretxiko_i'; 
            this.sizeX1 = 120;
            this.sizeY1 = 119;
            this.offsetXR1 = 30;
            this.offsetXL1 = 30;
            this.offsetY1 = 35;

        } else if (this.j1 === 4) {              // Mariñon
            personaje1 = 'mariñon';
            personaje1i = 'mariñon_i'; 
            this.sizeX1 = 140;
            this.sizeY1 = 140;
            this.offsetXR1 = 20;
            this.offsetXL1 = 25;
            this.offsetY1 = 40;


        } else if (this.j1 === 5) {              // Biblioseta
            personaje1 = 'biblioseta';
            personaje1i = 'biblioseta_i'; 
            this.sizeX1 = 120;
            this.sizeY1 = 120;
            this.offsetXR1 = 20;
            this.offsetXL1 = 30;
            this.offsetY1 = 30;

        }

        // ELECCIÓN PERSONAJE JUGADOR 2 .......................................................................................
       
        let personaje2 = 'champichip';           // Champichip por defecto
        let personaje2i = 'champichip_i';

        if (this.j2 === 2) {                     // Champistar
            personaje2 = 'champistar';
            personaje2i = 'champistar_i'; 
            this.sizeX2 = 140;
            this.sizeY2 = 119;
            this.offsetXR2 = 20;
            this.offsetXL2 = 25;
            this.offsetY2 = 28;

        } else if (this.j2 === 3) {              // Perretxiko
            personaje2 = 'perretxiko';
            personaje2i = 'perretxiko_i'; 
            this.sizeX2 = 120;
            this.sizeY2 = 119;
            this.offsetXR2 = 20;
            this.offsetXL2 = 20;
            this.offsetY2 = 35;

        } else if (this.j2 === 4) {              // Mariñon
            personaje2 = 'mariñon';
            personaje2i = 'mariñon_i'; 
            this.sizeX2 = 140;
            this.sizeY2 = 140;
            this.offsetXR2 = 20;
            this.offsetXL2 = 25;
            this.offsetY2 = 30;

        } else if (this.j2 === 5) {              // Biblioseta
            personaje2 = 'biblioseta';
            personaje2i = 'biblioseta_i'; 
            this.sizeX2 = 120;
            this.sizeY2 = 120;
            this.offsetXR2 = 20;
            this.offsetXL2 = 30;
            this.offsetY2 = 30;
        }

        // ELECCIÓN MUNDO .....................................................................................................

        let fondo = 'background_o';             // Otoño por defecto
        let suelo = 'ground_o';
        let bandera = 'flag_o';
        let casa = 'house_o'
        let pared = 'wall_o';
        let pequeña = 'small_o';
        let mediana = 'medium_o';
        let grande = 'large_o';
        let saltarina = 'bouncy_o';
        let venenosa = 'poisonous_o';

        if (this.mundo === 2) {                  // Invierno
            fondo = 'background_i';
            suelo = 'ground_i';
            bandera = 'flag_i';
            casa = 'house_i'
            pared = 'wall_i';
            pequeña = 'small_i';
            mediana = 'medium_i';
            grande = 'large_i';
            saltarina = 'bouncy_i';
            venenosa = 'poisonous_i';

        } else if (this.mundo === 3) {           // Primavera
            fondo = 'background_p';
            suelo = 'ground_p';
            bandera = 'flag_p';
            casa = 'house_p'
            pared = 'wall_p';
            pequeña = 'small_p';
            mediana = 'medium_p';
            grande = 'large_p';
            saltarina = 'bouncy_p';
            venenosa = 'poisonous_p';

        } else if (this.mundo === 4) {           // Verano
            fondo = 'background_v';    
            suelo = 'ground_v';
            bandera = 'flag_v';
            casa = 'house_v'
            pared = 'wall_v';
            pequeña = 'small_v';
            mediana = 'medium_v';
            grande = 'large_v';
            saltarina = 'bouncy_v';
            venenosa = 'poisonous_v';
        }

        // CREACIÓN DEL MUNDO DEL JUEGO .......................................................................................

        this.background = this.add.image(960, 540, fondo);                              // Fondo
        this.background.alpha = 0.5;

        this.ground = this.physics.add.image(960, 1045, suelo).setImmovable();          // Suelo
        this.ground.setScale(2);
        this.ground.body.allowGravity = false;     

        this.platforms = this.physics.add.staticGroup();                                // Plataformas
        this.platforms.create(200, 400, pared);
        // Ir colocando todas las plataformas del mapa...

        
        this.flag = this.physics.add.image(700, 900, bandera);                          // Bandera
        this.flag.setScale(0.2);
        this.flag.body.allowGravity = false;
        this.flag.setCollideWorldBounds(true);

        this.housePlayer1 = this.physics.add.image(175, 875, casa).setImmovable();      // Casa jugador 1
        this.housePlayer1.body.allowGravity = false;
        this.housePlayer1.setScale(0.4);
        
        this.housePlayer2 = this.physics.add.image(1750, 875, casa).setImmovable();     // Casa jugador 2
        this.housePlayer2.body.allowGravity = false;
        this.housePlayer2.setScale(0.4);

        this.player1 = this.physics.add.sprite(180, 700, personaje1);                   // Personaje 1 
        this.player1.body.setSize(this.sizeX1, this.sizeY1); 
        this.player1.body.setOffset(this.offsetXL1, this.offsetY1);

        this.anims.create({
            key: 'caminar1',    // Animación de caminar personaje 1
            frames: this.anims.generateFrameNumbers(personaje1, {start: 0, end: 4}), 
            frameRate: 10,
            repeat: -1          
        });

        this.anims.create({     // Animación de salto personaje 1
            key: 'saltar1',
            frames: this.anims.generateFrameNumbers(personaje1, {start:0, end: 4}),
            frameRate: 10,
            repeat: 0
        })

        this.anims.create({
            key: 'morir1',      // Animación de muerte personaje 1
            frames: this.anims.generateFrameNumbers(personaje1, {start:5, end: 10}),
            frameRate: 6,
            repeat: 0
        })

        this.player2 = this.physics.add.sprite(1750, 700, personaje2);                  // Personaje 2 
        this.player2.body.setSize(this.sizeX2, this.sizeY2); 
        this.player2.body.setOffset(this.offsetXL2, this.offsetY2);

        this.anims.create({
            key: 'caminar2',     // Animación de caminar personaje 1
            frames: this.anims.generateFrameNumbers(personaje2, {start: 0, end: 4}), 
            frameRate: 10,
            repeat: -1           
        });

        this.anims.create({
            key: 'saltar2',      // Animación de salto personaje 2
            frames: this.anims.generateFrameNumbers(personaje2, {start:0, end: 4}),
            frameRate: 10,
            repeat: 0
        })

        this.anims.create({
            key: 'morir2',      // Animación de muerte personaje 2
            frames: this.anims.generateFrameNumbers(personaje2, {start:5, end: 10}),
            frameRate: 6,
            repeat: 0
        })

        // INTERFAZ ..........................................................................................................
        this.configText = {
            style: {
                fontFamily: 'calibri',
                color: '#3c2201',
                fontSize: '25px'
            }
        }
        
        this.player1Rectangle = this.add.image(170, 75, 'rectangle').setScale(0.5);
        this.player1Character = this.add.image(75, 75, personaje1i).setScale(0.5);

        this.player1Points = this.add.image(140, 55, 'star').setScale(0.7);
        this.player1Life = this.add.image(140, 95, 'heart').setScale(0.7);

        this.p1Points = this.add.text(170, 45, this.scorePlayer1 + ' puntos', this.configText.style);
        this.p1Life = this.add.text(170, 82, this.lifePlayer1 + ' vida', this.configText.style);


        this.player2Rectangle = this.add.image(1750, 75, 'rectangle').setScale(0.5);
        this.player2Character = this.add.image(1655 , 75, personaje2i).setScale(0.5);

        this.player2Points = this.add.image(1720, 55, 'star').setScale(0.7);
        this.player2Life = this.add.image(1720, 95, 'heart').setScale(0.7);

        this.p2Points = this.add.text(1750, 45, this.scorePlayer2 + ' puntos', this.configText.style);
        this.p2Life = this.add.text(1750, 82, this.lifePlayer2 + ' vida', this.configText.style);

        // HECHIZOS .........................................................................................................

        this.spells = this.physics.add.group();                         // grupo para los hechizos

        let posx = Phaser.Math.Between(100, 1800);                      // Posición x aleatoria para el hechizo
        let posy = Phaser.Math.Between(200, 900);                       // Posición y aleatoria para el hechizo

        this.venomSpell = this.physics.add.image(posx, posy, 'venom').setScale(0.1);
        this.venomSpell.body.allowGravity = false;

        // COLISIONES .........................................................................................................

        this.player1.setCollideWorldBounds(true);                       // Con los límites del mundo
        this.player2.setCollideWorldBounds(true);  

        this.physics.add.collider(this.player1, this.ground);           // Con el suelo
        this.physics.add.collider(this.player2, this.ground);

        this.physics.add.collider(this.player1, this.platforms);        // Con las plataformas
        this.physics.add.collider(this.player2, this.platforms);

        this.physics.add.collider(                                      // Con las casas
            this.player1,           // Jugador 1
            this.housePlayer1,      // Con casa 1
            (player, house) => this.playerToHouse(player, house), 
            () => this.currentFlagHolder === this.player1, 
            this
        );
        
        this.physics.add.collider(
            this.player2,           // Jugador 2
            this.housePlayer2,      // Con casa 2
            (player, house) => this.playerToHouse(player, house), 
            () => this.currentFlagHolder === this.player2, 
            this
        );        

        this.playersCollision = this.physics.add.collider(this.player1, this.player2, this.switchFlag, null, this);       // Entre los jugadores

        this.collisionFlagP1 = this.physics.add.overlap(this.player1, this.flag, this.collectFlagPlayer1, null, this);    // Con la bandera
        this.collisionFlagP2 = this.physics.add.overlap(this.player2, this.flag, this.collectFlagPlayer2, null, this);

        this.physics.add.collider(this.spells, this.player1, this.hitPlayer, null, this);                   // Con los hechizos
        this.physics.add.collider(this.spells, this.player2, this.hitPlayer, null, this);

        this.physics.add.collider(this.player1, this.venomSpell, this.collectSpellPlayer1, null, this);      
        this.physics.add.collider(this.player2, this.venomSpell, this.collectSpellPlayer2, null, this);

        // RECONOCIMIENTO DE TECLAS ...........................................................................................

        this.leftKeyPlayer1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKeyPlayer1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.upKeyPlayer1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.throwKeyPlayer1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.leftKeyPlayer2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKeyPlayer2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKeyPlayer2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);   
        this.throwKeyPlayer2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    collectFlagPlayer1() {

        this.player1HasFlag = true;                             // Ej jugador 1 tiene ahora la bandera
        this.currentFlagHolder = this.player1;                  
        this.isCaptured = true;
        this.flag.disableBody(true, false);                      // La desactivamos
        console.log('El jugador 1 ha conseguido la bandera');
    }

    collectFlagPlayer2() {

        this.player2HasFlag = true;                             // El jugador 2 tiene ahora la bandera
        this.currentFlagHolder = this.player2;     
        this.isCaptured = true;            
        this.flag.disableBody(true, false);                      // La desactivamos
        console.log('El jugador 2 ha conseguido la bandera');
    }

    switchFlag() {
        if(this.player1HasFlag) {                           // Si el jugador 1 tenía la bandera
            this.player2HasFlag = true;
            this.player1HasFlag = false;
            this.currentFlagHolder = this.player2;

            if (this.player1.body.touching.right) {
                this.player1.body.setVelocityX(-2000);      // Rebota hacia la izquierda
                this.player2.body.setVelocityX(2000);       // Rebota hacia la derecha
            } else if (this.player1.body.touching.left) {
                this.player1.body.setVelocityX(2000);       // Rebota hacia la derecha
                this.player2.body.setVelocityX(-2000);      // Rebota hacia la izquierda
            } else if (this.player1.body.touching.up) {
                this.player1.body.setVelocityY(500);        // Rebota hacia la derecha
                this.player2.body.setVelocityY(-500);       // Rebota hacia la izquierda
            } else if (this.player1.body.touching.down) {
                this.player1.body.setVelocityY(-500);       // Rebota hacia la derecha
                this.player2.body.setVelocityY(500);        // Rebota hacia la izquierda
            }

            console.log('El jugador 2 tiene ahora la bandera');

        } else if (this.player2HasFlag) {                   // Si el jugador 2 tenía la bandera
            this.player2HasFlag = false;
            this.player1HasFlag = true;
            
            if (this.player1.body.touching.right) {
                this.player1.body.setVelocityX(-2000);      // Rebota hacia la izquierda
                this.player2.body.setVelocityX(2000);       // Rebota hacia la derecha
            } else if (this.player1.body.touching.left) {
                this.player1.body.setVelocityX(2000);       // Rebota hacia la derecha
                this.player2.body.setVelocityX(-2000);      // Rebota hacia la izquierda
            } else if (this.player1.body.touching.up) {
                this.player1.body.setVelocityY(500);        // Rebota hacia la derecha
                this.player2.body.setVelocityY(-500);       // Rebota hacia la izquierda
            } else if (this.player1.body.touching.down) {
                this.player1.body.setVelocityY(-500);       // Rebota hacia la derecha
                this.player2.body.setVelocityY(500);        // Rebota hacia la izquierda
            }

            this.currentFlagHolder = this.player1;
            console.log('El jugador 1 tiene ahora la bandera');
        }
    }

    playerToHouse(player) {
        this.isMovementEnabled = false;
        if (player === this.player1 && this.player1HasFlag) {
            this.scorePlayer1++;
            this.p1Points.setText(this.scorePlayer1 + ' puntos');
            this.housePlayer1.disableBody(true, false);
            setTimeout(() => {
                this.nextRound();  // Se llama a nextRound después de 2 segundos
                this.isMovementEnabled = true;
            }, 2000);

        } else if (player === this.player2 && this.player2HasFlag) {
            this.scorePlayer2++;
            this.p2Points.setText(this.scorePlayer2 + ' puntos');
            this.housePlayer2.disableBody(true, false);
            setTimeout(() => {
                this.nextRound();  // Se llama a nextRound después de 2 segundos
                this.isMovementEnabled = true;
            }, 2000);
        }
    }

    collectSpellPlayer1(player, spell) {
        this.player1HasSpell = true;                                    // El jugador 1 tiene un hechizo
        spell.disableBody(true, true);                                  // Desactivar y ocultar el hechizo

        this.player1Spelli = this.add.image(75 , 175, 'venom_i').setScale(0.5);
        this.poisonText1 = this.add.text(120, 150, 
            'Poción veneno: \nquita al oponente 5 \nde vida cada 5 \nsegundos', 
            { 
                ...this.configText.style, 
                color: '#FFFFFF'
            }
        );
        console.log('El jugador 1 ha recogido el hechizo de veneno');
    }
    
    collectSpellPlayer2(player, spell) {
        this.player2HasSpell = true;                                    // El jugador 2 tiene un hechizo
        spell.disableBody(true, true);                                  // Desactivar y ocultar el hechizo

        this.player2Spelli = this.add.image(1655 , 175, 'venom_i').setScale(0.5);
        this.poisonText2 = this.add.text(1700, 150, 
            'Poción veneno: \nquita al oponente 5 \nde vida cada 5 \nsegundos', 
            { 
                ...this.configText.style, 
                color: '#FFFFFF'
            }
        );

        console.log('El jugador 2 ha recogido el hechizo de veneno');
    }

    throwSpell() {  // LANZAR HECHIZOS ----------------------------------------------------------------------------------------
        if (this.throwKeyPlayer1.isDown && this.player1HasSpell) {   
            this.createSpell(this.player1);                             // Crea y lanza un hechizo
            this.player1HasSpell = false;                               // El jugador 1 ya no tiene el hechizo

            this.player1Spelli.destroy();
            this.poisonText1.destroy();

            console.log('El jugador 1 ha lanzado el hechizo de veneno');
        }
    
        if (this.throwKeyPlayer2.isDown && this.player2HasSpell) {   
            this.createSpell(this.player2);                             // Crea y lanza un hechizo
            this.player2HasSpell = false;                               // El jugador 2 ya no tiene el hechizo

            this.player2Spelli.destroy();
            this.poisonText2.destroy();

            console.log('El jugador 2 ha lanzado el hechizo de veneno');
        }
    }
    
    createSpell(player) {  // CREAR HECHIZOS ------------------------------------------------------------------------------ 
        let spell = this.spells.create(player.x, player.y, 'venom');    // Crea un hechizo de tipo venom
        spell.setVelocityX(player.flipX ? 600 : -600);                  // Velocidad según la dirección del jugador
        spell.setScale(0.1);                                            // Tamaño del hechizo 
        spell.body.allowGravity = false;                                // El hechizo no se ve afectado por la gravedad
    }
    
    hitPlayer(player, spell) {
        spell.destroy();                        // Destruye el hechizo al impactar
        player.setTint(0x933cb2);               // Cambia el color del jugador para indicar que fue golpeado
        this.time.addEvent({                    
            delay: 500,
            callback: () => {
                player.clearTint();             // A los 500ms destinta al jugador
            }
        });

        this.applyVenomDamage(player);          // E inicia el daño del veneno
    }

    applyVenomDamage(player) {
        if (!player.venomTimer) {                                           // Verificar si el jugador ya tiene un temporizador activo
            player.venomTimer = this.time.addEvent({
                delay: 3000,                                                // 3 segundos entre cada daño
                callback: () => {
                    if (player === this.player1) {
                        if (this.lifePlayer1 > 0) {
                            this.lifePlayer1 -= 5;                          // Reducir la vida
                            player.setTint(0xff0000);                       // Cambia el color del jugador para indicar que recibe daño
                            this.p1Life.setText(this.lifePlayer1 + ' vida'); // Actualizar texto
                            
                            this.time.delayedCall(500, () => {              // Restaurar el color después de un breve tiempo
                                player.clearTint();
                            });
                        }
                    } else if (player === this.player2) {
                        if (this.lifePlayer2 > 0) {
                            this.lifePlayer2 -= 5;                          // Reducir la vida
                            player.setTint(0xff0000);                       // Cambia el color del jugador para indicar que recibe daño
                            this.p2Life.setText(this.lifePlayer2 + ' vida'); // Actualizar texto

                            this.time.delayedCall(500, () => {              // Restaurar el color después de un breve tiempo
                                player.clearTint();
                            });
                        }
                    }
                },
                loop: true                                                  // Daño recurrente
            });
        }
    }

    updatePlayerMovement() {    // ACTUALIZA EL MOVIMIENTO DE LOS PERSONAJES --------------------------------------------------
        
        // Movimiento del jugador 1
        if (this.leftKeyPlayer1.isDown && this.isMovementEnabled) {                                   
            this.player1.body.setVelocityX(-this.movement_speed);               // Moverse a la izquierda
            this.player1.flipX = false;
            this.player1.body.setOffset(this.offsetXL1, this.offsetY1);   
            //this.player1.anims.play('caminar1', true);         

        } else if (this.rightKeyPlayer1.isDown && this.isMovementEnabled) {
            this.player1.body.setVelocityX(this.movement_speed);                // Moverse a la derecha
            this.player1.flipX = true;                                          // Cambiar de sentido el sprite
            this.player1.body.setOffset(this.offsetXR1, this.offsetY1);         // Cambiar el offset
            //this.player1.anims.play('caminar1', true);   

        } else {
            this.player1.body.setVelocityX(0);                                  // No moverse
        }

        // Salto del jugador 1
        if (this.upKeyPlayer1.isDown && this.player1.body.touching.down && this.isMovementEnabled) {
            this.player1.body.setVelocityY(-this.movement_jump);                // Moverse hacia arriba
            this.player1.anims.play('saltar1', true);                           // Animación de saltar     

        } else if (this.player1.body.touching.down && this.isMovementEnabled) {
            this.player1.anims.stop();                                          // Detiene la animación de salto
            this.player1.anims.play('caminar1', true);                          // Activa la de caminar
        }

        if (this.lifePlayer1 <= 0) {                                            // Animación de muerte
            this.player1.anims.play('morir1', true);  
        }

        // Movimiento del jugador 2
        if (this.leftKeyPlayer2.isDown && this.isMovementEnabled) {
            this.player2.body.setVelocityX(-this.movement_speed);               // Moverse a la izquierda
            this.player2.flipX = false;
            this.player2.body.setOffset(this.offsetXL2, this.offsetY2);
            //this.player2.anims.play('caminar2', true);   

        } else if (this.rightKeyPlayer2.isDown && this.isMovementEnabled) {   
            this.player2.body.setVelocityX(this.movement_speed);                // Moverse a la derecha
            this.player2.flipX = true;                                          // Cambiar de sentido el sprite
            this.player2.body.setOffset(this.offsetXR2, this.offsetY2);         // Cambiar el offset
            //this.player2.anims.play('caminar2', true);   

        } else {
            this.player2.body.setVelocityX(0);                                  // No moverse
        }

        // Salto del jugador 2
        if (this.upKeyPlayer2.isDown && this.player2.body.touching.down && this.isMovementEnabled) {
            this.player2.body.setVelocityY(-this.movement_jump);                // Moverse hacia arriba
            this.player2.anims.play('saltar2', true);                           // Animación de saltar

        } else if (this.player2.body.touching.down && this.isMovementEnabled) {
            this.player2.anims.stop();                                          // Detiene la animación de salto
            this.player2.anims.play('caminar2', true);                          // Activa la de caminar
        }

        if (this.lifePlayer2 <= 0) {
            this.player2.anims.play('morir2', true);                            // Animación de muerte
        }
    }

    startGame() {   // COMIENZA EL JUEGO --------------------------------------------------------------------------------------
        this.gameStarted = true;   
        this.rounds = 0;
    }
    
    nextRound() {   // COMIENZA UNA NUEVA RONDA -------------------------------------------------------------------------------
        this.rounds++;                              // Aumenta el contador de rondas

        this.player1.setPosition(180, 700);         // Resetea la posición de los jugadores
        this.player2.setPosition(1750, 700);

        this.lifePlayer1 = 25;                      // Resetea la vida de los jugadores
        this.p1Life.setText(this.lifePlayer1 + ' vida');
        this.lifePlayer2 = 25;
        this.p2Life.setText(this.lifePlayer2 + ' vida');
        this.dead = true;

        this.player1HasFlag = false;
        this.player2HasFlag = false;
        this.currentFlagHolder = null;
        this.isCaptured = false;

        let posx = Phaser.Math.Between(100, 1800);  // Posición aleatoria x
        let posy = Phaser.Math.Between(200, 900);   // Posición aleatoria y

        this.flag.enableBody(true, posx, posy , true, true);  // Volver a colocar la bandera

        this.housePlayer1.enableBody(true, 175, 875 , true, true);
        this.housePlayer2.enableBody(true, 1750, 875 , true, true);

        if (this.player1HasSpell) {
            this.player1Spelli.destroy();
            this.poisonText1.destroy();
        } 
        if (this.player2HasSpell) {
            this.player2Spelli.destroy();
            this.poisonText2.destroy();
        }

        let posxSpell = Phaser.Math.Between(100, 1800);                      // Posición x aleatoria para el hechizo
        let posySpell = Phaser.Math.Between(200, 900);                       // Posición y aleatoria para el hechizo

        this.venomSpell = this.physics.add.image(posxSpell, posySpell, 'venom');
        this.venomSpell.setScale(0.1);
        this.venomSpell.body.allowGravity = false;

        this.physics.add.collider(this.player1, this.venomSpell, this.collectSpellPlayer1, null, this);      
        this.physics.add.collider(this.player2, this.venomSpell, this.collectSpellPlayer2, null, this);
        
        this.resetPoisonTimers();                   // Detener cualquier temporizador de veneno activo
    }

    resetPoisonTimers() {   // DETIENE LOS TEMPORIZADORES DE VENENO -----------------------------------------------------------
        if (this.player1.venomTimer) {
            this.player1.venomTimer.remove(false);
            this.player1.venomTimer = null;         // Elimina el temporizador del jugador 1
        }
    
        if (this.player2.venomTimer) {
            this.player2.venomTimer.remove(false);
            this.player2.venomTimer = null;         // Elimina el temporizador del jugador 2
        }
    
        // Restaurar el estado de veneno de los jugadores a "no envenenados"
        this.player1.setTint(0xFFFFFF);     // Restaurar color original de player 1
        this.player2.setTint(0xFFFFFF);     // Restaurar color original de player 2
    }

    checkWinCondition() {   // COMPRUEBA SI SE CUMPLE LA CONDICIÓN DE FIN DE PARTIDA O NUEVA RONDA ----------------------------

        if (this.lifePlayer1 <= 0 && this.dead) {           // Si el jugador 1 se muere
            this.scorePlayer2++;                            // Ej jugador 2 gana la ronda
            this.p2Points.setText(this.scorePlayer2 + ' puntos');

            this.isMovementEnabled = false;
            this.dead = false;

            setTimeout(() => {
                this.nextRound();                           // Se llama a nextRound después de 2 segundos
                this.isMovementEnabled = true;
            }, 2000);
        }

        if (this.lifePlayer2 <= 0 && this.dead) {           // Si el jugador 2 se muere
            this.scorePlayer1++;                            // Ej jugador 2 gana la ronda
            this.p1Points.setText(this.scorePlayer1 + ' puntos');

            this.isMovementEnabled = false;
            this.dead = false;
            
            setTimeout(() => {
                this.nextRound();                           // Se llama a nextRound después de 2 segundos
                this.isMovementEnabled = true;
            }, 2000);
        }
        
        if (this.rounds >= 3) {                                              // Cuando han pasado 3 rondas
            this.registry.set('player1Score', this.scorePlayer1);            // Guarda en registro la puntuación del jugador 1
            this.registry.set('player2Score', this.scorePlayer2);            // Guarda en registro la puntuación del jugador 2
            this.scene.start("EndScene", {})                                 // Carga la escena de fin de partida

        }
    }

    update(time, delta) {   // ACTUALIZA EL JUEGO -----------------------------------------------------------------------------
        this.updatePlayerMovement();
        this.checkWinCondition();
        this.throwSpell();

        if (this.isCaptured) {
            this.flag.setPosition(this.currentFlagHolder.x + 50, this.currentFlagHolder.y - 50);
        }
    }
}