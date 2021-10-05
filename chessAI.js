var ChessAI = function(game) {

    function getPieceValue(piece) {
        if (piece == null) {
            return 0;
        }

        var pieceValue = 0;
        switch (piece.type) {
            case game.PAWN : {
                pieceValue = 10;
                break   
            }
            case game.KNIGHT  : {
                pieceValue = 30;
                break   
            }
            case game.BISHOP  : {
                pieceValue = 30;
                break   
            }
            case game.ROOK  : {
                pieceValue = 50;
                break   
            }
            case game.QUEEN  : {
                pieceValue = 90;
                break   
            }
            case game.KING  : {
                pieceValue = 900;
                break   
            }
        }
        return piece.color == 'w' ? pieceValue : -pieceValue;
    }

    function getAllMoves() {
        return game.moves();
    }

    function getAllOrderedMoves() {
        var unsortedMoves = game.moves({ verbose: true });
        var sortedMoves = [];

        var n = []//non-capture
        var b = []//pawn push of 2 squares
        var e = []//en-passant
        var c = []//standard capture
        var p = []//promotion
        var k = []//kingside castling
        var q = []//queenside castling
        unsortedMoves.forEach(move => {
            switch(move.flags[0]) {
                case 'n' : {
                    n.push(`${move.san}`);
                    break;
                }
                case 'b' : {
                    b.push(`${move.san}`);
                    break;
                }
                case 'e' : {
                    e.push(`${move.san}`);
                    break;
                }
                case 'c' : {
                    c.push(`${move.san}`);
                    break;
                }
                case 'p' : {
                    p.push(`${move.san}`);
                    break;
                }
                case 'k' : {
                    k.push(`${move.san}`);
                    break;
                }
                case 'q' : {
                    q.push(`${move.san}`);
                    break;
                }
                default : {
                    throw new Error("Unknown move flag");
                }
            }
        });

        

        sortedMoves = e;
        sortedMoves += c;
        sortedMoves += p;
        sortedMoves += k;
        sortedMoves += q;
        sortedMoves += n;
        sortedMoves += b;

        sortedMoves = sortedMoves.toString().split(',');

        return sortedMoves;
    }

    function evaluateBoard() {
        var totalEval = 0;
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                totalEval += getPieceValue(game.board()[x][y]);
            }
        }
        return totalEval;
    }

    function getRandomMove() {
        var possibleMoves = getAllMoves();
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    function calculateBestMove() {
        var possibleMoves = getAllMoves();
        var bestMoveMinMax = null;
        var bestMoveVal = 9999;
        for (let i = 0; i < possibleMoves.length; i++) {
            const testMove = possibleMoves[i];
            game.move(testMove);

            const testMoveVal = evaluateBoard();
            if (testMoveVal < bestMoveVal) {
                bestMoveMinMax = testMove;
                bestMoveVal = testMoveVal;
            }
            game.undo();
        }
        return bestMoveMinMax;
    }

    function MinMax(depth, maximizingPlayer) {
        positionCount++;
        if (depth == 0) {
            return evaluateBoard();
        }
        
        if (maximizingPlayer) {
            var bestMoveEval = -Infinity;
            getAllMoves().forEach(move => {
                game.move(move);
                bestMoveEval = Math.max(bestMoveEval, MinMax(depth -1, false));
                game.undo();
            });
            
        } else {
            var bestMoveEval = Infinity;
            getAllMoves().forEach(move => {
                game.move(move);
                bestMoveEval = Math.min(bestMoveEval, MinMax(depth -1, true));
                game.undo();
            });
        }
        return bestMoveEval;
    }

    function MinMaxRoot(depth) {
        var bestMoveMinMax = null;
        var bestMoveEval = Infinity;

        getAllMoves().forEach(move => {
            game.move(move);
            var moveEval = MinMax(depth-1, true);
            game.undo();
            if (moveEval < bestMoveEval) {
                bestMoveMinMax = move;
                bestMoveEval = moveEval;
            }
        });
        return bestMoveMinMax;
    }

    function MinMaxAlphaBeta(depth, maximizingPlayer, α, β) {
        positionCount++;
        if (depth == 0) {
            return evaluateBoard();
        }

        var moves = getAllMoves();

        if (maximizingPlayer) {
            var bestMoveEval = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                const move = moves[i];
                game.move(move);
                    bestMoveEval = Math.max(bestMoveEval, MinMaxAlphaBeta(depth -1, false, α, β));
                    game.undo();
                    if (bestMoveEval >= β) {
                        break;
                    }
                    α = Math.max(α, bestMoveEval);
            }
        } else {
            var bestMoveEval = Infinity;
            for (let i = 0; i < moves.length; i++) {
                const move = moves[i];
                game.move(move);
                bestMoveEval = Math.min(bestMoveEval, MinMaxAlphaBeta(depth -1, true, α, β));
                game.undo();
                if (bestMoveEval <= α) {
                    break;
                }
                β = Math.min(β, bestMoveEval);   
            }
        }
        return bestMoveEval;
    }

    function MinMaxAlphaBetaRoot(depth) {
        var bestMoveMinMax = null;
        var bestMoveEval = Infinity;

        getAllMoves().forEach(move => {
            game.move(move);
            var moveEval = MinMaxAlphaBeta(depth-1, true, -Infinity, Infinity);
            game.undo();
            if (moveEval < bestMoveEval) {
                bestMoveMinMax = move;
                bestMoveEval = moveEval;
            }
        });
        
        return bestMoveMinMax;
    }


    function MinMaxAlphaBetaSortedList(depth, maximizingPlayer, α, β) {
        positionCount++;
        if (depth == 0) {
            return evaluateBoard();
        }

        var moves = getAllOrderedMoves();

        if (maximizingPlayer) {
            var bestMoveEval = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                    const move = moves[i];
                    game.move(move);
                    bestMoveEval = Math.max(bestMoveEval, MinMaxAlphaBetaSortedList(depth -1, false, α, β));
                    game.undo();
                    if (bestMoveEval >= β) {
                        break;
                    }
                    α = Math.max(α, bestMoveEval);
            }
        } else {
            var bestMoveEval = Infinity;
            for (let i = 0; i < moves.length; i++) {
                const move = moves[i];
                game.move(move);
                bestMoveEval = Math.min(bestMoveEval, MinMaxAlphaBetaSortedList(depth -1, true, α, β));
                game.undo();
                if (bestMoveEval <= α) {
                    break;
                }
                β = Math.min(β, bestMoveEval);   
            }
        }
        return bestMoveEval;
    }

    function MinMaxAlphaBetaSortedListRoot(depth) {
        var bestMoveMinMax = null;
        var bestMoveEval = Infinity;

        var possibleMoves = getAllOrderedMoves();

        for (let i = 0; i < possibleMoves.length; i++) {
            const move = possibleMoves[i];
            game.move(move);
            var moveEval = MinMaxAlphaBetaSortedList(depth-1, true, -Infinity, Infinity);
            game.undo();
            if (moveEval < bestMoveEval) {
                bestMoveMinMax = move;
                bestMoveEval = moveEval;
            }
        }
        
        return bestMoveMinMax;
    }

    function evaluateCalculation(calculationMethod, args, name) {
        console.group(`${name}`);
        console.time(`${name} Time`);
        var bestMove = calculationMethod.apply(this, args);
        console.timeEnd(`${name} Time`);
        console.log(`It calculated ${positionCount} positions.`);
        console.log(`This is the best move: ${bestMove}`);
        positionCount = 0;
        console.groupEnd();
        return bestMove
    }



    var positionCount = 0;

    if (game != undefined) {
        return {
            testAllCalculationMethods : function () {
                const depth = 4;

                var randomMove = evaluateCalculation(getRandomMove, [], "Random");
                var bestMove1Depth = evaluateCalculation(calculateBestMove, [], "Simple best");
                var bestMoveMinMax = evaluateCalculation(MinMaxRoot, [depth], "Min Max");
                var bestMoveMinMaxAlpha = evaluateCalculation(MinMaxAlphaBetaRoot, [depth], "Alpha Beta");
                var bestMoveMinMaxAlphaSortedList = evaluateCalculation(MinMaxAlphaBetaSortedListRoot, [depth], "Sorted List");



                game.move(bestMoveMinMaxAlphaSortedList);
                board.position(game.fen());
            },

            makeMove : function () {
                var fen = game.fen();

                // var bestMoveMinMaxAlpha = evaluateCalculation(MinMaxAlphaBetaRoot, [4], "Alpha Beta");
                var bestMoveMinMaxAlphaSortedList = evaluateCalculation(MinMaxAlphaBetaSortedListRoot, [5], "Sorted List");
                game.load(fen);
                game.move(bestMoveMinMaxAlphaSortedList);
                board.position(game.fen());
            },
            makeRandomMove : function () {
                game.move(getRandomMove());
                board.position(game.fen());
            },
            makeCurrentBestMove : function () {
                game.move(calculateBestMove());
                board.position(game.fen());
            }



        }
    } else {
        throw new Error("Chess ai was not given a game object")
    }

    
}

/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== 'undefined') exports.ChessAI = ChessAI
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== 'undefined')
  define(function () {
    return ChessAI
  })
