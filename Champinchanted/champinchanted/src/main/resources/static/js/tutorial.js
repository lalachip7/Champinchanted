class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }
    
        preload() {     // CARGA DE ARCHIVOS --------------------------------------------------------
            
            this.load.image('closeIcon', 'assets/Interfaz/close.PNG');   
            this.load.image('windowTuto', 'assets/Interfaz/Tutorial.png'); 
                 
        }
    
        create() {
            // Añade el fondo de la ventana
            const background = this.add.image(0, 0, "windowTuto")
            .setOrigin(0)                                                                                  
            background.setScale(this.scale.width / background.width, this.scale.height / background.height);
            
            const button = this.add.image(1820, 90, 'closeIcon')   // Añade el botón de configuración
            .setScale(0.04) // Reducir tamaño a la mitad    
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop("TutorialScene");
                this.scene.resume("IntroScene");
            });
        }
        
        
        openWindow() {
        }
    };
    
    
   
    
    
    


