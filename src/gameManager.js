import {displayResult, drawBoard, highlightCell, setupDomBoard} from "./domModifier.js";
import {colour} from "./models/piece.js";
import {isDraw, isCheckMate} from "./helpers/ruleHelpers.js";

class GameManager {
    constructor(board) {
        this.board = board;

        this.currentGameState = gameState.NORMAL;
        this.currentSelectedCoor = undefined;
    }

    startGame() {
        setupDomBoard(this.board, this);
        drawBoard(this.board);
    }

    selectCell(coor) {
        if (this.currentGameState === gameState.NORMAL) {
            this._normalStateMove(coor);
        } else if (this.currentGameState === gameState.PENDING_MOVE) {
            this._pendingStateMove(coor);
        }
    }

    _normalStateMove(coor) {
        if (this.board.colourAtCell(coor) !== this.board.getCurrentTurnColour()) {
            alert("Illegal move!")
            return;
        }

        highlightCell(coor);
        this.currentSelectedCoor = coor;
        this.currentGameState = gameState.PENDING_MOVE;
    }

    _pendingStateMove(destCoor) {
        if (destCoor.equals(this.currentSelectedCoor)) {
            this._switchToNormalMode();
            return;
        }

        try {
            this.board.moveCell(this.currentSelectedCoor, destCoor)
        } catch (err) {
            alert("Illegal move!")
            return;
        }

        this._switchToNormalMode();

        if (isCheckMate(this.board)) {
            this._endGameWithCheckMate();
            return;
        }

        if (isDraw(this.board)) {
            this._endGameWithDraw();
        }
    }

    _endGameWithCheckMate() {
        this.currentGameState = gameState.FINISHED;
        let whiteScore = this.board.getCurrentTurnColour() === colour.white ? "0" : "1"
        let blackScore = this.board.getCurrentTurnColour() === colour.white ? "1" : "0"
        displayResult(whiteScore, blackScore);
        alert(`CHECK MATE ${this.board.getCurrentTurnColour() === colour.white ? "black" : "white"} wins`)
    }

    _endGameWithDraw() {
        this.currentGameState = gameState.FINISHED;
        displayResult('1/2', '1/2');
        alert("STAKEMATE! DRAW")
    }

    _switchToNormalMode() {
        this.currentSelectedCoor = undefined;
        this.board.clearPossibleMoves();
        this.currentGameState = gameState.NORMAL;
        drawBoard(this.board);
    }
}

const gameState = {
    NORMAL: 0,
    PENDING_MOVE: 1,
    FINISHED: 2
}

export {GameManager}
