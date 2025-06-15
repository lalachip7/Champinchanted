// Importa TODAS las escenas de tu juego y el gestor de sesión
import IntroGame from './intro.js';
import GameScene from './game.js';
import UsernameScene from './username.js';
import EndGame from './endgame.js';
import CreditsScene from './credits.js';
import TutorialScene from './tutorial.js';
import PersonajesGame from './personajesgame.js';
import PersonajesGameOnline from './personajesgameonline.js';
import MapaGameOnline from './mapagameonline.js';
import MapaGame from './mapagame.js';
import sessionManager from './sessionManager.js';



const config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-canvas',
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 1900 }
        }
    },
    scene: [ // Lista de todas las escenas importadas.
        IntroGame,
        GameScene,
        UsernameScene,
        EndGame,
        CreditsScene,
        TutorialScene,
        PersonajesGame,
        PersonajesGameOnline,
        MapaGameOnline,
        MapaGame
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Arranque del Juego 

// Crea una nueva instancia del juego con la configuración definida
const game = new Phaser.Game(config);

// Eventos Globales 

// El evento para detener el heartbeat al cerrar la pestaña
window.addEventListener("beforeunload", function(event) {
    // Usamos el sessionManager importado para detener las señales de "estoy vivo"
    if (sessionManager && sessionManager.stopHeartbeat) {
        sessionManager.stopHeartbeat();
    }
});