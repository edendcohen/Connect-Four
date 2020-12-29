const MAX_SIZE = 10;
const MIN_SIZE = 3;
const EMPTY = 0;
const WHITE = 1;
const BLACK = -100;
const WHITE_WIN = 10000;
const BLACK_WIN = -10000;
const DRAW = 0;
const ONGOING = -1;


class Board {

    #rows;
    #cols;
    #winSequence;
    #whiteMoves;
    #totalMoves;
    board;
    #turnsRemaining;
    outcome;
    gameLog;
    debugBoard;

    constructor(rows, cols, winSequence) {
        //error handling
        if ((rows <= MIN_SIZE) || (cols <= MIN_SIZE))
            throw 'BoardTooSmall';

        if ((rows > MAX_SIZE) || (cols > MAX_SIZE))
            throws; 'BoardTooLarge';

        if ((winSequence > rows) || (winSequence > cols)) 
            throw 'WinSequenceTooLong';
        

        if (winSequence <= 1)
            throw 'WinSequenceTooShort';

        this.#rows = rows;
        this.#cols = cols;
        this.#winSequence = winSequence;

        //these attributes may change following subsequent games on the same board
        this.reset();

    }

    /**
     * Returns a new board with an identical context.
     */
    clone()
    {
        var newBoard = new Board(this.#rows, this.#cols, this.#winSequence);

        newBoard.#whiteMoves = this.#whiteMoves;
        newBoard.#totalMoves = this.#totalMoves;
        newBoard.#turnsRemaining = this.#turnsRemaining;
        newBoard.gameLog = this.gameLog.slice();
        newBoard.outcome = this.outcome;

        //clone the board itself
        newBoard.board = new Array(this.#rows);       
        for (let r = 0; r < this.#rows; r++) 
        {
            newBoard.board[r] = new Array(this.#cols);
            for (let c = 0; c < this.#cols; c++)
                newBoard.board[r][c] = this.board[r][c];
        }

        return newBoard;
    }

    /**
     * Resets the board to an initial position (without changing its size and other properties defined when the object was created)
     */
    reset()
    {
        this.#totalMoves = 0;
        this.#whiteMoves = true;
        this.#turnsRemaining = this.#cols * this.#rows;
        this.outcome = ONGOING;
        this.gameLog = new Array();
        
        this.board = new Array(this.#rows);
        
        for (let r = 0; r < this.#rows; r++) {
            this.board[r] = new Array(this.#cols);
            for (let c = 0; c < this.#cols; c++)
                this.board[r][c] = EMPTY;
        }
    }

    isWhiteMove()
    {
        return this.#whiteMoves;
    }
    
    display()
    {
        var output = new String();

        for (let r = this.#rows - 1; r >= -1; r--) {
            
            for (let c = 0; c < this.#cols; c++)
            {
                if (r === -1)
                {
                    output += ` ${c} `;
                }
                else
                {
                    let outputChar;
                    switch(this.board[r][c])
                    {
                        case EMPTY:
                            outputChar = '-';
                            break;
                        case WHITE:
                            outputChar = 'x';
                            break;
                        case BLACK:
                            outputChar = 'o';
                            break;
                        default:
                            console.assert(true);
                    }
                    output += ` ${outputChar} `;
                    }
            }
            output += "\n";
        }

        return output;
    }

    /**
     * 
     * @param {boolean} sideWhite Which side's remaining turns should be returned.
     */
    getTurnsRemaining(sideWhite)
    {
        if (sideWhite) //requested for white
        {
            if (this.#whiteMoves)
            {
                return Math.ceil(this.#turnsRemaining / 2);
            }
            else //black moves
            {
                return Math.floor(this.#turnsRemaining / 2);
            }
        }
        else // requetsed for black
        {
            if (!this.#whiteMoves)
            {
                return Math.ceil(this.#turnsRemaining / 2);
            }
            else //white moves
            {
                return Math.floor(this.#turnsRemaining / 2);
            }
        }

        console.assert(true);
            
    }
    
    /**
     * Max number of sequences possible on this board size 
     */
    #getMaxSequences()
    {
        var count = (this.#cols - this.#winSequence + 1) * this.#rows; //horizontals

        count += (this.#rows - this.#winSequence + 1) * this.#cols; //verticals

        count += (2 * (this.#cols - this.#winSequence + 1) * (this.#rows - this.#winSequence + 1)); //diagnoals

        return count;
     }

    // Returns how many partial rows of seqLength length the requested side has which currently are, or can potentially be extended to winSequence length.
    #findSeqInRow(sideWhite, seqLength)
    {
        console.assert((seqLength <= this.#winSequence) && (seqLength > 0));

        var row = 0;
        var count = 0;

        // Go over each row
        while (row < this.#rows)
        {
            // Go over each sequence of winSequence cells (with overlaps)
            for (let col = 0; col <= (this.#cols - this.#winSequence); col++)
            {
                // count the total value in this subsequence
                let sum = 0;
                let emptyCells = 0;
                for (let i = col; i < col + this.#winSequence; i++)
                {
                    let thisCell = this.board[row][i];
                    sum += thisCell;
                    if (thisCell === EMPTY)
                        emptyCells++;
                }

                if (sum === (seqLength * (sideWhite ? WHITE: BLACK)))
                    // only count this if the requested side has enough moves remaining to theoretically occupy this sequence
                    if (this.getTurnsRemaining(sideWhite) >= emptyCells)
                        count++;
            }

            row++;
        }

        return count;
    }

    #findSeqInCol(sideWhite, seqLength)
    {
        console.assert((seqLength <= this.#winSequence) && (seqLength > 0));

        var col = 0;
        var count = 0;

        // Go over each col
        while (col < this.#cols)
        {
            // Go over each sequence of winSequence cells (with overlaps)
            for (let row = 0; row <= (this.#rows - this.#winSequence); row++)
            {
                // count the total value in this subsequence
                let sum = 0;
                let emptyCells = 0;
                for (let i = row; i < row + this.#winSequence; i++)
                {
                    let thisCell = this.board[i][col];
                    sum += thisCell;
                    if (thisCell === EMPTY)
                        emptyCells++;
                }

                if (sum === (seqLength * (sideWhite ? WHITE: BLACK)))
                    // only count this if the requested side has enough moves remaining to theoretically occupy this sequence
                    if (this.getTurnsRemaining(sideWhite) >= emptyCells)
                        count++;
            }

            col++;
        }

        return count;
    }
    
    #findSeqInDiag(sideWhite, seqLength)
    {
        console.assert((seqLength <= this.#winSequence) && (seqLength > 0));

        var count = 0;

        // Start with the diagonals where col increases as row decreases
        for (let col = 0; col <= this.#cols - this.#winSequence; col++)
        {
            // Go over each sequence of winSequence cells (with overlaps)
            for (let row = this.#rows - 1; row >= this.#winSequence - 1; row--)
            {
                // count the total value in this subsequence
                let sum = 0;
                let emptyCells = 0;
                for (let i = 0; i < this.#winSequence; i++)
                {
                    let thisCell = this.board[row - i][col + i];
                    sum += thisCell;
                    if (thisCell === EMPTY)
                        emptyCells++;
                }

                if (sum === (seqLength * (sideWhite ? WHITE: BLACK)))
                    // only count this if the requested side has enough moves remaining to theoretically occupy this sequence
                    if (this.getTurnsRemaining(sideWhite) >= emptyCells)
                        count++;
            }
        }


        // Analyze the diagonals where col increases as row increases
        for (let col = 0; col <= this.#cols - this.#winSequence; col++)
        {
            // Go over each sequence of winSequence cells (with overlaps)
            for (let row = 0; row <= this.#rows - this.#winSequence; row++)
            {
                // count the total value in this subsequence
                let sum = 0;
                let emptyCells = 0;
                for (let i = 0; i < this.#winSequence; i++)
                {
                    let thisCell = this.board[row + i][col + i];
                    sum += thisCell;
                    if (thisCell === EMPTY)
                        emptyCells++;
                }

                if (sum === (seqLength * (sideWhite ? WHITE: BLACK)))
                    // only count this if the requested side has enough moves remaining to theoretically occupy this sequence
                    if (this.getTurnsRemaining(sideWhite) >= emptyCells)
                        count++;
            }
        }
        return count;
    }

    #findAllSeq(sideWhite, seqLength)
    {
        return this.#findSeqInRow(sideWhite, seqLength) + this.#findSeqInCol(sideWhite, seqLength) + this.#findSeqInDiag(sideWhite, seqLength);
    }

    /**
     * Returns the game's outcome:
     * WHITE_WIN - white won
     * BLACK_WIN - black won
     * DRAW - draw
     * ONGOING - game not over
     */
    #getOutcome()
    {
        if (this.#findAllSeq(!this.#whiteMoves, this.#winSequence) > 0)
            return this.#whiteMoves ? BLACK_WIN : WHITE_WIN;

        if (this.#turnsRemaining === 0)
            return DRAW;

        return ONGOING;
    }

    // Returns an array of all legal moves (by column numbers), or null if none.
    getLegalMoves()
    {
        if (this.outcome != ONGOING)
            return null;

        var movesList = new Array();
        
        for (let c = 0; c < this.#cols; c++)
        {
            if (this.board[this.#rows - 1][c] === EMPTY)
            {
                movesList.push(c);
            }
        }

        return movesList;
    }
    
    // Throws Exception if move not possible, or makes the move if it's possible (and returns true).
    // !!! ASSUMES THE GAME IS ONGOING
    move(column)
    {
        if ((column < 0) || (column >= this.#cols))
            throw 'OutOfRange';

        if (this.outcome != ONGOING)
            throw 'GameOver';

        for (let r = 0; r < this.#rows; r++)
        {
            if (this.board[r][column] === EMPTY)
            {
                this.board[r][column] = (this.#whiteMoves) ? WHITE : BLACK;
                
                this.gameLog.push({side:this.#whiteMoves?"White":"Black", column:parseInt(column,10)}); //add move to game log

                this.#whiteMoves = !this.#whiteMoves;
                this.#totalMoves++;
                this.#turnsRemaining--;

                this.outcome = this.#getOutcome();

                this.debugBoard = this.display();

                return true;
            }
        }

        throw 'InvalidMove';
        return false;
    }

    /**
     * Takes back the last move played and returns true if succeeded
     */
    takeback()
    {
        if (this.#totalMoves > 0)
        {
            console.assert(this.gameLog.length > 0);
            var lastMove = this.gameLog.pop(); //pop the last move from the log
            var lastRow = lastMove.row;
            var lastCol = lastMove.col;

            console.assert(this.board[lastRow][lastCol] !== EMPTY);

            this.board[lastRow][lastCol] = EMPTY; //turn last cell back to EMPTY state
            this.#whiteMoves = !this.#whiteMoves; //change side
            this.#totalMoves--;
            this.#turnsRemaining ++;
            this.outcome = ONGOING; //if the game was over before the last move, it would not be possible to get here
            this.debugBoard = this.display();

            return true;
        }

        return false;
    }

    /**
     * Gets a location of a cell, and returns values denoting the count of the neighbors: total, whites, blacks, empties.
     */
    getNeighbors(row, col)
    {
        var empties = 0;
        var whites = 0;
        var blacks = 0;
        
        console.assert((col >= 0) && (row >= 0) && (col <= this.#cols) && (row <= this.#rows));

        for (let r = Math.max(row - 1,0); r <= Math.min(row + 1, this.#rows - 1); r++)
        {
            for (let c = Math.max(col - 1,0); c <= Math.min(col + 1, this.#cols - 1); c++)
            {
                if ((r == row) && (c == col))
                    continue;

                switch(this.board[r][c])
                {
                    case WHITE:
                        whites++;
                        break;
                    case BLACK:
                        blacks++;
                        break;
                    default:
                        empties++;
                }
            }
        }
            return {whites, blacks, empties};
    }


    /**
     * Returns a value denoting whose board position is stronger (white/black).
     * A higher positive number is better for white. A lower negative number is better for black.
     * 
     * BLACK_WIN = black wins
     * 0 = balanced position or draw.
     * WHITE_WIN = white wins
     */
    assessment()
    {
        // return a quick result if it's game over
        if (this.outcome != ONGOING)
            return this.outcome;

        var remainingWhite = this.getTurnsRemaining(true);
        var remainingBlack = this.getTurnsRemaining(false);
        var totalTurns = this.#cols * this.#rows;
        var turnsTaken = totalTurns - this.#turnsRemaining;
        var whitePoints = 0;
        var blackPoints = 0;

        for (let r = 0; r < this.#rows; r++) 
            for (let c = 0; c < this.#cols; c++)
            {
                let {whites, blacks, empties} = this.getNeighbors(r,c);
                let points = 0;

                if (r < this.#rows / 2)
                    points += r;
                else 
                    points += this.#rows - r;
                
                if (c < this.#cols / 2)
                    points += c;
                else 
                    points += this.#cols - c;
            
                if (this.board[r][c] === WHITE)
                {
                    whitePoints += points + whites - blacks;
                    
                }   
                else if (this.board[r][c] === BLACK)
                {
                    blackPoints += points + blacks - whites;
                }  
            }

        // adjust the advantage based on who has more turns to go
        let advantageFactor = (1 / this.#turnsRemaining);

        if (remainingBlack > remainingWhite)
            blackPoints *= (1 + advantageFactor);
        else if (remainingWhite > remainingBlack)
            whitePoints *= (1 + advantageFactor);
        else //same number of moves remaining
        {
            // give a slight first-movers advantage
            if (this.#whiteMoves)
                whitePoints *= (1 + advantageFactor / 3);
            else
                blackPoints *= (1 + advantageFactor / 3);
        }
        
        // go through all sequences of length 2 until (but lower than) winSequence
        for (let i = this.#winSequence - 1; i >= 2; i--)
        {
            whitePoints += Math.pow(this.#findAllSeq(true, i), 3);
            blackPoints += Math.pow(this.#findAllSeq(false, i), 3);
        }

        return whitePoints - blackPoints;
    }

    /**
     * Returns what it thinks is the best move for the currently playing side using ply number of recursive assessments, as well as the assessment of this position.
     * If the game is already over, returns null as the best move.
     * 
     * @param {*} ply 0 will return an assessment of the current sitaution without looking ahead
     * @param {*} first pass true if calling to this function externally (as opposed to recursive calls) - for diagnostics only
     */
    play(ply, first)
    {
        var bestMove = null;
        var assessment;
        
        if (ply == 0)
        {
            assessment = this.assessment();
        }
        else if (this.outcome != ONGOING)
        {
            assessment = this.outcome;

            if (assessment == WHITE_WIN)
                assessment += ply;
                
            else if (assessment == BLACK_WIN)
                assessment -= ply;
        }
        else //game ongoing and ply >= 1
        {
            let legalMoves = this.getLegalMoves();
            assessment = (this.#whiteMoves) ? (BLACK_WIN - ply) : (WHITE_WIN + ply);

            for (const move of legalMoves)
            {               
                let tempBoard = this.clone();
                tempBoard.move(move);
                const advisedPlay = tempBoard.play(ply - 1, false);
                                
                if (this.#whiteMoves)
                {
                    if (advisedPlay.bestAssessment > assessment)
                    {
                        bestMove = move;
                        assessment = advisedPlay.bestAssessment;
                    }
                    // if (assessment >= WHITE_WIN) //save time as optimal move already found
                    // break;
                }
                else // black
                {
                    if (advisedPlay.bestAssessment < assessment)
                    {
                        bestMove = move;
                        assessment = advisedPlay.bestAssessment;
                    }
                    // if (assessment <= BLACK_WIN) //save time as optimal move already found
                    //     break;
                }

                

                // let ret = this.takeback();
                // console.assert(ret);
            }

            // no best move found - pick one at random
            if (bestMove === null)
            {
                bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
            }
        }
        
        return {advisedMove: bestMove, bestAssessment: assessment};
    } //play
}

// --------------------------------------------------------------------------------------------------------------------------------


const COLUMNS = 7;
const ROWS = 6;
const WIN = 4;

var game = new Board(ROWS, COLUMNS, WIN);

var readlineSync = require('readline-sync');

do 
{
    console.clear();
    console.log(game.display());

    console.log("Evaluation: " + game.assessment());

    // Wait for user's response.
    let col = readlineSync.question(`${game.isWhiteMove() ? "White" : "Black"}'s move. Column? `);

    try
    {
        if ((col == 't') || (col == 'T'))
            game.takeback();
        else if ((col == 'q') || (col == 'Q'))
            process.exit(1);
        else if ((col == 'r') || (col == 'R'))
        {
            game.reset();

        }
        else
            game.move(col);

            if (game.outcome == ONGOING)
            {
                let ply = 5;
                let p1 = Date.now();
                let pcMove = game.play(ply, true).advisedMove;
                let p2 = Date.now() - p1;
                readlineSync.question(`I will respond by moving at column ${pcMove}. Time: ${p2}. Press <enter>`);
                game.move(pcMove);
            }       
            
    }
    catch (exception)
    {
        readlineSync.question("This is an invalid move. Press <enter> to retry.");
    }

} while (game.outcome === ONGOING);

console.clear();
console.log(game.display());

if (game.outcome === DRAW)
    console.log("The game is a draw!")
else if (game.outcome === WHITE_WIN)
    console.log("White won!")
else if (game.outcome === BLACK_WIN)
    console.log("Black won!")
else
    throw "Unknown Outcome";

readlineSync.question("Press <enter> to end.");

console.log(game.gameLog);