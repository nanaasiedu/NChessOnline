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
    position

    constructor(colour, piece, position) {
        this.colour = colour;
        this.piece = piece;
        this.position = position;
        this.whiteCheckingPieces = [];
        this.blackCheckingPieces = [];
    }
}

class Board {
    rows;

    constructor() {
        this.rows = Array(8);

        const fillRow = function (row, r, colour, piece) {
            for (let c = 0; c < row.length; c++) {
                row[c] = new Cell(colour, piece, createPos(r,c))
            }
        }

        for (let r = 0; r < this.rows.length; r++) {
            this.rows[r] = Array(8);

            if (r > 1 && r < 6) {
                fillRow(this.rows[r], r, undefined, piece.none);
            }
        }

        fillRow(this.rows[1], 1, colour.black, piece.pawn);
        fillRow(this.rows[6], 6, colour.white, piece.pawn);

        this.rows[0][0] = new Cell(colour.black, piece.rook, createPos(0, 0));
        this.rows[0][7] = new Cell(colour.black, piece.rook, createPos(0, 7));
        this.rows[0][1] = new Cell(colour.black, piece.knight, createPos(0, 1));
        this.rows[0][6] = new Cell(colour.black, piece.knight, createPos(0, 6));
        this.rows[0][2] = new Cell(colour.black, piece.bishop, createPos(0, 2));
        this.rows[0][5] = new Cell(colour.black, piece.bishop, createPos(0, 5));
        this.rows[0][3] = new Cell(colour.black, piece.queen, createPos(0, 3));
        this.rows[0][4] = new Cell(colour.black, piece.king, createPos(0, 4));

        this.rows[7][0] = new Cell(colour.white, piece.rook, createPos(7, 0));
        this.rows[7][7] = new Cell(colour.white, piece.rook, createPos(7, 7));
        this.rows[7][1] = new Cell(colour.white, piece.knight, createPos(7, 1));
        this.rows[7][6] = new Cell(colour.white, piece.knight, createPos(7, 6));
        this.rows[7][2] = new Cell(colour.white, piece.bishop, createPos(7, 2));
        this.rows[7][5] = new Cell(colour.white, piece.bishop, createPos(7, 5));
        this.rows[7][3] = new Cell(colour.white, piece.queen, createPos(7, 3));
        this.rows[7][4] = new Cell(colour.white, piece.king, createPos(7, 4));
    }

    getCell(pos) {
        return this.rows[pos.r][pos.c];
    }
}

Board.prototype.toString = function() {
    return `${this.rows}`;
};
