import {GameManager} from "./gameManager.js";
import {Board} from "./models/board.js";

$(document).ready(function() {
    const params = new URLSearchParams(window.location.search)
    const matchId = params.get('id')

    $.get(`http://localhost:8000/match/${matchId}`, function( response ) {
        const board = new Board(response.state);
        const gameManager = new GameManager(board, matchId);
        gameManager.startGame();
    });
})
