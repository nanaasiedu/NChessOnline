class GameManager {
    constructor(board) {
        this.board = board;

        this.currentTurnColour = colour.white;
        this.cellSelectionMode = false;
    }

    selectCell(pos) {
        const cell = this.board.getCell(pos);
        if (cell.colour !== this.currentTurnColour && cell.piece !== piece.none) {
            console.log("Cant make move!");
            return;
        }

        const canPieceMove = markPossibleMoves(this.board, pos)
        highlightCell(pos);
        this._switchTurns();
    }

    _switchTurns() {
        if (this.currentTurnColour === colour.white) {
            this.currentTurnColour = colour.black;
        } else {
            this.currentTurnColour = colour.white;
        }
    }
}
