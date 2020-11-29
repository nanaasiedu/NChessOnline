class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function createVec(x, y) {
    return new Vector(x, y);
}

// danger scan methods

function initialDangerScan(board) {
    for (let r = 0; r < board.getHeight(); r++) {
        for (let c = 0; c < board.getWidth(); c++) {
            dangerScan(board, createPos(r, c))
        }
    }
}

function dangerScan(board, startPos) {
    const threateningCell = board.getCell(startPos)

    const cellScanMethod = cellScanMethodMap[threateningCell.piece];
    cellScanMethod(board, threateningCell.colour, startPos, addCheckingPieceToPos)
}

const cellScanMethodMap = {
    none: () => {},
    pawn:  pawnScan,
    knight: knightScan,
    bishop: (board, pieceColour, startPos, scanMethod) => (crossScan(board, piece.bishop, pieceColour, startPos, scanMethod)),
    rook: (board, pieceColour, startPos, scanMethod) => (plusScan(board, piece.rook, pieceColour, startPos, scanMethod)),
    queen: (board, pieceColour, startPos, scanMethod) => {
        plusScan(board, piece.queen, pieceColour, startPos, scanMethod)
        crossScan(board, piece.queen, pieceColour, startPos, scanMethod)
    },
    king: kingScan
}

// scan methods

function scanInDirection(board, cellPiece, pieceColour, startPos, directionVec, scanMethod) {
    const {vx, vy} = {vx: directionVec.x, vy: directionVec.y};
    const {r, c} = { r: startPos.r, c: startPos.c};

    const legalPosition = function(r, c) {
        return r >= 0 && r < board.getHeight() && c >= 0 && c < board.getWidth()
    }

    let i = 1;
    while (legalPosition(r + i * vy, c + i * vx)) {
        const curPos = createPos(r + i * vy, c + i * vx);
        scanMethod(board, pieceColour, cellPiece, curPos, directionVec);

        if (board.pieceAtCell(curPos) !== piece.none) {
            return;
        }

        i++;
    }
}

function pawnScan(board, pieceColour, startPos, scanMethod) {
    const r = startPos.r;
    const c = startPos.c;

    if (pieceColour === colour.white) {
        scanMethod(board, pieceColour, piece.pawn, createPos(r - 1, c - 1))
        scanMethod(board, pieceColour, piece.pawn, createPos(r - 1, c + 1))
    } else {
        scanMethod(board, pieceColour, piece.pawn, createPos(r + 1, c - 1))
        scanMethod(board, pieceColour, piece.pawn, createPos(r + 1, c + 1))
    }
}

function knightScan(board, pieceColour, startPos, scanMethod) {
    const r = startPos.r;
    const c = startPos.c;

    scanMethod(board, pieceColour, piece.knight, createPos(r + 2, c - 1))
    scanMethod(board, pieceColour, piece.knight, createPos(r + 2, c + 1))

    scanMethod(board, pieceColour, piece.knight, createPos(r - 2, c - 1))
    scanMethod(board, pieceColour, piece.knight, createPos(r - 2, c + 1))

    scanMethod(board, pieceColour, piece.knight, createPos(r + 1, c + 2))
    scanMethod(board, pieceColour, piece.knight, createPos(r - 1, c + 2))

    scanMethod(board, pieceColour, piece.knight, createPos(r + 1, c - 2))
    scanMethod(board, pieceColour, piece.knight, createPos(r - 1, c - 2))
}

function kingScan(board, pieceColour, startPos, scanMethod) {
    const r = startPos.r;
    const c = startPos.c;

    scanMethod(board, pieceColour, piece.king, createPos(r + 1, c - 1))
    scanMethod(board, pieceColour, piece.king, createPos(r + 1, c ))
    scanMethod(board, pieceColour, piece.king, createPos(r + 1, c + 1 ))

    scanMethod(board, pieceColour, piece.king, createPos(r - 1, c - 1))
    scanMethod(board, pieceColour, piece.king, createPos(r - 1, c ))
    scanMethod(board, pieceColour, piece.king, createPos(r - 1, c + 1 ))

    scanMethod(board, pieceColour, piece.king, createPos(r, c - 1))
    scanMethod(board, pieceColour, piece.king, createPos(r, c + 1))
}

function plusScan(board, cellPiece, pieceColour, startPos, scanMethod) {
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(0, 1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(1, 0), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(0, -1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(-1, 0), scanMethod)
}

function crossScan(board, cellPiece, pieceColour, startPos, scanMethod) {
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(1, 1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(1, -1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(-1, 1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(-1, -1), scanMethod)
}

// Mark methods

function markPossibleMoves(board, pos) {
    if (board.getCell(pos).piece === piece.none) {
        return false;
    }


}

// board scan methods

function addCheckingPieceToPos(board, pieceColour, cellPiece, curPos, directionVec) {
    board.addCheckingPiece(pieceColour, cellPiece, curPos, directionVec);
}
