const piece = {
    none: "none",
    pawn: "pawn",
    knight: "knight",
    bishop: "bishop",
    rook: "rook",
    queen: "queen"
}

let createBoard = function() {
    let rows = Array(8);

    for (let r = 0; r < rows.length; r++) {
        rows[r] = Array(8);

        if (r === 1 || r === 6) {
            fillRow(rows[r], piece.pawn);
        }

        if (r > 1 || r < 6) {
            fillRow(rows[r], piece.none);
        }

    }

    return rows;
}

let fillRow = function(row, piece) {
    for (let c = 0; c < row.length; c++) {
        row[c] = {
            piece
        }
    }
}

let setupBoard = function(board) {
    const boardElement = document.getElementById('board');
    console.log(boardElement);

    for (let row of board) {
        const newRowElement = document.createElement('div')
        newRowElement.setAttribute('class', 'row')

        for (let cell of row) {
            const newCellElement = document.createElement('div')
            newCellElement.textContent = ' '
            newCellElement.setAttribute('class', 'cell')

            newRowElement.appendChild(newCellElement);
        }

        boardElement.appendChild(newRowElement);
    }
}

board = createBoard()

window.onload = function() {
    setupBoard(board);
}
