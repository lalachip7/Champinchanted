# API REST
# Descripción General
Este documento mencionaremos las funcionalidades implementadas mediante API REST en esta entrega.
# 1. Gestión de Usuarios
El módulo de gestión de usuarios permite realizar operaciones CRUD (Crear, Leer, Actualizar y Eliminar) y gestionar la desconexión de usuarios.
# Ruta Base: /api/users
Funcionalidad	Método HTTP	Endpoint	Descripción
Obtener información de usuario	GET	‘/api/users/{username}’	Devuelve la información del usuario especificado por su nombre de usuario.
Eliminar un usuario	DELETE	‘/api/users/{username}’	Elimina al usuario correspondiente al nombre de usuario proporcionado.
Registrar un nuevo usuario	POST	‘/api/users’	Permite registrar un nuevo usuario mediante un objeto JSON con sus datos.
Actualizar información de usuario	PUT	‘/api/users/{username}’	Actualiza los datos del usuario especificado por su nombre de usuario.
Desconectar un usuario	POST	‘/api/users/{username}/disconnect’  	Gestiona la desconexión de un usuario específico.

------------------------------------------------------------------------------------------------------------------------------
# 2. Gestión de Juegos
El módulo de gestión de juegos permite crear, consultar, actualizar y eliminar partidas. También facilita la asignación de usuarios, personajes y mapas a un juego específico.
# Ruta Base: /api/games
Funcionalidad	Método HTTP	Endpoint	Descripción
Obtener información de un juego	GET	‘/api/games/{code}’	Devuelve los datos del juego especificado mediante su código.
Eliminar un juego	DELETE	‘/api/games/{code}’	Elimina el juego identificado por su código.
Crear un nuevo juego	POST	‘/api/games’	Permite crear una nueva partida recibiendo la información del juego en JSON.
Asignar un usuario a un juego	PUT	‘/api/games/{code}/user’	Asigna un usuario al juego utilizando su nombre y el código de la partida.
Asignar un personaje a un usuario	PUT	‘/api/games/{code}/character’	Asigna un personaje específico al usuario dentro del juego.
Actualizar el mapa de un juego	PUT	‘/api/games/{code}/map’	Asigna un mapa específico a la partida identificada por su código.
------------------------------------------------------------------------------------------------------------------------------
# 3. Estado de la API
El módulo de estado de la API proporciona información sobre los usuarios conectados y el estado general del sistema.
# Ruta Base: /api/status
Funcionalidad	Método HTTP	Endpoint	Descripción
Obtener usuarios conectados	GET	‘/api/status/connected-users’	Devuelve una lista de los usuarios actualmente conectados al sistema.
