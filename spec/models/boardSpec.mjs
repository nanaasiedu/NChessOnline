import {Board} from "../../src/models/board.js";

describe("Board", function () {
    let board;

    it("should default to starting chess positions", function () {
        board = new Board();
        expect(getFenBoardRep(board)).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    })

    it("should be able to load FEN from constructor", function () {
        board = new Board("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR");
        expect(getFenBoardRep(board)).toEqual("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR");
    })

    describe("piece movement", function () {
        it("should allow pawn movements", function () {
            board = new Board();
            movePieceAndAssertBoard(board, "d2", "d4", "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR"); // white - 2 moves
            movePieceAndAssertBoard(board, "e7", "e5", "rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR") // black - 2 moves
            movePieceAndAssertBoard(board, "c2", "c3", "rnbqkbnr/pppp1ppp/8/4p3/3P4/2P5/PP2PPPP/RNBQKBNR") // white - 1 move
            movePieceAndAssertBoard(board, "f7", "f6", "rnbqkbnr/pppp2pp/5p2/4p3/3P4/2P5/PP2PPPP/RNBQKBNR") // black - 1 move
            movePieceAndAssertBoard(board, "d4", "e5", "rnbqkbnr/pppp2pp/5p2/4P3/8/2P5/PP2PPPP/RNBQKBNR") // white takes black
            movePieceAndAssertBoard(board, "f6", "e5", "rnbqkbnr/pppp2pp/8/4p3/8/2P5/PP2PPPP/RNBQKBNR") // black takes white
        })
    })

    describe("invalid moves", function () {
        it("should throw an error on invalid positions", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            expect(function () { board.movePiece("invalid", "z10") }).toThrow(new Error("Invalid location"));
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
        })

        it("should throw an error when there is no piece on the starting position", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            expect(function () { board.movePiece("a3", "a4") }).toThrow(new Error("Illegal Move"));
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
        })

        it("should throw an error when the selected piece can not move to the destination", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            expect(function () { board.movePiece("a2", "b2") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("b1", "c4") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e1", "e6") }).toThrow(new Error("Illegal Move"));
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
        })

        it("should throw an error if the move will leave the friendly king in check", function () {
            board = new Board("8/p7/k7/r7/R7/K7/7P/8");
            expect(function () { board.movePiece("a4", "b4") }).toThrow(new Error("Illegal Move")); // Can't move rook as it protects king
            expect(getFenBoardRep(board)).toEqual("8/p7/k7/r7/R7/K7/7P/8");
        })

        // it("should throw an error when moving a colour off turn", function () {
        //     board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
        //     expect(board.movePiece("a7", "a6").toThrow(new Error("Illegal Move")));
        //     board.movePiece("a2", "a3");
        //     expect(board.movePiece("a3", "a4").toThrow(new Error("Illegal Move")));
        //     board.movePiece("a7", "a6");
        //     expect(getFenBoardRep(board)).toEqual("rnbqkbnr/1ppppppp/p7/8/8/P7/1PPPPPPP/RNBQKBNR");
        // })
    })

    // TODO: Enpassant

})

function movePieceAndAssertBoard(board, startPos, destPos, expectedFEN) {
    board.movePiece(startPos, destPos);
    expect(getFenBoardRep(board)).toEqual(expectedFEN);
}

function getFenBoardRep(board) {
    return board.getFEN().substring(0, 71);
}