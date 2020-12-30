import {createPos} from "../models/position.js";

export const convertFileToIndex = (file) => file.charCodeAt(0) - 'a'.charCodeAt(0);
export const convertRankToIndex = (rank) => 8 - rank * 1;
export const convertIndexToRank = (r) => 8-r;
export const convertIndexToFile = (c) => String.fromCharCode('a'.charCodeAt(0) + c);
export const convertPosToChessPos = (pos) => `${convertIndexToFile(pos.c)}${convertIndexToRank(pos.r)}`
export const convertChessPosToPos = (chessPos) => createPos(
    convertRankToIndex(chessPos.charAt(1)), convertFileToIndex(chessPos.charAt(0))
)
