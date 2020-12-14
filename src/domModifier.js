import { piece } from "./models/piece.js";
import {createPos} from "./models/position.js";
import {colour} from "./models/piece.js";

const cellId = (r, c) => `cell-${r}-${c}`

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
    const cellPiece = board.getCell(pos);
    const cellElement = findCellElement(pos);

    const currentPieceImageElement = cellElement.querySelector('img')
    if (currentPieceImageElement) {
        currentPieceImageElement.remove();
    }

    if (cellPiece.piece !== piece.none) {
        const pieceImage = document.createElement('img');
        pieceImage.src = `images/pieces/${cellPiece.colour}_${cellPiece.piece}.png`;
        pieceImage.style.maxHeight = '100%'
        pieceImage.style.maxWidth = '100%'
        cellElement.appendChild(pieceImage);
    }

    if (board.isCellMovable(pos)) {
        highlightCell(pos);
    } else {
        unhighlightCell(pos);
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

function showDangerCells(board) {
    for (let r = 0; r < board.getHeight(); r++) {
        for(let c = 0; c < board.getWidth(); c++) {
            const pos = createPos(r,c);
            if (board.isCellChecked(pos, colour.white) || board.isCellChecked(pos, colour.black)) {
                findCellElement(pos).classList.add('selected')
            }
        }
    }
}

export { setupDomBoard, drawBoard, addPieceToCell, highlightCell, unhighlightCell, showDangerCells }
