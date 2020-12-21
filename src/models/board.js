import {isPathBetweenUnchecked} from "../scanHelpers.js";
import {colour, piece, swapColour} from "./piece.js";
import {createPos} from "./position.js";
import {Vector, createVec} from "./vector.js";
import {dangerScanBoard, markPossibleMoves} from "../scanHelpers.js";

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

// TODO: move to cell file
class Cell {
    constructor(cellColour, cellPiece) {
        this.colour = cellColour;
        this.piece = cellPiece;
        this.numberOfWhiteChecks = 0;
        this.numberOfBlackChecks = 0;
        this.checkedByWhiteKing = false;
        this.checkedByBlackKing = false;
        this.movePossible = false;
        this.pinnedToking = false;
        this.checkedByWhitePawn = false;
        this.checkedByBlackPawn = false;
    }
}

class Board {
    constructor() {
        this.rows = Array(BOARD_HEIGHT);
        this._isAnyCellMovable = false;
        this.whiteKingPos = createPos(7, 4);
        this.blackKingPos = createPos(0, 4);

        this.hasWhiteKingMoved = false;
        this.hasLeftWhiteRookMoved = false;
        this.hasRightWhiteRookMoved = false;
        this.hasBlackKingMoved = false;
        this.hasLeftBlackRookMoved = false;
        this.hasRightBlackRookMoved = false;

        this.blackEnpassantCol = undefined;
        this.whiteEnpassantCol = undefined;

        this.previousEnpassantCell = undefined;
        this.previousEnpassantPos = undefined;
        this.previousMovingPos = undefined;
        this.previousDestPos = undefined;
        this.previousDestCell = undefined;

        const fillRow = function (row, r, colour, piece) {
            for (let c = 0; c < row.length; c++) {
                row[c] = new Cell(colour, piece)
            }
        }

        for (let r = 0; r < this.rows.length; r++) {
            this.rows[r] = Array(BOARD_WIDTH);

            if (r > 1 && r < BOARD_HEIGHT - 2) {
                fillRow(this.rows[r], r, undefined, piece.none);
            }
        }

        fillRow(this.rows[1], 1, colour.black, piece.pawn);
        fillRow(this.rows[BOARD_HEIGHT - 2], BOARD_HEIGHT - 2, colour.white, piece.pawn);

        this.rows[0][0] = new Cell(colour.black, piece.rook);
        this.rows[0][7] = new Cell(colour.black, piece.rook);
        this.rows[0][1] = new Cell(colour.black, piece.knight);
        this.rows[0][6] = new Cell(colour.black, piece.knight);
        this.rows[0][2] = new Cell(colour.black, piece.bishop);
        this.rows[0][5] = new Cell(colour.black, piece.bishop);
        this.rows[0][3] = new Cell(colour.black, piece.queen);
        this.rows[0][4] = new Cell(colour.black, piece.king);

        this.rows[BOARD_HEIGHT - 1][0] = new Cell(colour.white, piece.rook);
        this.rows[BOARD_HEIGHT - 1][7] = new Cell(colour.white, piece.rook);
        this.rows[BOARD_HEIGHT - 1][1] = new Cell(colour.white, piece.knight);
        this.rows[BOARD_HEIGHT - 1][6] = new Cell(colour.white, piece.knight);
        this.rows[BOARD_HEIGHT - 1][2] = new Cell(colour.white, piece.bishop);
        this.rows[BOARD_HEIGHT - 1][5] = new Cell(colour.white, piece.bishop);
        this.rows[BOARD_HEIGHT - 1][3] = new Cell(colour.white, piece.queen);
        this.rows[BOARD_HEIGHT - 1][4] = new Cell(colour.white, piece.king);

        dangerScanBoard(this);
    }

    getCell(pos) {
        if (!this.legalPosition(pos)) return undefined;

        const cell = this.rows[pos.r][pos.c];
        return {
            piece: cell.piece,
            colour: cell.colour
        };
    }

    pieceAtCell(pos) {
        return this.getCell(pos).piece;
    }

    setCell(cell, pos) {
        this.rows[pos.r][pos.c].piece = cell.piece;
        this.rows[pos.r][pos.c].colour = cell.colour;

        if (cell.colour === colour.white && cell.piece === piece.king) this.whiteKingPos = pos;
        if (cell.colour === colour.black && cell.piece === piece.king) this.blackKingPos = pos;

        if (cell.colour === colour.white && cell.piece === piece.pawn &&
            this.pieceAtCell(createPos(this.getHeight()-2, pos.c)) === piece.pawn) this.whiteEnpassantCol = pos.c;

        if (cell.colour === colour.black && cell.piece === piece.pawn &&
            this.pieceAtCell(createPos(1, pos.c)) === piece.pawn) this.blackEnpassantCol = pos.c;
    }

