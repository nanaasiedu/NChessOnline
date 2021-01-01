import {createCoordinate} from "../models/coordinate.js";

const convertFileToIndex = (file) => file.charCodeAt(0) - 'a'.charCodeAt(0);
const convertRankToIndex = (rank) => 8 - rank * 1;
const convertIndexToRank = (r) => 8-r;
const convertIndexToFile = (c) => String.fromCharCode('a'.charCodeAt(0) + c);
export const convertCoordinateToPosition = (coor) => `${convertIndexToFile(coor.c)}${convertIndexToRank(coor.r)}`
export const convertPositionToCoordinate = (pos) => {
    let matches = pos.match(/([a-h])([1-8])/)
    if (matches === null || matches[0] !== pos) throw new Error("Invalid position");
    return createCoordinate(convertRankToIndex(matches[2]), convertFileToIndex(matches[1]));
}

