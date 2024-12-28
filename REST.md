# **API REST**

## **Descripción General**  
Este documento describe las funcionalidades implementadas mediante API REST.

---

## **1. Gestión de Usuarios**  
El módulo de gestión de usuarios permite realizar operaciones **CRUD** (Crear, Leer, Actualizar y Eliminar) y gestionar la desconexión de usuarios.

**Ruta Base:** `/api/users`  

| **Funcionalidad**                | **Método HTTP** | **Endpoint**                          | **Descripción**                                                                 |
|----------------------------------|-----------------|--------------------------------------|-------------------------------------------------------------------------------|
| Obtener información de usuario   | GET             | `/api/users/{username}`              | Devuelve la información de un usuario específico.                              |
| Eliminar un usuario              | DELETE          | `/api/users/{username}`              | Elimina un usuario existente.                                                  |
| Registrar un nuevo usuario       | POST            | `/api/users`                         | Registra un nuevo usuario en el sistema.                                       |
| Actualizar información de usuario| PUT             | `/api/users/{username}`              | Actualiza los datos de un usuario específico.                                  |
| Desconectar un usuario           | POST            | `/api/users/{username}/disconnect`   | Gestiona la desconexión de un usuario.                                         |

---

## **2. Gestión de Juegos**  
El módulo de gestión de juegos permite crear, consultar, actualizar y eliminar partidas, además de asignar usuarios, personajes y mapas.

**Ruta Base:** `/api/games`  

| **Funcionalidad**                       | **Método HTTP** | **Endpoint**                        | **Descripción**                                                                 |
|-----------------------------------------|-----------------|------------------------------------|-------------------------------------------------------------------------------|
| Obtener información de un juego         | GET             | `/api/games/{code}`                | Devuelve los datos de un juego específico.                                      |
| Eliminar un juego                       | DELETE          | `/api/games/{code}`                | Elimina una partida existente.                                                 |
| Crear un nuevo juego                    | POST            | `/api/games`                       | Crea una nueva partida.                                                        |
| Asignar un usuario a un juego           | PUT             | `/api/games/{code}/user`           | Asigna un usuario a una partida.                                               |
| Asignar un personaje a un usuario       | PUT             | `/api/games/{code}/character`      | Asigna un personaje a un jugador en la partida.                                |
| Actualizar el mapa de un juego          | PUT             | `/api/games/{code}/map`            | Actualiza el mapa asociado a una partida.                                      |

---

## **3. Estado de la API**  
El módulo de estado proporciona información sobre los usuarios conectados y el estado del sistema.

**Ruta Base:** `/api/status`  

| **Funcionalidad**            | **Método HTTP** | **Endpoint**                          | **Descripción**                                                              |
|------------------------------|-----------------|--------------------------------------|------------------------------------------------------------------------------|
| Obtener usuarios conectados  | GET             | `/api/status/connected-users`        | Devuelve una lista de los usuarios actualmente conectados.                    |

