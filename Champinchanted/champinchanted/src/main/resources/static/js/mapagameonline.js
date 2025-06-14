class MapaGameOnline extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaGameOnline' });
    }

    init(data) {
        this.stompClient = data.stompClient;
        this.gameCode = data.gameCode;
        this.username = data.username;
        this.selectedMap = -1;
        this.isHost = data.isHost;
    }

    preload() {
        this.load.image('server_on', 'assets/Interfaz/serverEncendido.png');
        this.load.image('server_off', 'assets/Interfaz/serverApagado.png');
        this.load.image("background2_image", "assets/Fondos/fondoMapas.png");
        this.load.image('invierno', 'assets/Fondos/Mapa_de_invierno.png');
        this.load.image('primavera', 'assets/Fondos/Mapa_de_primavera.png');
        this.load.image('otoño', 'assets/Fondos/Mapa_de_otoño.png');
        this.load.image('verano', 'assets/Fondos/Mapa_de_verano.png');
        this.load.image("readyMapa1_button", "assets/Interfaz/botonVeranoMapa.png");
        this.load.image("readyMapa2_button", "assets/Interfaz/botonOtoñoMapa.png");
        this.load.image("readyMapa3_button", "assets/Interfaz/botonInviernoMapa.png");
        this.load.image("readyMapa4_button", "assets/Interfaz/botonPrimaveraMapa.png");
        this.load.image("chat_button", "assets/Interfaz/BotonChat.png");
    }

    create() {
        this.add.image(0, 0, "background2_image").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

        // --- Interfaz de Usuario ---
        this.add.text(this.scale.width / 2, this.scale.height - 40, `Código de la Sala: ${this.gameCode}`, { fontFamily: 'FantasyFont, Calibri', fontSize: '36px', color: '#FEEFD8', backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 15, y: 8 } }).setOrigin(0.5);
        this.createChatInterface();
        const chatButton = this.add.image(this.scale.width - 100, 100, "chat_button").setScale(0.10).setInteractive().on('pointerdown', () => this.toggleChatWindow());
        chatButton.setDepth(10);
        const mapaButtons = [{ key: "readyMapa2_button", x: 350, y: 120, mapId: 1 }, { key: "readyMapa3_button", x: 1150, y: 120, mapId: 2 }, { key: "readyMapa4_button", x: 1150, y: 600, mapId: 3 }, { key: "readyMapa1_button", x: 350, y: 600, mapId: 4 }];
        mapaButtons.forEach(buttonInfo => {
            const buttonImage = this.add.image(buttonInfo.x, buttonInfo.y, buttonInfo.key)
                .setScale(0.20);
            if (this.isHost) {
                buttonImage.setInteractive().on('pointerdown', () => this.selectMap(buttonInfo.mapId));
            } else {
                buttonImage.setAlpha(0.6);
            }
        });

        if (!this.isHost) {
            this.add.text(this.scale.width / 2, 950, 'Esperando a que el anfitrión elija un mapa...', {
                fontFamily: 'FantasyFont', fontSize: '32px', color: '#FEEFD8'
            }).setOrigin(0.5);
        }

        // --- Lógica del indicador del servidor Y CONTADOR ---
        this.serverStatusIcon = this.add.image(60, 60, 'server_off').setScale(0.1);

        // Se crea el texto para el contador de jugadores a la derecha del icono.
        this.playerCountText = this.add.text(100, 45, '?/2', {
            fontFamily: 'FantasyFont, Calibri',
            fontSize: '24px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        });

        if (this.stompClient && this.stompClient.connected) {
            this.serverStatusIcon.setTexture('server_on');
        }
        if (this.stompClient) {
            this.stompClient.ws.onclose = () => this.events.emit('server_disconnected');
        }
        this.events.on('server_disconnected', () => {
            if (this.serverStatusIcon) { this.serverStatusIcon.setTexture('server_off'); }
            // Si nos desconectamos, el contador también se resetea.
            if (this.playerCountText) { this.playerCountText.setText('0/2'); }
        }, this);


        // --- Lógica de Suscripciones ---
        this.stompClient.subscribe(`/topic/games/${this.gameCode}/start`, (message) => {
            // Cuando el servidor da la orden, ambos jugadores reciben el mensaje completo
            const startGameData = JSON.parse(message.body);

            // Llamamos a la siguiente función pasándole TODOS los datos recibidos
            this.goToNextScene(startGameData);
        });

        this.stompClient.subscribe(`/topic/chat/${this.gameCode}`, (message) => {
            const chatMessage = JSON.parse(message.body);
            this.addChatMessage(chatMessage.sender, chatMessage.content);
        });

        // La suscripción a notificaciones ahora también actualiza el contador.
        this.stompClient.subscribe(`/topic/notifications/${this.gameCode}`, (message) => {
            const notification = JSON.parse(message.body);

            // Muestra el mensaje de sistema (unión/desconexión).
            this.displaySystemMessage(notification.content);

            // Actualiza el contador de jugadores si la información viene en el mensaje.
            if (notification.playerCount !== undefined) {
                this.playerCountText.setText(`${notification.playerCount}/2`);
            }
        });

        // Se envía el mensaje de addUser DESPUÉS de suscribirse a todo.
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send(`/app/chat.addUser`, {}, JSON.stringify({ sender: this.username, gameCode: this.gameCode }));
        }

        this.events.on('shutdown', () => this.cleanup());
    }

    displaySystemMessage(content) {
        const messagesArea = document.getElementById('chat-messages');
        if (!messagesArea) return;
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<em>${content}</em>`;
        Object.assign(messageElement.style, {
            margin: '0 0 8px 0', padding: '3px', fontStyle: 'italic',
            fontWeight: 'bold', color: '#FFFF00', textAlign: 'center',
            wordWrap: 'break-word'
        });
        messagesArea.appendChild(messageElement);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    addChatMessage(sender, content) {
        const messagesArea = document.getElementById('chat-messages');
        if (!messagesArea) return;
        const messageElement = document.createElement('p');
        const senderStyle = (sender === this.username) ? 'color: #66ff66;' : 'color: #66ccff;';
        messageElement.innerHTML = `<strong style="${senderStyle}">${sender}:</strong> ${content}`;
        Object.assign(messageElement.style, { margin: '0 0 5px 0', padding: '2px', wordWrap: 'break-word' });
        messagesArea.appendChild(messageElement);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    sendChatMessage() {
        const content = this.chatInput.value.trim();
        if (content && this.stompClient) {
            const chatMessage = { sender: this.username, content: content, gameCode: this.gameCode };
            this.stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            this.chatInput.value = '';
        }
    }

    selectMap(mapId) {
        if (this.selectedMap !== -1) return;
        this.selectedMap = mapId;
        const selectMapMessage = { gameCode: this.gameCode, mapId: mapId, username: this.username };
        this.stompClient.send("/app/game.selectMap", {}, JSON.stringify(selectMapMessage));
    }

    goToNextScene(startGameData) {
        // Guardamos en el registro el mapa que ha confirmado el servidor
        this.registry.set('mapa', startGameData.mapId);

        this.cleanup();

        // Iniciamos la siguiente escena pasando toda la información necesaria
        this.scene.start("PersonajesGameOnline", {
            stompClient: this.stompClient,
            gameCode: this.gameCode,
            username: this.username,
            isHost: this.isHost,
            // ¡Aquí está la clave! Pasamos los nombres de usuario
            player1Username: startGameData.player1Username,
            player2Username: startGameData.player2Username
        });
    }

    createChatInterface() {
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'chat-container';
        Object.assign(this.chatContainer.style, {
            display: 'none', position: 'absolute', right: '20px', bottom: '20px',
            width: '320px', height: '400px',
            backgroundColor: 'rgba(50, 50, 50, 0.75)',
            border: '2px solid #666', borderRadius: '10px', color: 'white',
            fontFamily: 'Calibri, sans-serif', flexDirection: 'column'
        });
        const messagesArea = document.createElement('div');
        messagesArea.id = 'chat-messages';
        Object.assign(messagesArea.style, { flexGrow: '1', padding: '10px', overflowY: 'auto', borderBottom: '1px solid #444' });
        const inputArea = document.createElement('div');
        Object.assign(inputArea.style, { display: 'flex', padding: '5px' });
        this.chatInput = document.createElement('input');
        this.chatInput.type = 'text'; this.chatInput.placeholder = 'Escribe un mensaje...';
        this.chatInput.onkeydown = (event) => { if (event.key === 'Enter') this.sendChatMessage(); };
        Object.assign(this.chatInput.style, { flexGrow: '1', padding: '8px', border: 'none', borderRadius: '5px', color: 'black' });
        const sendButton = document.createElement('button');
        sendButton.innerText = 'Enviar';
        sendButton.onclick = () => this.sendChatMessage();
        Object.assign(sendButton.style, { marginLeft: '5px', padding: '8px', cursor: 'pointer' });
        inputArea.appendChild(this.chatInput);
        inputArea.appendChild(sendButton);
        this.chatContainer.appendChild(messagesArea);
        this.chatContainer.appendChild(inputArea);
        document.body.appendChild(this.chatContainer);
    }

    toggleChatWindow() {
        const chatDisplay = this.chatContainer.style.display;
        this.chatContainer.style.display = (chatDisplay === 'none') ? 'flex' : 'none';
    }

    cleanup() {
        this.events.off('server_disconnected');
        if (this.chatContainer) {
            this.chatContainer.remove();
        }
    }
}
