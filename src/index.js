import {GameManager} from "./gameManager.js";
import {Board} from "./models/board.js";

window.onload = function () {
    const board = new Board("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq");
    const gameManager = new GameManager(board);
    gameManager.startGame();
}
