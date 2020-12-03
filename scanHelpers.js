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
    cellScanMethod(board, threateningCell.colour, startPos, addCheckToCell)
}

const cellScanMethodMap = {
    none: () => {},
    pawn:  pawnDangerScan,
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

    let i = 1;
    while (board.legalPosition(createPos(r + i * vy, c + i * vx))) {
        const curPos = createPos(r + i * vy, c + i * vx);
        scanMethod(board, pieceColour, cellPiece, curPos, directionVec);

        if (board.pieceAtCell(curPos) !== piece.none) {
            return;
        }

        i++;
    }
}

function pawnDangerScan(board, pieceColour, startPos, scanMethod) {
    const r = startPos.r;
    const c = startPos.c;

    if (pieceColour === colour.white) {
        scanMethod(board, pieceColour, piece.pawn, createPos(r - 1, c - 1), createVec(-1, -1))
        scanMethod(board, pieceColour, piece.pawn, createPos(r - 1, c + 1), createVec(-1, 1))
    } else {
        scanMethod(board, pieceColour, piece.pawn, createPos(r + 1, c - 1), createVec(1, -1))
        scanMethod(board, pieceColour, piece.pawn, createPos(r + 1, c + 1), createVec(1, 1))
    }
}

function pawnMoveScan(board, pieceColour, startPos, scanMethod) {
    if (pieceColour === colour.white && board.legalPosition(startPos.addR(-1)) && board.isCellEmpty(startPos.addR(-1))) {
        scanMethod(board, pieceColour, piece.pawn, startPos.addR(-1))

        if (startPos.r === board.getHeight() - 2 && board.legalPosition(startPos.addR(-2)) && board.isCellEmpty(startPos.addR(-2))) {
            scanMethod(board, pieceColour, piece.pawn, startPos.addR(-2));
        }
    } else if (pieceColour === colour.black && board.legalPosition(startPos.addR(1)) && board.isCellEmpty(startPos.addR(1))) {
        scanMethod(board, pieceColour, piece.pawn, startPos.addR(1))

        if (startPos.r === 1 && board.legalPosition(startPos.addR(2)) && board.isCellEmpty(startPos.addR(2))) {
            scanMethod(board, pieceColour, piece.pawn, startPos.addR(2));
        }
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
    const cell = board.getCell(pos);
    if (cell.piece === piece.none) {
        return false;
    }

    const cellScanMethod = cellScanMethodMap[cell.piece];
    cellScanMethod(board, cell.colour, pos, addPossibleMove)

    if (cell.piece === piece.pawn) {
        pawnMoveScan(board, cell.colour, pos, addPossibleMove)
    }
}

// board scan methods

function addCheckToCell(board, pieceColour, cellPiece, curPos, directionVec) {
    board.checkCell(pieceColour, curPos);
}

function addPossibleMove(board, pieceColour, cellPiece, curPos, directionVec) {
    if (!board.legalPosition(curPos)) return;
    if (cellPiece === piece.none) return;
    if (cellPiece === piece.pawn && board.isCellEmpty(curPos) && directionVec !== undefined) return;

    if (board.isCellEmpty(curPos)) {
        board.setMovePossibleOnCell(curPos);
        return;
    }

    if (board.colourAtCell(curPos) !== pieceColour) {
        if (cellPiece === piece.pawn && directionVec === undefined) return;
        if (cellPiece === piece.king && board.isCellChecked(curPos, pieceColour)) return;
        board.setMovePossibleOnCell(curPos);
    }

}
