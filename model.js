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

class Position {
    constructor(r, c) {
        this.r = r;
        this.c = c;
    }
}

function createPos(r , c) { return new Position(r, c); }

class Cell {
    colour
    piece
    whiteCheckingPieces
    blackCheckingPieces

    constructor(cellColour, cellPiece) {
        this.colour = cellColour;
        this.piece = cellPiece;
        this.whiteCheckingPieces = [];
        this.blackCheckingPieces = [];
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
    rows;

    constructor() {
        this.rows = Array(BOARD_HEIGHT);

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
        return  {
            piece: cell.piece,
            colour: cell.colour
        };
    }

    pieceAtCell(pos) {
        return this.getCell(pos).piece;
    }

    addCheckingPiece(pieceColour, piece, posToCheck, directionVec) {
        if (!legalPosition(posToCheck.r, posToCheck.c)) {
            return;
        }
        const checkingPiecesProp = pieceColour === colour.white ? "whiteCheckingPieces" : "blackCheckingPieces";

        this.rows[posToCheck.r][posToCheck.c][checkingPiecesProp].push({ piece, direction: directionVec });
    }

    isCellChecked(pos, friendlyColour) {
        const enemyPiecesProp = friendlyColour === colour.white ? "blackCheckingPieces" : "whiteCheckingPieces";
        return this.rows[pos.r][pos.c][enemyPiecesProp].length !== 0
    }

    getWidth() {
        return BOARD_WIDTH;
    }

    getHeight() {
        return BOARD_HEIGHT;
    }
}

Board.prototype.toString = function() {
    return `${this.rows}`;
};

function legalPosition(r, c) {
    return r >= 0 && r < BOARD_HEIGHT && c >= 0 && c < BOARD_WIDTH
}
