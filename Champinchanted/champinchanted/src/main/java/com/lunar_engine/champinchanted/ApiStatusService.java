package com.lunar_engine.champinchanted;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

// Gestiona las conexiones de los usuarios
@Service
public class ApiStatusService {
    
    private final ConcurrentHashMap<String, Long> lastSeen; // La última vez que el usuario 
                                                            // estuvo activo

    // CONSTRUCTOR ..........................................................................
    public ApiStatusService() {
        this.lastSeen = new ConcurrentHashMap<>();  // Inicializa la variable lastSeen
    }

    /****************************************************************************************
     * Actualiza el tiempo de última conexión de un usuario cuando interactúa. Este método 
     * registra el tiempo exacto de la última actividad del usuario
     * @param username El nombre de usuario que acaba de interactuar
     */
    public void hasSeen(String username) {      // Recibe el nombre del usuario que acaba de
                                                // interactuar
        this.lastSeen.put(username, System.currentTimeMillis());  // Obtiene el tiempo actual
                                                                  // con currentTimeMillis 
                                                                  // y lo actualiza
    }

    /****************************************************************************************
     * Marca a un usuario como activo, actualizando su tiempo de última conexión. Este método
     * es utilizado cuando un usuario se conecta o se vuelve activo
     * @param username El nombre del usuario a marcar como activo
     */
    public void setActive(String username) {
        this.lastSeen.put(username, System.currentTimeMillis());
    }

    /****************************************************************************************
     * Marca a un usuario como inactivo, eliminando su registro de tiempo de última conexión.
     * Este método es utilizado cuando un usuario se desconecta o se vuelve inactivo
     * @param username El nombre del usuario a marcar como inactivo
     */
    public void setInactive(String username) {
        this.lastSeen.remove(username);
    }

    /****************************************************************************************
     * Determina los usuarios que están conectados según un umbral de tiempo. Los usuarios se
     * consideran conectados si su última actividad fue dentro del umbral
     * @param threshold El umbral de tiempo (en milisegundos) que se considera como conectado
     * @return Una lista con los nombres de los usuarios que están conectados
    */
    public List<String> isConnected(long threshold) {   // Threshold es el tiempo en el que 
                                                        // se considera que un usuario está 
                                                        // conectado
        List<String> connected = new ArrayList<>();             
		long currentTimeMillis = System.currentTimeMillis();    // Obtiene el tiempo actual

        for (var entry: this.lastSeen.entrySet()) {             // Itera sobre cada entrada 
                                                                // del mapa lastSeen
            // Y comprueba el tiempo desde la última vez que estuvo activo
            if (entry.getValue() > (currentTimeMillis - threshold)) {   
                connected.add(entry.getKey());    // Si esa diferencia es menor que el umbral,
                                                  // lo agrega a la lista de conectados
            }
        }
        return connected;   // Y por último devuelve la lista de usuarios conectados
    }

    /****************************************************************************************
     * Devuelve el número de usuarios conectados según el umbral de tiempo
     * @param threshold El umbral de tiempo (en milisegundos) que se considera como conectado
     * @return El número de usuarios conectados
     */
    public int numberOfUsersConnected(long threshold) { 
        return this.isConnected(threshold).size();       // Devuelve el tamaño de la lista
    }

    /****************************************************************************************
     * Limpia la lista de usuarios inactivos según un umbral de tiempo. Elimina a los usuarios
     * cuyo tiempo de última actividad ha superado el umbral y se consideran desconectados
     * @param threshold El umbral de tiempo (en milisegundos) que se considera como conectado
     */
    public void cleanupInactiveUsers(long threshold) {
        long currentTimeMillis = System.currentTimeMillis();
        this.lastSeen.entrySet().removeIf(entry -> entry.getValue() < (currentTimeMillis 
        - threshold));      // Elimina los usuarios inactivos
    }
}
