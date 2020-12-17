context('White wins', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8080')
    })

    it('Quick checkmate', () => {
        runTestForLANPGNFile('cypress/fixtures/white-quick-checkmate.pgn');
    })

    xit('game 1', () => {
        runTestForLANPGNFile('cypress/fixtures/white-win-1.pgn');
    })
})

function runTestForLANPGNFile(fileLocation) {
    cy.readFile(fileLocation).then((pgnText) => {
        let pgnItems = pgnText.split(" ");
        let moves = pgnItems.slice(0, -1);
        let result = pgnItems.slice(-1)[0];

        for (let move of moves) {
            let before = move.substring(0, 2);
            let after = move.substring(2, 4);

            cy.get(`#cell-${before}`).click()
            cy.get(`#cell-${after}`).click()
        }

        cy.get(`.score`).should('contain', result)
    })
}

