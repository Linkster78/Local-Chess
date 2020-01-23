const Sides = {
    NONE : 0,
    WHITE: 1,
    BLACK: 2
}

const Types = {
    NONE  : 0,
    PAWN  : 1,
    ROOK  : 2,
    KNIGHT: 3,
    BISHOP: 4,
    QUEEN : 5,
    KING  : 6
}

const Pieces = {
    NOTHING     : [0 , Types.NONE  , Sides.NONE ],
    PAWN_WHITE  : [1 , Types.PAWN  , Sides.WHITE],
    PAWN_BLACK  : [2 , Types.PAWN  , Sides.BLACK],
    ROOK_WHITE  : [3 , Types.ROOK  , Sides.WHITE],
    ROOK_BLACK  : [4 , Types.ROOK  , Sides.BLACK],
    KNIGHT_WHITE: [5 , Types.KNIGHT, Sides.WHITE],
    KNIGHT_BLACK: [6 , Types.KNIGHT, Sides.BLACK],
    BISHOP_WHITE: [7 , Types.BISHOP, Sides.WHITE],
    BISHOP_BLACK: [8 , Types.BISHOP, Sides.BLACK],
    QUEEN_WHITE : [9 , Types.QUEEN , Sides.WHITE],
    QUEEN_BLACK : [10, Types.QUEEN , Sides.BLACK],
    KING_WHITE  : [11, Types.KING  , Sides.WHITE],
    KING_BLACK  : [12, Types.KING  , Sides.BLACK]
}

var boardPieces = new Array(8);
var currentTurn = Sides.WHITE;
var currentCell = [0, 0];
var currentOptions = [];
var checked = [false, false];

$(document).ready(() => {
    resetBoard();
    
    var chessboard = $("#chessboard");
    var letterLine = $("<tr><th></th></tr>");
    for(var x = 0; x < 8; x++) {
        var letterCell = $("<th class='cell-header'>" + (x + 10).toString(36).toUpperCase() + "</th>");
        letterLine.append(letterCell);
    }
    chessboard.append(letterLine);
    var white = true;
    for(var y = 0; y < 8; y++) {
        var line = $("<tr></tr>");
        var numberCell = $("<th class='cell-header'>" + (8 - y) + "</th>");
        line.append(numberCell);
        for(var x = 0; x < 8; x++) {
            var cell = $("<td class='cell' data-x='" + x + "' data-y='" + y + "'></td>");
            if(white) {
                cell.addClass("cell-white");
            } else {
                cell.addClass("cell-black");
            }
            white = !white;
            line.append(cell);
        }
        white = !white;
        chessboard.append(line);
    }
    
    updateBoard();
    
    $(".cell").click((event) => {
        if(isCheckmate(currentTurn)) {
            return;
        }
        
        var x = parseInt($(event.target).attr("data-x"));
        var y = parseInt($(event.target).attr("data-y"));
        var piece = boardPieces[x][y];
        var pieceKey = getPieceKey(piece);
        
        if($(event.target).hasClass("cell-movable")) {
            getBoardCell(currentCell[0], currentCell[1]).removeClass("cell-selected");
            for(cell of currentOptions) {
                $(getBoardCell(cell[0], cell[1])).removeClass("cell-movable");
            }
            
            var kingCell;
            if(currentTurn == Sides.WHITE) {
                kingCell = getPieceLocation(Pieces.KING_WHITE[0]);
            } else {
                kingCell = getPieceLocation(Pieces.KING_BLACK[0]);
            }
            getBoardCell(kingCell[0], kingCell[1]).removeClass("cell-checked");
            
            movePiece(currentCell, [x, y]);
            
            if(currentTurn == Sides.WHITE) {
                currentTurn = Sides.BLACK;
            } else {
                currentTurn = Sides.WHITE;
            }
            
            updateBoard();
            
            if(isChecked(currentTurn)) {
                var kingCell;
                if(currentTurn == Sides.WHITE) {
                    kingCell = getPieceLocation(Pieces.KING_WHITE[0]);
                } else {
                    kingCell = getPieceLocation(Pieces.KING_BLACK[0]);
                }
                getBoardCell(kingCell[0], kingCell[1]).addClass("cell-checked");
                checked[currentTurn - 1] = true;
            }
            
            if(isCheckmate(currentTurn)) {
                if(currentTurn == Sides.WHITE) {
                    $("#status").text("Checkmate! Black team has won.");
                } else {
                    $("#status").text("Checkmate! White team has won.");
                }
            }
        } else {
            getBoardCell(currentCell[0], currentCell[1]).removeClass("cell-selected");
            for(cell of currentOptions) {
                $(getBoardCell(cell[0], cell[1])).removeClass("cell-movable");
            }
            if(Pieces[pieceKey][2] == currentTurn) {
                currentCell = [x, y];
                $(event.target).addClass("cell-selected");
                currentOptions = [];
                for(cell of getPieceOptions(x, y)) {
                    if(canMovePiece([x, y], cell)) {
                        $(getBoardCell(cell[0], cell[1])).addClass("cell-movable");
                        currentOptions.push(cell);
                    }
                }
            }
        }
    });
});

