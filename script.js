window.onload = function () {
    const board = new Board();
    setupDomBoard(board);
    initialDangerScan(board);

    for (let r = 0; r < 8; r++) {
        for(let c = 0; c < 8; c++) {
            const pos = createPos(r,c);
            if (board.isCellChecked(pos, colour.white) || board.isCellChecked(pos, colour.black)) {
                findCellElement(pos).classList.add('selected')
            }
        }
    }
}
