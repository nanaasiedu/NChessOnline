import {Board} from "../../src/models/board.js";
import {isCheckMate, isDraw} from "../../src/helpers/ruleHelpers.js";

describe("check mate", function () {
    it("doesnt occur when king is not checked", function () {
        assertCheckMate("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w", false);
        assertCheckMate("4r3/8/r2b4/3K4/7q/8/8/2q3k1 w", false);

        assertCheckMate("rnbqkbnr/pppppppp/8/8/8/N7/PPPPPPPP/R1BQKBNR b", false);
        assertCheckMate("4r3/8/r2b4/3K4/7q/8/8/2q3k1 b", false);
    })

    it("doesnt occur when king is checked but can can move", function () {
        assertCheckMate("rnbqk2r/ppp3pp/8/8/1b6/8/PPP2PPP/RNBQKBNR w", false);
        assertCheckMate("rnbqkbnr/ppp3pp/8/1B1N4/8/8/PPPPPPPP/R1BQK1NR b", false);
    })

    it("doesnt occur when king is checked but the check can be blocked", function () {
        assertCheckMate("4k3/8/8/8/q7/8/1PP5/KN6 w", false);
        assertCheckMate("4k3/8/8/8/r7/8/1PP5/KN6 w", false);
        assertCheckMate("4k3/8/8/8/N2b4/8/P1P5/KN6 w", false);

        assertCheckMate("6nk/6p1/8/7Q/8/8/8/4K3 b", false);
        assertCheckMate("6nk/6p1/8/7R/8/8/8/4K3 b", false);
        assertCheckMate("6nk/7p/7b/4B3/8/8/8/4K3 b", false);
    })

    it("doesnt occur when king is checked but checking piece can be taken", function () {
        assertCheckMate("8/8/8/8/8/4k3/3q3R/3K4 w", false);

        assertCheckMate("3k4/3Q3r/2K5/8/8/8/8/8 b", false);
    })

    it("occurs when king can not escape check", function () {
        assertCheckMate("8/8/8/8/8/4k3/3q4/3K4 w", true);
        assertCheckMate("rnb1k1nr/pppp1ppp/3Np3/2b5/8/7P/PPPPPqP1/R1BQKBNR w", true);

        assertCheckMate("3k4/3Q4/2K5/8/8/8/8/8 b", true);
        assertCheckMate("r1bqkbnr/ppp2Qpp/2np4/4p3/2B5/4P3/PPPP1PPP/RNB1K1NR b", true);

        assertCheckMate("8/PkPP4/1Q5R/3B4/8/8/8/8 b", true);
        assertCheckMate("3k4/8/8/7b/8/2qr4/7R/3K4 w", true);
    })

    function assertCheckMate(fen, result) {
        const board = new Board(fen);
        const fenBeforeAction = board.getFEN();
        expect(isCheckMate(board)).toEqual(result);
        expect(board.getFEN()).toEqual(fenBeforeAction);
    }
})

describe("draw", function () {
    it("doesnt occur when player has legal move", function () {
        assertDraw("1q6/5ppb/4p1k1/4b1Pp/7P/7K/8/8 w", false);
        assertDraw("8/7R/8/8/3K4/8/PpPB4/k7 b", false);

        assertDraw("1q6/5ppb/4p1k1/4b2p/7P/3P2pK/6P1/8 w", false);
        assertDraw("8/7R/8/8/3K4/1P3p2/Pp1B4/k7 b", false);
    })

    it("occurs when player doesnt have any legal move", function () {
        assertDraw("1q6/5ppb/4p1k1/4b2p/3p3P/3P2pK/6P1/8 w", true);
        assertDraw("8/7R/8/8/3K1P2/1P3p2/Pp1B4/k7 b", true);
    })

    it("occurs when there are insufficient material", function () {

    })

    function assertDraw(fen, result) {
        const board = new Board(fen);
        const fenBeforeAction = board.getFEN();
        expect(isDraw(board)).toEqual(result);
        expect(board.getFEN()).toEqual(fenBeforeAction);
    }
})