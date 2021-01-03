// danger scan methods

import {createCoordinate} from "../models/coordinate.js";
import {colour, piece, swapColour} from "../models/piece.js";
import {createVec, Vector} from "../models/vector.js";

function dangerScanBoard(board) {
    board.clearCellsCheckProperties();

    for (let r = 0; r < board.getHeight(); r++) {
        for (let c = 0; c < board.getWidth(); c++) {
            dangerScanFromCoor(board, createCoordinate(r, c))
        }
    }
}

function dangerScanFromCoor(board, startCoor) {
    const checkingCell = board.getCell(startCoor)
    const opponentColour = swapColour(checkingCell.colour);
    const checkStateBeforeScan = board.isKingChecked(opponentColour);

    const cellScanMethod = cellScanMethodMap[checkingCell.piece];
    cellScanMethod(board, checkingCell.colour, startCoor, addCheckToCell)

    if (!checkStateBeforeScan && board.isKingChecked(opponentColour)) {
        board.setCheckingCoor(startCoor);
    }

}

const cellScanMethodMap = {
    none: () => {},
    pawn:  pawnDangerScan,
    knight: knightScan,
    bishop: (board, pieceColour, startCoor, scanMethod) => (crossScan(board, piece.bishop, pieceColour, startCoor, scanMethod)),
    rook: (board, pieceColour, startCoor, scanMethod) => (plusScan(board, piece.rook, pieceColour, startCoor, scanMethod)),
    queen: (board, pieceColour, startCoor, scanMethod) => {
        plusScan(board, piece.queen, pieceColour, startCoor, scanMethod)
        crossScan(board, piece.queen, pieceColour, startCoor, scanMethod)
    },
    king: kingScan
}

// scan methods

function scanInDirection(board, cellPiece, pieceColour, startCoor, directionVec, scanMethod) {
    const {vx, vy} = {vx: directionVec.x, vy: directionVec.y};
    const {r, c} = { r: startCoor.r, c: startCoor.c};

    let i = 1;
    while (board.legalCoordinate(createCoordinate(r + i * vy, c + i * vx))) {
        const curCoor = createCoordinate(r + i * vy, c + i * vx);
        scanMethod(board, pieceColour, cellPiece, curCoor, directionVec);

        if (board.pieceAtCell(curCoor) !== piece.none) {
            return;
        }

        i++;
    }
}

function pawnDangerScan(board, pieceColour, startCoor, scanMethod) {
    const r = startCoor.r;
    const c = startCoor.c;

    if (pieceColour === colour.white) {
        scanMethod(board, pieceColour, piece.pawn, createCoordinate(r - 1, c - 1), createVec(-1, -1))
        scanMethod(board, pieceColour, piece.pawn, createCoordinate(r - 1, c + 1), createVec(-1, 1))
    } else {
        scanMethod(board, pieceColour, piece.pawn, createCoordinate(r + 1, c - 1), createVec(1, -1))
        scanMethod(board, pieceColour, piece.pawn, createCoordinate(r + 1, c + 1), createVec(1, 1))
    }
}

function pawnMoveScan(board, pieceColour, startCoor, scanMethod) {
    if (pieceColour === colour.white && board.legalCoordinate(startCoor.addR(-1)) && board.isCellEmpty(startCoor.addR(-1))) {
        scanMethod(board, pieceColour, piece.pawn, startCoor.addR(-1))

        if (startCoor.r === board.getHeight() - 2 && board.legalCoordinate(startCoor.addR(-2)) && board.isCellEmpty(startCoor.addR(-2))) {
            scanMethod(board, pieceColour, piece.pawn, startCoor.addR(-2));
        }
    } else if (pieceColour === colour.black && board.legalCoordinate(startCoor.addR(1)) && board.isCellEmpty(startCoor.addR(1))) {
        scanMethod(board, pieceColour, piece.pawn, startCoor.addR(1))

        if (startCoor.r === 1 && board.legalCoordinate(startCoor.addR(2)) && board.isCellEmpty(startCoor.addR(2))) {
            scanMethod(board, pieceColour, piece.pawn, startCoor.addR(2));
        }
    }
}

