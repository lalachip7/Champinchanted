class SessionManager {
    constructor() {
        this.heartbeatInterval = null;  // Variable para almacenar el intervalo
        this.username = null;           // Variable para almacenar el nombre de usuario
    }

    startHeartbeat(username) {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);  // Limpiar cualquier intervalo anterior
        }

        this.username = username;
        console.log(`Iniciando heartbeat para el usuario: ${username}`); // Mensaje para depuración

        // Enviar un heartbeat inmediatamente al iniciar
        this.sendHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, 8000); // Reducimos el intervalo a 8 segundos para que sea menor que el umbral de 10
    }

    sendHeartbeat() {
        if (!this.username) return;

        fetch("/api/users/heartbeat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: this.username })
        })
        .then(response => {
            if(!response.ok) {
                console.error("Error al enviar el heartbeat");
            }
        })
        .catch(error => {
            console.error("Error de red al enviar el heartbeat: ", error);
        });
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
            console.log(`Heartbeat detenido para el usuario: ${this.username}`);
        }
    }
}


const sessionManager = new SessionManager();
export default sessionManager;