import { piece } from "./models/piece.js";
import {createPos} from "./models/position.js";
import {convertPosToChessPos} from "./notation/chessNotationHelpers.js";

const cellId = (r, c) => `cell-${convertPosToChessPos(createPos(r, c))}`

function setupDomBoard(board, gameManager) {
    const boardElement = document.getElementById('board');

    for (let r = 0; r < board.getHeight(); r++) {
        const newRowElement = document.createElement('div');
        newRowElement.setAttribute('class', 'row');

        for (let c = 0; c < board.getWidth(); c++) {
            const newCellElement = document.createElement('div');
            newCellElement.classList.add('cell');
            newCellElement.id = cellId(r, c);
            newCellElement.addEventListener("click", (event) => selectCell(event, gameManager, r, c));
            newRowElement.appendChild(newCellElement);
        }

        boardElement.appendChild(newRowElement);
    }
}

function drawBoard(board) {
    for (let r = 0; r < board.getHeight(); r++) {
        for (let c = 0; c < board.getWidth(); c++) {
            addPieceToCell(createPos(r,c), board);
        }
    }
}

function findCellElement(pos) {
    return document.querySelector(`#${cellId(pos.r,pos.c)}`)
}

function addPieceToCell(pos, board) {
    unhighlightCell(pos);
    const cell = board.getCell(pos);
    const cellElement = findCellElement(pos);

    const currentPieceImageElement = cellElement.querySelector('img')
    if (currentPieceImageElement) {
        currentPieceImageElement.remove();
    }

    if (cell.piece !== piece.none) {
        const pieceImage = document.createElement('img');
        pieceImage.src = `images/pieces/${cell.colour}_${cell.piece}.png`;
        pieceImage.style.maxHeight = '100%'
        pieceImage.style.maxWidth = '100%'
        cellElement.appendChild(pieceImage);
    }
}

function selectCell(event, gameManager, r, c) {
    gameManager.selectCell(createPos(r,c))
}

function highlightCell (pos) {
    const cellElement = findCellElement(pos);
    cellElement.classList.add('selected');
}

function unhighlightCell (pos) {
    const cellElement = findCellElement(pos);
    cellElement.classList.remove('selected');
}

function displayResult(whiteScore, blackScore) {
    document.querySelector('.score').textContent = `${whiteScore}-${blackScore}`
}

export { displayResult, setupDomBoard, drawBoard, addPieceToCell, highlightCell, unhighlightCell }
