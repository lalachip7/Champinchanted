class UsernameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UsernameScene' });
    }

    init() {
        this.username = null;
        this.authMode = null; // 'login' o 'register'
    }

    preload() {
        this.load.image("background_image", "assets/Fondos/fondo.png");
        this.load.image("login_button", "assets/Interfaz/inicioSesion.png");
        this.load.image("register_button", "assets/Interfaz/registrarse.png");
        
        this.load.image("create_game_button", "assets/Interfaz/botonCrearPartida.png");
        this.load.image("join_game_button", "assets/Interfaz/botonUnirsePartida.png");
        this.load.image("return_button", "assets/Interfaz/botonVolver.png");
        this.load.image("submit_button", "assets/Interfaz/botonConfirmar.png");
        
        const font = new FontFace('FantasyFont', 'url(assets/Fuentes/CATChilds.ttf)');
        font.load().then(f => document.fonts.add(f));
    }

    create() {
        this.add.image(0, 0, "background_image").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // --- Elementos HTML para Login/Registro ---
        this.usernameInput = this.createInputElement('text', 'username-input', 'Introduce tu nombre de usuario');
        this.passwordInput = this.createInputElement('password', 'password-input', 'Introduce tu contraseña');
        this.submitHtmlButton = this.createSubmitButton();
        document.body.appendChild(this.usernameInput);
        document.body.appendChild(this.passwordInput);
        document.body.appendChild(this.submitHtmlButton);
        
        // --- Botones de Selección Inicial (Login/Register) en Phaser ---
        const loginButtonBg = this.add.image(centerX, centerY - 50, "login_button").setScale(0.15).setInteractive();
        
        
        const registerButtonBg = this.add.image(centerX, centerY + 30, "register_button").setScale(0.15).setInteractive();
        
        
        this.selectionGroup = this.add.group([loginButtonBg, registerButtonBg]);

        // --- Botones de Opciones de Juego (Crear y Unirse) ---
        const createGameButton = this.add.image(centerX - 200, centerY + 200, "create_game_button").setScale(0.2).setInteractive();
        const joinGameButton = this.add.image(centerX + 200, centerY + 200, "join_game_button").setScale(0.2).setInteractive();
        
        this.gameOptionsGroup = this.add.group([createGameButton, joinGameButton]);
        this.gameOptionsGroup.setVisible(false);

        // --- Lógica de los botones ---
        loginButtonBg.on('pointerdown', () => this.showAuthUI('login'));
        registerButtonBg.on('pointerdown', () => this.showAuthUI('register'));
        this.submitHtmlButton.addEventListener('click', () => this.handleAuthSubmit());
        
        createGameButton.on('pointerdown', () => this.createGame());
        joinGameButton.on('pointerdown', () => {
            const code = prompt("Introduce el código de la partida:");
            if(code) this.joinGame(code.trim().toUpperCase());
        });
        
        this.add.image(centerX, centerY + 350, "return_button").setScale(0.2).setInteractive()
            .on('pointerdown', () => {
                this.cleanup();
                this.scene.start("IntroGame");
            });
            
        this.events.on('shutdown', () => this.cleanup());
    }

    createInputElement(type, id, placeholder) {
        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        input.placeholder = placeholder;
        Object.assign(input.style, {
            position: 'absolute', display: 'none', padding: '10px', fontSize: '20px', width: '300px', 
            fontFamily: 'FantasyFont, Calibri', border: "0", backgroundColor: "#333", color: "#fff",
            borderRadius: "50px", boxShadow: "0 0 10px rgba(0,0,0,0.5)", textAlign: 'center'
        });
        return input;
    }

    createSubmitButton() {
        const button = document.createElement('button');
        button.id = 'submit-html-button';
        button.innerText = 'Confirmar';
        Object.assign(button.style, {
            position: 'absolute', display: 'none', padding: '10px 20px', fontSize: '20px', 
            fontFamily: 'FantasyFont, Calibri', border: "0", backgroundColor: "#4CAF50", 
            color: "white", borderRadius: "50px", cursor: 'pointer'
        });
        return button;
    }
    
    showAuthUI(mode) {
        this.authMode = mode;
        this.selectionGroup.setVisible(false);
        
        const canvas = this.sys.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.positionAndShow(this.usernameInput, centerX, centerY - 80);
        this.positionAndShow(this.passwordInput, centerX, centerY - 20);
        this.positionAndShow(this.submitHtmlButton, centerX, centerY + 40);
    }

    positionAndShow(element, x, y) {
        element.style.left = `${x - element.offsetWidth / 2}px`;
        element.style.top = `${y}px`;
        element.style.display = 'block';
    }
    
    async handleAuthSubmit() {
        const username = this.usernameInput.value;
        const password = this.passwordInput.value;
        if (!username || !password) {
            alert('Usuario y contraseña no pueden estar vacíos.');
            return;
        }

        const url = (this.authMode === 'login') ? '/api/users/login' : '/api/users';
        try {
            const response = await fetch(url, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
            this.username = username;
            const successMessage = (this.authMode === 'login') ? 'Inicio de sesión exitoso.' : 'Usuario registrado con éxito.';
            alert(successMessage + '\nAhora puedes crear o unirte a una partida.');
            
            this.usernameInput.style.display = 'none';
            this.passwordInput.style.display = 'none';
            this.submitHtmlButton.style.display = 'none';
            this.gameOptionsGroup.setVisible(true);

        } catch (error) {
            console.error(`Error durante ${this.authMode}:`, error);
            alert(error.message);
        }
    }

    async createGame() {
        if (!this.username) { alert("Debes iniciar sesión primero."); return; }
        try {
            const response = await fetch('/api/games/create', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: this.username })
            });
            if (!response.ok) { throw new Error(`Error: ${response.status}`); }
            const game = await response.json();
            this.connectToWebSocketAndStart(game.code);
        } catch (error) {
            console.error('Error al crear la partida:', error);
            alert('No se pudo crear la partida.');
        }
    }

    async joinGame(gameCode) {
        if (!this.username) { alert("Debes iniciar sesión primero."); return; }
        try {
            const response = await fetch('/api/games/join', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: this.username, gameCode: gameCode })
            });
            if (!response.ok) { throw new Error(`Error: ${response.status}`); }
            this.connectToWebSocketAndStart(gameCode);
        } catch (error) {
            console.error('Error al unirse:', error);
            alert("No se pudo unir. Verifica el código.");
        }
    }
    
    connectToWebSocketAndStart(gameCode) {
        this.gameCode = gameCode;
        const socket = new SockJS('/ws');
        this.stompClient = Stomp.over(socket);
        this.stompClient.connect({}, (frame) => {
            console.log('Conectado al WebSocket: ' + frame);
            // Ya no se suscribe al chat aquí. Se hará en la siguiente escena.
            this.cleanup();
            this.scene.start('MapaGameOnline', {
                stompClient: this.stompClient,
                gameCode: this.gameCode,
                username: this.username
            });
        }, (error) => {
            console.error('Error de conexión WebSocket:', error);
            alert('No se pudo conectar al servidor.');
        });
    }

    cleanup() {
        if (this.usernameInput) this.usernameInput.remove();
        if (this.passwordInput) this.passwordInput.remove();
        if (this.submitHtmlButton) this.submitHtmlButton.remove();
    }
}
