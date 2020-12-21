import {createPos} from "./models/position.js";
import {piece} from "./models/piece.js";
import {canPinnedPieceMove, markPossibleMoves, isCellBlockableInDirection} from "./scanHelpers.js";

function canColourMove(curColour, board) {
    for (let r = 0; r < board.getHeight(); r++) {
        for (let c = 0; c < board.getWidth(); c++) {
            const curPos = createPos(r, c);
            const curCell = board.getCell(curPos);
            if (curCell.piece === piece.none || curCell.colour !== curColour) continue;

            // TODO: Move down into board
            markPossibleMoves(board, curPos)
            if (board.isAnyCellMovable()) {
                if (board.isCellPinned(curPos) && !canPinnedPieceMove(board, curPos)) {
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

export function isCheckMate(board, turnColour, checkingPiecePos) {
    if (!board.isKingChecked(turnColour)) return false;
    if (board.canKingMove(turnColour, checkingPiecePos)) return false;
    if (board.isKingDoubleChecked(turnColour)) return true;
    if (isCellBlockableInDirection(board,
        checkingPiecePos,
        board.getKingPos(turnColour),
        turnColour)) return false;
    return !board.canCellBeTakenByColour(checkingPiecePos, turnColour);
}

export function isDraw(curColour, board) {
    return !canColourMove(curColour, board) || board.hasInsufficientMaterial();
}