    moveCell(movingPos, destPos) {
        const movingCell = this.getCell(movingPos);
        const dyingCell = this.getCell(destPos);
        this.setCell(movingCell, destPos)
        this.removePieceAtCell(movingPos);

        // Enpassant
        if (movingCell.piece === piece.pawn) {
            const pawnDirection = Vector.makeDirectionVec(movingPos, destPos);
            const isPawnAttacking = pawnDirection.x !== 0;
            if (dyingCell.piece === piece.none && isPawnAttacking) {
                const dyingPawnPos = destPos.addR(-pawnDirection.y)
                this.previousEnpassantCell = this.getCell(dyingPawnPos)
                this.previousEnpassantPos = dyingPawnPos;

                this.removePieceAtCell(dyingPawnPos);
            } else {
                this.previousEnpassantCell = undefined
                this.previousEnpassantPos = undefined;
            }
        }

        this._movePossibleRookCastleMove(destPos, movingPos)

        if(this._isCellPromotable(movingCell, destPos)) {
            this.setCell(
                { piece: piece.queen, colour: movingCell.colour }, destPos
            );
        }

        dangerScanBoard(this);

        this.previousMovingPos = movingPos;
        this.previousDestPos = destPos;
        this.previousDestCell = dyingCell;


    }

    reversePreviousMove() {
        if (this.previousDestPos !== undefined) {
            this.setCell(this.getCell(this.previousDestPos), this.previousMovingPos)
            this.setCell(this.previousDestCell, this.previousDestPos)

            if (this.previousEnpassantPos !== undefined) {
                this.setCell(this.previousEnpassantCell, this.previousEnpassantPos)
            }

            this._clearPreviousMove();
            dangerScanBoard(this);
        }
    }

    _isCellPromotable(cell, pos) {
        return (cell.colour === colour.white &&
            cell.piece === piece.pawn &&
            pos.r === 0) ||
            (cell.colour === colour.black &&
                cell.piece === piece.pawn &&
                pos.r === this.getHeight()-1)
    }

    _clearPreviousMove() {
        this.previousMovingPos = undefined;
        this.previousDestPos = undefined;
        this.previousDestCell = undefined;
        this.previousEnpassantCell = undefined
        this.previousEnpassantPos = undefined;
    }

    _movePossibleRookCastleMove(destPos, movingPos) {
        const movedCell = this.getCell(destPos);
        const curColour = movedCell.colour;

        if(movedCell.piece === piece.king && movingPos.c-destPos.c === -2) {
            if (curColour === colour.white) {
                const rookPos = createPos(this.getHeight()-1, this.getWidth()-1);
                const rookCell = this.getCell(rookPos);
                this.setCell(rookCell, destPos.add(createVec(-1,0)))
                this.removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, this.getWidth()-1);
                const rookCell = this.getCell(rookPos);
                this.setCell(rookCell, destPos.add(createVec(-1,0)))
                this.removePieceAtCell(rookPos);
            }
        }

