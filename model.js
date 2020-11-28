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

class Board {
    rows;

    constructor() {
        this.rows = Array(8);

        const defaultBoardCellPiece = (colour, piece) => ({
            colour: colour,
            piece: piece,
            whiteCheckingPieces: [],
            blackCheckingPieces: []
        })

        const fillRow = function (row, cellPiece) {
            for (let c = 0; c < row.length; c++) {
                row[c] = defaultBoardCellPiece(cellPiece.colour, cellPiece.piece)
            }
        }

        for (let r = 0; r < this.rows.length; r++) {
            this.rows[r] = Array(8);

            if (r > 1 && r < 6) {
                fillRow(this.rows[r], defaultBoardCellPiece(undefined, piece.none));
            }
        }

        fillRow(this.rows[1], defaultBoardCellPiece(colour.black, piece.pawn));
        fillRow(this.rows[6], defaultBoardCellPiece(colour.white, piece.pawn));

        this.rows[0][0] = defaultBoardCellPiece(colour.black, piece.rook);
        this.rows[0][7] = defaultBoardCellPiece(colour.black, piece.rook);
        this.rows[0][1] = defaultBoardCellPiece(colour.black, piece.knight);
        this.rows[0][6] = defaultBoardCellPiece(colour.black, piece.knight);
        this.rows[0][2] = defaultBoardCellPiece(colour.black, piece.bishop);
        this.rows[0][5] = defaultBoardCellPiece(colour.black, piece.bishop);
        this.rows[0][3] = defaultBoardCellPiece(colour.black, piece.queen);
        this.rows[0][4] = defaultBoardCellPiece(colour.black, piece.king);

        this.rows[7][0] = defaultBoardCellPiece(colour.white, piece.rook);
        this.rows[7][7] = defaultBoardCellPiece(colour.white, piece.rook);
        this.rows[7][1] = defaultBoardCellPiece(colour.white, piece.knight);
        this.rows[7][6] = defaultBoardCellPiece(colour.white, piece.knight);
        this.rows[7][2] = defaultBoardCellPiece(colour.white, piece.bishop);
        this.rows[7][5] = defaultBoardCellPiece(colour.white, piece.bishop);
        this.rows[7][3] = defaultBoardCellPiece(colour.white, piece.queen);
        this.rows[7][4] = defaultBoardCellPiece(colour.white, piece.king);
    }

    getCell(r, c) {
        return this.rows[r][c];
    }
}

Board.prototype.toString = function() {
    return `${this.rows}`;
};
