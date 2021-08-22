import { piece } from "./models/piece.js";
import {createCoordinate} from "./models/coordinate.js";
import {convertCoordinateToPosition} from "./notation/chessNotationHelpers.js";

const cellId = (r, c) => `cell-${convertCoordinateToPosition(createCoordinate(r, c))}`

function setupDomBoard(board, gameManager) {

    for (let r = 0; r < board.getHeight(); r++) {
        const newRowElement = $('<div class="row"></div>');

        for (let c = 0; c < board.getWidth(); c++) {
            const newCellElement = $(`<div class="cell idle" id="${cellId(r, c)}"></div>`);
            newCellElement.click((event) => selectCell(event, gameManager, r, c));
            newRowElement.append(newCellElement);
        }

        $('#board').append(newRowElement);
    }
}

function drawBoard(board) {
    for (let r = 0; r < board.getHeight(); r++) {
        for (let c = 0; c < board.getWidth(); c++) {
            addPieceToCell(createCoordinate(r,c), board);
        }
    }
}

function findCellElement(pos) {
    return $(`#${cellId(pos.r,pos.c)}`)
}

function addPieceToCell(pos, board) {
    unhighlightCell(pos);
    const cell = board.getCell(pos);
    const cellElement = findCellElement(pos);

    const currentPieceImageElement = cellElement.find('img')
    if (currentPieceImageElement) {
        currentPieceImageElement.remove();
    }

    if (cell.piece !== piece.none) {
        const pieceImage = $(`<img src="/images/pieces/${cell.colour}_${cell.piece}.png"/>`);
        pieceImage.css('maxHeight', '100%')
        pieceImage.css('maxWidth', '100%')
        cellElement.append(pieceImage);
    }
}

function selectCell(event, gameManager, r, c) {
    gameManager.selectCell(createCoordinate(r,c))
}

function highlightCell (pos) {
    findCellElement(pos).addClass('selected');
}

function highlightCellAsError(pos) {
    let element = findCellElement(pos);
    element.addClass("error");
    element.removeClass("idle");

    setTimeout(function(){
        element.addClass("idle");
        element.removeClass("error");
    }, 0.5*1000);
}

function unhighlightCell (pos) {
    findCellElement(pos).removeClass('selected');
}

function displayResult(whiteScore, blackScore) {
    $('.score').text(`${whiteScore}-${blackScore}`)
}

export { displayResult, setupDomBoard, drawBoard, addPieceToCell, highlightCell, unhighlightCell, highlightCellAsError }