function getBoardCell(x, y) {
    return $("[data-x=" + x + "][data-y=" + y + "]");
}

function* getPieceOptions(x, y) {
    var piece = boardPieces[x][y];
    var pieceKey = getPieceKey(piece);
    var pieceType = Pieces[pieceKey][1];
    var pieceSide = Pieces[pieceKey][2];
    var pieceAt, pieceKeyAt, pieceTypeAt, pieceSideAt;
    switch(pieceType) {
        case Types.NONE:
            break;
        case Types.PAWN:
            if(pieceSide == Sides.WHITE) {
                if(y > 0) {
                    var pieceAt, pieceKeyAt;
                    if(y == 6) {
                        for(var y1 = 1; y1 <= 2; y1++) {
                            if(y - y1 >= 0) {
                                pieceAt = boardPieces[x][y - y1];
                                if(pieceAt == Pieces.NOTHING[0]) {
                                    yield [x, y - y1];
                                } else {
                                    break;
                                }
                            }
                        }
                    } else {
                        pieceAt = boardPieces[x][y - 1];
                        if(pieceAt == Pieces.NOTHING[0]) {
                            yield [x, y - 1];
                        }
                    }
                    if(x > 0) {
                        pieceAt = boardPieces[x - 1][y - 1];
                        pieceKeyAt = getPieceKey(pieceAt);
                        pieceSideAt = Pieces[pieceKeyAt][2];
                        if(pieceSideAt == Sides.BLACK) yield [x - 1, y - 1];
                    }
                    if(x < 7) {
                        pieceAt = boardPieces[x + 1][y - 1];
                        pieceKeyAt = getPieceKey(pieceAt);
                        pieceSideAt = Pieces[pieceKeyAt][2];
                        if(pieceSideAt == Sides.BLACK) yield [x + 1, y - 1];
                    }
                }
            } else {
                if(y < 7) {
                    var pieceAt, pieceKeyAt;
                    if(y == 1) {
                        for(var y1 = 1; y1 <= 2; y1++) {
                            if(y + y1 >= 0) {
                                pieceAt = boardPieces[x][y + y1];
                                if(pieceAt == Pieces.NOTHING[0]) {
                                    yield [x, y + y1];
                                } else {
                                    break;
                                }
                            }
                        }
                    } else {
                        pieceAt = boardPieces[x][y + 1];
                        if(pieceAt == Pieces.NOTHING[0]) {
                            yield [x, y + 1];
                        }
                    }
                    if(x > 0) {
                        pieceAt = boardPieces[x - 1][y + 1];
                        pieceKeyAt = getPieceKey(pieceAt);
                        pieceSideAt = Pieces[pieceKeyAt][2];
                        if(pieceSideAt == Sides.WHITE) yield [x - 1, y + 1];
                    }
                    if(x < 7) {
                        pieceAt = boardPieces[x + 1][y + 1];
                        pieceKeyAt = getPieceKey(pieceAt);
                        pieceSideAt = Pieces[pieceKeyAt][2];
                        if(pieceSideAt == Sides.WHITE) yield [x + 1, y + 1];
                    }
                }
            }
            break;
        case Types.ROOK:
            for(var i = 1; i < 8; i++) {
                if(y - i >= 0) {
                    pieceAt = boardPieces[x][y - i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x, y - i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x, y - i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x + i < 8) {
                    pieceAt = boardPieces[x + i][y];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x + i, y];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x + i, y];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(y + i < 8) {
                    pieceAt = boardPieces[x][y + i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x, y + i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x, y + i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x - i >= 0) {
                    pieceAt = boardPieces[x - i][y];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x - i, y];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x - i, y];
                        break;
                    } else {
                        break;
                    }
                }
            }
            break;
        case Types.KNIGHT:
            for(var x1 = 0; x1 < 5; x1++) {
                for(var y1 = 0; y1 < 5; y1++) {
                    var x2 = x - 2 + x1;
                    var y2 = y - 2 + y1;
                    if(x2 >= 0 && y2 >= 0 && x2 < 8 && y2 < 8) {
                        var offX = Math.abs(x1 - 2);
                        var offY = Math.abs(y1 - 2);
                        var offS = offX + offY;
                        if(offS == 3) {
                            pieceAt = boardPieces[x2][y2];
                            pieceKeyAt = getPieceKey(pieceAt);
                            pieceSideAt = Pieces[pieceKeyAt][2];
                            if(pieceSideAt != pieceSide) {
                                yield [x2, y2];
                            }
                        }
                    }
                }
            }
            break;
        case Types.BISHOP:
            for(var i = 1; i < 8; i++) {
                if(x + i < 8 && y - i >= 0) {
                    pieceAt = boardPieces[x + i][y - i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x + i, y - i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x + i, y - i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x + i < 8 && y + i < 8) {
                    pieceAt = boardPieces[x + i][y + i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x + i, y + i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x + i, y + i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x - i >= 0 && y + i < 8) {
                    pieceAt = boardPieces[x - i][y + i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x - i, y + i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x - i, y + i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x - i >= 0 && y - i >= 0) {
                    pieceAt = boardPieces[x - i][y - i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x - i, y - i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x - i, y - i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            break;
        case Types.QUEEN:
            for(var i = 1; i < 8; i++) {
                if(y - i >= 0) {
                    pieceAt = boardPieces[x][y - i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x, y - i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x, y - i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x + i < 8) {
                    pieceAt = boardPieces[x + i][y];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x + i, y];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x + i, y];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(y + i < 8) {
                    pieceAt = boardPieces[x][y + i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x, y + i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x, y + i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x - i >= 0) {
                    pieceAt = boardPieces[x - i][y];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x - i, y];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x - i, y];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x + i < 8 && y - i >= 0) {
                    pieceAt = boardPieces[x + i][y - i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x + i, y - i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x + i, y - i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x + i < 8 && y + i < 8) {
                    pieceAt = boardPieces[x + i][y + i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x + i, y + i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x + i, y + i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x - i >= 0 && y + i < 8) {
                    pieceAt = boardPieces[x - i][y + i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x - i, y + i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x - i, y + i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            for(var i = 1; i < 8; i++) {
                if(x - i >= 0 && y - i >= 0) {
                    pieceAt = boardPieces[x - i][y - i];
                    pieceKeyAt = getPieceKey(pieceAt);
                    pieceSideAt = Pieces[pieceKeyAt][2];
                    if(pieceSideAt == Sides.NONE) {
                        yield [x - i, y - i];
                    } else if(pieceSideAt != pieceSide) {
                        yield [x - i, y - i];
                        break;
                    } else {
                        break;
                    }
                }
            }
            break;
        case Types.KING:
            var oppositeKingCell;
            if(pieceSide == Sides.WHITE) {
                oppositeKingCell = getPieceLocation(Pieces.KING_BLACK[0]);
            } else {
                oppositeKingCell = getPieceLocation(Pieces.KING_WHITE[0]);
            }
            for(var x1 = 0; x1 < 3; x1++) {
                for(var y1 = 0; y1 < 3; y1++) {
                    var x2 = x - 1 + x1;
                    var y2 = y - 1 + y1;
                    if(x2 >= 0 && y2 >= 0 && x2 < 8 && y2 < 8) {
                        pieceAt = boardPieces[x2][y2];
                        pieceKeyAt = getPieceKey(pieceAt);
                        pieceSideAt = Pieces[pieceKeyAt][2];
                        if(pieceSideAt != pieceSide) {
                            yield [x2, y2];
                        }
                    }
                }
            }
            break;
        default:
            break;
    }
}

function canMovePiece(from, to) {
    var allowed = true;
    var piece = boardPieces[from[0]][from[1]];
    var pieceAt = boardPieces[to[0]][to[1]];
    boardPieces[to[0]][to[1]] = piece;
    boardPieces[from[0]][from[1]] = Pieces.NOTHING[0];
    if(isChecked(currentTurn)) allowed = false;
    boardPieces[from[0]][from[1]] = piece;
    boardPieces[to[0]][to[1]] = pieceAt;
    return allowed;
}

function getPieceKey(id) {
    for(piece of Object.keys(Pieces)) {
        if(Pieces[piece][0] == id) {
            return piece;
        }
    }
    return null;
}

function getPieceLocation(id) {
    for(var x = 0; x < 8; x++) {
        for(var y = 0; y < 8; y++) {
            if(boardPieces[x][y] == id) return [x, y];
        }
    }
    return null;
}

function movePiece(from, to) {
    var pieceFrom = boardPieces[from[0]][from[1]];
    var pieceFromKey = getPieceKey(pieceFrom);
    var pieceFromSide = Pieces[pieceFromKey][2];
    var pieceFromType = Pieces[pieceFromKey][1];
    var pieceTo = boardPieces[to[0]][to[1]];
    var pieceToKey = getPieceKey(pieceTo);
    var pieceToSide = Pieces[pieceToKey][2];
    var pieceToType = Pieces[pieceToKey][1];
    
    boardPieces[to[0]][to[1]] = boardPieces[from[0]][from[1]];
    boardPieces[from[0]][from[1]] = Pieces.NOTHING[0];
    
    /* TODO: Handle Rock */
}

function isChecked(side) {
    var kingCell = side == Sides.WHITE ? getPieceLocation(Pieces.KING_WHITE[0]) : getPieceLocation(Pieces.KING_BLACK[0]);
    for(var x = 0; x < 8; x++) {
        for(var y = 0; y < 8; y++) {
            var pieceAt = boardPieces[x][y];
            var pieceKeyAt = getPieceKey(pieceAt);
            var pieceSideAt = Pieces[pieceKeyAt][2];
            if(pieceSideAt != Sides.NONE && pieceSideAt != side) {
                for(cell of getPieceOptions(x, y)) {
                    if(cell[0] == kingCell[0] && cell[1] == kingCell[1]) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function isCheckmate(side) {
    for(var x = 0; x < 8; x++) {
        for(var y = 0; y < 8; y++) {
            var pieceAt = boardPieces[x][y];
            var pieceKeyAt = getPieceKey(pieceAt);
            var pieceSideAt = Pieces[pieceKeyAt][2];
            if(pieceSideAt == side) {
                for(cell of getPieceOptions(x, y)) {
                    if(canMovePiece([x, y], cell)) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function resetBoard() {
    for(var x = 0; x < 8; x++) {
        boardPieces[x] = new Array(8);
        for(var y = 0; y < 8; y++) {
            boardPieces[x][y] = Pieces.NOTHING[0];
        }
    }
    for(var x = 0; x < 8; x++) {
        boardPieces[x][1] = Pieces.PAWN_BLACK[0];
        boardPieces[x][6] = Pieces.PAWN_WHITE[0];
    }
    boardPieces[0][0] = Pieces.ROOK_BLACK  [0];
    boardPieces[0][7] = Pieces.ROOK_WHITE  [0];
    boardPieces[1][0] = Pieces.KNIGHT_BLACK[0];
    boardPieces[1][7] = Pieces.KNIGHT_WHITE[0];
    boardPieces[2][0] = Pieces.BISHOP_BLACK[0];
    boardPieces[2][7] = Pieces.BISHOP_WHITE[0];
    boardPieces[3][0] = Pieces.QUEEN_BLACK [0];
    boardPieces[3][7] = Pieces.QUEEN_WHITE [0];
    boardPieces[4][0] = Pieces.KING_BLACK  [0];
    boardPieces[4][7] = Pieces.KING_WHITE  [0];
    boardPieces[5][0] = Pieces.BISHOP_BLACK[0];
    boardPieces[5][7] = Pieces.BISHOP_WHITE[0];
    boardPieces[6][0] = Pieces.KNIGHT_BLACK[0];
    boardPieces[6][7] = Pieces.KNIGHT_WHITE[0];
    boardPieces[7][0] = Pieces.ROOK_BLACK  [0];
    boardPieces[7][7] = Pieces.ROOK_WHITE  [0];
}

function updateBoard() {
    for(var y = 0; y < 8; y++) {
        for(var x = 0; x < 8; x++) {
            var cell = getBoardCell(x, y);
            var piece = boardPieces[x][y];
            if(piece == Pieces.NOTHING[0]) {
                cell.css("background-image", "");
            } else {
                var pieceName = getPieceKey(piece).toLowerCase();
                var pieceSvg = "res/" + pieceName + ".svg";
                cell.css("background-image", "url(" + pieceSvg + ")");
            }
        }
    }
    
    if(currentTurn == Sides.WHITE) {
        $("#status").text("White player's turn.");
    } else {
        $("#status").text("Black player's turn.");
    }
}