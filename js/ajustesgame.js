class AjustesGame extends Phaser.Scene {
    constructor() {
        super({ key: 'AjustesScene' });
    }
    
    
        preload() {     // CARGA DE ARCHIVOS --------------------------------------------------------
            this.load.image('windowBackground', 'assets/Fondos/ajustesFondo.png'); //sin imagen yet
            this.load.image('closeIcon', 'assets/Interfaz/close.png');        //sin imagen yet
        }
    
        create() {
            // Añade el fondo de la ventana
            const background = this.add.image(0, 0, "windowBackground")
            .setOrigin(0)                                                                                  
            background.setScale(this.scale.width / background.width, this.scale.height / background.height);
            background.setDepth(-1); // Usa capas para que fondo este nivel más bajo
            
            const button = this.add.image(centerX + 100, centerY - 80, 'closeIcon')   // Añade el botón de configuración
            .setOrigin(0.75, 0.25) // Ajustar el punto de anclaje (derecha, arriba)
            .setScale(0.5) // Reducir tamaño a la mitad    
            .setInteractive()
            .setDepth(1) // Botones en una capa más alta
            .on('pointerdown', () => {
                this.closeWindow();                     // Cierra la ventana
            });
        }
    
        
        closeWindow() {
            this.windowBackground.setVisible(false);    
            this.closeIcon.setVisible(false);
        }
    
        // Por si se quiere volver a abrir en cualquien otro punto deljuego
        openWindow() {
            this.windowBackground.setVisible(true);
            this.closeIcon.setVisible(true);
        }
    };
    
    
   
    
    
    


