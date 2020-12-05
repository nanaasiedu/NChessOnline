class GameManager {
    constructor(board) {
        this.board = board;

        this.currentTurnColour = colour.white;
        this.currentGameState = gameState.NORMAL;
        this.currentSelectedPos = undefined;

        this.checkingPiecePos = undefined;
    }

    startGame() {
        setupDomBoard(this.board, this);
        dangerScanBoard(this.board);
        drawBoard(this.board);
    }

    selectCell(pos) {
        if (this.currentGameState === gameState.NORMAL) {
            this._normalStateMove(pos);
        } else if (this.currentGameState === gameState.PENDING_MOVE) {
            this._pendingStateMove(pos);

            console.log(this.board);
            if (!this._canColourMove() || this.board.hasInsufficientMaterial()){
                this.currentGameState = gameState.STALE_MATE;
                alert("STAKEMATE! DRAW")
            }
        }
    }

    _canColourMove() {
        for (let r = 0; r < this.board.getHeight(); r++) {
            for (let c = 0; c < this.board.getWidth(); c++) {
                const curPos = createPos(r, c);
                const curCell = this.board.getCell(curPos);
                if (curCell.piece === piece.none || curCell.colour !== this.currentTurnColour) continue;

                markPossibleMoves(this.board, curPos)
                console.log(curCell)
                console.log(1)
                if (this.board.isAnyCellMovable()) {
                    console.log(2)
                    if (this.board.isCellPinned(curPos) && !canPinnedPieceMove(this.board, curPos)) {
                        console.log(3)
                        this.board.clearPossibleMoves();
                        continue;

                    }
                    this.board.clearPossibleMoves();
                    console.log(4)

                    return true;
                }
            }
        }

        return false;
    }

    _isCurrentKingChecked() {
        return this.board.isKingChecked(this.currentTurnColour);
    }

    _normalStateMove(pos) {
        const cell = this.board.getCell(pos);
        if (cell.colour !== this.currentTurnColour || cell.piece === piece.none) {
            alert("Illegal move!")
            return;
        }

        markPossibleMoves(this.board, pos);

        if (cell.piece === piece.king) {
            this._markPossibleCastlingMoves()
        }

        if (!this.board.isAnyCellMovable()) {
            alert("Piece can't move");
            return;
        }

        drawBoard(this.board);
        highlightCell(pos);
        this.currentSelectedPos = pos;
        this.currentGameState = gameState.PENDING_MOVE;
    }

    _markPossibleCastlingMoves() {
        if (this.board.canKingLeftCastle(this.currentTurnColour)) {
            this.board.setMovePossibleOnCell(this.board.getKingPos(this.currentTurnColour).add(createVec(-2, 0)));
        }

        if (this.board.canKingRightCastle(this.currentTurnColour)) {
            this.board.setMovePossibleOnCell(this.board.getKingPos(this.currentTurnColour).add(createVec(2, 0)));
        }
    }

    _pendingStateMove(pos) {
        if (pos.equals(this.currentSelectedPos)) {
            this._switchToNormalMode();
            return;
        }

        if (!this.board.isCellMovable(pos)) {
            alert("Illegal Move!");
            return;
        }

        const movingCell = this.board.getCell(this.currentSelectedPos);
        const dyingCell = this.board.getCell(pos);
        this.board.setCell(movingCell, pos)
        this.board.removePieceAtCell(this.currentSelectedPos);

        // Enpassant
        if (movingCell.piece === piece.pawn) {
            const pawnDirection = Vector.makeDirectionVec(this.currentSelectedPos, pos);
            const isPawnAttacking = pawnDirection.x !== 0;
            if (dyingCell.piece === piece.none && isPawnAttacking) {
                this.board.removePieceAtCell(pos.addR(-pawnDirection.y));
            }
        }

        this._movePossibleRookCastleMove(pos, movingCell)

        dangerScanBoard(this.board);

        if (this._isCurrentKingChecked()) {
            alert("Illegal move king would be checked!");

            this.board.setCell(dyingCell, pos);
            this.board.setCell(movingCell, this.currentSelectedPos);

            return;
        }

        if(this._isPiecePromotable(movingCell.piece, pos)) {
            this.board.setCell(
                { piece: piece.queen, colour: this.currentTurnColour }, pos
            );
        }

        this._switchToNormalMode();
        this._switchTurns();
        this.checkingPiecePos = undefined;
        this.board.clearEnpassant(this.currentTurnColour);

        if (this._isCurrentKingChecked()) {
            this.checkingPiecePos = pos;

            if (this._isCheckMate()) {
                this.currentGameState = gameState.CHECK_MATE;
                alert(`CHECK MATE ${this.currentTurnColour === colour.white ? "black" : "white"} wins`)
            }
        }
    }

    _isPiecePromotable(cellPiece, pos) {
        return (this.currentTurnColour === colour.white &&
            cellPiece === piece.pawn &&
            pos.r === 0) ||
            (this.currentTurnColour === colour.black &&
            cellPiece === piece.pawn &&
            pos.r === this.board.getHeight()-1)
    }

    _movePossibleRookCastleMove(pos, movingCell) {
        if(movingCell.piece === piece.king && this.currentSelectedPos.c-pos.c === -2) {
            if (this.currentTurnColour === colour.white) {
                const rookPos = createPos(this.board.getHeight()-1, this.board.getWidth()-1);
                const rookCell = this.board.getCell(rookPos);
                this.board.setCell(rookCell, pos.add(createVec(-1,0)))
                this.board.removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, this.board.getWidth()-1);
                const rookCell = this.board.getCell(rookPos);
                this.board.setCell(rookCell, pos.add(createVec(-1,0)))
                this.board.removePieceAtCell(rookPos);
            }
        }

        if(movingCell.piece === piece.king && this.currentSelectedPos.c-pos.c === 2) {
            if (this.currentTurnColour === colour.white) {
                const rookPos = createPos(this.board.getHeight()-1, 0);
                const rookCell = this.board.getCell(rookPos);
                this.board.setCell(rookCell, pos.add(createVec(1,0)))
                this.board.removePieceAtCell(rookPos);
            } else {
                const rookPos = createPos(0, 0);
                const rookCell = this.board.getCell(rookPos);
                this.board.setCell(rookCell, pos.add(createVec(1,0)))
                this.board.removePieceAtCell(rookPos);
            }
        }
    }

    _switchToNormalMode() {
        this.currentSelectedPos = undefined;
        this.board.clearPossibleMoves();
        this.currentGameState = gameState.NORMAL;
        drawBoard(this.board);
    }

    _switchTurns() {
        if (this.currentTurnColour === colour.white) {
            this.currentTurnColour = colour.black;
        } else {
            this.currentTurnColour = colour.white;
        }
    }

    _isCheckMate() {
        if (this.board.canKingMove(this.currentTurnColour, this.checkingPiecePos)) return false;
        if (this.board.isKingDoubleChecked(this.currentTurnColour)) return true;

        if (isCellBlockableInDirection(this.board,
            this.checkingPiecePos,
            this.board.getKingPos(this.currentTurnColour),
            this.currentTurnColour)) return false;

        return !this.board.canCellBeTaken(this.checkingPiecePos, swapColour(this.currentTurnColour));


    }
}

const gameState = {
    NORMAL: 0,
    PENDING_MOVE: 1,
    CHECK_MATE: 2,
    STALE_MATE: 3
}
