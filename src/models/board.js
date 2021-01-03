import {colour, piece, swapColour} from "./piece.js";
import {createCoordinate} from "./coordinate.js";
import {Vector, createVec} from "./vector.js";
import {dangerScanBoard, markPossibleMoves} from "../helpers/scanHelpers.js";
import {
    loadFENIsWhiteTurn,
    loadFENBoard,
    getFENForBoard,
    loadFENCastlingKingSide,
    loadFENCastlingQueenSide,
    loadFENEnpassantPosition
} from "../notation/fenHelpers.js";
import {convertPositionToCoordinate} from "../notation/chessNotationHelpers.js";

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

const DEFAULT_STARTING_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -";

class Board {
    constructor(fenRep = DEFAULT_STARTING_FEN) {
        this.#loadFEN(fenRep);
    }

    getCurrentTurnColour() {
        return this.isWhiteTurn ? colour.white : colour.black;
    }

    // TODO: MAKE game manager use movePiece and make moveCell private
    moveCell(movingCoor, destCoor) {
        const fenBeforeMove = this.getFEN();
        const movingCell = this.getCell(movingCoor);

        if (!this.#isMoveValid(movingCell, movingCoor, destCoor)) throw new Error("Illegal Move");

        this.#setPossibleEnpassantCoordinate(movingCoor, destCoor);
        this.#removeEnpassantPawnIfAttacked(movingCoor, destCoor);
        this.#setCell(movingCell, destCoor)
        this.#removePieceAtCell(movingCoor);

        this.#movePossibleRookCastleMove(destCoor, movingCoor)

        const canPiecePromote = this.#isCellPromotable(movingCell, destCoor);
        if (canPiecePromote) {
            this.#promoteCell(destCoor);
        }

        dangerScanBoard(this);

        const playerColour = movingCell.colour;
        if (this.isKingChecked(playerColour)) {
            this.#loadFEN(fenBeforeMove);
            throw new Error("Illegal Move")
        }

        this.isWhiteTurn = !this.isWhiteTurn;
    }

    movePiece(startPos, endPos) {
        const startCoor = convertPositionToCoordinate(startPos);
        const endCoor = convertPositionToCoordinate(endPos);
        this.moveCell(startCoor, endCoor);
    }

    getFEN() {
        return getFENForBoard(this.rows, this.getCurrentTurnColour(),
            this.canWhiteCastleKingSide,
            this.canWhiteCastleQueenSide,
            this.canBlackCastleKingSide,
            this.canBlackCastleQueenSide,
            this.enpassantCoordinate
        );
    }

    // TODO: test
    canEnpassant(coor) {
        return coor.equals(this.enpassantCoordinate);
    }

    // CELL METHODS ========= // TODO: test

    getKingCoor(pieceColour) {
        if (pieceColour === colour.white) {
            return this.whiteKingCoor;
        } else {
            return this.blackKingCoor;
        }
    }

    isCellEmpty(coor) {
        return this.getCell(coor).piece === piece.none;
    }

    getCell(coor) {
        if (!this.legalCoordinate(coor)) return undefined;

        const cell = this.rows[coor.r][coor.c];
        return {
            piece: cell.piece,
            colour: cell.colour
        };
    }

    pieceAtCell(coor) {
        return this.getCell(coor).piece;
    }

    colourAtCell(coor) {
        return this.getCell(coor).colour || undefined;
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

    setMovePossibleOnCell(coor) {
        this._isAnyCellMovable = true;
        this.rows[coor.r][coor.c].movePossible = true;
    }

    isAnyCellMovable() {
        return this._isAnyCellMovable;
    }

    // CHECKING & PINNING ======= // TODO: test

    isCellChecked(coor, friendlyColour) {
        if (!this.legalCoordinate(coor)) return false;
        const enemyPiecesProp = friendlyColour === colour.white ? "numberOfBlackChecks" : "numberOfWhiteChecks";
        return this.rows[coor.r][coor.c][enemyPiecesProp] > 0;
    }

    checkCell(checkingColour, coorToCheck) {
        if (!this.legalCoordinate(coorToCheck)) {
            return;
        }
        const checkingPiecesProp = checkingColour === colour.white ? "numberOfWhiteChecks" : "numberOfBlackChecks";

        this.rows[coorToCheck.r][coorToCheck.c][checkingPiecesProp] += 1;
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

    isCellPinned(coor) {
        return this.rows[coor.r][coor.c].pinnedToking;
    }

    setPieceAsCheckedByKing(checkingColour, coorToCheck) {
        if (!this.legalCoordinate(coorToCheck)) return undefined;

        const checkedByKingProp = checkingColour === colour.white ? "checkedByWhiteKing" : "checkedByBlackKing";
        this.rows[coorToCheck.r][coorToCheck.c][checkedByKingProp] = true;
    }

    setPieceAsCheckedByPawn(attackingColour, coorToCheck) {
        if (!this.legalCoordinate(coorToCheck)) return undefined;

        const checkedByPawnProp = attackingColour === colour.white ? "checkedByWhitePawn" : "checkedByBlackPawn";
        this.rows[coorToCheck.r][coorToCheck.c][checkedByPawnProp] = true;
    }

    setCellAsPinned(coor) {
        this.rows[coor.r][coor.c].pinnedToking = true;
    }

    canCheckingCellBeTaken() {
        if (this.getCheckingCoor() === undefined) {
            return false;
        }

        const opponentColour = swapColour(this.colourAtCell(this.getCheckingCoor()));
        return this.canCellBeTakenByColour(this.getCheckingCoor(), opponentColour);
    }

    canCellBeTakenByColour(coor, attackingColour) {
        const attackingPiecesProp = attackingColour === colour.white ? "numberOfWhiteChecks" : "numberOfBlackChecks";
        const checkedByAttackingKingProp = attackingColour === colour.white ? "checkedByWhiteKing" : "checkedByBlackKing";
        const checkedByAttackingPawnProp = attackingColour === colour.white ? "checkedByWhitePawn" : "checkedByBlackPawn";

        const canCellBeTakenBysSeveralPieces = this.rows[coor.r][coor.c][attackingPiecesProp] > 2;

        const canSecondAttackerTakeCell = this.rows[coor.r][coor.c][attackingPiecesProp] === 2
            && !(this.rows[coor.r][coor.c][checkedByAttackingPawnProp]
                && this.pieceAtCell(coor) === piece.none)

        const isCellCheckedOnlyByAttackingKing = this.rows[coor.r][coor.c][checkedByAttackingKingProp];
        const isCellProtectedFromAttackingKing = this.isCellChecked(coor, attackingColour);
        const canAttackingKingTakeCell = isCellCheckedOnlyByAttackingKing && !isCellProtectedFromAttackingKing;

        const canOtherPieceTakeCell = !isCellCheckedOnlyByAttackingKing && this.isCellChecked(coor, swapColour(attackingColour))

        return canCellBeTakenBysSeveralPieces || canSecondAttackerTakeCell || canAttackingKingTakeCell || canOtherPieceTakeCell;
    }

    setCheckingCoor(coor) {
        this.checkingCoor = coor;
    }

    getCheckingCoor() {
        return this.checkingCoor;
    }

    // RULE HELPERS NEED ======= // TODO: test

    isKingChecked(pieceColour) {
        if (pieceColour === colour.white) {
            return this.isCellChecked(this.whiteKingCoor, colour.white);
        } else {
            return this.isCellChecked(this.blackKingCoor, colour.black);
        }
    }

    isKingDoubleChecked(pieceColour) {
        if (pieceColour === colour.white) {
            return this.#isCellDoubleChecked(this.whiteKingCoor, colour.white);
        } else {
            return this.#isCellDoubleChecked(this.blackKingCoor, colour.black);
        }
    }

    canKingMove(pieceColour) {
        const kingCoor = this.getKingCoor(pieceColour);
        const r = kingCoor.r;
        const c = kingCoor.c

        return this.#isMoveLegal(kingCoor, createCoordinate(r + 1, c - 1)) ||
            this.#isMoveLegal(kingCoor, createCoordinate(r + 1, c)) ||
            this.#isMoveLegal(kingCoor, createCoordinate(r + 1, c + 1)) ||

            this.#isMoveLegal(kingCoor, createCoordinate(r - 1, c - 1)) ||
            this.#isMoveLegal(kingCoor, createCoordinate(r - 1, c)) ||
            this.#isMoveLegal(kingCoor, createCoordinate(r - 1, c + 1)) ||

            this.#isMoveLegal(kingCoor, createCoordinate(r, c - 1)) ||
            this.#isMoveLegal(kingCoor, createCoordinate(r, c + 1))
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

    legalCoordinate(coor) {
        return coor !== undefined && coor.r >= 0 && coor.r < this.getHeight() && coor.c >= 0 && coor.c < this.getWidth()
    }

    // ==========================

    #isCellDoubleChecked(coor, playerColour) {
        const enemyPiecesProp = playerColour === colour.white ? "numberOfBlackChecks" : "numberOfWhiteChecks";
        return this.rows[coor.r][coor.c][enemyPiecesProp] > 1;
    }

    #canKingCastleKingSide(playerColour) {
        const canCastleKingSide = playerColour === colour.white ? this.canWhiteCastleKingSide : this.canBlackCastleKingSide;
        if (!canCastleKingSide || this.isKingChecked(playerColour)) return false;

        const kingCoor = this.getKingCoor(playerColour);
        return !this.isCellChecked(kingCoor.addC(1), playerColour) &&
            !this.isCellChecked(kingCoor.addC(2), playerColour) &&
            this.isCellEmpty(kingCoor.addC(1)) &&
            this.isCellEmpty(kingCoor.addC(2))
    }

    #canKingCastleQueenSide(playerColour) {
        const canCastleQueenSide = playerColour === colour.white ? this.canWhiteCastleQueenSide : this.canBlackCastleQueenSide;
        if (!canCastleQueenSide || this.isKingChecked(playerColour)) return false;

        const kingCoor = this.getKingCoor(playerColour);
        return !this.isCellChecked(kingCoor.addC(-1), playerColour) &&
            !this.isCellChecked(kingCoor.addC(-2), playerColour) &&
            this.isCellEmpty(kingCoor.addC(-1)) &&
            this.isCellEmpty(kingCoor.addC(-2)) &&
            this.isCellEmpty(kingCoor.addC(-3))
    }

    #removePieceAtCell(coor) {
        if (coor.equals(createCoordinate(0, 4))) {
            this.canBlackCastleQueenSide = false;
            this.canBlackCastleKingSide = false;
        }

        if (coor.equals(createCoordinate(this.getHeight() - 1, 4))) {
            this.canWhiteCastleQueenSide = false;
            this.canWhiteCastleKingSide = false;
        }

        if (coor.equals(createCoordinate(0, 0))) this.canBlackCastleQueenSide = false;
        if (coor.equals(createCoordinate(this.getHeight() - 1, 0))) this.canWhiteCastleQueenSide = false;

        if (coor.equals(createCoordinate(0, this.getWidth() - 1))) this.canBlackCastleKingSide = false;
        if (coor.equals(createCoordinate(this.getHeight() - 1, this.getWidth() - 1))) this.canWhiteCastleKingSide = false;

        this.rows[coor.r][coor.c].piece = piece.none;
        this.rows[coor.r][coor.c].colour = undefined;
    }