function knightScan(board, pieceColour, startCoor, scanMethod) {
    const r = startCoor.r;
    const c = startCoor.c;

    scanMethod(board, pieceColour, piece.knight, createCoordinate(r + 2, c - 1))
    scanMethod(board, pieceColour, piece.knight, createCoordinate(r + 2, c + 1))

    scanMethod(board, pieceColour, piece.knight, createCoordinate(r - 2, c - 1))
    scanMethod(board, pieceColour, piece.knight, createCoordinate(r - 2, c + 1))

    scanMethod(board, pieceColour, piece.knight, createCoordinate(r + 1, c + 2))
    scanMethod(board, pieceColour, piece.knight, createCoordinate(r - 1, c + 2))

    scanMethod(board, pieceColour, piece.knight, createCoordinate(r + 1, c - 2))
    scanMethod(board, pieceColour, piece.knight, createCoordinate(r - 1, c - 2))
}

function kingScan(board, pieceColour, startCoor, scanMethod) {
    const r = startCoor.r;
    const c = startCoor.c;

    scanMethod(board, pieceColour, piece.king, createCoordinate(r + 1, c - 1))
    scanMethod(board, pieceColour, piece.king, createCoordinate(r + 1, c ))
    scanMethod(board, pieceColour, piece.king, createCoordinate(r + 1, c + 1 ))

    scanMethod(board, pieceColour, piece.king, createCoordinate(r - 1, c - 1))
    scanMethod(board, pieceColour, piece.king, createCoordinate(r - 1, c ))
    scanMethod(board, pieceColour, piece.king, createCoordinate(r - 1, c + 1 ))

    scanMethod(board, pieceColour, piece.king, createCoordinate(r, c - 1))
    scanMethod(board, pieceColour, piece.king, createCoordinate(r, c + 1))
}

