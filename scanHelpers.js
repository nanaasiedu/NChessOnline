function dangerScan(board, r, c) {
    const cellPiece = board[r][c]

    if (cellPiece.piece === piece.pawn) {
        pawnDangerScan(board, cellPiece, r, c)
    } else if (cellPiece.piece === piece.rook) {
        rookDangerScan(board, cellPiece, r, c)
    }
}

function pawnDangerScan(board, cellPiece, r, c) {
    if (legalPosition(2, c-1)) {
        board[2][c-1].blackCheckingPieces.add({ piece: cellPiece.piece })
    }
    if (legalPosition(2, c+1)) {
        board[2][c-1].blackCheckingPieces.add({ piece: cellPiece.piece })
    }
}

function rookDangerScan(board, cellPiece, r, c) {
    let i = 1;
    while (legalPosition(r, c + i)) {
        if (cellPiece.colour === colour.black) {
            board[r][c+i].blackCheckingPieces.add({ piece: cellPiece.piece })
        } else if (cellPiece.colour === colour.white) {
            board[r][c+i].whiteCheckingPieces.add({ piece: cellPiece.piece })
        }

        if (board)

        i++;
    }
}

function legalPosition(r, c) {
    return r > 0 && r < 8 && c > 0 && c < 8
}