        if(movedCell.piece === piece.king && movingPos.c-destPos.c === 2) {
            if (curColour === colour.white) {
                const rookPos = createPos(this.getHeight()-1, 0);
                const rookCell = this.getCell(rookPos);
                this.setCell(rookCell, destPos.add(createVec(1,0)))
                this.removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, 0);
                const rookCell = this.getCell(rookPos);
                this.setCell(rookCell, destPos.add(createVec(1,0)))
                this.removePieceAtCell(rookPos);
            }
        }
    }

    clearEnpassant(pieceColour) {
        if (pieceColour === colour.white) {
            this.whiteEnpassantCol = undefined;
        } else {
            this.blackEnpassantCol = undefined;
        }
    }

    canEnpassant(pieceColour, pos) {
        if (pieceColour === colour.white) {
            return pos.r === 2 && this.blackEnpassantCol === (pos.c);
        } else {
            return pos.r === this.getHeight() - 3 && this.whiteEnpassantCol === (pos.c);
        }
    }

    setPieceAsCheckedByKing(attackingColour, posToCheck) {
        if (!this.legalPosition(posToCheck)) return undefined;

        const checkedByKingProp = attackingColour === colour.white ? "checkedByWhiteKing" : "checkedByBlackKing";
        this.rows[posToCheck.r][posToCheck.c][checkedByKingProp] = true;
    }

    setPieceAsCheckedByPawn(attackingColour, posToCheck) {
        if (!this.legalPosition(posToCheck)) return undefined;

        const checkedByPawnProp = attackingColour === colour.white ? "checkedByWhitePawn" : "checkedByBlackPawn";
        this.rows[posToCheck.r][posToCheck.c][checkedByPawnProp] = true;
    }

    clearCellsCheckProperties() {
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                this.rows[r][c].pinnedToking = false;
                this.rows[r][c].checkedByWhiteKing = false;
                this.rows[r][c].checkedByBlackKing = false;
                this.rows[r][c].numberOfWhiteChecks = 0;
                this.rows[r][c].numberOfBlackChecks = 0;
                this.rows[r][c].checkedByWhitePawn = false;
                this.rows[r][c].checkedByBlackPawn = false;
            }
        }
    }

    setCellAsPinned(pos) {
        this.rows[pos.r][pos.c].pinnedToking = true;
    }

    clearPossibleMoves() {
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                this.rows[r][c].movePossible = false;
            }
        }

        this._isAnyCellMovable = false;
    }

    isCellPinned(pos) {
        return this.rows[pos.r][pos.c].pinnedToking;
    }

    getKingPos(pieceColour) {
        if (pieceColour === colour.white) {
            return this.whiteKingPos;
        } else {
            return this.blackKingPos;
        }
    }

    canKingMove(pieceColour, attackingPos) {
        const kingPos = this.getKingPos(pieceColour);
        const r = kingPos.r;
        const c = kingPos.c

        return this._canKingMoveToPos(createPos(r + 1, c - 1), pieceColour, attackingPos) ||
            this._canKingMoveToPos(createPos(r + 1, c), pieceColour, attackingPos) ||
            this._canKingMoveToPos(createPos(r + 1, c + 1), pieceColour, attackingPos) ||

            this._canKingMoveToPos(createPos(r - 1, c - 1), pieceColour, attackingPos) ||
            this._canKingMoveToPos(createPos(r - 1, c), pieceColour, attackingPos) ||
            this._canKingMoveToPos(createPos(r - 1, c + 1), pieceColour, attackingPos) ||

            this._canKingMoveToPos(createPos(r, c - 1), pieceColour, attackingPos) ||
            this._canKingMoveToPos(createPos(r, c + 1), pieceColour, attackingPos)
    }

    _canKingMoveToPos(pos, pieceColour, attackingPos) {
        if (!this.legalPosition(pos)) return false;

        const attackingPiece = this.pieceAtCell(attackingPos);
        const kingPos = this.getKingPos(pieceColour);
        const attackDirection = Vector.makeDirectionVec(attackingPos, kingPos);
        const isAttackerAPinner = attackingPiece === piece.bishop || attackingPiece === piece.rook || attackingPos === piece.queen

        if (isAttackerAPinner && kingPos.add(attackDirection).equals(pos)) return false;
        return !this.isCellChecked(pos, pieceColour) && this.getCell(pos).colour !== pieceColour;
    }

    isKingChecked(pieceColour) {
        if (pieceColour === colour.white) {
            return this.isCellChecked(this.whiteKingPos, colour.white);
        } else {
            return this.isCellChecked(this.blackKingPos, colour.black);
        }
    }

    isKingDoubleChecked(pieceColour) {
        if (pieceColour === colour.white) {
            return this.isCellDoubleChecked(this.whiteKingPos, colour.white);
        } else {
            return this.isCellDoubleChecked(this.blackKingPos, colour.black);
        }
    }

    removePieceAtCell(pos) {
        if (pos.equals(createPos(0, 4))) this.hasBlackKingMoved = true;
        if (pos.equals(createPos(this.getHeight()-1, 4))) this.hasWhiteKingMoved = true;

        if (pos.equals(createPos(0, 0))) this.hasLeftBlackRookMoved = true;
        if (pos.equals(createPos(this.getHeight()-1, 0))) this.hasLeftWhiteRookMoved = true;

        if (pos.equals(createPos(0, this.getWidth()-1))) this.hasRightBlackRookMoved = true;
        if (pos.equals(createPos(this.getHeight()-1, this.getWidth()-1))) this.hasRightWhiteRookMoved = true;

        this.rows[pos.r][pos.c].piece = piece.none;
        this.rows[pos.r][pos.c].colour = undefined;
    }

    colourAtCell(pos) {
        return this.getCell(pos).colour;
    }

    isCellEmpty(pos) {
        return this.getCell(pos).piece === piece.none;
    }

    checkCell(attackingColour, posToCheck) {
        if (!this.legalPosition(posToCheck)) {
            return;
        }
        const checkingPiecesProp = attackingColour === colour.white ? "numberOfWhiteChecks" : "numberOfBlackChecks";

        this.rows[posToCheck.r][posToCheck.c][checkingPiecesProp] += 1;
    }

    setMovePossibleOnCell(pos) {
        this._isAnyCellMovable = true;
        this.rows[pos.r][pos.c].movePossible = true;
    }

    isAnyCellMovable() {
        return this._isAnyCellMovable;
    }

    isCellMovable(pos) {
        return this.rows[pos.r][pos.c].movePossible;
    }

    canCellBeTakenByColour(pos, attackingColour) {
        const attackingPiecesProp = attackingColour === colour.white ? "numberOfWhiteChecks" : "numberOfBlackChecks";
        const checkedByAttackingKingProp = attackingColour === colour.white ? "checkedByWhiteKing" : "checkedByBlackKing";
        const checkedByAttackingPawnProp = attackingColour === colour.white ? "checkedByWhitePawn" : "checkedByBlackPawn";

        const canCellBeTakenBysSeveralPieces = this.rows[pos.r][pos.c][attackingPiecesProp] > 2;

        const canSecondAttackerTakeCell = this.rows[pos.r][pos.c][attackingPiecesProp] === 2
            && !(this.rows[pos.r][pos.c][checkedByAttackingPawnProp]
            && this.pieceAtCell(pos) === piece.none)

        const isCellCheckedOnlyByAttackingKing = this.rows[pos.r][pos.c][checkedByAttackingKingProp];
        const isCellProtectedFromAttackingKing = this.isCellChecked(pos, attackingColour);
        const canAttackingKingTakeCell = isCellCheckedOnlyByAttackingKing && !isCellProtectedFromAttackingKing;

        const canOtherPieceTakeCell = !isCellCheckedOnlyByAttackingKing && this.isCellChecked(pos, swapColour(attackingColour))

        return canCellBeTakenBysSeveralPieces || canSecondAttackerTakeCell || canAttackingKingTakeCell || canOtherPieceTakeCell;
    }

    isCellChecked(pos, friendlyColour) {
        if (!this.legalPosition(pos)) return false;
        const enemyPiecesProp = friendlyColour === colour.white ? "numberOfBlackChecks" : "numberOfWhiteChecks";
        return this.rows[pos.r][pos.c][enemyPiecesProp] > 0;
    }

    isCellDoubleChecked(pos, friendlyColour) {
        const enemyPiecesProp = friendlyColour === colour.white ? "numberOfBlackChecks" : "numberOfWhiteChecks";
        return this.rows[pos.r][pos.c][enemyPiecesProp] > 1;
    }

    canKingLeftCastle(friendlyColour) {
        if (friendlyColour === colour.white) {
            if (this.hasWhiteKingMoved || this.hasLeftWhiteRookMoved || this.isKingChecked(friendlyColour)) return false;
            const cornerCell = this.getCell(createPos(this.getHeight()-1, 0));
            if (cornerCell.piece !== piece.rook || cornerCell.colour !== colour.white) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(this.getHeight()-1, 0),
                friendlyColour)
        } else {
            if (this.hasBlackKingMoved || this.hasLeftBlackRookMoved || this.isKingChecked(friendlyColour)) return false;
            const cornerCell = this.getCell(createPos(0, 0));
            if (cornerCell.piece !== piece.rook || cornerCell.colour !== colour.black) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(0, 0),
                friendlyColour)
        }
    }

    canKingRightCastle(friendlyColour) {
        if (friendlyColour === colour.white) {
            if (this.hasWhiteKingMoved || this.hasRightWhiteRookMoved || this.isKingChecked(friendlyColour)) return false;
            const cornerCell = this.getCell(createPos(this.getHeight()-1, this.getWidth()-1));
            if (cornerCell.piece !== piece.rook || cornerCell.colour !== colour.white) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(this.getHeight()-1, this.getWidth()-1),
                friendlyColour)
        } else {
            if (this.hasBlackKingMoved || this.hasRightBlackRookMoved || this.isKingChecked(friendlyColour)) return false;
            const cornerCell = this.getCell(createPos(0, this.getWidth()-1));
            if (cornerCell.piece !== piece.rook || cornerCell.colour !== colour.black) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(0, this.getWidth()-1),
                friendlyColour)
        }
    }

    markPossibleMovesForPos(pos) {
        markPossibleMoves(this, pos);
    }

    getWidth() {
        return BOARD_WIDTH;
    }

    getHeight() {
        return BOARD_HEIGHT;
    }

    legalPosition(pos) {
        return pos.r >= 0 && pos.r < this.getHeight() && pos.c >= 0 && pos.c < this.getWidth()
    }

    hasInsufficientMaterial() {
        return false; // TODO
    }
}

Board.prototype.toString = function () {
    return `${this.rows}`;
};

export { Board }