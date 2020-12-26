import {isPathBetweenUnchecked} from "../helpers/scanHelpers.js";
import {colour, piece, swapColour} from "./piece.js";
import {createPos} from "./position.js";
import {Vector, createVec} from "./vector.js";
import {dangerScanBoard, markPossibleMoves} from "../helpers/scanHelpers.js";
import {getFENForBoard, locationNotationToPosition} from "../notation/fenHelpers.js";

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

class Cell {
    constructor(cellColour, cellPiece) {
        this.colour = cellColour;
        this.piece = cellPiece;

        this.numberOfWhiteChecks = 0;
        this.numberOfBlackChecks = 0;
        this.checkedByWhiteKing = false;
        this.checkedByBlackKing = false;
        this.checkedByWhitePawn = false;
        this.checkedByBlackPawn = false;

        this.pinnedToking = false;
        this.movePossible = false;
    }
}

const DEFAULT_STARTING_POSITIONS_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

class Board {
    constructor(fenRep = DEFAULT_STARTING_POSITIONS_FEN) {
        this.rows = Array(BOARD_HEIGHT);
        this._isAnyCellMovable = false;
        this.whiteKingPos = undefined;
        this.blackKingPos = undefined;

        this.hasWhiteKingMoved = false;
        this.hasLeftWhiteRookMoved = false;
        this.hasRightWhiteRookMoved = false;
        this.hasBlackKingMoved = false;
        this.hasLeftBlackRookMoved = false;
        this.hasRightBlackRookMoved = false;

        this.blackEnpassantCol = undefined;
        this.whiteEnpassantCol = undefined;

        this._loadFEN(fenRep)

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

    colourAtCell(pos) {
        return this.getCell(pos).colour || undefined;
    }

    setCell(cell, pos) {
        this.rows[pos.r][pos.c].piece = cell.piece;
        this.rows[pos.r][pos.c].colour = cell.colour;

        if (cell.colour === colour.white && cell.piece === piece.king) this.whiteKingPos = pos;
        if (cell.colour === colour.black && cell.piece === piece.king) this.blackKingPos = pos;

        if (cell.colour === colour.white && cell.piece === piece.pawn &&
            this.pieceAtCell(createPos(this.getHeight() - 2, pos.c)) === piece.pawn) this.whiteEnpassantCol = pos.c;

        if (cell.colour === colour.black && cell.piece === piece.pawn &&
            this.pieceAtCell(createPos(1, pos.c)) === piece.pawn) this.blackEnpassantCol = pos.c;
    }

    _isMoveValid(movingCell, movingPos, destPos) {
        this.markPossibleMovesForPos(movingPos);
        const canMoveToCell = this.isCellMovable(destPos);
        this.clearPossibleMoves();
        return canMoveToCell;
    }

    moveCell(movingPos, destPos) {
        const movingCell = this.getCell(movingPos);

        if (!this._isMoveValid(movingCell, movingPos, destPos)) throw new Error("Illegal Move");

        const dyingCell = this.getCell(destPos);
        this.setCell(movingCell, destPos)
        this.removePieceAtCell(movingPos);

        this._checkForEnpassant(movingPos, destPos);

        this._movePossibleRookCastleMove(destPos, movingPos)

        if (this._isCellPromotable(movingCell, destPos)) {
            this._promoteCell(destPos);
        }

        dangerScanBoard(this);

        const curColour = movingCell.colour;
        if (this.isKingChecked(curColour)) {
            this._reversePreviousMove(dyingCell, movingPos, destPos);
            throw new Error("Illegal Move")
        }
    }

    movePiece(startChessPos, endChessPos) {
        const startPos = locationNotationToPosition(startChessPos);
        const endPos = locationNotationToPosition(endChessPos);
        this.moveCell(startPos, endPos);
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
        if (pos.equals(createPos(this.getHeight() - 1, 4))) this.hasWhiteKingMoved = true;

        if (pos.equals(createPos(0, 0))) this.hasLeftBlackRookMoved = true;
        if (pos.equals(createPos(this.getHeight() - 1, 0))) this.hasLeftWhiteRookMoved = true;

        if (pos.equals(createPos(0, this.getWidth() - 1))) this.hasRightBlackRookMoved = true;
        if (pos.equals(createPos(this.getHeight() - 1, this.getWidth() - 1))) this.hasRightWhiteRookMoved = true;

        this.rows[pos.r][pos.c].piece = piece.none;
        this.rows[pos.r][pos.c].colour = undefined;
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
            const cornerCell = this.getCell(createPos(this.getHeight() - 1, 0));
            if (cornerCell.piece !== piece.rook || cornerCell.colour !== colour.white) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(this.getHeight() - 1, 0),
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
            const cornerCell = this.getCell(createPos(this.getHeight() - 1, this.getWidth() - 1));
            if (cornerCell.piece !== piece.rook || cornerCell.colour !== colour.white) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(this.getHeight() - 1, this.getWidth() - 1),
                friendlyColour)
        } else {
            if (this.hasBlackKingMoved || this.hasRightBlackRookMoved || this.isKingChecked(friendlyColour)) return false;
            const cornerCell = this.getCell(createPos(0, this.getWidth() - 1));
            if (cornerCell.piece !== piece.rook || cornerCell.colour !== colour.black) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(0, this.getWidth() - 1),
                friendlyColour)
        }
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

    getFEN() {
        return getFENForBoard(this);
    }

    _loadFEN(fen) {
        const pieceRepMap = {}
        pieceRepMap["p"] = piece.pawn;
        pieceRepMap["b"] = piece.bishop;
        pieceRepMap["n"] = piece.knight;
        pieceRepMap["r"] = piece.rook;
        pieceRepMap["q"] = piece.queen;
        pieceRepMap["k"] = piece.king;

        const isNumeric = (c) => c >= '0' && c <= '9';


        let fenOffset = 0;
        for (let r = 0; r < this.rows.length; r++) {
            this.rows[r] = Array(BOARD_WIDTH);
            let emptySpaceSeen = 0;

            for (let c = 0; c < this.rows[r].length; c++) {
                let curFENPiece = fen.charAt(fenOffset);

                if (curFENPiece === '/') {
                    fenOffset++;
                    curFENPiece = fen.charAt(fenOffset);
                }

                if (isNumeric(curFENPiece)) {
                    this.rows[r][c] = new Cell(undefined, piece.none);
                    emptySpaceSeen++;

                    if (emptySpaceSeen === curFENPiece * 1) {
                        fenOffset++;
                        emptySpaceSeen = 0;
                    }

                    continue;
                }

                const isWhite = curFENPiece === curFENPiece.toUpperCase();
                const cellPiece = pieceRepMap[curFENPiece.toLowerCase()];
                const cellColour = isWhite ? colour.white : colour.black;

                if (cellPiece === piece.king && cellColour === colour.white) this.whiteKingPos = createPos(r, c);
                if (cellPiece === piece.king && cellColour === colour.black) this.blackKingPos = createPos(r, c);

                this.rows[r][c] = new Cell(cellColour, cellPiece);
                fenOffset++;
            }
        }
    }

    _reversePreviousMove(dyingCell, movingPos, destPos) {
        this.setCell(this.getCell(destPos), movingPos)
        this.setCell(dyingCell, destPos)

        dangerScanBoard(this);
    }

    _clearEnpassant(pieceColour) {
        if (pieceColour === colour.white) {
            this.whiteEnpassantCol = undefined;
        } else {
            this.blackEnpassantCol = undefined;
        }
    }

    isCellMovable(pos) {
        return this.rows[pos.r][pos.c].movePossible;
    }

    markPossibleMovesForPos(pos) {
        markPossibleMoves(this, pos);

        const cell = this.getCell(pos);
        if (cell.piece === piece.king) {
            this._markPossibleCastlingMoves(cell.colour)
        }
    }

    _promoteCell(pos) {
        const cellColour = this.colourAtCell(pos);
        this.setCell(
            {piece: piece.queen, colour: cellColour}, pos
        );
    }

    _checkForEnpassant(movingPos, destPos) {
        const movingCell = this.getCell(movingPos);
        const dyingCell = this.getCell(destPos);

        if (movingCell.piece === piece.pawn) {
            const pawnDirection = Vector.makeDirectionVec(movingPos, destPos);
            const isPawnAttacking = pawnDirection.x !== 0;
            if (dyingCell.piece === piece.none && isPawnAttacking) {
                const dyingPawnPos = destPos.addR(-pawnDirection.y);
                this.removePieceAtCell(dyingPawnPos);
            } else {
            }
        }
    }

    _isCellPromotable(cell, pos) {
        return (cell.colour === colour.white &&
            cell.piece === piece.pawn &&
            pos.r === 0) ||
            (cell.colour === colour.black &&
                cell.piece === piece.pawn &&
                pos.r === this.getHeight() - 1)
    }

    _movePossibleRookCastleMove(destPos, movingPos) {
        const movedCell = this.getCell(destPos);
        const curColour = movedCell.colour;

        if (movedCell.piece === piece.king && movingPos.c - destPos.c === -2) {
            if (curColour === colour.white) {
                const rookPos = createPos(this.getHeight() - 1, this.getWidth() - 1);
                const rookCell = this.getCell(rookPos);
                this.setCell(rookCell, destPos.add(createVec(-1, 0)))
                this.removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, this.getWidth() - 1);
                const rookCell = this.getCell(rookPos);
                this.setCell(rookCell, destPos.add(createVec(-1, 0)))
                this.removePieceAtCell(rookPos);
            }
        }

        if (movedCell.piece === piece.king && movingPos.c - destPos.c === 2) {
            if (curColour === colour.white) {
                const rookPos = createPos(this.getHeight() - 1, 0);
                const rookCell = this.getCell(rookPos);
                this.setCell(rookCell, destPos.add(createVec(1, 0)))
                this.removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, 0);
                const rookCell = this.getCell(rookPos);
                this.setCell(rookCell, destPos.add(createVec(1, 0)))
                this.removePieceAtCell(rookPos);
            }
        }
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

    _markPossibleCastlingMoves(kingColour) {
        if (this.canKingLeftCastle(kingColour)) {
            this.setMovePossibleOnCell(this.getKingPos(kingColour).add(createVec(-2, 0)));
        }

        if (this.canKingRightCastle(kingColour)) {
            this.setMovePossibleOnCell(this.getKingPos(kingColour).add(createVec(2, 0)));
        }
    }
}

export {Board}