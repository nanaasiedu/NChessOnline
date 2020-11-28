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
    for (let r = 0; r < board.getHeight(); r++) {
        for (let c = 0; c < board.getWidth(); c++) {
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
    none: () => {},
    pawn:  pawnDangerScan,
    knight: knightDangerScan,
    bishop: (board, pieceColour, startPos) => (crossDangerScan(board, piece.bishop, pieceColour, startPos)),
    rook: (board, pieceColour, startPos) => (plusDangerScan(board, piece.rook, pieceColour, startPos)),
    queen: (board, pieceColour, startPos) => {
        plusDangerScan(board, piece.queen, pieceColour, startPos)
        crossDangerScan(board, piece.queen, pieceColour, startPos)
    },
    king: kingDangerScan
}

function scanInDirection(board, cellPiece, pieceColour, startPos, directionVec) {
    const {vx, vy} = {vx: directionVec.x, vy: directionVec.y};
    const {r, c} = { r: startPos.r, c: startPos.c};

    const legalPosition = function(r, c) {
        return r >= 0 && r < board.getHeight() && c >= 0 && c < board.getWidth()
    }

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

function knightDangerScan(board, pieceColour, startPos) {
    const r = startPos.r;
    const c = startPos.c;

    board.addCheckingPiece(pieceColour, piece.knight, createPos(r + 2, c - 1))
    board.addCheckingPiece(pieceColour, piece.knight, createPos(r + 2, c + 1))

    board.addCheckingPiece(pieceColour, piece.knight, createPos(r - 2, c - 1))
    board.addCheckingPiece(pieceColour, piece.knight, createPos(r - 2, c + 1))

    board.addCheckingPiece(pieceColour, piece.knight, createPos(r + 1, c + 2))
    board.addCheckingPiece(pieceColour, piece.knight, createPos(r - 1, c + 2))

    board.addCheckingPiece(pieceColour, piece.knight, createPos(r + 1, c - 2))
    board.addCheckingPiece(pieceColour, piece.knight, createPos(r - 1, c - 2))
}

function kingDangerScan(board, pieceColour, startPos) {
    const r = startPos.r;
    const c = startPos.c;

    board.addCheckingPiece(pieceColour, piece.king, createPos(r + 1, c - 1))
    board.addCheckingPiece(pieceColour, piece.king, createPos(r + 1, c ))
    board.addCheckingPiece(pieceColour, piece.king, createPos(r + 1, c + 1 ))

    board.addCheckingPiece(pieceColour, piece.king, createPos(r - 1, c - 1))
    board.addCheckingPiece(pieceColour, piece.king, createPos(r - 1, c ))
    board.addCheckingPiece(pieceColour, piece.king, createPos(r - 1, c + 1 ))

    board.addCheckingPiece(pieceColour, piece.king, createPos(r, c - 1))
    board.addCheckingPiece(pieceColour, piece.king, createPos(r, c + 1))
}

function plusDangerScan(board, cellPiece, pieceColour, startPos) {
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(0, 1))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(1, 0))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(0, -1))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(-1, 0))
}

function crossDangerScan(board, cellPiece, pieceColour, startPos) {
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(1, 1))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(1, -1))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(-1, 1))
    scanInDirection(board, cellPiece, pieceColour, startPos, createVec(-1, -1))
}
