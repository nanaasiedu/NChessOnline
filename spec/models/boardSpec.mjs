import {Board} from "../../src/models/board.js";
import {colour} from "../../src/models/piece.js";

describe("Board", function () {
    let board;

    describe("board creation", function () {
        it("should default to starting chess positions", function () {
            board = new Board();
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            expect(getFenTurnRep(board)).toEqual("w");
            expect(getFenCastlingRep(board)).toEqual("KQkq");
        })

        it("should be able to load FEN with turn defaults", function () {
            board = new Board("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR");
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR");
            expect(getFenTurnRep(board)).toEqual("w");
        })

        it("should be able to load FEN with turn set", function () {
            board = new Board("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR b");
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR");
            expect(getFenTurnRep(board)).toEqual("b");
        })

        it("should be able to load FEN with turn & castling positions set", function () {
            board = new Board("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR b Kq");
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR");
            expect(getFenTurnRep(board)).toEqual("b");
            expect(getFenCastlingRep(board)).toEqual("Kq");
        })

        it("should be able to load FEN with castling if the relevant pieces are in castling positions", function () {
            board = new Board("r3k2r/8/8/8/8/8/8/R3K2R");
            expect(getFenCastlingRep(board)).toEqual("KQkq");

            board = new Board("r3k2r/8/8/8/8/8/8/R3K3"); // Move White King-side Rook
            expect(getFenCastlingRep(board)).toEqual("Qkq");

            board = new Board("r3k2r/8/8/8/8/8/R7/4K2R b KQkq"); // Move White Queen-side Rook
            expect(getFenCastlingRep(board)).toEqual("Kkq"); // Notice: "Q" was ignored in input

            board = new Board("r3k2r/8/8/8/8/8/4K3/R6R b KQkq"); // Move White King
            expect(getFenCastlingRep(board)).toEqual("kq"); // Notice: "KQ" was ignored in input

            board = new Board("r3kr2/8/8/8/8/8/8/R3K2R"); // Move Black King-side Rook
            expect(getFenCastlingRep(board)).toEqual("KQq");

            board = new Board("4k2r/8/8/8/8/8/8/R3K2R b kq"); // Move Black Queen-side Rook
            expect(getFenCastlingRep(board)).toEqual("k");  // Notice: "q" was ignored in input
                                                                     // "KQ" was accepted in input despite white castling positions

            board = new Board("r6r/4k3/8/8/8/8/8/R3K2R b KQkq"); // Move Black King
            expect(getFenCastlingRep(board)).toEqual("KQ"); // Notice: "kq" was ignored in input
        })
    })

    describe("turns", function () {
        it("getCurrentTurnColour returns white when no colour has been set nor move played", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            expect(board.getCurrentTurnColour()).toEqual(colour.white);
        })

        it("getCurrentTurnColour alternates colours when a move is made", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            board.movePiece("a2", "a3")
            expect(board.getCurrentTurnColour()).toEqual(colour.black);
            expect(getFenTurnRep(board)).toEqual("b");
            board.movePiece("a7", "a6")
            expect(board.getCurrentTurnColour()).toEqual(colour.white);
            expect(getFenTurnRep(board)).toEqual("w");
        })
    })

    describe("piece movement", function () {
        it("should allow pawn movements", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            movePieceAndAssertBoard(board, "d2", "d4", "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR"); // white - 2 moves
            movePieceAndAssertBoard(board, "e7", "e5", "rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR") // black - 2 moves
            movePieceAndAssertBoard(board, "c2", "c3", "rnbqkbnr/pppp1ppp/8/4p3/3P4/2P5/PP2PPPP/RNBQKBNR") // white - 1 move
            movePieceAndAssertBoard(board, "f7", "f6", "rnbqkbnr/pppp2pp/5p2/4p3/3P4/2P5/PP2PPPP/RNBQKBNR") // black - 1 move
            movePieceAndAssertBoard(board, "d4", "e5", "rnbqkbnr/pppp2pp/5p2/4P3/8/2P5/PP2PPPP/RNBQKBNR") // white takes black
            movePieceAndAssertBoard(board, "f6", "e5", "rnbqkbnr/pppp2pp/8/4p3/8/2P5/PP2PPPP/RNBQKBNR") // black takes white
        })

        it("should allow rook movements", function () {
            board = new Board("k7/p7/8/r7/7R/8/P7/K7");

            movePieceAndAssertBoard(board, "h4", "a4", "k7/p7/8/r7/R7/8/P7/K7");
            movePieceAndAssertBoard(board, "a5", "h5", "k7/p7/8/7r/R7/8/P7/K7");

            expect(function () { board.movePiece("a4", "a2") }).toThrow(new Error("Illegal Move")); // Can't take friendly

            movePieceAndAssertBoard(board, "a4", "a5", "k7/p7/8/R6r/8/8/P7/K7");
            movePieceAndAssertBoard(board, "h5", "h4", "k7/p7/8/R7/7r/8/P7/K7");

            expect(function () { board.movePiece("a5", "a8") }).toThrow(new Error("Illegal Move")); // Can't move pass piece

            movePieceAndAssertBoard(board, "a5", "a7", "k7/R7/8/8/7r/8/P7/K7");
        })

        it("should allow bishop movements", function () {
            board = new Board("1k6/1p6/8/3b4/4B3/8/6P1/6K1");

            expect(function () { board.movePiece("e4", "g2") }).toThrow(new Error("Illegal Move")); // Can't take friendly

            movePieceAndAssertBoard(board, "e4", "f3", "1k6/1p6/8/3b4/8/5B2/6P1/6K1");
            movePieceAndAssertBoard(board, "d5", "f7", "1k6/1p3b2/8/8/8/5B2/6P1/6K1");

            expect(function () { board.movePiece("f3", "a8") }).toThrow(new Error("Illegal Move")); // Can't move pass piece

            movePieceAndAssertBoard(board, "f3", "b7", "1k6/1B3b2/8/8/8/8/6P1/6K1");
            movePieceAndAssertBoard(board, "f7", "a2", "1k6/1B6/8/8/8/8/b5P1/6K1");
        })

        it("should allow knight movements", function () {
            board = new Board("k7/1N5p/2P5/P7/7p/5p2/P5n1/7K");
            expect(function () { board.movePiece("b7", "a5") }).toThrow(new Error("Illegal Move")); // Can't take friendly
            movePieceAndAssertBoard(board, "b7", "c5", "k7/7p/2P5/P1N5/7p/5p2/P5n1/7K");
            movePieceAndAssertBoard(board, "g2", "f4", "k7/7p/2P5/P1N5/5n1p/5p2/P7/7K");
            movePieceAndAssertBoard(board, "c5", "e4", "k7/7p/2P5/P7/4Nn1p/5p2/P7/7K");
            movePieceAndAssertBoard(board, "f4", "d5", "k7/7p/2P5/P2n4/4N2p/5p2/P7/7K");
            movePieceAndAssertBoard(board, "e4", "g5", "k7/7p/2P5/P2n2N1/7p/5p2/P7/7K");
            movePieceAndAssertBoard(board, "d5", "b4", "k7/7p/2P5/P5N1/1n5p/5p2/P7/7K");
            movePieceAndAssertBoard(board, "g5", "h7", "k7/7N/2P5/P7/1n5p/5p2/P7/7K");
            movePieceAndAssertBoard(board, "b4", "a2", "k7/7N/2P5/P7/7p/5p2/n7/7K");
        })

        it("should allow queen movements", function () {
            board = new Board("7k/1q4p1/2P5/8/8/8/6Q1/K7");
            expect(function () { board.movePiece("g2", "c6") }).toThrow(new Error("Illegal Move")); // Can't take friendly
            expect(function () { board.movePiece("g2", "a8") }).toThrow(new Error("Illegal Move")); // Can't move pass
            movePieceAndAssertBoard(board, "g2", "d5", "7k/1q4p1/2P5/3Q4/8/8/8/K7");

            expect(function () { board.movePiece("b7", "g7") }).toThrow(new Error("Illegal Move")); // Can't take friendly
            expect(function () { board.movePiece("b7", "h7") }).toThrow(new Error("Illegal Move")); // Can't move pass
            movePieceAndAssertBoard(board, "b7", "f7", "7k/5qp1/2P5/3Q4/8/8/8/K7");
            movePieceAndAssertBoard(board, "d5", "c4", "7k/5qp1/2P5/8/2Q5/8/8/K7");
            movePieceAndAssertBoard(board, "f7", "f3", "7k/6p1/2P5/8/2Q5/5q2/8/K7");
            movePieceAndAssertBoard(board, "c4", "e2", "7k/6p1/2P5/8/8/5q2/4Q3/K7");
            movePieceAndAssertBoard(board, "f3", "c3", "7k/6p1/2P5/8/8/2q5/4Q3/K7");
            movePieceAndAssertBoard(board, "e2", "b2", "7k/6p1/2P5/8/8/2q5/1Q6/K7");
            movePieceAndAssertBoard(board, "c3", "c6", "7k/6p1/2q5/8/8/8/1Q6/K7");
            movePieceAndAssertBoard(board, "b2", "g7", "7k/6Q1/2q5/8/8/8/8/K7");


        })

        it("should allow king movements", function () {
            board = new Board("8/1k6/8/8/8/8/6K1/8");
            movePieceAndAssertBoard(board, "g2", "g3", "8/1k6/8/8/8/6K1/8/8");
            movePieceAndAssertBoard(board, "b7", "b6", "8/8/1k6/8/8/6K1/8/8");
            movePieceAndAssertBoard(board, "g3", "f4", "8/8/1k6/8/5K2/8/8/8");
            movePieceAndAssertBoard(board, "b6", "c5", "8/8/8/2k5/5K2/8/8/8");
            movePieceAndAssertBoard(board, "f4", "e4", "8/8/8/2k5/4K3/8/8/8");
            movePieceAndAssertBoard(board, "c5", "d6", "8/8/3k4/8/4K3/8/8/8");
            movePieceAndAssertBoard(board, "e4", "d3", "8/8/3k4/8/8/3K4/8/8");
            movePieceAndAssertBoard(board, "d6", "e6", "8/8/4k3/8/8/3K4/8/8");
        })
    })

    describe("invalid moves", function () {
        it("should throw an error on invalid positions", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            expect(function () { board.movePiece("invalid", "z10") }).toThrow(new Error("Invalid location"));
            expect(function () { board.movePiece("a9", "a2") }).toThrow(new Error("Invalid location"));
            expect(function () { board.movePiece("a1", "b9") }).toThrow(new Error("Invalid location"));
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

        it("should throw an error if the move will leave king in check", function () {
            board = new Board("7k/q2q2q1/4n3/2QQQ3/q1QKQ1q1/2QQQ3/8/q2q2q1");
            expect(function () { board.movePiece("d5", "e6") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e5", "e6") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e4", "f3") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e3", "f3") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("d3", "e2") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("c3", "c2") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("c4", "b3") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("c5", "c6") }).toThrow(new Error("Illegal Move"));

            board = new Board("8/5k2/8/8/2PPp3/2PKP3/2PPP3/8");
            expect(function () { board.movePiece("d4", "d5") }).toThrow(new Error("Illegal Move"));
        })

        it("should throw an error when moving a colour off turn", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            expect(function () { board.movePiece("a7", "a6") }).toThrow(new Error("Illegal Move"));
            board.movePiece("a2", "a3");
            expect(function () { board.movePiece("a3", "a4") }).toThrow(new Error("Illegal Move"));
            board.movePiece("a7", "a6");
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/1ppppppp/p7/8/8/P7/1PPPPPPP/RNBQKBNR");
        })
    })

    // TODO: Enpassant

    // TODO: Castling
    describe("castling moves", function () {
        it("should allow all castling moves by default", function () {

        });

    })

})

function movePieceAndAssertBoard(board, startPos, destPos, expectedFEN) {
    board.movePiece(startPos, destPos);
    expect(getFenBoardRep(board)).toEqual(expectedFEN);
}

const fenRegex = /(.+) ([wb]) ?(.+)?/

function getFenBoardRep(board) {
    return board.getFEN().match(fenRegex)[1];
}

function getFenTurnRep(board) {
    return board.getFEN().match(fenRegex)[2];
}

function getFenCastlingRep(board) {
    return board.getFEN().match(fenRegex)[3];
}