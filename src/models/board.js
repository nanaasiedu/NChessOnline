import {colour, piece, swapColour} from "./piece.js";
import {createPos} from "./position.js";
import {Vector, createVec} from "./vector.js";
import {dangerScanBoard, markPossibleMoves} from "../helpers/scanHelpers.js";
import {
    loadFENIsWhiteTurn,
    loadFENBoard,
    getFENForBoard,
    locationNotationToPosition,
    loadFENCastlingKingSide,
    loadFENCastlingQueenSide
} from "../notation/fenHelpers.js";

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

const DEFAULT_STARTING_POSITIONS_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w";

class Board {
    constructor(fenRep = DEFAULT_STARTING_POSITIONS_FEN) {
        this.rows = Array(BOARD_HEIGHT);
        this._isAnyCellMovable = false;
        this.whiteKingPos = undefined;
        this.blackKingPos = undefined;

        this.blackEnpassantCol = undefined;
        this.whiteEnpassantCol = undefined;

        this.rows = loadFENBoard(fenRep);
        this.isWhiteTurn = loadFENIsWhiteTurn(fenRep);
        this.canWhiteCastleQueenSide = loadFENCastlingQueenSide(fenRep, colour.white, this.rows);
        this.canBlackCastleQueenSide = loadFENCastlingQueenSide(fenRep, colour.black, this.rows);
        this.canWhiteCastleKingSide = loadFENCastlingKingSide(fenRep, colour.white, this.rows);
        this.canBlackCastleKingSide = loadFENCastlingKingSide(fenRep, colour.black, this.rows);

        this.#findKingPositions();

        dangerScanBoard(this);
    }

    getCurrentTurnColour() {
        return this.isWhiteTurn ? colour.white : colour.black;
    }

    moveCell(movingPos, destPos) {
        const movingCell = this.getCell(movingPos);

        if (!this.#isMoveValid(movingCell, movingPos, destPos)) throw new Error("Illegal Move");

        const dyingCell = this.getCell(destPos);
        this.#setCell(movingCell, destPos)
        this.#removePieceAtCell(movingPos);

        this.#checkForEnpassant(movingPos, destPos);

        this.#movePossibleRookCastleMove(destPos, movingPos)

        if (this.#isCellPromotable(movingCell, destPos)) {
            this.#promoteCell(destPos);
        }

        dangerScanBoard(this);

        const curColour = movingCell.colour;
        if (this.isKingChecked(curColour)) {
            this.#reversePreviousMove(dyingCell, movingPos, destPos);
            throw new Error("Illegal Move")
        }

        this.isWhiteTurn = !this.isWhiteTurn;
    }

    movePiece(startChessPos, endChessPos) {
        const startPos = locationNotationToPosition(startChessPos);
        const endPos = locationNotationToPosition(endChessPos);
        this.moveCell(startPos, endPos);
    }

    getFEN() {
        return getFENForBoard(this.rows, this.getCurrentTurnColour(),
            this.canWhiteCastleKingSide,
            this.canWhiteCastleQueenSide,
            this.canBlackCastleKingSide,
            this.canBlackCastleQueenSide
        );
    }

    // TODO: test
    canEnpassant(pieceColour, pos) {
        if (pieceColour === colour.white) {
            return pos.r === 2 && this.blackEnpassantCol === (pos.c);
        } else {
            return pos.r === this.getHeight() - 3 && this.whiteEnpassantCol === (pos.c);
        }
    }

    // CELL METHODS ========= // TODO: test

    getKingPos(pieceColour) {
        if (pieceColour === colour.white) {
            return this.whiteKingPos;
        } else {
            return this.blackKingPos;
        }
    }

    isCellEmpty(pos) {
        return this.getCell(pos).piece === piece.none;
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

    // POSSIBLE MOVES ======= // TODO: test

    clearPossibleMoves() {
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                this.rows[r][c].movePossible = false;
            }
        }

        this._isAnyCellMovable = false;
    }

    setMovePossibleOnCell(pos) {
        this._isAnyCellMovable = true;
        this.rows[pos.r][pos.c].movePossible = true;
    }

    isAnyCellMovable() {
        return this._isAnyCellMovable;
    }

    // CHECKING & PINNING ======= // TODO: test

    isCellChecked(pos, friendlyColour) {
        if (!this.legalPosition(pos)) return false;
        const enemyPiecesProp = friendlyColour === colour.white ? "numberOfBlackChecks" : "numberOfWhiteChecks";
        return this.rows[pos.r][pos.c][enemyPiecesProp] > 0;
    }

