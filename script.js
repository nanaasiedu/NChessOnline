const initialDangerScan = function(board) {
    for (let r = 0; r < 8; r++) {
        for(let c = 0; c < 8; c++) {
            dangerScan(board, r, c)
        }
    }
}

window.onload = function () {
    const board = new Board();
    setupDomBoard(board);
    initialDangerScan(board);

    for (let r = 0; r < 8; r++) {
        for(let c = 0; c < 8; c++) {
            if (board.getCell(r, c).whiteCheckingPieces.length !== 0 || board.getCell(r, c).blackCheckingPieces.length !== 0) {
                findCellElement(r,c).classList.add('selected')
            }
        }
    }
}
