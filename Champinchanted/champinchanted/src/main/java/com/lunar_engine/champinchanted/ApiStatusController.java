package com.lunar_engine.champinchanted;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController                     // Clase controlador
@RequestMapping("/api/status")      // Ruta para los métodos dentro del controlador
public class ApiStatusController {
    
    @Autowired
    private final ApiStatusService apiStatusService;    // Instancia que gestiona la lógica 
                                                        // de conexión de usuarios

    @Autowired
    private final long seenThreshold;   // Umbral de tiempo para determinar si un usuario 
                                        // está conectado

    // CONSTRUCTOR ..........................................................................
    public ApiStatusController(ApiStatusService apiStatusService, long seenThreshold) {
        this.apiStatusService = apiStatusService;
        this.seenThreshold = seenThreshold;
    }

    /****************************************************************************************
     * Recupera el número de usuarios actualmente conectados que se determina según un umbral
     * de tiempo
     * @return Un ResponseEntity que contiene el número de usuarios conectados en el cuerpo
     * de la respuesta
     */
    @GetMapping("/connected-users")
    public ResponseEntity<ConnectedUsersResponse> getCoAnnectedUsers() {     
        int numberOfUsersConnected = this.apiStatusService.
            numberOfUsersConnected(this.seenThreshold);         // Llama al apiStatusService 
            //con el umbral para obtener el núero de usuarios conectados

        return ResponseEntity.ok(new ConnectedUsersResponse(numberOfUsersConnected));   
        // Devuelve una respuesta HTTP con el código 200 (OK) y el número de usuarios 
        // conectados
    }
    
    /****************************************************************************************
     * Record que encapsula el número de usuarios conectados.
     * Este objeto es usado como respuesta en la consulta de usuarios conectados.
     */
    public record ConnectedUsersResponse (long getConnectedUsers) {}
}