    #setCell(cell, coor) {
        this.rows[coor.r][coor.c].piece = cell.piece;
        this.rows[coor.r][coor.c].colour = cell.colour;

        if (cell.colour === colour.white && cell.piece === piece.king) this.whiteKingCoor = coor;
        if (cell.colour === colour.black && cell.piece === piece.king) this.blackKingCoor = coor;
    }

    #isMoveValid(movingCell, movingCoor, destCoor) {
        if (this.isWhiteTurn && movingCell.colour !== colour.white ||
            !this.isWhiteTurn && movingCell.colour !== colour.black) return false;

        this.#markPossibleMovesForCoor(movingCoor);
        const canMoveToCell = this.#isCellMovable(destCoor);
        this.clearPossibleMoves();
        return canMoveToCell;
    }

    #clearEnpassant() {
        this.enpassantCoordinate = undefined;
    }

    #isCellMovable(coor) {
        return this.rows[coor.r][coor.c].movePossible;
    }

    #markPossibleMovesForCoor(coor) {
        markPossibleMoves(this, coor);

        const cell = this.getCell(coor);
        if (cell.piece === piece.king) {
            this.#markPossibleCastlingMoves(cell.colour)
        }
    }

    #promoteCell(coor) {
        const cellColour = this.colourAtCell(coor);
        this.#setCell(
            {piece: piece.queen, colour: cellColour}, coor
        );
    }

    #removeEnpassantPawnIfAttacked(movingCoor, destCoor) {
        const movingCell = this.getCell(movingCoor);
        const dyingCell = this.getCell(destCoor);

        if (movingCell.piece === piece.pawn) {
            const pawnDirection = Vector.makeDirectionVec(movingCoor, destCoor);
            const isPawnAttacking = pawnDirection.x !== 0;
            if (dyingCell.piece === piece.none && isPawnAttacking) {
                const dyingPawnCoor = destCoor.addR(-pawnDirection.y);
                this.#removePieceAtCell(dyingPawnCoor);
            }
        }
    }

    #setPossibleEnpassantCoordinate(movingCoor, destCoor) {
        this.#clearEnpassant();

        const movingCell = this.getCell(movingCoor);
        const numberOfSpacesMoved = Math.abs(destCoor.r - movingCoor.r);

        if (movingCell.piece === piece.pawn && numberOfSpacesMoved === 2) {
            const movingDirection = Vector.makeDirectionVec(movingCoor, destCoor);
            this.enpassantCoordinate = movingCoor.add(movingDirection);
        }
    }

    #isCellPromotable(cell, coor) {
        return (cell.colour === colour.white &&
            cell.piece === piece.pawn &&
            coor.r === 0) ||
            (cell.colour === colour.black &&
                cell.piece === piece.pawn &&
                coor.r === this.getHeight() - 1)
    }

    #movePossibleRookCastleMove(destCoor, movingCoor) {
        const movedCell = this.getCell(destCoor);
        const curColour = movedCell.colour;
        const row = curColour === colour.white ? this.getHeight() - 1 : 0;

        if (movedCell.piece !== piece.king || Math.abs(movingCoor.c - destCoor.c) !== 2) return;

        const rookCol = movingCoor.c - destCoor.c > 0 ? 0 : this.getWidth() - 1;
        const oppositeDirectionVec = Vector.makeDirectionVec(destCoor, movingCoor);

        const rookCoor = createCoordinate(row, rookCol);
        const rookCell = this.getCell(rookCoor);
        this.#setCell(rookCell, destCoor.add(oppositeDirectionVec))
        this.#removePieceAtCell(rookCoor);
    }

    #markPossibleCastlingMoves(kingColour) {
        if (this.#canKingCastleQueenSide(kingColour)) {
            this.setMovePossibleOnCell(this.getKingCoor(kingColour).add(createVec(-2, 0)));
        }

        if (this.#canKingCastleKingSide(kingColour)) {
            this.setMovePossibleOnCell(this.getKingCoor(kingColour).add(createVec(2, 0)));
        }
    }

    #isMoveLegal(startCoor, endCoor) {
        const fenBeforeMove = this.getFEN();

        try {
            this.moveCell(startCoor, endCoor);
        } catch (e) {
            return false;
        }

        this.#loadFEN(fenBeforeMove);
        return true;
    }

    #loadFEN(fenRep) {
        this.rows = Array(BOARD_HEIGHT);
        this._isAnyCellMovable = false;

        this.rows = loadFENBoard(fenRep);
        this.isWhiteTurn = loadFENIsWhiteTurn(fenRep);
        this.canWhiteCastleQueenSide = loadFENCastlingQueenSide(fenRep, colour.white, this.rows);
        this.canBlackCastleQueenSide = loadFENCastlingQueenSide(fenRep, colour.black, this.rows);
        this.canWhiteCastleKingSide = loadFENCastlingKingSide(fenRep, colour.white, this.rows);
        this.canBlackCastleKingSide = loadFENCastlingKingSide(fenRep, colour.black, this.rows);
        this.enpassantCoordinate = loadFENEnpassantPosition(fenRep)

        this.whiteKingCoor = undefined;
        this.blackKingCoor = undefined;
        this.#findKingCoordinates();

        this.checkingCoor = undefined;
        dangerScanBoard(this);
    }

    #findKingCoordinates() {
        for (let r = 0; r < this.getHeight(); r++) {
            for (let c = 0; c < this.getWidth(); c++) {
                const cell = this.getCell(createCoordinate(r, c));
                if (cell.piece === piece.king && cell.colour === colour.white) this.whiteKingCoor = createCoordinate(r, c);
                if (cell.piece === piece.king && cell.colour === colour.black) this.blackKingCoor = createCoordinate(r, c);
            }
        }
    }
}

export {Board}