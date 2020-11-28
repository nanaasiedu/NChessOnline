window.onload = function () {
    const board = new Board();
    setupDomBoard(board);
    initialDangerScan(board);

    for (let r = 0; r < 8; r++) {
        for(let c = 0; c < 8; c++) {
            const pos = createPos(r,c);
            if (board.getCell(pos).whiteCheckingPieces.length !== 0 || board.getCell(pos).blackCheckingPieces.length !== 0) {
                findCellElement(pos).classList.add('selected')
            }
        }
    }
}
