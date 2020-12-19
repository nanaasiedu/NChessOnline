
import {drawBoard, highlightCell, setupDomBoard} from "./domModifier.js";
// TODO: PUSH ALL SCAN HELPERS METHODS DOWN TO BOARD
import {canPinnedPieceMove, dangerScanBoard, isCellBlockableInDirection, markPossibleMoves} from "./scanHelpers.js";
import {colour, piece, swapColour} from "./models/piece.js";
import {createPos} from "./models/position.js";
import {createVec, Vector} from "./models/vector.js";
import {displayResult} from "./domModifier.js";

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
        // TODO: have the Board control danger scans
        dangerScanBoard(this.board);
        drawBoard(this.board);
    }

    selectCell(pos) {
        if (this.currentGameState === gameState.NORMAL) {
            this._normalStateMove(pos);
        } else if (this.currentGameState === gameState.PENDING_MOVE) {
            this._pendingStateMove(pos);

            if (!this._canColourMove() || this.board.hasInsufficientMaterial()){
                this.currentGameState = gameState.STALE_MATE;
                displayResult('1/2', '1/2');
                alert("STAKEMATE! DRAW")
            }
        }
    }

    // TODO: Move to RuleHelpers
    _canColourMove() {
        for (let r = 0; r < this.board.getHeight(); r++) {
            for (let c = 0; c < this.board.getWidth(); c++) {
                const curPos = createPos(r, c);
                const curCell = this.board.getCell(curPos);
                if (curCell.piece === piece.none || curCell.colour !== this.currentTurnColour) continue;

                // TODO: Move down into board
                markPossibleMoves(this.board, curPos)
                if (this.board.isAnyCellMovable()) {
                    if (this.board.isCellPinned(curPos) && !canPinnedPieceMove(this.board, curPos)) {
                        this.board.clearPossibleMoves();
                        continue;

                    }
                    this.board.clearPossibleMoves();
                    return true;
                }
            }
        }

        return false;
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

        // Todo: move to mark possible moves
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

    // TODO: Moving
    _markPossibleCastlingMoves() {
        if (this.board.canKingLeftCastle(this.currentTurnColour)) {
            this.board.setMovePossibleOnCell(this.board.getKingPos(this.currentTurnColour).add(createVec(-2, 0)));
        }

        if (this.board.canKingRightCastle(this.currentTurnColour)) {
            this.board.setMovePossibleOnCell(this.board.getKingPos(this.currentTurnColour).add(createVec(2, 0)));
        }
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

        // Todo: move enpassant and moving logic to Board
        const movingCell = this.board.getCell(this.currentSelectedPos);
        const dyingCell = this.board.getCell(pos);
        this.board.setCell(movingCell, pos)
        this.board.removePieceAtCell(this.currentSelectedPos);

        // Enpassant
        if (movingCell.piece === piece.pawn) {
            const pawnDirection = Vector.makeDirectionVec(this.currentSelectedPos, pos);
            const isPawnAttacking = pawnDirection.x !== 0;
            if (dyingCell.piece === piece.none && isPawnAttacking) {
                this.board.removePieceAtCell(pos.addR(-pawnDirection.y));
            }
        }

        // TODO: move to Board
        this._movePossibleRookCastleMove(pos, movingCell)

        // TODO: have the Board control danger scans
        dangerScanBoard(this.board);

        if (this._isCurrentKingChecked()) {
            alert("Illegal move king would be checked!");

            // TODO: Create reverse move function on Board
            this.board.setCell(dyingCell, pos);
            this.board.setCell(movingCell, this.currentSelectedPos);

            return;
        }

        // TODO: Move to Board
        if(this._isPiecePromotable(movingCell.piece, pos)) {
            this.board.setCell(
                { piece: piece.queen, colour: this.currentTurnColour }, pos
            );
        }

        this._switchToNormalMode();
        this._switchTurns();
        this.checkingPiecePos = undefined;

        // TODO: Move to Board
        this.board.clearEnpassant(this.currentTurnColour);

        if (this._isCurrentKingChecked()) {
            this.checkingPiecePos = pos;

            if (this._isCheckMate()) {
                this.currentGameState = gameState.CHECK_MATE;
                let whiteScore = this.currentTurnColour === colour.white ? "0" : "1"
                let blackScore = this.currentTurnColour === colour.white ? "1" : "0"
                displayResult(whiteScore, blackScore);
                alert(`CHECK MATE ${this.currentTurnColour === colour.white ? "black" : "white"} wins`)
            }
        }
    }

    // TODO: Move to Board
    _isPiecePromotable(cellPiece, pos) {
        return (this.currentTurnColour === colour.white &&
            cellPiece === piece.pawn &&
            pos.r === 0) ||
            (this.currentTurnColour === colour.black &&
            cellPiece === piece.pawn &&
            pos.r === this.board.getHeight()-1)
    }

    // TODO: Move to Board
    _movePossibleRookCastleMove(pos, movingCell) {
        if(movingCell.piece === piece.king && this.currentSelectedPos.c-pos.c === -2) {
            if (this.currentTurnColour === colour.white) {
                const rookPos = createPos(this.board.getHeight()-1, this.board.getWidth()-1);
                const rookCell = this.board.getCell(rookPos);
                this.board.setCell(rookCell, pos.add(createVec(-1,0)))
                this.board.removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, this.board.getWidth()-1);
                const rookCell = this.board.getCell(rookPos);
                this.board.setCell(rookCell, pos.add(createVec(-1,0)))
                this.board.removePieceAtCell(rookPos);
            }
        }

        if(movingCell.piece === piece.king && this.currentSelectedPos.c-pos.c === 2) {
            if (this.currentTurnColour === colour.white) {
                const rookPos = createPos(this.board.getHeight()-1, 0);
                const rookCell = this.board.getCell(rookPos);
                this.board.setCell(rookCell, pos.add(createVec(1,0)))
                this.board.removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, 0);
                const rookCell = this.board.getCell(rookPos);
                this.board.setCell(rookCell, pos.add(createVec(1,0)))
                this.board.removePieceAtCell(rookPos);
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

        return !this.board.canCellBeTaken(this.checkingPiecePos, swapColour(this.currentTurnColour));


    }
}

const gameState = {
    NORMAL: 0,
    PENDING_MOVE: 1,
    CHECK_MATE: 2,
    STALE_MATE: 3
}

export { GameManager }
