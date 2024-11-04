class AjustesGame extends Phaser.Scene {
    constructor() {
        super({ key: 'AjustesGame' });
    }

    
        preload() {
            this.load.image('windowBackground', 'assets/ajustes/'); //sin imagen yet
            this.load.image('closeIcon', 'assets/ajustes/');        //sin imagen yet
        }
    
        create() {
            // Posición inicial de la ventana en el centro de la pantalla
            const centerX = this.scale.width / 2;
            const centerY = this.scale.height / 2;
    
            // Crear el fondo de la ventana
            this.windowBackground = this.add.image(centerX, centerY, 'windowBackground');
            this.windowBackground.setOrigin(0.5);
            
            //this.windowBackground.setScale(0.5);  escalar ventana?
    
            // Icono de cierre en la esquina superior derecha
            this.closeIcon = this.add.image(centerX + 100, centerY - 80, 'closeIcon');
            this.closeIcon.setOrigin(0.5);
            
            // puede necesitar escalarse
    
            
            this.closeIcon.setInteractive();
            this.closeIcon.on('pointerdown', () => {
                this.closeWindow();  
            });
        }
    
        
        closeWindow() {
            this.windowBackground.setVisible(false);
            this.closeIcon.setVisible(false);
        }
    
        // por si se quiere volver a abrir en cualquien otro punto deljuego
        openWindow() {
            this.windowBackground.setVisible(true);
            this.closeIcon.setVisible(true);
        }
    };
    
    
   
    
    
    


