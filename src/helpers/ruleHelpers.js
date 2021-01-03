import {createCoordinate} from "../models/coordinate.js";
import {piece} from "../models/piece.js";
import {markPossibleMoves, isCellBlockableInDirection} from "./scanHelpers.js";

function canColourMove(board) {
    const turnColour = board.getCurrentTurnColour();

    for (let r = 0; r < board.getHeight(); r++) {
        for (let c = 0; c < board.getWidth(); c++) {
            const curPos = createCoordinate(r, c);
            const curCell = board.getCell(curPos);
            if (curCell.piece === piece.none || curCell.colour !== turnColour) continue;

            // TODO: Move down into board
            markPossibleMoves(board, curPos)
            if (board.isAnyCellMovable()) {
                // if (!canPinnedPieceMove(board, curPos)) { TODO: Test
                //     board.clearPossibleMoves();
                //     continue;
                //
                // }
                board.clearPossibleMoves();
                return true;
            }
        }
    }

    return false;
}

export function isCheckMate(board) {
    const turnColour = board.getCurrentTurnColour();

    if (!board.isKingChecked(turnColour)) return false;
    if (board.canKingMove(turnColour)) return false;
    if (board.isKingDoubleChecked(turnColour)) return true;
    if (isCellBlockableInDirection(board,
        board.getKingCoor(turnColour),
        turnColour)) return false;
    return !board.canCheckingCellBeTaken();
}

export function isDraw(board) {
    return !canColourMove(board) || board.hasInsufficientMaterial();
}