window.onload = function () {
    const board = new Board();
    const gameManager = new GameManager(board);

    setupDomBoard(board, gameManager);
    initialDangerScan(board);
    drawBoard(board);
}
