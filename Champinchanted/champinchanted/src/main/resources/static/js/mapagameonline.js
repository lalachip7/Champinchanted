export default class MapaGameOnline extends Phaser.Scene {
    constructor() {
        super({ key: 'MapaGameOnline' });
    }

    init(data) {
        this.gameCode = data.gameCode;
        this.username = data.username;
        this.isHost = data.isHost;
        this.lastTimelineEventCount = 0;
        
        // NUEVO: Bandera para saber si estamos conectados al servidor. Empezamos asumiendo que sí.
        this.isServerConnected = true;
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
        this.add.text(this.scale.width / 2, this.scale.height - 40, `Código de la Sala: ${this.gameCode}`, { fontFamily: 'FantasyFont, Calibri', fontSize: '36px', color: '#FEEFD8', backgroundColor: 'rgba(0,0,0,0.7)', padding: { x: 15, y: 8 } }).setOrigin(0.5);
        this.add.image(550, 305, 'otoño').setScale(0.4).setDepth(1);
        this.add.image(1350, 305, 'invierno').setScale(0.4).setDepth(1);
        this.add.image(1350, 785, 'primavera').setScale(0.4).setDepth(1);
        this.add.image(550, 785, 'verano').setScale(0.4).setDepth(1);
        this.add.image(350, 120, "readyMapa2_button").setScale(0.20).setDepth(2);
        this.add.image(1150, 120, "readyMapa3_button").setScale(0.20).setDepth(2);
        this.add.image(1150, 600, "readyMapa4_button").setScale(0.20).setDepth(2);
        this.add.image(350, 600, "readyMapa1_button").setScale(0.20).setDepth(2);
        if (!this.isHost) {
            this.add.text(this.scale.width / 2, 950, 'En espera en la sala...', { fontFamily: 'FantasyFont', fontSize: '32px', color: '#FEEFD8' }).setOrigin(0.5);
        }
        this.serverStatusIcon = this.add.image(60, 60, 'server_on').setScale(0.1);
        this.playerCountText = this.add.text(100, 45, '0/2', { fontFamily: 'FantasyFont, Calibri', fontSize: '24px', color: '#FFFFFF', stroke: '#000000', strokeThickness: 4 });
        
        // Se mantienen los mismos sondeos
        this.playerCountPoll = this.time.addEvent({ delay: 3000, callback: this.updatePlayerCountViaAPI, callbackScope: this, loop: true });
        this.serverStatusPoll = this.time.addEvent({ delay: 5000, callback: this.updateServerStatusViaAPI, callbackScope: this, loop: true });
        this.timelinePoll = this.time.addEvent({ delay: 2000, callback: this.updateTimelineViaAPI, callbackScope: this, loop: true });
        
        this.createChatInterface();
        this.add.image(this.scale.width - 100, 100, "chat_button").setScale(0.08).setInteractive().on('pointerdown', () => this.toggleChatWindow());
        this.events.on('shutdown', () => this.cleanup());
    }
    
    // --- LÓGICA DE SONDEO Y RECONEXIÓN MEJORADA ---

    async updateServerStatusViaAPI() {
        try {
            const response = await fetch('/api/ping');
            if (response.ok) {
                if (!this.isServerConnected) {
                    // Si antes estábamos desconectados y ahora la conexión es exitosa,
                    // es un evento de RECONEXIÓN.
                    console.log("Reconexión con el servidor detectada. Forzando actualización completa.");
                    this.isServerConnected = true;
                    // Forzamos una actualización completa e inmediata de toda la información.
                    this.forceFullUpdate();
                }
                if (this.serverStatusIcon) this.serverStatusIcon.setTexture('server_on');
            } else {
                this.isServerConnected = false;
                if (this.serverStatusIcon) this.serverStatusIcon.setTexture('server_off');
            }
        } catch (error) {
            this.isServerConnected = false;
            if (this.serverStatusIcon) this.serverStatusIcon.setTexture('server_off');
        }
    }
    
    // NUEVO: Esta función fuerza la recarga de toda la información de la sala.
    forceFullUpdate() {
        // Resetea el contador de eventos para forzar que la timeline se redibuje por completo.
        this.lastTimelineEventCount = 0; 
        
        // Limpia el contenido actual del chat visualmente.
        const messagesArea = document.getElementById('chat-messages');
        if (messagesArea) messagesArea.innerHTML = '';
        
        // Llama inmediatamente a las funciones de actualización.
        this.updatePlayerCountViaAPI();
        this.updateTimelineViaAPI();
    }
    
    // Las funciones de sondeo ahora son más simples
    async updatePlayerCountViaAPI() {
        if (!this.isServerConnected) { this.playerCountText.setText('0/2'); return; }
        try {
            const response = await fetch(`/api/games/${this.gameCode}/status`);
            if (response.ok) {
                const data = await response.json();
                if (this.playerCountText) this.playerCountText.setText(`${data.playerCount}/2`);
            } else {
                if (this.playerCountText) this.playerCountText.setText('0/2');
            }
        } catch (error) {
            if (this.playerCountText) this.playerCountText.setText('0/2');
        }
    }

    async updateTimelineViaAPI() {
        if (!this.gameCode) return;
        try {
            const response = await fetch(`/api/games/${this.gameCode}/timeline`);
            if (response.ok) {
                const timelineEvents = await response.json();
                if (timelineEvents.length > this.lastTimelineEventCount) {
                    const newEvents = timelineEvents.slice(this.lastTimelineEventCount);
                    
                    newEvents.forEach(event => {
                        if (event.type === 'CHAT_MESSAGE') {
                            // --- ESTA ES LA CORRECCIÓN ---
                            // Solo dibujamos el mensaje si el que lo envía NO somos nosotros,
                            // porque nuestros propios mensajes ya los mostramos al instante.
                            if (event.sender !== this.username) {
                                this.addChatMessage(event.sender, event.content);
                            }
                        } else if (event.type === 'SYSTEM_NOTIFICATION') {
                            this.displaySystemMessage(event.content);
                        }
                    });
                    this.lastTimelineEventCount = timelineEvents.length;
                }
            }
        } catch (error) { /* Silencio */ }
    }

    async sendChatMessage() {
        const content = this.chatInput.value.trim();
        if (content) {
            this.addChatMessage(this.username, content);
            this.chatInput.value = '';
            const message = { sender: this.username, content: content };
            try {
                const response = await fetch(`/api/games/${this.gameCode}/chat`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message)
                });
                if (!response.ok) { this.displaySystemMessage("Tu último mensaje no se pudo entregar."); }
            } catch (error) { this.displaySystemMessage("Error de red. No se pudo enviar tu mensaje."); }
        }
    }
    
    // El resto de funciones no necesitan cambios
    createChatInterface() {
        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'chat-container';
        Object.assign(this.chatContainer.style, { display: 'none', position: 'absolute', right: '20px', bottom: '20px', width: '320px', height: '400px', backgroundColor: 'rgba(50, 50, 50, 0.75)', border: '2px solid #666', borderRadius: '10px', color: 'white', fontFamily: 'Calibri, sans-serif', flexDirection: 'column' });
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
    displaySystemMessage(content) { const m = document.getElementById('chat-messages'); if (!m) return; const p = document.createElement('p'); p.innerHTML = `<em>${content}</em>`; Object.assign(p.style, { margin: '0 0 8px 0', padding: '3px', fontStyle: 'italic', fontWeight: 'bold', color: '#FFFF00', textAlign: 'center', wordWrap: 'break-word' }); m.appendChild(p); m.scrollTop = m.scrollHeight; }
    addChatMessage(sender, content) { const m = document.getElementById('chat-messages'); if (!m) return; const p = document.createElement('p'); const s = (sender === this.username) ? 'color: #66ff66;' : 'color: #66ccff;'; p.innerHTML = `<strong style="${s}">${sender}:</strong> ${content}`; Object.assign(p.style, { margin: '0 0 5px 0', padding: '2px', wordWrap: 'break-word' }); m.appendChild(p); m.scrollTop = m.scrollHeight; }
    toggleChatWindow() { const d = this.chatContainer.style.display; this.chatContainer.style.display = (d === 'none') ? 'flex' : 'none'; }
    cleanup() { if (this.playerCountPoll) this.playerCountPoll.destroy(); if (this.serverStatusPoll) this.serverStatusPoll.destroy(); if (this.timelinePoll) this.timelinePoll.destroy(); if (this.chatContainer) this.chatContainer.remove(); }
}