const piece = {
    none: "none",
    pawn: "pawn",
    knight: "knight",
    bishop: "bishop",
    rook: "rook",
    queen: "queen",
    king: "king"
}

const colour = {
    white: "white",
    black: "black"
}

const createBoard = function () {
    let rows = Array(8);

    for (let r = 0; r < rows.length; r++) {
        rows[r] = Array(8);

        if (r > 1 && r < 6) {
            fillRow(rows[r], {
                piece: piece.none
            });
        }
    }

    const defaultBoardCellPiece = (colour, piece) => ({
        colour: colour,
        piece: piece,
        whiteCheckingPieces: [],
        blackCheckingPieces: []
    })

    fillRow(rows[1], {colour: colour.black, piece: piece.pawn});
    fillRow(rows[6], {colour: colour.white, piece: piece.pawn});

    // blackCheckingPieces: [ { piece: piece.rook, nextCheck: { row: col: } } ]
    rows[0][0] = {colour: colour.black, piece: piece.rook}
    rows[0][7] = {colour: colour.black, piece: piece.rook}
    rows[0][1] = {colour: colour.black, piece: piece.knight}
    rows[0][6] = {colour: colour.black, piece: piece.knight}
    rows[0][2] = {colour: colour.black, piece: piece.bishop}
    rows[0][5] = {colour: colour.black, piece: piece.bishop}
    rows[0][3] = {colour: colour.black, piece: piece.queen}
    rows[0][4] = {colour: colour.black, piece: piece.king}

    rows[7][0] = {colour: colour.white, piece: piece.rook}
    rows[7][7] = {colour: colour.white, piece: piece.rook}
    rows[7][1] = {colour: colour.white, piece: piece.knight}
    rows[7][6] = {colour: colour.white, piece: piece.knight}
    rows[7][2] = {colour: colour.white, piece: piece.bishop}
    rows[7][5] = {colour: colour.white, piece: piece.bishop}
    rows[7][3] = {colour: colour.white, piece: piece.queen}
    rows[7][4] = {colour: colour.white, piece: piece.king}

    return rows;
}

const fillRow = function (row, cellPiece) {
    for (let c = 0; c < row.length; c++) {
        row[c] = cellPiece
    }
}

const cellId = (r, c) => `cell-${r}-${c}`

const setupBoard = function (board) {
    const boardElement = document.getElementById('board');

    for (let r = 0; r < board.length; r++) {
        const newRowElement = document.createElement('div');
        newRowElement.setAttribute('class', 'row');

        for (let c = 0; c < board[r].length; c++) {
            const newCellElement = document.createElement('div');
            newCellElement.classList.add('cell');
            newCellElement.id = cellId(r, c)
            addPieceToCell(board[r][c], newCellElement);
            newCellElement.addEventListener("click", (event) => selectCell(event, r, c));
            newRowElement.appendChild(newCellElement);
        }

        boardElement.appendChild(newRowElement);
    }
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

const dangerScan = function (cellPiece, r, c) {
    if (cellPiece.piece === piece.pawn && cellPiece.colour === colour.white) {

    }
}

const initialDangerScan = function() {
    for (let r = 0; r < 8; r++) {
        for(let c = 0; c < 8; c++) {
            dangerScan(board, r, c)
        }
    }

}

const selectCell = function(event, r, c) {
    let cellElement;

    if (event.target.classList.contains('cell')) {
        cellElement = event.target;
    } else {
        cellElement = event.target.parentElement;
    }

    cellElement.classList.add('selected');
}

board = createBoard()

window.onload = function () {
    setupBoard(board);
    initialDangerScan()
}
