class MapaGameOnline extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaGameOnline' });
    }

    init(data) {
        this.stompClient = data.stompClient;
        this.gameCode = data.gameCode;
        this.username = data.username;
        this.selectedMap = -1;
    }

    preload() {
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
        
        // Interfaz del Chat (se crea aquí)
        this.createChatInterface();
        
        const chatButton = this.add.image(this.scale.width - 100, 100, "chat_button")
            .setScale(0.10) // Igual que los botones de mapa
            .setInteractive()
            .on('pointerdown', () => {
                console.log("Botón de chat pulsado");
                this.toggleChatWindow();
            });
        chatButton.setDepth(10); // Asegura que esté por encima del fondo

        const baseX1 = this.scale.width / 2.5 - 50;
        const baseX2 = this.scale.width / 1.22 - 50;

        const mapaButtons = [
            { key: "readyMapa2_button", x: 350, y: 120, mapId: 1 },
            { key: "readyMapa3_button", x: 1150, y: 120, mapId: 2 },
            { key: "readyMapa4_button", x: 1150, y: 600, mapId: 3 },
            { key: "readyMapa1_button", x: 350, y: 600, mapId: 4 }
    ];

        mapaButtons.forEach(buttonInfo => {
            this.add.image(buttonInfo.x, buttonInfo.y, buttonInfo.key)
                .setScale(0.20)
                .setInteractive()
                .on('pointerdown', () => this.selectMap(buttonInfo.mapId));
        });


        // Suscripciones WebSocket
        this.stompClient.subscribe(`/topic/games/${this.gameCode}`, (message) => {
            const gameState = JSON.parse(message.body);
            if (gameState.map !== -1 && this.selectedMap === -1) {
                console.log(`Mapa ${gameState.map} ha sido seleccionado por otro jugador.`);
                this.goToNextScene();
            }
        });

        this.stompClient.subscribe(`/topic/chat/${this.gameCode}`, (message) => {
            const chatMessage = JSON.parse(message.body);
            this.addChatMessage(chatMessage.sender, chatMessage.content);
        });
        
        this.events.on('shutdown', () => this.cleanup());
    }

    selectMap(mapId) {
        if (this.selectedMap !== -1) return; // Evita doble selección
        this.selectedMap = mapId;
        this.registry.set('mapa', mapId);

        const selectMapMessage = { gameCode: this.gameCode, mapId: mapId };
        this.stompClient.send(`/app/game.selectMap`, {}, JSON.stringify(selectMapMessage));
        
        this.goToNextScene();
    }

    goToNextScene() {
        this.cleanup();
        this.scene.start("PersonajesGameOnline", {
            stompClient: this.stompClient,
            gameCode: this.gameCode,
            username: this.username
        });
    }

    createChatInterface() {
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'chat-container';
        Object.assign(this.chatContainer.style, {
            display: 'none', position: 'absolute', right: '20px', bottom: '20px',
            width: '320px', height: '400px', backgroundColor: 'rgba(0,0,0,0.8)',
            border: '2px solid #666', borderRadius: '10px', color: 'white',
            fontFamily: 'Calibri, sans-serif', flexDirection: 'column'
        });

        const messagesArea = document.createElement('div');
        messagesArea.id = 'chat-messages';
        Object.assign(messagesArea.style, { flexGrow: '1', padding: '10px', overflowY: 'auto', borderBottom: '1px solid #444'});

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

        inputArea.appendChild(this.chatInput); inputArea.appendChild(sendButton);
        this.chatContainer.appendChild(messagesArea); this.chatContainer.appendChild(inputArea);
        document.body.appendChild(this.chatContainer);
    }

    toggleChatWindow() {
        const chatDisplay = this.chatContainer.style.display;
        this.chatContainer.style.display = (chatDisplay === 'none') ? 'flex' : 'none';
    }

    addChatMessage(sender, content) {
        const messagesArea = document.getElementById('chat-messages');
        if (!messagesArea) return;
        const messageElement = document.createElement('p');
        const senderStyle = (sender === this.username) ? 'color: #66ff66;' : 'color: #66ccff;'; // Color verde para ti, azul para los demás
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
    
    cleanup() {
        if (this.chatContainer) this.chatContainer.remove();
    }
}