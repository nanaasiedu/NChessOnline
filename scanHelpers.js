class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function createVec(x, y) {
    return new Vector(x, y);
}

const initialDangerScan = function (board) {
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            dangerScan(board, createPos(r, c))
        }
    }
}

function dangerScan(board, startPos) {
    const threateningCell = board.getCell(startPos)

    const scanMethod = dangerScanMethodMap[threateningCell.piece];
    scanMethod(board, threateningCell.colour, startPos)
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

function scanInDirection(board, cellPiece, pieceColour, startPos, directionVec) {
    const {vx, vy} = {vx: directionVec.x, vy: directionVec.y};
    const {r, c} = { r: startPos.r, c: startPos.c};

    let i = 1;
    while (legalPosition(r + i * vy, c + i * vx)) {
        const curPos = createPos(r + i * vy, c + i * vx);
        board.addCheckingPiece(pieceColour, cellPiece, curPos, directionVec);

        if (board.pieceAtCell(curPos) !== piece.none) {
            return;
        }

        i++;
    }
}

function pawnDangerScan(board, pieceColour, startPos) {
    const r = startPos.r;
    const c = startPos.c;

    if (pieceColour === colour.white) {
        board.addCheckingPiece(pieceColour, piece.pawn, createPos(r - 1, c - 1))
        board.addCheckingPiece(pieceColour, piece.pawn, createPos(r - 1, c + 1))
    } else {
        board.addCheckingPiece(pieceColour, piece.pawn, createPos(r + 1, c - 1))
        board.addCheckingPiece(pieceColour, piece.pawn, createPos(r + 1, c + 1))
    }
}

function rookDangerScan(board, pieceColour, startPos) {
    plusDangerScan(board, piece.rook, pieceColour, startPos);
}

function plusDangerScan(board, cellPiece, pieceColour, startPos) {
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(0, 1))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(1, 0))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(0, -1))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(-1, 0))
}

function bishopDangerScan(board, pieceColour, r, c) {

}

function legalPosition(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8
}
