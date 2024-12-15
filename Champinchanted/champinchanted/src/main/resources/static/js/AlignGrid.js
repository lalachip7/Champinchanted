class AlignGrid {
    constructor(config) {
        this.scene = config.scene;
        this.rows = config.rows;
        this.cols = config.cols;
        this.grid = this.createGrid();
    }

    createGrid() {
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                grid[row][col] = { x: col * (this.scene.game.config.width / this.cols), y: row * (this.scene.game.config.height / this.rows) };
            }
        }
        return grid;
    }

    getPosByIndex(index) {
        const row = Math.floor(index / this.cols);
        const col = index % this.cols;
        return this.grid[row][col];
    }

    showNumbers() {
        // Aquí podrías añadir código para visualizar la cuadrícula con números si lo deseas
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const pos = this.grid[row][col];
                const text = this.scene.add.text(pos.x, pos.y, `${row},${col}`);
                text.setOrigin(0.5);
            }
        }
    }
}