    checkCell(attackingColour, posToCheck) {
        if (!this.legalPosition(posToCheck)) {
            return;
        }
        const checkingPiecesProp = attackingColour === colour.white ? "numberOfWhiteChecks" : "numberOfBlackChecks";

        this.rows[posToCheck.r][posToCheck.c][checkingPiecesProp] += 1;
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

    isCellPinned(pos) {
        return this.rows[pos.r][pos.c].pinnedToking;
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

    setCellAsPinned(pos) {
        this.rows[pos.r][pos.c].pinnedToking = true;
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

    // RULE HELPERS NEED ======= // TODO: test

    isKingChecked(pieceColour) {
        if (pieceColour === colour.white) {
            return this.isCellChecked(this.whiteKingPos, colour.white);
        } else {
            return this.isCellChecked(this.blackKingPos, colour.black);
        }
    }

    isKingDoubleChecked(pieceColour) {
        if (pieceColour === colour.white) {
            return this.#isCellDoubleChecked(this.whiteKingPos, colour.white);
        } else {
            return this.#isCellDoubleChecked(this.blackKingPos, colour.black);
        }
    }

    canKingMove(pieceColour, attackingPos) {
        const kingPos = this.getKingPos(pieceColour);
        const r = kingPos.r;
        const c = kingPos.c

        return this.#canKingMoveToPos(createPos(r + 1, c - 1), pieceColour, attackingPos) ||
            this.#canKingMoveToPos(createPos(r + 1, c), pieceColour, attackingPos) ||
            this.#canKingMoveToPos(createPos(r + 1, c + 1), pieceColour, attackingPos) ||

            this.#canKingMoveToPos(createPos(r - 1, c - 1), pieceColour, attackingPos) ||
            this.#canKingMoveToPos(createPos(r - 1, c), pieceColour, attackingPos) ||
            this.#canKingMoveToPos(createPos(r - 1, c + 1), pieceColour, attackingPos) ||

            this.#canKingMoveToPos(createPos(r, c - 1), pieceColour, attackingPos) ||
            this.#canKingMoveToPos(createPos(r, c + 1), pieceColour, attackingPos)
    }

    hasInsufficientMaterial() {
        return false;
    }

    // DIMENSIONS ============== // TODO: test

    getWidth() {
        return BOARD_WIDTH;
    }

    getHeight() {
        return BOARD_HEIGHT;
    }

    legalPosition(pos) {
        return pos.r >= 0 && pos.r < this.getHeight() && pos.c >= 0 && pos.c < this.getWidth()
    }

    // ==========================

    #isCellDoubleChecked(pos, friendlyColour) {
        const enemyPiecesProp = friendlyColour === colour.white ? "numberOfBlackChecks" : "numberOfWhiteChecks";
        return this.rows[pos.r][pos.c][enemyPiecesProp] > 1;
    }

    #canKingCastleKingSide(playerColour) {
        const canCastleKingSide = playerColour === colour.white ? this.canWhiteCastleKingSide : this.canBlackCastleKingSide;
        if (!canCastleKingSide || this.isKingChecked(playerColour)) return false;

        const kingPos = this.getKingPos(playerColour);
        return !this.isCellChecked(kingPos.addC(1), playerColour) &&
            !this.isCellChecked(kingPos.addC(2), playerColour) &&
            this.isCellEmpty(kingPos.addC(1)) &&
            this.isCellEmpty(kingPos.addC(2))
    }

    #canKingCastleQueenSide(playerColour) {
        const canCastleQueenSide = playerColour === colour.white ? this.canWhiteCastleQueenSide : this.canBlackCastleQueenSide;
        if (!canCastleQueenSide || this.isKingChecked(playerColour)) return false;

        const kingPos = this.getKingPos(playerColour);
        return !this.isCellChecked(kingPos.addC(-1), playerColour) &&
            !this.isCellChecked(kingPos.addC(-2), playerColour) &&
            this.isCellEmpty(kingPos.addC(-1)) &&
            this.isCellEmpty(kingPos.addC(-2)) &&
            this.isCellEmpty(kingPos.addC(-3))
    }

    #removePieceAtCell(pos) {
        if (pos.equals(createPos(0, 4))) {
            this.canBlackCastleQueenSide = false;
            this.canBlackCastleKingSide = false;
        }

        if (pos.equals(createPos(this.getHeight() - 1, 4))) {
            this.canWhiteCastleQueenSide = false;
            this.canWhiteCastleKingSide = false;
        }

        if (pos.equals(createPos(0, 0))) this.canBlackCastleQueenSide = false;
        if (pos.equals(createPos(this.getHeight() - 1, 0))) this.canWhiteCastleQueenSide = false;

        if (pos.equals(createPos(0, this.getWidth() - 1))) this.canBlackCastleKingSide = false;
        if (pos.equals(createPos(this.getHeight() - 1, this.getWidth() - 1))) this.canWhiteCastleKingSide = false;

