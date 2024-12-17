package com.lunar_engine.champinchanted;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

// Gestiona las conexiones de los usuarios
@Service
public class ApiStatusService {
    
    private final ConcurrentHashMap<String, Long> lastSeen; // La última vez que el usuario estuvo activo

    // CONSTRUCTOR  
    public ApiStatusService() {
        this.lastSeen = new ConcurrentHashMap<>();  // Inicializa la variable lastSeen
    }

    // MÉTODO QUE ACTUALIZA EL TIEMPO DE ÚLTIMA CONEXIÓN DEL USUARIO
    public void hasSeen(String username) {      // Recibe el nombre del usuario que acaba de interactuar
        this.lastSeen.put(username, System.currentTimeMillis());    // Obtiene el tiempo actual con currentTimeMillis y lo actualiza
    }

    // MÉTODO QUE MARCA A UN USUARIO COMO ACTIVO (CONEXIÓN)
    public void setActive(String username) {
        this.lastSeen.put(username, System.currentTimeMillis());
    }

    // MÉTODO QUE MARCA A UN USUARIO COMO INACTIVO (DESCONEXIÓN)
    public void setInactive(String username) {
        this.lastSeen.remove(username);
    }

    // MÉTODO QUE DETERMINA LOS USUARIOS QUE ESTÁN CONECTADOS, SEGÚN UN UMBRAL DE TIEMPO
    public List<String> isConnected(long threshold) {   // Threshold es el tiempo en el que se considera que un usuario está conectado

        List<String> connected = new ArrayList<>();             
		long currentTimeMillis = System.currentTimeMillis();    // Obtiene el tiempo actual

        for (var entry: this.lastSeen.entrySet()) {             // Itera sobre cada entrada del mapa lastSeen
            if (entry.getValue() > (currentTimeMillis - threshold)) {   // Y comprueba el tiempo desde la última vez que estuvo activo con el tiempo actual
                connected.add(entry.getKey());                  // Si esa diferenciaa es menor que el umbral, lo agrega a la lista de conectados
            }
        }
        return connected;   // Y por último devuelve la lista de usuarios conectados
    }

    // MÉTODO QUE DEVUELVE EL NÚMERO DE USUARIOS CONECTADOS SEGÚN EL UMBRAL
    public int numberOfUsersConnected(long threshold) { 
        return this.isConnected(threshold).size();          // Devuelve el tamaño de la lista
    }

    // MÉTODO QUE LIMPIA LOS USUARIOS DESCONECTADOS
    public void cleanupInactiveUsers(long threshold) {
        long currentTimeMillis = System.currentTimeMillis();
        this.lastSeen.entrySet().removeIf(entry -> entry.getValue() < (currentTimeMillis - threshold));
        // Elimina los usuarios inactivos
    }
}
