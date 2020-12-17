context('White wins', () => {
    beforeEach(() => {
        cy.visit('http://localhost:8080')
    })

    it('game 1', () => {
        cy.get('#cell-6-0').click()
    })
})

