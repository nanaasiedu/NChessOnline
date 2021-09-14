$(document).ready(function() {
    $.get( "http://localhost:8000/match/", function( response ) {
        const gameCardsElement = $('.game-cards');
        for (let match of response.matches) {
            const newGameCardElement = $(`<a class="game-card" href="/pages/game.html?id=${match.id}">${match.name}</a>`)
            gameCardsElement.append(newGameCardElement)
        }
    });
})