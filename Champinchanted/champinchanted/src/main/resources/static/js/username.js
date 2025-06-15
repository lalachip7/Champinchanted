import sessionManager from './sessionManager.js';

export default class UsernameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UsernameScene' });
    }

    init() {
        this.username = null;
        this.authMode = null; // 'login' o 'register'
    }

    preload() {
        this.load.image("background_base", "assets/Fondos/fondo.png");
        this.load.image("background_decor", "assets/Fondos/fondoSinChampi.png");
        this.load.image("login_button", "assets/Interfaz/inicioSesion.png");
        this.load.image("register_button", "assets/Interfaz/registrarse.png");

        this.load.image("create_game_button", "assets/Interfaz/botonCrearPartida.png");
        this.load.image("join_game_button", "assets/Interfaz/botonUnirsePartida.png");
        this.load.image("return_button", "assets/Interfaz/botonVolver.png");
        this.load.image("submit_button", "assets/Interfaz/botonConfirmar.png");
        this.load.image("change_password_button", "assets/Interfaz/cambiarClave.png");
        this.load.image("delete_account_button", "assets/Interfaz/eliminarCuenta.png");

        const font = new FontFace('FantasyFont', 'url(assets/Fuentes/CATChilds.ttf)');
        font.load().then(f => document.fonts.add(f));
    }

    create() {
        this.add.image(0, 0, "background_base").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

        this.add.image(0, 0, "background_decor").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);

        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        // Elementos HTML para Login/Registro 
        this.usernameInput = this.createInputElement('text', 'username-input', 'Introduce tu nombre de usuario');
        this.passwordInput = this.createInputElement('password', 'password-input', 'Introduce tu contraseña');
        this.oldPasswordInput = this.createInputElement('password', 'old-password-input', 'Contraseña Antigua');
        this.newPasswordInput = this.createInputElement('password', 'new-password-input', 'Contraseña Nueva');
        this.submitHtmlButton = this.createSubmitButton();
        document.body.appendChild(this.usernameInput);
        document.body.appendChild(this.passwordInput);
        document.body.appendChild(this.submitHtmlButton);
        document.body.appendChild(this.oldPasswordInput);
        document.body.appendChild(this.newPasswordInput);

        // Botones de Selección Inicial (Login/Register)
        const loginButtonBg = this.add.image(centerX, centerY - 50, "login_button").setScale(0.15).setInteractive();


        const registerButtonBg = this.add.image(centerX, centerY + 30, "register_button").setScale(0.15).setInteractive();

        this.selectionGroup = this.add.group([loginButtonBg, registerButtonBg]);

        // Botones de Opciones de Juego (Crear y Unirse)
        const createGameButton = this.add.image(centerX - 200, centerY + 200, "create_game_button").setScale(0.2).setInteractive();
        const joinGameButton = this.add.image(centerX + 200, centerY + 200, "join_game_button").setScale(0.2).setInteractive();

        const changePasswordButton = this.add.image(centerX, centerY + 300, "change_password_button") // Reutilizamos la imagen del botón de confirmar
            .setScale(0.15).setInteractive();

        const deleteAccountButton = this.add.image(centerX, centerY + 380, "delete_account_button") // Reutilizamos el botón de volver
            .setScale(0.15)
            .setInteractive()
            .setTint(0xff6666);

        this.gameOptionsGroup = this.add.group([createGameButton, joinGameButton, changePasswordButton, deleteAccountButton]);
        this.gameOptionsGroup.setVisible(false);

        // Lógica de los botones
        loginButtonBg.on('pointerdown', () => this.showAuthUI('login'));
        registerButtonBg.on('pointerdown', () => this.showAuthUI('register'));
        this.submitHtmlButton.addEventListener('click', () => this.handleAuthSubmit());

        createGameButton.on('pointerdown', () => this.createGame());
        joinGameButton.on('pointerdown', () => {
            const code = prompt("Introduce el código de la partida:");
            if (code) this.joinGame(code.trim().toUpperCase());
        });
        changePasswordButton.on('pointerdown', () => this.showPasswordChangeUI());
        deleteAccountButton.on('pointerdown', () => this.handleDeleteAccount());
        this.add.image(160, 80, "return_button").setScale(0.15).setInteractive()
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
            borderRadius: "50px", boxShadow: "0 0 10px rgba(0,0,0,0.5)", textAlign: 'center', transform: 'translateX(-50%)'
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
            color: "white", borderRadius: "50px", cursor: 'pointer', transform: 'translateX(-50%)'
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
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.display = 'block';
    }

    showPasswordChangeUI() {
        // Ocultamos los botones de crear/unirse a partida
        this.gameOptionsGroup.setVisible(false);

        // Mostramos los campos para cambiar la contraseña y el botón de confirmar
        const canvas = this.sys.game.canvas;
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.positionAndShow(this.oldPasswordInput, centerX, centerY - 80);
        this.positionAndShow(this.newPasswordInput, centerX, centerY - 20);

        // Hacemos que el botón de confirmar ahora llame a la nueva función de actualizar
        this.submitHtmlButton.innerText = 'Actualizar';
        this.positionAndShow(this.submitHtmlButton, centerX, centerY + 40);

        // Cambiamos el evento del botón para que apunte a la nueva lógica
        this.submitHtmlButton.onclick = () => this.handlePasswordUpdate();
    }

    async handleDeleteAccount() {
        // Pedir confirmación es CRUCIAL para acciones destructivas
        const isConfirmed = confirm("¿Estás SEGURO de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.");

        if (!isConfirmed) {
            return; // El usuario canceló la acción
        }

        // Pedimos la contraseña para la versión segura del backend
        const password = prompt("Para confirmar, por favor, introduce tu contraseña:");

        if (password === null) { // El usuario pulsó "Cancelar" en el prompt
            return;
        }

        try {
            const url = `/api/users/${this.username}`;

            const response = await fetch(url, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ "password": password }) // Enviamos la contraseña para verificación
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            alert(result.message); 

            // Limpiamos todo y volvemos a la pantalla de inicio
            this.cleanup();
            this.scene.start("IntroGame");

        } catch (error) {
            console.error("Error al eliminar la cuenta:", error);
            alert(error.message);
        }
    }

    // Añade esta otra función para manejar el envío de datos
    async handlePasswordUpdate() {
        const oldPassword = this.oldPasswordInput.value;
        const newPassword = this.newPasswordInput.value;

        if (!this.username) {
            alert("Error: No se ha detectado ningún usuario.");
            return;
        }
        if (!oldPassword || !newPassword) {
            alert("Debes rellenar ambos campos.");
            return;
        }

        try {
            // La URL debe incluir el nombre de usuario
            const url = `/api/users/${this.username}`;

            const response = await fetch(url, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // Usamos el modelo seguro con contraseña antigua y nueva
                    "oldPassword": oldPassword,
                    "newPassword": newPassword
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al actualizar la contraseña.');
            }

            alert(result.message); // Muestra "Contraseña actualizada con éxito."

            // Ocultamos los campos y volvemos a mostrar las opciones de juego
            this.oldPasswordInput.style.display = 'none';
            this.newPasswordInput.style.display = 'none';
            this.submitHtmlButton.style.display = 'none';
            this.gameOptionsGroup.setVisible(true);

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
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

            sessionManager.startHeartbeat(this.username);

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
            this.startGameLobby(game.code, true);
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
            this.startGameLobby(gameCode, false);
        } catch (error) {
            console.error('Error al unirse:', error);
            alert("No se pudo unir. Verifica el código.");
        }
    }

    startGameLobby(gameCode, isHost) {
        this.cleanup();
        this.scene.start('MapaGameOnline', {
            gameCode: gameCode,
            username: this.username,
            isHost: isHost
        });
    }

    cleanup() {
        if (this.usernameInput) this.usernameInput.remove();
        if (this.passwordInput) this.passwordInput.remove();
        if (this.submitHtmlButton) this.submitHtmlButton.remove();
    }
}