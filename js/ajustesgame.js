class AjustesGame extends Phaser.Scene {
    constructor() {
        super({ key: 'AjustesGame' });
    }
    
    
        preload() {     // CARGA DE ARCHIVOS --------------------------------------------------------
            this.load.image('windowBackground', 'assets/ajustes/'); //sin imagen yet
            this.load.image('closeIcon', 'assets/ajustes/');        //sin imagen yet
        }
    
        create() {
            // Posición inicial de la ventana en el centro de la pantalla
            const centerX = this.scale.width / 2;
            const centerY = this.scale.height / 2;
    
            // Añade el fondo de la ventana
            this.windowBackground = this.add.image(centerX, centerY, 'windowBackground');
            this.windowBackground.setOrigin(0.5);
            
            // Escala la ventana (En principio no hace falta porque ya está el escalado automático de phaser activado)
            //const scaleFactor = Math.min(this.scale.width / 1980, this.scale.height / 1080);
            //this.windowBackground.setScale(scaleFactor);    
    
            // Icono de cierre en la esquina superior derecha
            this.closeIcon = this.add.image(centerX + 100, centerY - 80, 'closeIcon');
            this.closeIcon.setOrigin(0.5);
            
            // Escalado del icono si es muy grande
            //this.closeIcon.setScale(0.5);     // Escalado a la mitad por si se necesita
            
            this.closeIcon.setInteractive();
            this.closeIcon.on('pointerdown', () => {    // Al pulsar el botón
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
    
    
   
    
    
    


