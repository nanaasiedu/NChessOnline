const cellId = (r, c) => `cell-${r}-${c}`

const setupDomBoard = function (board) {
    const boardElement = document.getElementById('board');

    for (let r = 0; r < board.getHeight(); r++) {
        const newRowElement = document.createElement('div');
        newRowElement.setAttribute('class', 'row');

        for (let c = 0; c < board.getWidth(); c++) {
            const newCellElement = document.createElement('div');
            newCellElement.classList.add('cell');
            newCellElement.id = cellId(r, c)
            addPieceToCell(board.getCell(createPos(r,c)), newCellElement);
            newCellElement.addEventListener("click", (event) => selectCell(event, r, c));
            newRowElement.appendChild(newCellElement);
        }

        boardElement.appendChild(newRowElement);
    }
}

const findCellElement = function (pos) {
    return document.querySelector(`#${cellId(pos.r,pos.c)}`)
}

const addPieceToCell = function(cellPiece, cellElement) {
    if (cellPiece.piece !== piece.none) {
        const pieceImage = document.createElement('img');
        pieceImage.src = `images/pieces/${cellPiece.colour}_${cellPiece.piece}.png`;
        pieceImage.style.maxHeight = '100%'
        pieceImage.style.maxWidth = '100%'
        cellElement.appendChild(pieceImage);
    }
}

const selectCell = function(event, pos) {
    let cellElement;

    if (event.target.classList.contains('cell')) {
        cellElement = event.target;
    } else {
        cellElement = event.target.parentElement;
    }

    cellElement.classList.add('selected');
}

const showDangerCells = function (board) {
    for (let r = 0; r < board.getHeight(); r++) {
        for(let c = 0; c < board.getWidth(); c++) {
            const pos = createPos(r,c);
            if (board.isCellChecked(pos, colour.white) || board.isCellChecked(pos, colour.black)) {
                findCellElement(pos).classList.add('selected')
            }
        }
    }
}
