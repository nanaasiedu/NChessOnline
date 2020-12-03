window.onload = function () {
    const board = new Board();
    const gameManager = new GameManager(board);
    gameManager.startGame();
}
