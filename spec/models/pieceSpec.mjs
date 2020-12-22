import {swapColour, colour} from "../../src/models/piece.js";

describe("Piece", function() {
    it("returns alternate colour of input", function() {
        expect(swapColour(colour.white)).toEqual(colour.black);
        expect(swapColour(colour.black)).toEqual(colour.white);
    })

})