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

        this.heartbeatInterval = setInterval(() => {
            fetch("/api/users/heartbeat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: username })
            })
            .then(response => {
                if(!response.ok) {
                    console.error("Error al enviar el heartbeat");
                }
            })
            .catch(error => {
                console.error("Error al enviar el heartbeat: ", error);
            });
        }, 30000);
    }   

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
}