        this.rows[pos.r][pos.c].piece = piece.none;
        this.rows[pos.r][pos.c].colour = undefined;
    }

    #setCell(cell, pos) {
        this.rows[pos.r][pos.c].piece = cell.piece;
        this.rows[pos.r][pos.c].colour = cell.colour;

        if (cell.colour === colour.white && cell.piece === piece.king) this.whiteKingPos = pos;
        if (cell.colour === colour.black && cell.piece === piece.king) this.blackKingPos = pos;

        if (cell.colour === colour.white && cell.piece === piece.pawn &&
            this.pieceAtCell(createPos(this.getHeight() - 2, pos.c)) === piece.pawn) this.whiteEnpassantCol = pos.c;

        if (cell.colour === colour.black && cell.piece === piece.pawn &&
            this.pieceAtCell(createPos(1, pos.c)) === piece.pawn) this.blackEnpassantCol = pos.c;
    }

    #isMoveValid(movingCell, movingPos, destPos) {
        if (this.isWhiteTurn && movingCell.colour !== colour.white ||
            !this.isWhiteTurn && movingCell.colour !== colour.black) return false;

        this.#markPossibleMovesForPos(movingPos);
        const canMoveToCell = this.#isCellMovable(destPos);
        this.clearPossibleMoves();
        return canMoveToCell;
    }

    #reversePreviousMove(dyingCell, movingPos, destPos) {
        this.#setCell(this.getCell(destPos), movingPos)
        this.#setCell(dyingCell, destPos)

        dangerScanBoard(this);
    }

    #clearEnpassant(pieceColour) {
        if (pieceColour === colour.white) {
            this.whiteEnpassantCol = undefined;
        } else {
            this.blackEnpassantCol = undefined;
        }
    }

    #isCellMovable(pos) {
        return this.rows[pos.r][pos.c].movePossible;
    }

    #markPossibleMovesForPos(pos) {
        markPossibleMoves(this, pos);

        const cell = this.getCell(pos);
        if (cell.piece === piece.king) {
            this.#markPossibleCastlingMoves(cell.colour)
        }
    }

    #promoteCell(pos) {
        const cellColour = this.colourAtCell(pos);
        this.#setCell(
            {piece: piece.queen, colour: cellColour}, pos
        );
    }

    #checkForEnpassant(movingPos, destPos) {
        const movingCell = this.getCell(movingPos);
        const dyingCell = this.getCell(destPos);

        if (movingCell.piece === piece.pawn) {
            const pawnDirection = Vector.makeDirectionVec(movingPos, destPos);
            const isPawnAttacking = pawnDirection.x !== 0;
            if (dyingCell.piece === piece.none && isPawnAttacking) {
                const dyingPawnPos = destPos.addR(-pawnDirection.y);
                this.#removePieceAtCell(dyingPawnPos);
            } else {
            }
        }
    }

    #isCellPromotable(cell, pos) {
        return (cell.colour === colour.white &&
            cell.piece === piece.pawn &&
            pos.r === 0) ||
            (cell.colour === colour.black &&
                cell.piece === piece.pawn &&
                pos.r === this.getHeight() - 1)
    }

    #movePossibleRookCastleMove(destPos, movingPos) {
        const movedCell = this.getCell(destPos);
        const curColour = movedCell.colour;

        if (movedCell.piece === piece.king && movingPos.c - destPos.c === -2) {
            if (curColour === colour.white) {
                const rookPos = createPos(this.getHeight() - 1, this.getWidth() - 1);
                const rookCell = this.getCell(rookPos);
                this.#setCell(rookCell, destPos.add(createVec(-1, 0)))
                this.#removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, this.getWidth() - 1);
                const rookCell = this.getCell(rookPos);
                this.#setCell(rookCell, destPos.add(createVec(-1, 0)))
                this.#removePieceAtCell(rookPos);
            }
        }

        if (movedCell.piece === piece.king && movingPos.c - destPos.c === 2) {
            if (curColour === colour.white) {
                const rookPos = createPos(this.getHeight() - 1, 0);
                const rookCell = this.getCell(rookPos);
                this.#setCell(rookCell, destPos.add(createVec(1, 0)))
                this.#removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, 0);
                const rookCell = this.getCell(rookPos);
                this.#setCell(rookCell, destPos.add(createVec(1, 0)))
                this.#removePieceAtCell(rookPos);
            }
        }
    }

    #canKingMoveToPos(pos, pieceColour, attackingPos) {
        if (!this.legalPosition(pos)) return false;

        const attackingPiece = this.pieceAtCell(attackingPos);
        const kingPos = this.getKingPos(pieceColour);
        const attackDirection = Vector.makeDirectionVec(attackingPos, kingPos);
        const isAttackerAPinner = attackingPiece === piece.bishop || attackingPiece === piece.rook || attackingPos === piece.queen

        if (isAttackerAPinner && kingPos.add(attackDirection).equals(pos)) return false;
        return !this.isCellChecked(pos, pieceColour) && this.getCell(pos).colour !== pieceColour;
    }

    #markPossibleCastlingMoves(kingColour) {
        if (this.#canKingCastleQueenSide(kingColour)) {
            this.setMovePossibleOnCell(this.getKingPos(kingColour).add(createVec(-2, 0)));
        }

        if (this.#canKingCastleKingSide(kingColour)) {
            this.setMovePossibleOnCell(this.getKingPos(kingColour).add(createVec(2, 0)));
        }
    }

    #findKingPositions() {
        for (let r = 0; r < this.getHeight(); r++) {
            for (let c = 0; c < this.getWidth(); c++) {
                const cell = this.getCell(createPos(r, c));
                if (cell.piece === piece.king && cell.colour === colour.white) this.whiteKingPos = createPos(r, c);
                if (cell.piece === piece.king && cell.colour === colour.black) this.blackKingPos = createPos(r, c);
            }
        }
    }
}

export {Board}