class MapaGameOnline extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaGameOnline' });
        this.stompClient = null; // Cliente STOMP para la comunicación WebSocket
        this.gameCode = null;    // Código de la partida actual
        this.username = null;    // Nombre de usuario del jugador actual
        this.selectedMap = -1;   // Mapa seleccionado, inicializado a -1
    }

    init(data) {
        this.stompClient = data.stompClient; // Recibe el cliente STOMP de la escena anterior
        this.gameCode = data.gameCode;       // Recibe el código de la partida
        this.username = data.username;       // Recibe el nombre de usuario
    }

    preload() {
        // Fondo e imágenes de los mapas
        this.load.image("background2_image", "assets/Fondos/fondoMapas.png");

        this.load.image('invierno', 'assets/Fondos/Mapa_de_invierno.png');
        this.load.image('primavera', 'assets/Fondos/Mapa_de_primavera.png');
        this.load.image('otoño', 'assets/Fondos/Mapa_de_otoño.png');
        this.load.image('verano', 'assets/Fondos/Mapa_de_verano.png');

        this.load.image("options_button", "assets/Interfaz/ajustes.png");
        this.load.image("readyMapa1_button", "assets/Interfaz/botonVeranoMapa.png");
        this.load.image("readyMapa2_button", "assets/Interfaz/botonOtoñoMapa.png");
        this.load.image("readyMapa3_button", "assets/Interfaz/botonInviernoMapa.png");
        this.load.image("readyMapa4_button", "assets/Interfaz/botonPrimaveraMapa.png");
    }

    create() {
        // Fondo
        this.add.image(0, 0, "background2_image")
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);

        // Opciones (ajustes, etc., puedes mantenerlos si son globales)
        this.add.image(this.scale.width - 100, 80, "options_button")
            .setScale(0.12)
            .setInteractive();

        // Imágenes de los mapas
        this.add.image(this.scale.width / 4, this.scale.height - 600, 'verano').setScale(0.8);
        this.add.image(this.scale.width / 4, this.scale.height - 110, 'otoño').setScale(0.8);
        this.add.image(this.scale.width / 1.22, this.scale.height - 600, 'invierno').setScale(0.8);
        this.add.image(this.scale.width / 1.22, this.scale.height - 110, 'primavera').setScale(0.8);

        // Botones de selección de mapa
        this.mapButtons = []; // Almacena los botones para habilitar/deshabilitar

        const map1Button = this.add.image(this.scale.width / 2.5, this.scale.height - 110, "readyMapa1_button") // Mapa verano
            .setScale(0.20)
            .setInteractive()
            .on('pointerdown', () => this.selectMap(0)); // 0 para el mapa de Verano

        const map2Button = this.add.image(this.scale.width / 2.5, this.scale.height - 600, "readyMapa2_button") // Mapa otoño
            .setScale(0.20)
            .setInteractive()
            .on('pointerdown', () => this.selectMap(1)); // 1 para el mapa de Otoño

        const map3Button = this.add.image(this.scale.width / 1.22, this.scale.height - 600, "readyMapa3_button") // Mapa invierno
            .setScale(0.20)
            .setInteractive()
            .on('pointerdown', () => this.selectMap(2)); // 2 para el mapa de Invierno

        const map4Button = this.add.image(this.scale.width / 1.22, this.scale.height - 110, "readyMapa4_button") // Mapa primavera
            .setScale(0.20)
            .setInteractive()
            .on('pointerdown', () => this.selectMap(3)); // 3 para el mapa de Primavera

        this.mapButtons.push(map1Button, map2Button, map3Button, map4Button);

        // Suscribirse al tema de la partida para recibir actualizaciones del mapa
        this.stompClient.subscribe(`/topic/games/${this.gameCode}`, (message) => {
            const gameState = JSON.parse(message.body);
            console.log("Estado de partida recibido en MapaGameOnline:", gameState);

            // Si el mapa ya ha sido seleccionado por alguien, inhabilita los botones de selección
            if (gameState.mapId !== -1 && this.selectedMap === -1) {
                this.selectedMap = gameState.mapId;
                this.registry.set('mapa', this.selectedMap); // Actualiza el mapa en el registro local
                this.disableMapSelection(); // Deshabilita la selección para el segundo jugador
                console.log(`Mapa ${this.selectedMap} seleccionado por otro jugador. Pasando a selección de personajes.`);
                this.scene.stop("MapaGameOnline");
                this.scene.start("PersonajesGameOnline", {
                    stompClient: this.stompClient,
                    gameCode: this.gameCode,
                    username: this.username
                });
                IntroGame.bgMusic.stop(); // Para la música de fondo
            }
        });
    }

    // Método para seleccionar el mapa
    selectMap(mapId) {
        if (this.selectedMap === -1) { // Solo permite seleccionar si aún no hay mapa elegido
            this.selectedMap = mapId;
            this.registry.set('mapa', mapId); // Almacena el mapa en el registro global de Phaser

            // Envia el mensaje de selección de mapa al servidor via WebSocket
            const selectMapMessage = {
                gameCode: this.gameCode,
                username: this.username,
                mapId: mapId
            };
            this.stompClient.send(`/app/game.selectMap`, {}, JSON.stringify(selectMapMessage));
            console.log(`Mapa ${mapId} seleccionado. Pasando a selección de personajes.`);

            this.scene.stop("MapaGameOnline");
            this.scene.start("PersonajesGameOnline", {
                stompClient: this.stompClient,
                gameCode: this.gameCode,
                username: this.username
            });
            IntroGame.bgMusic.stop(); // Para la música de fondo
        } else {
            console.warn("Ya se ha seleccionado un mapa para esta partida.");
        }
    }

    // Deshabilita los botones de selección de mapa para el segundo jugador
    disableMapSelection() {
        this.mapButtons.forEach(button => {
            button.setInteractive(false).setAlpha(0.5); // Desactiva interactividad y oscurece
        });
        console.log("Selección de mapa deshabilitada.");
    }
}
