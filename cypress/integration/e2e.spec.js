context('White wins', () => {
    beforeEach(() => {
        startNewGame()
    })

    it('mate in four', () => {
        runTestForLANPGNFile('cypress/fixtures/white-mate-in-four.pgn');
    })

    it('game 1', () => {
        runTestForLANPGNFile('cypress/fixtures/white-win-1.pgn');
    })
})

context('Black wins', () => {
    beforeEach(() => {
        startNewGame()
    })

    it('mate in four', () => {
        runTestForLANPGNFile('cypress/fixtures/black-mate-in-four.pgn');
    })
})

context('Draw', () => {
    beforeEach(() => {
        startNewGame();
    })

    it('stalemate', () => {
        runTestForLANPGNFile('cypress/fixtures/stalemate-1.pgn');
    })
})

function startNewGame() {
    cy.visit('http://localhost:8080')
    cy.get(`#new-game`).click()
}

function runTestForLANPGNFile(fileLocation) {
    cy.readFile(fileLocation).then((pgnText) => {
        runTestForLANPGN(pgnText)
    });
}

function runTestForLANPGN(pgnText) {
    let pgnItems = pgnText.split(" ");
    let moves = pgnItems.slice(0, -1);
    let result = pgnItems.slice(-1)[0].slice(0, -1);

    performMoves(moves);

    cy.get(`.score`).should('contain', result)
}

function performMoves(moves) {
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        let before = move.substring(0, 2);
        let after = move.substring(2, 4);

        cy.get(`#cell-${before}`).click()
        cy.get(`#cell-${after}`).click()

        if (i < moves.length - 1 ) {
            cy.get(`.score`).should('have.text', '')
        }
    }
}
