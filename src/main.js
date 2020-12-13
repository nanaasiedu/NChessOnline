import {GameManager} from "./gameManager.js";
import {Board} from "./model.js";

window.onload = function () {
    const board = new Board();
    const gameManager = new GameManager(board);
    gameManager.startGame();
}
