class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function createVec(x , y) { return new Vector(x, y); }

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

function scanInDirection(board, pieceColour, startPos, directionVec) {
    const checkingPiecesProp = pieceColour === colour.white ? "whiteCheckingPieces" : "blackCheckingPieces"
    const {vx, vy} = { vx: directionVec.x, vy: directionVec.y };
    const {r, c} = startPos;

    let i = 1;
    while (legalPosition(r + i * vy, c + i * vx)) {
        const curPos = createPos(r + i * vy, c + i * vx);
        const currentCell = board.getCell(curPos);
        if (currentCell.piece !== piece.none) {
            currentCell[checkingPiecesProp].push({piece: piece.rook, direction: directionVec})
            return;
        }

        currentCell[checkingPiecesProp].push({piece: piece.rook})

        i++;
    }
}

function pawnDangerScan(board, pieceColour, pos) {
    const r = pos.r;
    const c = pos.c;

    if (pieceColour === colour.white) {
        if (legalPosition(r - 1, c - 1)) {
            board.getCell(createPos(r - 1, c - 1)).whiteCheckingPieces.push({piece: piece.pawn})
        }
        if (legalPosition(r - 1, c + 1)) {
            board.getCell(createPos(r - 1, c + 1)).whiteCheckingPieces.push({piece: piece.pawn})
        }
    } else {
        if (legalPosition(r + 1, c - 1)) {
            board.getCell(createPos(r + 1, c - 1)).blackCheckingPieces.push({piece: piece.pawn})
        }
        if (legalPosition(r + 1, c + 1)) {
            board.getCell(createPos(r + 1, c + 1)).blackCheckingPieces.push({piece: piece.pawn})
        }
    }
}

function rookDangerScan(board, pieceColour, startPos) {
    scanInDirection(board, pieceColour, startPos, createVec(0, 1))
}

function bishopDangerScan(board, pieceColour, r, c) {

}

function legalPosition(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8
}
