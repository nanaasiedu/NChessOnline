class GameManager {
    constructor(board) {
        this.board = board;

        this.currentTurnColour = colour.white;
        this.cellSelectionMode = false;
        this.currentGameState = gameState.NORMAL;
        this.currentSelectedPos = undefined;
    }

    selectCell(pos) {
        if (this.currentGameState === gameState.NORMAL) {
            this._normalStateMove(pos);
        } else if (this.currentGameState === gameState.PENDING_MOVE) {
            this._pendingStateMove(pos);
        }

    }

    _normalStateMove(pos) {
        const cell = this.board.getCell(pos);
        if (cell.colour !== this.currentTurnColour || cell.piece === piece.none) {
            alert("Illegal move!")
            return;
        }

        markPossibleMoves(this.board, pos);

        if (!this.board.isAnyCellMovable()) {
            alert("Piece can't move");
            return;
        }

        drawBoard(this.board);
        highlightCell(pos);
        this.currentSelectedPos = pos;
        this.currentGameState = gameState.PENDING_MOVE;
    }

    _pendingStateMove(pos) {
        if (pos.equals(this.currentSelectedPos)) {
            this._switchToNormalMode();
            return;
        }

        if (!this.board.isCellMovable(pos)) {
            alert("Illegal Move!");
            return;
        }

        const movingCell = this.board.getCell(this.currentSelectedPos);
        this.board.setCell(movingCell,  pos)
        this.board.removePieceAtCell(this.currentSelectedPos);
        this._switchToNormalMode();
        this._switchTurns();

    }

    _switchToNormalMode() {
        this.currentSelectedPos = undefined;
        this.board.clearPossibleMoves();
        this.currentGameState = gameState.NORMAL;
        drawBoard(this.board);
    }

    _switchTurns() {
        if (this.currentTurnColour === colour.white) {
            this.currentTurnColour = colour.black;
        } else {
            this.currentTurnColour = colour.white;
        }
    }
}

const gameState = {
    NORMAL: 0,
    PENDING_MOVE: 1,
}
