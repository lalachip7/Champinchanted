class MapaGameOnline extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaGameOnline' });
    }

    init(data) {
        console.log("--- MapaGameOnline: init() ---");
        this.stompClient = data.stompClient;
        this.gameCode = data.gameCode;
        this.username = data.username;
        this.selectedMap = -1;
        this.isHost = data.isHost;
        console.log(`Usuario: ${this.username}, Código de Sala: ${this.gameCode}`);
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
        console.log("--- MapaGameOnline: create() ---");
        this.add.image(0, 0, "background2_image").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

        // --- Interfaz de Usuario ---
        this.add.text(this.scale.width / 2, this.scale.height - 40, `Código de la Sala: ${this.gameCode}`, {fontFamily: 'FantasyFont, Calibri', fontSize: '36px', color: '#FEEFD8', backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 15, y: 8 }}).setOrigin(0.5);
        this.createChatInterface();
        const chatButton = this.add.image(this.scale.width - 100, 100, "chat_button").setScale(0.10).setInteractive().on('pointerdown', () => this.toggleChatWindow());
        chatButton.setDepth(10);
        const mapaButtons = [ { key: "readyMapa2_button", x: 350, y: 120, mapId: 1 }, { key: "readyMapa3_button", x: 1150, y: 120, mapId: 2 }, { key: "readyMapa4_button", x: 1150, y: 600, mapId: 3 }, { key: "readyMapa1_button", x: 350, y: 600, mapId: 4 }];
        mapaButtons.forEach(buttonInfo => {
            const buttonImage = this.add.image(buttonInfo.x, buttonInfo.y, buttonInfo.key)
                .setScale(0.20);

            // ¡LÓGICA CLAVE!
            if (this.isHost) {
                // Si es el host, el botón es interactivo
                buttonImage.setInteractive().on('pointerdown', () => this.selectMap(buttonInfo.mapId));
            } else {
                // Si no es el host, el botón se ve más opaco y no se puede pulsar
                buttonImage.setAlpha(0.6);
            }
        });

        if (!this.isHost) {
            this.add.text(this.scale.width / 2, 950, 'Esperando a que el anfitrión elija un mapa...', {
                fontFamily: 'FantasyFont', fontSize: '32px', color: '#FEEFD8'
            }).setOrigin(0.5);
        }

        this.stompClient.subscribe(`/topic/games/${this.gameCode}/start`, (message) => {
            // Cuando el servidor confirma la selección de mapa, ambos jugadores ejecutan esto
            const startGameData = JSON.parse(message.body);
            const finalMapId = startGameData.mapId;

            // Antes de cambiar de escena, guardamos el mapa que el servidor ha confirmado
            this.registry.set('mapa', finalMapId);

            this.goToNextScene(finalMapId);
        });
        
        // --- ORDEN CORREGIDO ---

        console.log("PASO A: Suscribiéndose al canal de chat normal...");
        this.stompClient.subscribe(`/topic/chat/${this.gameCode}`, (message) => {
            console.log("Mensaje de CHAT NORMAL recibido:", message.body);
            const chatMessage = JSON.parse(message.body);
            this.addChatMessage(chatMessage.sender, chatMessage.content);
        });
        console.log("PASO B: Suscrito al canal de chat normal.");

        
        console.log("PASO C: Suscribiéndose al canal de NOTIFICACIONES...");
        this.stompClient.subscribe(`/topic/notifications/${this.gameCode}`, (message) => {
            console.log("%c¡NOTIFICACIÓN DEL SISTEMA RECIBIDA!", "color: lightblue; font-size: 14px;", message.body);
            const notification = JSON.parse(message.body);
            this.displaySystemMessage(notification.content);
        });
        console.log("PASO D: Suscrito al canal de NOTIFICACIONES.");
        
        // SOLO DESPUÉS de suscribirnos, enviamos el mensaje para anunciar que hemos llegado.
        if (this.stompClient && this.stompClient.connected) {
            console.log("PASO E: Conexión Stomp activa y suscripciones listas. Enviando mensaje de 'addUser'...");
            this.stompClient.send(`/app/chat.addUser`, {}, JSON.stringify({ sender: this.username, gameCode: this.gameCode }));
            console.log("PASO F: Mensaje 'addUser' enviado.");
        } else {
            console.error("ERROR CRÍTICO: La conexión Stomp NO está activa al entrar en create().");
        }

        this.events.on('shutdown', () => this.cleanup());
    }

    // --- FUNCIÓN MODIFICADA PARA LA PRUEBA ---
    // He cambiado el color a un amarillo brillante para que destaque.
    displaySystemMessage(content) {
        console.log("Mostrando mensaje del sistema en el chat:", content);
        const messagesArea = document.getElementById('chat-messages');
        if (!messagesArea) {
            console.error("Error al mostrar mensaje del sistema: No se encuentra el elemento 'chat-messages'.");
            return;
        };
        
        const messageElement = document.createElement('p');
        messageElement.innerHTML = `<em>${content}</em>`;
        Object.assign(messageElement.style, {
            margin: '0 0 8px 0',
            padding: '3px',
            fontStyle: 'italic',
            fontWeight: 'bold', // Añadido para que sea más visible
            color: '#FFFF00',   // ¡¡CAMBIADO A AMARILLO!!
            textAlign: 'center',
            wordWrap: 'break-word'
        });
        messagesArea.appendChild(messageElement);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // Función para mostrar los mensajes normales de los jugadores.
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

    // Función para enviar un mensaje de chat.
    sendChatMessage() {
        const content = this.chatInput.value.trim();
        if (content && this.stompClient) {
            const chatMessage = { sender: this.username, content: content, gameCode: this.gameCode };
            this.stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
            this.chatInput.value = '';
        }
    }
    
    // --- Resto de funciones del juego (sin cambios) ---
    selectMap(mapId) {
        // Evita que el anfitrión envíe el mensaje varias veces.
        if (this.selectedMap !== -1) return;
        this.selectedMap = mapId;

        // Ahora, el anfitrión solo envía el mensaje. NO avanza de escena.
        // Esperará, igual que el invitado, la respuesta del servidor.
        const selectMapMessage = { gameCode: this.gameCode, mapId: mapId, username: this.username };
        this.stompClient.send(`/app/game.selectMap`, {}, JSON.stringify(selectMapMessage));
    }

    goToNextScene(finalMapId) {
        // Guardamos en el registro el mapa que ha confirmado el servidor
        this.registry.set('mapa', finalMapId);

        this.cleanup();
        this.scene.start("PersonajesGameOnline", {
            stompClient: this.stompClient,
            gameCode: this.gameCode,
            username: this.username,
            isHost: this.isHost
        });
    }

    createChatInterface() {
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'chat-container';
        Object.assign(this.chatContainer.style, {
            display: 'none', position: 'absolute', right: '20px', bottom: '20px',
            width: '320px', height: '400px', 
            backgroundColor: 'rgba(50, 50, 50, 0.75)', // <<< ¡¡AQUÍ ESTÁ EL CAMBIO!! Fondo gris oscuro semitransparente.
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
        if (this.chatContainer) this.chatContainer.remove();
    }
}
