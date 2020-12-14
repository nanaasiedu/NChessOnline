const piece = Object.freeze({
    none: "none",
    pawn: "pawn",
    knight: "knight",
    bishop: "bishop",
    rook: "rook",
    queen: "queen",
    king: "king"
})

const colour = Object.freeze({
    white: "white",
    black: "black"
})

function swapColour(col) {
    return col === colour.white ? colour.black : colour.white;
}

export { piece, colour, swapColour }


