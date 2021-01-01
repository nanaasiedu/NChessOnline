import {createCoordinate} from "../models/coordinate.js";
import {piece} from "../models/piece.js";
import {canPinnedPieceMove, markPossibleMoves, isCellBlockableInDirection} from "./scanHelpers.js";

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
                if (!canPinnedPieceMove(board, curPos)) {
                    board.clearPossibleMoves();
                    continue;

                }
                board.clearPossibleMoves();
                return true;
            }
        }
    }

    return false;
}

export function isCheckMate(board, checkingPiecePos) {
    const turnColour = board.getCurrentTurnColour();

    if (!board.isKingChecked(turnColour)) return false;
    if (board.canKingMove(turnColour, checkingPiecePos)) return false;
    if (board.isKingDoubleChecked(turnColour)) return true;
    if (isCellBlockableInDirection(board,
        checkingPiecePos,
        board.getKingCoor(turnColour),
        turnColour)) return false;
    return !board.canCellBeTakenByColour(checkingPiecePos, turnColour);
}

export function isDraw(board) {
    return !canColourMove(board) || board.hasInsufficientMaterial();
}