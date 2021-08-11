import {GameManager} from "./gameManager.js";
import {Board} from "./models/board.js";

$(document).ready(function() {
    const board = new Board();
    const gameManager = new GameManager(board);
    gameManager.startGame();
})