function plusScan(board, cellPiece, pieceColour, startCoor, scanMethod) {
    scanInDirection(board, cellPiece, pieceColour, startCoor, createVec(0, 1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startCoor, createVec(1, 0), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startCoor, createVec(0, -1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startCoor, createVec(-1, 0), scanMethod)
}

function crossScan(board, cellPiece, pieceColour, startCoor, scanMethod) {
    scanInDirection(board, cellPiece, pieceColour, startCoor, createVec(1, 1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startCoor, createVec(1, -1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startCoor, createVec(-1, 1), scanMethod)
    scanInDirection(board, cellPiece, pieceColour, startCoor, createVec(-1, -1), scanMethod)
}

// Mark methods

function markPossibleMoves(board, Coor) {
    const cell = board.getCell(Coor);

    if (cell === undefined || cell.piece === piece.none) return;

    const cellScanMethod = cellScanMethodMap[cell.piece];
    cellScanMethod(board, cell.colour, Coor, addPossibleMove)

    if (cell.piece === piece.pawn) {
        pawnMoveScan(board, cell.colour, Coor, addPossibleMove)
    }
}

// board scan methods

function addCheckToCell(board, pieceColour, cellPiece, curCoor, directionVec) {
    board.checkCell(pieceColour, curCoor);

    const curCell = board.getCell(curCoor);
    if (curCell === undefined) return;

    if (cellPiece === piece.pawn) {
        board.setPieceAsCheckedByPawn(pieceColour, curCoor)
    }

    if (cellPiece === piece.king) {
        board.setPieceAsCheckedByKing(pieceColour, curCoor);
    } else if (curCell.piece !== piece.none && curCell.colour === swapColour(pieceColour) && directionVec !== undefined) {
        const enemyKingCoor = board.getKingCoor(swapColour(pieceColour));
        const directionToKing = Vector.makeDirectionVec(curCoor, enemyKingCoor);
        if (directionToKing.equals(directionVec) && isPathBetweenEmpty(board, curCoor, enemyKingCoor)) {
            board.setCellAsPinned(curCoor);
        }
    }
}

function addPossibleMove(board, pieceColour, cellPiece, curCoor, directionVec) {
    if (!board.legalCoordinate(curCoor)) return;
    if (cellPiece === piece.none) return;
    if (cellPiece === piece.pawn &&
        board.isCellEmpty(curCoor) &&
        directionVec !== undefined &&
        !board.canEnpassant(curCoor)) return;
    if (cellPiece === piece.king && board.isCellChecked(curCoor, pieceColour)) return;

    if (board.isCellEmpty(curCoor)) {
        board.setMovePossibleOnCell(curCoor);
        return;
    }

    if (board.colourAtCell(curCoor) !== pieceColour) {
        if (cellPiece === piece.pawn && directionVec === undefined) return;
        board.setMovePossibleOnCell(curCoor);
    }
}

function isCellBlockableInDirection(board, defendingCoor, defendingColour) {
    const attackingCoor = board.getCheckingCoor();
    if (attackingCoor === undefined) {
        return true;
    }

    const directionVec = Vector.makeDirectionVec(attackingCoor, defendingCoor);
    const {vx, vy} = {vx: directionVec.x, vy: directionVec.y};
    const {r, c} = { r: attackingCoor.r, c: attackingCoor.c};

    let i = 1;
    while (board.legalCoordinate(createCoordinate(r + i * vy, c + i * vx))) {
        const curCoor = createCoordinate(r + i * vy, c + i * vx);

        if (board.pieceAtCell(curCoor) !== piece.none) {
            return false;
        }

        if (board.canCellBeTakenByColour(curCoor, defendingColour)) {
            return true;
        }

        i++;
    }

    return false;
}

function isPathBetweenEmpty(board, startCoor, endCoor) {
    const directionVec = Vector.makeDirectionVec(startCoor, endCoor);
    const {vx, vy} = {vx: directionVec.x, vy: directionVec.y};
    const {r, c} = { r: startCoor.r, c: startCoor.c};

    let i = 1;
    while (board.legalCoordinate(createCoordinate(r + i * vy, c + i * vx))) {
        const curCoor = createCoordinate(r + i * vy, c + i * vx);

        if (curCoor.equals(endCoor)) return true;

        if (board.pieceAtCell(curCoor) !== piece.none) {
            return false;
        }

        i++;
    }

    return false;
}

function canPinnedPieceMove(board, Coor) {
    if (!board.isCellPinned(Coor)) return true;
    const cell = board.getCell(Coor);
    const kingCoor = board.getKingCoor(cell.colour);
    const directionVec = Vector.makeDirectionVec(Coor, kingCoor);

    if (cell.piece === piece.knight) return false;
    if (cell.piece === piece.pawn && !directionVec.isDiagonal() && cell.colour === colour.white &&
        board.isCellEmpty(Coor.addR(-1)))
        return true;
    if (cell.piece === piece.pawn && !directionVec.isDiagonal() && cell.colour === colour.black &&
        board.isCellEmpty(Coor.addR(1)))
        return true;
    if (cell.piece === piece.bishop && directionVec.isDiagonal() &&
        (board.isCellEmpty(Coor.add(directionVec)) || board.isCellEmpty(Coor.add(directionVec.neg()))))
        return true;
    if (cell.piece === piece.rook && !directionVec.isDiagonal() &&
        (board.isCellEmpty(Coor.add(directionVec)) || board.isCellEmpty(Coor.add(directionVec.neg()))))
        return true;
    if (cell.piece === piece.queen &&
        (board.isCellEmpty(Coor.add(directionVec)) || board.isCellEmpty(Coor.add(directionVec.neg()))))
        return true;

}

export { dangerScanBoard, markPossibleMoves, isCellBlockableInDirection, canPinnedPieceMove }
