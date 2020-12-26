class Cell {
    constructor(cellColour, cellPiece) {
        this.colour = cellColour;
        this.piece = cellPiece;

        this.numberOfWhiteChecks = 0;
        this.numberOfBlackChecks = 0;
        this.checkedByWhiteKing = false;
        this.checkedByBlackKing = false;
        this.checkedByWhitePawn = false;
        this.checkedByBlackPawn = false;

        this.pinnedToking = false;
        this.movePossible = false;
    }
}

export { Cell }