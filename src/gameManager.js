import {displayResult, drawBoard, highlightCell, setupDomBoard} from "./domModifier.js";
import {colour} from "./models/piece.js";
import {isDraw, isCheckMate} from "./helpers/ruleHelpers.js";

class GameManager {
    constructor(board) {
        this.board = board;

        // TODO: push down current turn colour
        this.currentTurnColour = colour.white;
        this.currentGameState = gameState.NORMAL;
        this.currentSelectedPos = undefined;
    }

    startGame() {
        setupDomBoard(this.board, this);
        drawBoard(this.board);
    }

    selectCell(pos) {
        if (this.currentGameState === gameState.NORMAL) {
            this._normalStateMove(pos);
        } else if (this.currentGameState === gameState.PENDING_MOVE) {
            this._pendingStateMove(pos);
            drawBoard(this.board);
        }
    }

    _normalStateMove(pos) {
        if (this.board.colourAtCell(pos) !== this.currentTurnColour) {
            alert("Illegal move!")
            return;
        }

        highlightCell(pos);
        this.currentSelectedPos = pos;
        this.currentGameState = gameState.PENDING_MOVE;
    }

    _pendingStateMove(destPos) {
        if (destPos.equals(this.currentSelectedPos)) {
            this._switchToNormalMode();
            return;
        }

        try {
            this.board.moveCell(this.currentSelectedPos, destPos)
        } catch (err) {
            alert("Illegal move!")
            return;
        }

        this._switchToNormalMode();
        this._switchTurns();

        if (isCheckMate(this.board, this.currentTurnColour, destPos)) {
            this._endGameWithCheckMate();
            return;
        }


        if (isDraw(this.currentTurnColour, this.board)) {
            this._endGameWithDraw();
        }
    }

    _endGameWithCheckMate() {
        this.currentGameState = gameState.CHECK_MATE;
        let whiteScore = this.currentTurnColour === colour.white ? "0" : "1"
        let blackScore = this.currentTurnColour === colour.white ? "1" : "0"
        displayResult(whiteScore, blackScore);
        alert(`CHECK MATE ${this.currentTurnColour === colour.white ? "black" : "white"} wins`)
    }

    _endGameWithDraw() {
        this.currentGameState = gameState.STALE_MATE;
        displayResult('1/2', '1/2');
        alert("STAKEMATE! DRAW")
    }

    _switchToNormalMode() {
        this.currentSelectedPos = undefined;
        this.board.clearPossibleMoves();
        this.currentGameState = gameState.NORMAL;
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
    CHECK_MATE: 2,
    STALE_MATE: 3
}

export {GameManager}
