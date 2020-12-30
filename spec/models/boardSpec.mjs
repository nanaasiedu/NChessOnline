import {Board} from "../../src/models/board.js";
import {colour} from "../../src/models/piece.js";

describe("Board", function () {
    let board;

    describe("board creation", function () {
        it("should default to starting chess positions", function () {
            board = new Board();
            expect(board.getFEN()).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -");
        })

        it("should be able to load FEN board with defaults", function () {
            board = new Board("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR");
            expect(board.getFEN()).toEqual("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR w KQkq -");
        })

        it("should be able to load FEN with turn set", function () {
            board = new Board("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR b");
            expect(board.getFEN()).toEqual("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR b KQkq -");
        })

        it("should be able to load FEN with turn & castling positions set", function () {
            board = new Board("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR b Kq");
            expect(board.getFEN()).toEqual("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR b Kq -");
        })

        it("should be able to load full FEN", function () {
            board = new Board("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR b K e3");
            expect(board.getFEN()).toEqual("rnbqkbnr/8/pppppppp/8/8/PPPPPPPP/8/RNBQKBNR b K e3");
        })

        it("should be able to load FEN with castling if the relevant pieces are in castling positions", function () {
            board = new Board("r3k2r/8/8/8/8/8/8/R3K2R");
            expect(getFenCastlingRep(board)).toEqual("KQkq");

            board = new Board("r3k2r/8/8/8/8/8/8/R3K2R w -");
            expect(getFenCastlingRep(board)).toEqual("-");

            board = new Board("8/r3k2r/8/8/8/8/R3K2R/8 w KQkq"); // Move all relevant pieces
            expect(getFenCastlingRep(board)).toEqual("-");

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
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b K e3");
            expect(function () { board.movePiece("a3", "a4") }).toThrow(new Error("Illegal Move"));
            expect(board.getFEN()).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b K e3");
        })

        it("should throw an error when the selected piece can not move to the destination", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Q e6");
            expect(function () { board.movePiece("a2", "b2") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("b1", "c4") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e1", "e6") }).toThrow(new Error("Illegal Move"));
            expect(board.getFEN()).toEqual("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w Q e6");
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

        it("should not alter state of board when illegal move is thrown", function () {
            board = new Board("4k3/1P6/q7/2Pp4/K7/8/8/8 w - d6");
            // Normal move
            expect(function () { board.movePiece("c5", "c6") }).toThrow(new Error("Illegal Move"));
            expect(board.getFEN()).toEqual("4k3/1P6/q7/2Pp4/K7/8/8/8 w - d6");
            // Pawn enpassant
            expect(function () { board.movePiece("c5", "d6") }).toThrow(new Error("Illegal Move"));
            expect(board.getFEN()).toEqual("4k3/1P6/q7/2Pp4/K7/8/8/8 w - d6");
            // Pawn promotion
            expect(function () { board.movePiece("b7", "b8") }).toThrow(new Error("Illegal Move"));
            expect(board.getFEN()).toEqual("4k3/1P6/q7/2Pp4/K7/8/8/8 w - d6");
        })

        it("should throw an error when moving other players pieces", function () {
            board = new Board("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
            expect(function () { board.movePiece("a7", "a6") }).toThrow(new Error("Illegal Move"));
            board.movePiece("a2", "a3");
            expect(function () { board.movePiece("a3", "a4") }).toThrow(new Error("Illegal Move"));
            board.movePiece("a7", "a6");
            expect(getFenBoardRep(board)).toEqual("rnbqkbnr/1ppppppp/p7/8/8/P7/1PPPPPPP/RNBQKBNR");
        })
    })

    describe("Promotion", function () {
        it ("promotes pawns to queens when they reach the end of the board", function () {
            board = new Board("8/1P4k1/8/8/8/8/1K4p1/8 w - -");
            board.movePiece("b7","b8");
            expect(board.getFEN()).toEqual("1Q6/6k1/8/8/8/8/1K4p1/8 b - -");
            board.movePiece("g2","g1");
            expect(board.getFEN()).toEqual("1Q6/6k1/8/8/8/8/1K6/6q1 w - -");

        })
    })

    describe("enpassant moves", function () {
        it("should allow enpassant when pawn moves two spaces", function () {
            board = new Board("3k4/4p3/8/3P4/1p6/8/2P5/4K3 b - -");
            board.movePiece("e7", "e5"); // White enpassant
            expect(getFenEnpassantRep(board)).toEqual("e6");
            movePieceAndAssertBoard(board, "d5", "e6", "3k4/8/4P3/8/1p6/8/2P5/4K3");
            expect(getFenEnpassantRep(board)).toEqual("-");

            board.movePiece("d8", "e8");

            board.movePiece("c2", "c4"); // Black enpassant
            expect(getFenEnpassantRep(board)).toEqual("c3");
            movePieceAndAssertBoard(board, "b4", "c3", "4k3/8/4P3/8/8/2p5/8/4K3");
            expect(getFenEnpassantRep(board)).toEqual("-");
        });

        it("should disallow enpassant if player doesnt use it", function () {
            board = new Board("3k4/4p3/8/3P4/2p3pP/8/1P6/4K3 b - -");
            expect(function () { board.movePiece("g4", "h3") }).toThrow(new Error("Illegal Move"));

            board.movePiece("e7", "e5"); // Black offers enpassant
            board.movePiece("b2", "b4")  // White ignores offer and offers another enpassant
            board.movePiece("d8", "e8"); // Black Ignores offer

            expect(function () { board.movePiece("d5", "e6") }).toThrow(new Error("Illegal Move"));
            board.movePiece("d5", "d6");
            expect(function () { board.movePiece("c4", "b3") }).toThrow(new Error("Illegal Move"));
        })
    })

    describe("castling moves", function () {
        it("should allow castling moves when the castling path is clear and unchecked", function () {
            board = new Board("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq");
            movePieceAndAssertBoard(board, "e1", "g1", "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R4RK1");
            expect(getFenCastlingRep(board)).toEqual("kq"); // white king side
            movePieceAndAssertBoard(board, "e8", "g8", "r4rk1/pppppppp/8/8/8/8/PPPPPPPP/R4RK1");
            expect(getFenCastlingRep(board)).toEqual("-"); // black king side

            board = new Board("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq");
            movePieceAndAssertBoard(board, "e1", "c1", "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/2KR3R");
            expect(getFenCastlingRep(board)).toEqual("kq"); // white queen side
            movePieceAndAssertBoard(board, "e8", "c8", "2kr3r/pppppppp/8/8/8/8/PPPPPPPP/2KR3R");
            expect(getFenCastlingRep(board)).toEqual("-"); // black queen side

            // Special: can rook can pass through check when castling
            board = new Board("r3k2r/1R6/8/8/8/8/1r6/R3K2R w KQkq");
            movePieceAndAssertBoard(board, "e1", "c1", "r3k2r/1R6/8/8/8/8/1r6/2KR3R");
            expect(getFenCastlingRep(board)).toEqual("kq"); // white queen side
            board = new Board("r3k2r/1R6/8/8/8/8/1r6/R3K2R b KQkq");
            movePieceAndAssertBoard(board, "e8", "c8", "2kr3r/1R6/8/8/8/8/1r6/R3K2R");
            expect(getFenCastlingRep(board)).toEqual("KQ"); // black queen side
        });

        it("should not allow castling moves when path is checked", function () {
            board = new Board("r3k2r/8/2B5/2r2r2/8/8/8/R3K2R w KQkq");
            expect(function () { board.movePiece("e1", "g1") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e1", "c1") }).toThrow(new Error("Illegal Move"));

            board = new Board("r3k2r/8/2B5/2r2r2/8/8/8/R3K2R b KQkq");
            expect(function () { board.movePiece("e1", "g1") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e1", "c1") }).toThrow(new Error("Illegal Move"));

            board = new Board("r3k2r/8/2R2R2/8/8/2b5/8/R3K2R w KQkq");
            expect(function () { board.movePiece("e1", "g1") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e1", "c1") }).toThrow(new Error("Illegal Move"));

            board = new Board("r3k2r/8/2R2R2/8/8/2b5/8/R3K2R b KQkq");
            expect(function () { board.movePiece("e1", "g1") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e1", "c1") }).toThrow(new Error("Illegal Move"));
        });

        it("should not allow castling moves when path is blocked", function () {
            board = new Board("r1b1k1nr/8/8/8/8/8/8/RN2KB1R w KQkq");
            expect(function () { board.movePiece("e1", "g1") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e1", "c1") }).toThrow(new Error("Illegal Move"));

            board = new Board("r1b1k1nr/8/8/8/8/8/8/RN2KB1R b KQkq");
            expect(function () { board.movePiece("e8", "g8") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e8", "c8") }).toThrow(new Error("Illegal Move"));
        });

        it("should not allow castling moves when relevant pieces have moved", function () {
            board = new Board("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w -");
            expect(function () { board.movePiece("e1", "g1") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e1", "c1") }).toThrow(new Error("Illegal Move"));

            board = new Board("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R b -");
            expect(function () { board.movePiece("e8", "g8") }).toThrow(new Error("Illegal Move"));
            expect(function () { board.movePiece("e8", "c8") }).toThrow(new Error("Illegal Move"));
        });

    })

})

function movePieceAndAssertBoard(board, startPos, destPos, expectedFEN) {
    board.movePiece(startPos, destPos);
    expect(getFenBoardRep(board)).toEqual(expectedFEN);
}

const fenRegex = /(.+)\s([wb])\s?([K|Q|k|q]{1,4}|-)?\s?(.+)?/

function getFenBoardRep(board) {
    return board.getFEN().match(fenRegex)[1];
}

function getFenTurnRep(board) {
    return board.getFEN().match(fenRegex)[2];
}

function getFenCastlingRep(board) {
    return board.getFEN().match(fenRegex)[3];
}

function getFenEnpassantRep(board) {
    return board.getFEN().match(fenRegex)[4];
}