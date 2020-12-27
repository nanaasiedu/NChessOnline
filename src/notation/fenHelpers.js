import {createPos} from "../models/position.js";
import {piece, colour} from "../models/piece.js";
import {Cell} from "../models/cell.js";
import {convertFileToIndex, convertRankToIndex} from "./chessNotationHelpers.js";

const fenRegex = /(.+) ([wb])/

function locationNotationToPosition(location) {
    let matches = location.match(/([a-h])([1-8])/)
    if (matches === null || matches[0] !== location) throw new Error("Invalid location");
    return createPos(convertRankToIndex(matches[2]), convertFileToIndex(matches[1]));
}

function getFENForBoard(rows, turnColour) {
    let fenRep = "";

    fenRep += convertBoardToFen(rows);
    fenRep += ` ${convertColourToFen(turnColour)}`

    return fenRep;
}

function convertBoardToFen(rows) {
    let fenRep = "";

    for (let r = 0; r < rows.length; r++) {
        fenRep += getFENForRow(rows[r]);

        if (r < rows.length - 1) fenRep += "/"
    }

    return fenRep;
}

function convertColourToFen(turnColour) {
    return turnColour === colour.white ? "w" : "b";
}

function convertCellToFen(cell) {
    const pieceToFenMap = {}
    pieceToFenMap[piece.pawn] = "p";
    pieceToFenMap[piece.bishop] = "b";
    pieceToFenMap[piece.knight] = "n";
    pieceToFenMap[piece.rook] = "r";
    pieceToFenMap[piece.queen] = "q";
    pieceToFenMap[piece.king] = "k";

    return cell.colour === colour.white
        ? pieceToFenMap[cell.piece].toUpperCase() : pieceToFenMap[cell.piece]
}

function convertFenToCell(fenPiece) {
    const fenToPieceMap = {}
    fenToPieceMap["p"] = piece.pawn;
    fenToPieceMap["b"] = piece.bishop;
    fenToPieceMap["n"] = piece.knight;
    fenToPieceMap["r"] = piece.rook;
    fenToPieceMap["q"] = piece.queen;
    fenToPieceMap["k"] = piece.king;

    const isWhite = fenPiece === fenPiece.toUpperCase();
    const cellPiece = fenToPieceMap[fenPiece.toLowerCase()];
    const cellColour = isWhite ? colour.white : colour.black;

    return new Cell(cellColour, cellPiece);
}

function getFENForRow(row) {
    let fenRowRep = ""
    let emptySpaceCount = 0;

    for (let c = 0; c < row.length; c++) {
        const cell = row[c];
        if (cell.piece === piece.none) {
            emptySpaceCount++;
            continue;
        }

        if (emptySpaceCount > 0) {
            fenRowRep += emptySpaceCount
            emptySpaceCount = 0;
        }

        const pieceRep = convertCellToFen(cell);

        fenRowRep += pieceRep;
    }

    if (emptySpaceCount > 0) {
        fenRowRep += emptySpaceCount
    }

    return fenRowRep;
}

function loadFENBoard(fen) {
    const BOARD_WIDTH = 8;
    const BOARD_HEIGHT = 8;
    const rows = Array(BOARD_HEIGHT);

    const isNumeric = (c) => c >= '0' && c <= '9';

    let fenOffset = 0;
    for (let r = 0; r < rows.length; r++) {
        rows[r] = Array(BOARD_WIDTH);
        let emptySpaceSeen = 0;

        for (let c = 0; c < rows[r].length; c++) {
            let curFENPiece = fen.charAt(fenOffset);

            if (curFENPiece === '/') {
                fenOffset++;
                curFENPiece = fen.charAt(fenOffset);
            }

            if (isNumeric(curFENPiece)) {
                rows[r][c] = new Cell(undefined, piece.none);
                emptySpaceSeen++;

                if (emptySpaceSeen === curFENPiece * 1) {
                    fenOffset++;
                    emptySpaceSeen = 0;
                }

                continue;
            }

            rows[r][c] = convertFenToCell(curFENPiece);
            fenOffset++;
        }
    }

    return rows;
}

function loadFENIsWhiteTurn(fen) {
    const match = fen.match(fenRegex);
    return match === null || match[2] === "w";
}

export { loadFENIsWhiteTurn, loadFENBoard, locationNotationToPosition, getFENForBoard }