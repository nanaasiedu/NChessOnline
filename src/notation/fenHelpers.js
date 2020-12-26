import {createPos} from "../models/position.js";
import {piece} from "../models/piece.js";
import {colour} from "../models/piece.js";

const convertFileToIndex = (file) => file.charCodeAt(0) - 'a'.charCodeAt(0);
const convertRankToIndex = (rank) => 8 - rank * 1;

function locationNotationToPosition(location) {
    let matches = location.match(/([a-h])([1-8])/)
    if (matches === null || matches[0] !== location) throw new Error("Invalid location");
    return createPos(convertRankToIndex(matches[2]), convertFileToIndex(matches[1]));
}

function getFENForBoard(board) {
    let fenRep = "";

    for (let r = 0; r < board.getHeight(); r++) {
        fenRep += getFENForRow(board, r);
    }

    return fenRep;
}

function getFenCellRep(cell) {
    const pieceRepMap = {}
    pieceRepMap[piece.pawn] = "p";
    pieceRepMap[piece.bishop] = "b";
    pieceRepMap[piece.knight] = "n";
    pieceRepMap[piece.rook] = "r";
    pieceRepMap[piece.queen] = "q";
    pieceRepMap[piece.king] = "k";

    return cell.colour === colour.white
        ? pieceRepMap[cell.piece].toUpperCase() : pieceRepMap[cell.piece]
}

function getFENForRow(board, r) {
    let fenRowRep = ""
    let emptySpaceCount = 0;

    for (let c = 0; c < board.getWidth(); c++) {
        const cell = board.getCell(createPos(r, c));
        if (cell.piece === piece.none) {
            emptySpaceCount++;
            continue;
        }

        if (emptySpaceCount > 0) {
            fenRowRep += emptySpaceCount
            emptySpaceCount = 0;
        }

        const pieceRep = getFenCellRep(cell);

        fenRowRep += pieceRep;
    }

    if (emptySpaceCount > 0) {
        fenRowRep += emptySpaceCount
    }

    if (r < board.getWidth() - 1) {
        fenRowRep += "/"
    }

    return fenRowRep;
}

export { locationNotationToPosition, getFENForBoard }