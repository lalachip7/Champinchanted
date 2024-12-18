class PersonajesGameOnline extends Phaser.Scene {
    constructor() {
        super({ key: 'PersonajesGameOnline' });
    }

    preload() {
        // Cargar recursos
        this.load.image("background1_image", "assets/Fondos/fondoPersonajes.png");
        this.load.image("ready_button1", "assets/Interfaz/botonListo.png");
    

        // Personajes
        this.load.image('character1', 'assets/Personajes/perretxiko.png');
        this.load.image('character2', 'assets/Personajes/champichip.png');
        this.load.image('character3', 'assets/Personajes/champistar.png');
        this.load.image('character4', 'assets/Personajes/mariñon.png');
        this.load.image('character5', 'assets/Personajes/biblioseta.png');
        this.load.image("highlight", "assets/Botones/highlight.png");
        this.load.image("highlight", "assets/Interfaz/highlight.png");

        // Fuentes
        const font = new FontFace('FantasyFont', 'url(assets/Fuentes/CATChilds.ttf)');

        font.load().then((loadedFont) => {                      // Carga la fuente y la añade al documento
            document.fonts.add(loadedFont);
            console.log('Fuente FantasyFont cargada');
        }).catch((err) => {
            console.error('Error al cargar la fuente FantasyFont:', err);
        });
    }

    create() {
        this.configText = {
            fontFamily: 'FantasyFont, Calibri',
            fontSize: '30px',
            color: '#FEEFD8'
        };
        
        // Fondo
        this.add.image(0, 0, "background1_image")
            .setOrigin(0)
            .setDisplaySize(this.scale.width, this.scale.height);

        // Variables de selección
        this.selectedCharacters = { player1: null, player2: null };

        // Configuración de personajes
        const characters = [
            { key: 'character1', name: 'Perretxiko' },
            { key: 'character2', name: 'ChampiChip' },
            { key: 'character3', name: 'ChampiStar' },
            { key: 'character4', name: 'Mariñón' },
            { key: 'character5', name: 'Biblioseta' },
        ];

        this.selectPlayerText = this.add.text(960, 80, 'Elegid un personaje', this.configText)
            .setOrigin(0.5)
            .setStyle({ fontSize: '65px' });

        // Mostrar selección del jugador 1
        this.player1SelectedImage = this.add.image(575, 275, null)
            .setScale(0.8)
            .setVisible(false);

        this.player1SelectedText = this.add.text(575, 375, '', this.configText).setOrigin(0.5);
        

        // Mostrar selección del jugador 2
        this.player2SelectedImage = this.add.image(1350, 275, null)
            .setScale(0.8)
            .setVisible(false);
        
        this.player2SelectedText = this.add.text(1350, 375, '', this.configText).setOrigin(0.5);

        // Jugador 1: cuadrícula y selección
        this.createCharacterGrid(425, 500, characters, 'player1', this.player1SelectedImage, this.player1SelectedText);

        // Jugador 2: cuadrícula y selección
        this.createCharacterGrid(1200, 500, characters, 'player2', this.player2SelectedImage, this.player2SelectedText);

        // Botones de Listo
        this.createReadyButtons();
    }

    createCharacterGrid(startX, startY, characters, player, selectedImage, selectedText) {
        const spacingX = 150;
        const spacingY = 150;

        characters.forEach((char, index) => {
            const posX = startX + (index % 3) * spacingX;
            const posY = startY + Math.floor(index / 3) * spacingY;

            const charImage = this.add.image(posX, posY, char.key)
                .setInteractive()
                .setScale(0.6)
                .on('pointerdown', () => {
                    this.selectCharacter(player, char, charImage, selectedImage, selectedText);
                    this.updatePlayersCharacters(player, char);
                });

            // Deshabilitar visualmente si ya está seleccionado
            charImage.alpha = 1;
            charImage.setData('selected', false);

            charImage.updateAvailability = () => {
                const isSelected = this.selectedCharacters.player1 === char.key || this.selectedCharacters.player2 === char.key;
                charImage.alpha = isSelected ? 0.5 : 1;
                charImage.disableInteractive();
                if (!isSelected) charImage.setInteractive();
            };
        });
    }

    selectCharacter(player, character, charImage, selectedImage, selectedText) {
        // Verificar si el personaje ya fue seleccionado por el otro jugador
        const otherPlayer = player === 'player1' ? 'player2' : 'player1';
        if (this.selectedCharacters[otherPlayer] === character.key) return;

        // Actualizar selección del jugador
        this.selectedCharacters[player] = character.key;
        
        // Mostrar personaje seleccionado en la parte superior
        selectedImage.setTexture(character.key).setVisible(true);
        selectedText.setText(character.name);

        // Actualizar disponibilidad visualmente
        this.children.list.forEach(child => {
            if (child.updateAvailability) child.updateAvailability();
        });
    }

    createReadyButtons() {
        let button1Ready = false;
        let button2Ready = false;
    
        const centerX = this.scale.width / 2;
        const centerY = 875;
        const buttonSpacing = 385;
    
        // Botón Listo del Jugador 1
        const readyButton1 = this.add.image(centerX - buttonSpacing, centerY, "ready_button1")
            .setScale(0.20)
            .setInteractive()
            .on('pointerdown', () => {
                if (this.selectedCharacters.player1) { // Verificar si el personaje está seleccionado
                    button1Ready = !button1Ready; // Alternar estado
                    readyButton1.setTint(button1Ready ? 0x555555 : 0xffffff); // Oscurecer o aclarar
                    this.checkReadyState(); // Verificar estado
                } else {
                    console.log("Jugador 1 debe elegir un personaje primero.");
                }
            });
    

    
        // Verificar si ambos jugadores están listos
        this.checkReadyState = () => {
            if (button1Ready && button2Ready && this.selectedCharacters.player1 && this.selectedCharacters.player2) {
                // Ambos botones están oscurecidos y los personajes están seleccionados
                this.scene.stop("PersonajesGame");
                this.scene.start("GameScene");
            }
        };
    }

    updatePlayersCharacters(player, character) {
        if (player === "player1") {
            if (character.key === "character2") {
                this.registry.set('personajeJ1', 1);
            } else if (character.key === "character3") {
                this.registry.set('personajeJ1', 2);
            } else if (character.key === "character1") {
                this.registry.set('personajeJ1', 3);
            } else if (character.key === "character4") {
                this.registry.set('personajeJ1', 4);
            } else if (character.key === "character5") {
                this.registry.set('personajeJ1', 5);
            }
        } else {
            if (character.key === "character2") {
                this.registry.set('personajeJ2', 1);
            } else if (character.key === "character3") {
                this.registry.set('personajeJ2', 2);
            } else if (character.key === "character1") {
                this.registry.set('personajeJ2', 3);
            } else if (character.key === "character4") {
                this.registry.set('personajeJ2', 4);
            } else if (character.key === "character5") {
                this.registry.set('personajeJ2', 5);
            }
        }   
    }
}