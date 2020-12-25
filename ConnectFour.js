const MAX_SIZE = 10;
const EMPTY = 0;
const WHITE = 1;
const BLACK = -100;
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
    gameLog;

    constructor(rows, cols, winSequence) {
        //error handling
        if ((rows <= 0) || (cols <= 0))
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

    clone()
    {
        var newBoard = new Board(this.#rows, this.#cols, this.#winSequence);

        newBoard.#whiteMoves = this.#whiteMoves;
        newBoard.#totalMoves = this.#totalMoves;
        newBoard.#turnsRemaining = this.#turnsRemaining;
        newBoard.gameLog = this.gameLog;

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

    reset()
    {
        this.#totalMoves = 0;
        this.#whiteMoves = true;
        this.#turnsRemaining = this.#cols * this.#rows;
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

    findSeqInCol(sideWhite, seqLength)
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

    /**
     * Returns the game's outcome:
     * WHITE - white won
     * BLACK - black won
     * DRAW - draw
     * ONGOING - game not over
     */
    getOutcome()
    {
        if (this.#findSeqInRow(!this.#whiteMoves, this.#winSequence) > 0)
            return this.#whiteMoves ? BLACK : WHITE;

        if (this.findSeqInCol(!this.#whiteMoves, this.#winSequence) > 0)
            return this.#whiteMoves ? BLACK : WHITE;

        if (this.#findSeqInDiag(!this.#whiteMoves, this.#winSequence) > 0)
            return this.#whiteMoves ? BLACK : WHITE;

        if (this.#turnsRemaining === 0)
            return DRAW;

        return ONGOING;
    }

    // Returns an array of all legal moves (by column numbers), or null if none.
    getLegalMoves()
    {
        if (this.getOutcome() != ONGOING)
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

        for (let r = 0; r < this.#rows; r++)
        {
            if (this.board[r][column] === EMPTY)
            {
                this.board[r][column] = (this.#whiteMoves) ? WHITE : BLACK;
                
                this.gameLog.push({white:this.#whiteMoves, row:r, col:column}); //add move to game log

                this.#whiteMoves = !this.#whiteMoves;
                this.#totalMoves++;
                this.#turnsRemaining--;

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

            return true;
        }

        return false;
    }
}

const COLUMNS = 4;
const ROWS = 4;
const WIN = 4;

var game = new Board(ROWS, COLUMNS, WIN);

var readlineSync = require('readline-sync');

var outcome;

do 
{
    console.clear();
    console.log(game.display());

    // Wait for user's response.
    let col = readlineSync.question(`${game.isWhiteMove() ? "White" : "Black"}'s move. Column? `);

    try
    {
        var win = game.move(col);
    }
    catch (exception)
    {
        readlineSync.question("This is an invalid move. Press <enter> to retry.");
    }

    outcome = game.getOutcome();

} while (outcome === ONGOING);

console.clear();
console.log(game.display());

if (outcome === DRAW)
    console.log("The game is a draw!")
else if (outcome === WHITE)
    console.log("White won!")
else if (outcome === BLACK)
    console.log("Black won!")
else
    throw "Unknown Outcome";