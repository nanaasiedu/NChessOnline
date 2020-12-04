const piece = Object.freeze({
    none: "none",
    pawn: "pawn",
    knight: "knight",
    bishop: "bishop",
    rook: "rook",
    queen: "queen",
    king: "king"
})

const colour = Object.freeze({
    white: "white",
    black: "black"
})

function swapColour(col) {
    return col === colour.white ? colour.black : colour.white;
}

class Position {
    constructor(r, c) {
        this.r = r;
        this.c = c;
    }

    addC(c) {
        return createPos(this.r, this.c + c);
    }

    addR(r) {
        return createPos(this.r + r, this.c);
    }

    add(vec) {
        return createPos(this.r + vec.y, this.c + vec.x);
    }

    equals(pos) {
        return this.r === pos.r && this.c === pos.c;
    }
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    normalise() {
        const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
        return createVec(Math.round(this.x/magnitude), Math.round(this.y/magnitude));
    }

    static makeDirectionVec(startPos, endPos) {
        return createVec(endPos.c - startPos.c, endPos.r - startPos.r).normalise()
    }
}

function createVec(x, y) {
    return new Vector(x, y);
}

function createPos(r, c) {
    return new Position(r, c);
}

class Cell {
    constructor(cellColour, cellPiece) {
        this.colour = cellColour;
        this.piece = cellPiece;
        this.numberOfWhiteChecks = 0;
        this.numberOfBlackChecks = 0;
        this.checkedByWhiteKing = false;
        this.checkedByBlackKing = false;
        this.movePossible = false;
    }

    clearCell() {
        this.piece = piece.none;
        this.colour = undefined;
    }

    placePiece(colour, piece) {
        this.colour = colour;
        this.piece = piece;
    }
}

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 8;

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
    }

    getCell(pos) {
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
    }

    setPieceAsCheckedByKing(pieceColour) {
        if (pieceColour === colour.white) {
            const pos = this.whiteKingPos;
            this.rows[pos.r][pos.c].checkedByWhiteKing = true;
        } else {
            const pos = this.whiteKingPos;
            this.rows[pos.r][pos.c].checkedByBlackKing = true;
        }
    }

    clearKingChecks() {
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                this.rows[r][c].checkedByWhiteKing = false;
                this.rows[r][c].checkedByBlackKing = false;
            }
        }
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
        const attackingPiece = this.pieceAtCell(attackingPos);
        const kingPos = this.getKingPos(pieceColour);
        const attackDirection = Vector.makeDirectionVec(attackingPos, kingPos);

        if (attackingPiece === piece.king || attackingPiece === piece.pawn || attackingPos === piece.knight) return false;


        if (kingPos.add(attackDirection).equals(pos)) return false;

        if (!this.legalPosition(pos)) return false;
        return !this.isCellChecked(pos, pieceColour) && (this.isCellEmpty(pos) || this.getCell(pos).colour !== pieceColour);
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

    clearPossibleMoves() {
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                this.rows[r][c].movePossible = false;
            }
        }

        this._isAnyCellMovable = false;
    }

    clearCellChecks() {
        for (let r = 0; r < BOARD_HEIGHT; r++) {
            for (let c = 0; c < BOARD_WIDTH; c++) {
                this.rows[r][c].numberOfWhiteChecks = 0;
                this.rows[r][c].numberOfBlackChecks = 0;
            }
        }
    }

    isAnyCellMovable() {
        return this._isAnyCellMovable;
    }

    isCellMovable(pos) {
        return this.rows[pos.r][pos.c].movePossible;
    }

    canCellBeTaken(pos, defendingColour) {
        const defendingPiecesProp = defendingColour === colour.white ? "numberOfWhiteChecks" : "numberOfBlackChecks";
        const checkedByEnemyKing = defendingColour === colour.white ? "checkedByBlackKing" : "checkedByWhiteKing";

        return !(this.rows[pos.r][pos.c][defendingPiecesProp] === 1 && this.rows[pos.r][pos.c][checkedByEnemyKing]) && this.isCellChecked(pos, defendingColour);
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

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(this.getHeight()-1, 0),
                friendlyColour)
        } else {
            if (this.hasBlackKingMoved || this.hasLeftBlackRookMoved || this.isKingChecked(friendlyColour)) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(0, 0),
                friendlyColour)
        }
    }

    canKingRightCastle(friendlyColour) {
        if (friendlyColour === colour.white) {
            if (this.hasWhiteKingMoved|| this.hasRightWhiteRookMoved || this.isKingChecked(friendlyColour)) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(this.getHeight()-1, this.getWidth()-1),
                friendlyColour)
        } else {
            if (this.hasBlackKingMoved || this.hasRightBlackRookMoved || this.isKingChecked(friendlyColour)) return false;

            return isPathBetweenUnchecked(this,
                this.getKingPos(friendlyColour),
                createPos(0, this.getWidth()-1),
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
}

Board.prototype.toString = function () {
    return `${this.rows}`;
};


