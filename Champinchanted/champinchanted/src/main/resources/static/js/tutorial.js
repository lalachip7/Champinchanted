class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });
    }
    
    
        preload() {     // CARGA DE ARCHIVOS --------------------------------------------------------
            this.load.image('windowBackground', 'assets/Fondos/ajustesFondo.png'); 
            this.load.image('closeIcon', 'assets/Interfaz/close.png');        

            // Fuentes
            const font = new FontFace('FantasyFont', 'url(assets/Fuentes/CATChilds.ttf)');

            font.load().then((loadedFont) => {             // Carga la fuente y la añade al documento
                document.fonts.add(loadedFont);
                console.log('Fuente FantasyFont cargada');
            }).catch((err) => {
                console.error('Error al cargar la fuente FantasyFont:', err);
            });
        }
    
        create() {
            this.configText = {
                fontFamily: 'FantasyFont, Calibri',
                fontSize: '90px',
                color: '#FEEFD8'
            };

            // Añade el fondo de la ventana
            const background = this.add.image(0, 0, "windowBackground")
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
        
    
        // Por si se quiere volver a abrir en cualquien otro punto deljuego
        openWindow() {
        }
    };
    
    
   
    
    
    

