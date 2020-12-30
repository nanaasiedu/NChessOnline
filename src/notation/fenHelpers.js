import {createPos} from "../models/position.js";
import {piece, colour} from "../models/piece.js";
import {Cell} from "../models/cell.js";
import {convertFileToIndex, convertRankToIndex, convertChessPosToPos, convertPosToChessPos} from "./chessNotationHelpers.js";

const fenRegex = /(.+)\s([wb])\s?([K|Q|k|q]{1,4}|-)?\s?(.+)?/

function locationNotationToPosition(location) {
    let matches = location.match(/([a-h])([1-8])/)
    if (matches === null || matches[0] !== location) throw new Error("Invalid location");
    return createPos(convertRankToIndex(matches[2]), convertFileToIndex(matches[1]));
}

function getFENForBoard(rows, turnColour,
                        canWhiteCastleKingSide,
                        canWhiteCastleQueenSide,
                        canBlackCastleKingSide,
                        canBlackCastleQueenSide,
                        enpassantPosition
) {
    let fenRep = "";

    fenRep += convertBoardToFen(rows);
    fenRep += ` ${convertColourToFen(turnColour)}`
    fenRep += ` ${convertCastlingToFen(canWhiteCastleKingSide, canWhiteCastleQueenSide, canBlackCastleKingSide, canBlackCastleQueenSide)}`
    fenRep += ` ${convertEnpassantToFen(enpassantPosition)}`
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

function convertCastlingToFen(canWhiteCastleKingSide, canWhiteCastleQueenSide, canBlackCastleKingSide, canBlackCastleQueenSide) {
    const rep = `${canWhiteCastleKingSide ? "K" : ""}${canWhiteCastleQueenSide ? "Q" : ""}${canBlackCastleKingSide ? "k" : ""}${canBlackCastleQueenSide ? "q" : ""}`;
    return rep === "" ? "-" : rep;
}

function convertEnpassantToFen(enpassantPosition) {
    return enpassantPosition === undefined ? '-' : convertPosToChessPos(enpassantPosition);
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

function loadFENCastlingQueenSide(fen, playerColour, rows) {
    const playerRow = playerColour === colour.white ? rows.length - 1 : 0;
    const isQueenSideRookInPosition = rows[playerRow][0].piece === piece.rook;
    const isKingInPosition = rows[playerRow][4].piece === piece.king;
    return isQueenSideRookInPosition && isKingInPosition && loadFenCastling(fen, "q", playerColour)
}

function loadFENCastlingKingSide(fen, playerColour, rows) {
    const playerRow = playerColour === colour.white ? rows.length - 1 : 0;
    const isKingSideRookInPosition = rows[playerRow][rows[0].length - 1].piece === piece.rook;
    const isKingInPosition = rows[playerRow][4].piece === piece.king;
    return isKingSideRookInPosition && isKingInPosition && loadFenCastling(fen, "k", playerColour)
}

function loadFenCastling(fen, castlingRep, playerColour) {
    const repChar = playerColour === colour.white ? castlingRep.toUpperCase() : castlingRep;
    const match = fen.match(fenRegex);

    return match === null || match[3] === undefined || match[3].includes(repChar);
}

function loadFENEnpassantPosition(fen) {
    const match = fen.match(fenRegex);
    if (match === null || match[4] === undefined || match[4] === '-') {
        return undefined;
    }

    return convertChessPosToPos(match[4]);
}

export { loadFENEnpassantPosition, loadFENCastlingQueenSide, loadFENCastlingKingSide, loadFENIsWhiteTurn, loadFENBoard, locationNotationToPosition, getFENForBoard }