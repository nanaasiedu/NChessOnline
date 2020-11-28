class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function dangerScan(board, r, c) {
    const cellPiece = board.getCell(r, c)

    const scanMethod = dangerScanMethodMap[cellPiece.piece];
    scanMethod(board, cellPiece.colour, r, c)
}

const dangerScanMethodMap = {
    none: () => {
    },
    pawn: pawnDangerScan,
    knight: () => {
    },
    bishop: () => {
    },
    rook: rookDangerScan,
    queen: () => {
    },
    king: () => {
    }
}

function pawnDangerScan(board, pieceColour, r, c) {
    if (pieceColour === colour.white) {
        if (legalPosition(r - 1, c - 1)) {
            board.getCell(r - 1, c - 1).whiteCheckingPieces.push({piece: piece.pawn})
        }
        if (legalPosition(r - 1, c + 1)) {
            board.getCell(r - 1, c + 1).whiteCheckingPieces.push({piece: piece.pawn})
        }
    } else {
        if (legalPosition(r + 1, c - 1)) {
            board.getCell(r + 1, c - 1).blackCheckingPieces.push({piece: piece.pawn})
        }
        if (legalPosition(r + 1, c + 1)) {
            board.getCell(r + 1, c + 1).blackCheckingPieces.push({piece: piece.pawn})
        }
    }
}

function rookDangerScan(board, pieceColour, r, c) {
    const checkingPiecesProp = pieceColour === colour.white ? "whiteCheckingPieces" : "blackCheckingPieces"

    // south
    let i = 1;
    while (legalPosition(r + i, c)) {
        const currentCell = board.getCell(r + i, c);
        if (currentCell.piece !== piece.none) {
            currentCell[checkingPiecesProp].push({piece: piece.rook, direction: "S"})
            return;
        }

        currentCell[checkingPiecesProp].push({piece: piece.rook})

        i++;
    }

    // north
    i = 1;
    while (legalPosition(r - i, c)) {
        const currentCell = board.getCell(r - i, c);
        if (currentCell.piece !== piece.none) {
            currentCell[checkingPiecesProp].push({piece: piece.rook, direction: "N"})
            return;
        }

        currentCell[checkingPiecesProp].push({piece: piece.rook})

        i++;
    }
}

function bishopDangerScan(board, pieceColour, r, c) {

}

function legalPosition(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8
}
