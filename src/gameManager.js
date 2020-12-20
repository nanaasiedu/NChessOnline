import {displayResult, drawBoard, highlightCell, setupDomBoard} from "./domModifier.js";
// TODO: PUSH ALL SCAN HELPERS METHODS DOWN TO BOARD
import {isCellBlockableInDirection, markPossibleMoves} from "./scanHelpers.js";
import {colour, piece, swapColour} from "./models/piece.js";
import {createVec} from "./models/vector.js";
import {canColourMove} from "./ruleHelpers.js";

class GameManager {
    constructor(board) {
        this.board = board;

        this.currentTurnColour = colour.white;
        this.currentGameState = gameState.NORMAL;
        this.currentSelectedPos = undefined;

        this.checkingPiecePos = undefined;
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

            if (!canColourMove(this.currentTurnColour, this.board) || this.board.hasInsufficientMaterial()){
                this.currentGameState = gameState.STALE_MATE;
                displayResult('1/2', '1/2');
                alert("STAKEMATE! DRAW")
            }
        }
    }

    _isCurrentKingChecked() {
        return this.board.isKingChecked(this.currentTurnColour);
    }

    _normalStateMove(pos) {
        const cell = this.board.getCell(pos);
        if (cell.colour !== this.currentTurnColour || cell.piece === piece.none) {
            alert("Illegal move!")
            return;
        }

        markPossibleMoves(this.board, pos);

        if (cell.piece === piece.king) {
            this._markPossibleCastlingMoves()
        }

        if (!this.board.isAnyCellMovable()) {
            alert("Piece can't move");
            return;
        }

        drawBoard(this.board);
        highlightCell(pos);
        this.currentSelectedPos = pos;
        this.currentGameState = gameState.PENDING_MOVE;
    }

    _markPossibleCastlingMoves() {
        if (this.board.canKingLeftCastle(this.currentTurnColour)) {
            this.board.setMovePossibleOnCell(this.board.getKingPos(this.currentTurnColour).add(createVec(-2, 0)));
        }

        if (this.board.canKingRightCastle(this.currentTurnColour)) {
            this.board.setMovePossibleOnCell(this.board.getKingPos(this.currentTurnColour).add(createVec(2, 0)));
        }
    }

    _pendingStateMove(destPos) {
        if (destPos.equals(this.currentSelectedPos)) {
            this._switchToNormalMode();
            return;
        }

        if (!this.board.isCellMovable(destPos)) {
            alert("Illegal Move!");
            return;
        }

        this.board.moveCell(this.currentSelectedPos, destPos)

        if (this._isCurrentKingChecked()) {
            alert("Illegal move king would be checked!");
            this.board.reversePreviousMove();

            return;
        }

        this._switchToNormalMode();
        this._switchTurns();
        this.checkingPiecePos = undefined;

        // TODO: Move to Board
        this.board.clearEnpassant(this.currentTurnColour);

        if (this._isCurrentKingChecked()) {
            this.checkingPiecePos = destPos;

            if (this._isCheckMate()) {
                this.currentGameState = gameState.CHECK_MATE;
                let whiteScore = this.currentTurnColour === colour.white ? "0" : "1"
                let blackScore = this.currentTurnColour === colour.white ? "1" : "0"
                displayResult(whiteScore, blackScore);
                alert(`CHECK MATE ${this.currentTurnColour === colour.white ? "black" : "white"} wins`)
            }
        }
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

    _isCheckMate() {
        if (this.board.canKingMove(this.currentTurnColour, this.checkingPiecePos)) return false;
        if (this.board.isKingDoubleChecked(this.currentTurnColour)) return true;
        if (isCellBlockableInDirection(this.board,
            this.checkingPiecePos,
            this.board.getKingPos(this.currentTurnColour),
            this.currentTurnColour)) return false;
        return !this.board.canCellBeTakenByColour(this.checkingPiecePos, this.currentTurnColour);
    }
}

const gameState = {
    NORMAL: 0,
    PENDING_MOVE: 1,
    CHECK_MATE: 2,
    STALE_MATE: 3
}

export { GameManager }
