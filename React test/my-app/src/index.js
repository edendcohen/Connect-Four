import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const COLUMNS = 7;
const ROWS = 6;
const WIN = 4;

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

    rows;
    cols;
    winSequence;
    whiteMoves;
    totalMoves;
    board;
    turnsRemaining;
    outcome;
    gameLog;
    debugBoard;

    constructor(rows, cols, winSequence) {
        //error handling
        if ((rows <= MIN_SIZE) || (cols <= MIN_SIZE))
            throw 'BoardTooSmall';

        if ((rows > MAX_SIZE) || (cols > MAX_SIZE))
            throw 'BoardTooLarge';

        if ((winSequence > rows) || (winSequence > cols)) 
            throw 'WinSequenceTooLong';
        

        if (winSequence <= 1)
            throw 'WinSequenceTooShort';

        this.rows = rows;
        this.cols = cols;
        this.winSequence = winSequence;

        //these attributes may change following subsequent games on the same board
        this.reset();

    }

    /**
     * Returns a new board with an identical context.
     */
    clone()
    {
        var newGame = new Board(this.rows, this.cols, this.winSequence);

        newGame.whiteMoves = this.whiteMoves;
        newGame.totalMoves = this.totalMoves;
        newGame.turnsRemaining = this.turnsRemaining;
        newGame.gameLog = this.gameLog.slice();
        newGame.outcome = this.outcome;

        //clone the board itself
        newGame.board = new Array(this.rows);       
        for (let r = 0; r < this.rows; r++) 
        {
            newGame.board[r] = new Array(this.cols);
            for (let c = 0; c < this.cols; c++)
                newGame.board[r][c] = this.board[r][c];
        }

        return newGame;
    }

    /**
     * Resets the board to an initial position (without changing its size and other properties defined when the object was created)
     */
    reset()
    {
        this.totalMoves = 0;
        this.whiteMoves = true;
        this.turnsRemaining = this.cols * this.rows;
        this.outcome = ONGOING;
        this.gameLog = new Array();
        
        this.board = new Array(this.rows);
        
        for (let r = 0; r < this.rows; r++) {
            this.board[r] = new Array(this.cols);
            for (let c = 0; c < this.cols; c++)
                this.board[r][c] = EMPTY;
        }
    }

    isWhiteMove()
    {
        return this.whiteMoves;
    }
    
    display()
    {
        var output = new String();

        for (let r = this.rows - 1; r >= -1; r--) {
            
            for (let c = 0; c < this.cols; c++)
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
            if (this.whiteMoves)
            {
                return Math.ceil(this.turnsRemaining / 2);
            }
            else //black moves
            {
                return Math.floor(this.turnsRemaining / 2);
            }
        }
        else // requetsed for black
        {
            if (!this.whiteMoves)
            {
                return Math.ceil(this.turnsRemaining / 2);
            }
            else //white moves
            {
                return Math.floor(this.turnsRemaining / 2);
            }
        }

        console.assert(true);
            
    }
    
    /**
     * Max number of sequences possible on this board size 
     */
    getMaxSequences()
    {
        var count = (this.cols - this.winSequence + 1) * this.rows; //horizontals

        count += (this.rows - this.winSequence + 1) * this.cols; //verticals

        count += (2 * (this.cols - this.winSequence + 1) * (this.rows - this.winSequence + 1)); //diagnoals

        return count;
     }

    // Returns how many partial rows of seqLength length the requested side has which currently are, or can potentially be extended to winSequence length.
    findSeqInRow(sideWhite, seqLength)
    {
        console.assert((seqLength <= this.winSequence) && (seqLength > 0));

        var row = 0;
        var count = 0;

        // Go over each row
        while (row < this.rows)
        {
            // Go over each sequence of winSequence cells (with overlaps)
            for (let col = 0; col <= (this.cols - this.winSequence); col++)
            {
                // count the total value in this subsequence
                let sum = 0;
                let emptyCells = 0;
                for (let i = col; i < col + this.winSequence; i++)
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
        console.assert((seqLength <= this.winSequence) && (seqLength > 0));

        var col = 0;
        var count = 0;

        // Go over each col
        while (col < this.cols)
        {
            // Go over each sequence of winSequence cells (with overlaps)
            for (let row = 0; row <= (this.rows - this.winSequence); row++)
            {
                // count the total value in this subsequence
                let sum = 0;
                let emptyCells = 0;
                for (let i = row; i < row + this.winSequence; i++)
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
    
    findSeqInDiag(sideWhite, seqLength)
    {
        console.assert((seqLength <= this.winSequence) && (seqLength > 0));

        var count = 0;

        // Start with the diagonals where col increases as row decreases
        for (let col = 0; col <= this.cols - this.winSequence; col++)
        {
            // Go over each sequence of winSequence cells (with overlaps)
            for (let row = this.rows - 1; row >= this.winSequence - 1; row--)
            {
                // count the total value in this subsequence
                let sum = 0;
                let emptyCells = 0;
                for (let i = 0; i < this.winSequence; i++)
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
        for (let col = 0; col <= this.cols - this.winSequence; col++)
        {
            // Go over each sequence of winSequence cells (with overlaps)
            for (let row = 0; row <= this.rows - this.winSequence; row++)
            {
                // count the total value in this subsequence
                let sum = 0;
                let emptyCells = 0;
                for (let i = 0; i < this.winSequence; i++)
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

    findAllSeq(sideWhite, seqLength)
    {
        return this.findSeqInRow(sideWhite, seqLength) + this.findSeqInCol(sideWhite, seqLength) + this.findSeqInDiag(sideWhite, seqLength);
    }

    /**
     * Returns the game's outcome:
     * WHITE_WIN - white won
     * BLACK_WIN - black won
     * DRAW - draw
     * ONGOING - game not over
     */
    getOutcome()
    {
        if (this.findAllSeq(!this.whiteMoves, this.winSequence) > 0)
            return this.whiteMoves ? BLACK_WIN : WHITE_WIN;

        if (this.turnsRemaining === 0)
            return DRAW;

        return ONGOING;
    }

    // Returns an array of all legal moves (by column numbers), or null if none.
    getLegalMoves()
    {
        if (this.outcome != ONGOING)
            return null;

        var movesList = new Array();
        
        for (let c = 0; c < this.cols; c++)
        {
            if (this.board[this.rows - 1][c] === EMPTY)
            {
                movesList.push(c);
            }
        }

        return movesList;
    }
    
    // If moves succeeds - returns row 
    // If move cannot be done, returns null.
    move(column)
    {
        if ((column < 0) || (column >= this.cols))
            return null;

        if (this.outcome != ONGOING)
            return null;

        for (let r = 0; r < this.rows; r++)
        {
            if (this.board[r][column] === EMPTY)
            {
                this.board[r][column] = (this.whiteMoves) ? WHITE : BLACK;
                
                this.gameLog.push({side:this.whiteMoves?"White":"Black", column:parseInt(column,10)}); //add move to game log

                this.whiteMoves = !this.whiteMoves;
                this.totalMoves++;
                this.turnsRemaining--;

                this.outcome = this.getOutcome();

                this.debugBoard = this.display();

                return r;
            }
        }

        return null;
    }

    /**
     * Takes back the last move played and returns true if succeeded
     */
    takeback()
    {
        if (this.totalMoves > 0)
        {
            console.assert(this.gameLog.length > 0);
            var lastMove = this.gameLog.pop(); //pop the last move from the log
            var lastRow = lastMove.row;
            var lastCol = lastMove.col;

            console.assert(this.board[lastRow][lastCol] !== EMPTY);

            this.board[lastRow][lastCol] = EMPTY; //turn last cell back to EMPTY state
            this.whiteMoves = !this.whiteMoves; //change side
            this.totalMoves--;
            this.turnsRemaining ++;
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
        
        console.assert((col >= 0) && (row >= 0) && (col <= this.cols) && (row <= this.rows));

        for (let r = Math.max(row - 1,0); r <= Math.min(row + 1, this.rows - 1); r++)
        {
            for (let c = Math.max(col - 1,0); c <= Math.min(col + 1, this.cols - 1); c++)
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
        var whitePoints = 0;
        var blackPoints = 0;

        for (let r = 0; r < this.rows; r++) 
            for (let c = 0; c < this.cols; c++)
            {
                let {whites, blacks, empties} = this.getNeighbors(r,c);
                let points = 0;

                if (r < this.rows / 2)
                    points += r;
                else 
                    points += this.rows - r;
                
                if (c < this.cols / 2)
                    points += c;
                else 
                    points += this.cols - c;
            
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
        let advantageFactor = (1 / this.turnsRemaining);

        if (remainingBlack > remainingWhite)
            blackPoints *= (1 + advantageFactor);
        else if (remainingWhite > remainingBlack)
            whitePoints *= (1 + advantageFactor);
        else //same number of moves remaining
        {
            // give a slight first-movers advantage
            if (this.whiteMoves)
                whitePoints *= (1 + advantageFactor / 3);
            else
                blackPoints *= (1 + advantageFactor / 3);
        }
        
        // go through all sequences of length 2 until (but lower than) winSequence
        for (let i = this.winSequence - 1; i >= 2; i--)
        {
            whitePoints += Math.pow(this.findAllSeq(true, i), 3);
            blackPoints += Math.pow(this.findAllSeq(false, i), 3);
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
        
        if (this.totalMoves === 0) // always start in the middle
        {
           bestMove = this.cols >> 1;
           assessment = 0;
        }
        else if (ply == 0)
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
            assessment = (this.whiteMoves) ? (BLACK_WIN - ply) : (WHITE_WIN + ply);

            for (const move of legalMoves)
            {               
                let tempBoard = this.clone();
                tempBoard.move(move);
                const advisedPlay = tempBoard.play(ply - 1, false);
                                
                if (this.whiteMoves)
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


//// ******************* React Front-end ******************************************

const COMPUTER_WHITE = false;
const COMPUTER_PLY = 5;
const WHITE_TOKEN = "⚪";
const BLACK_TOKEN = "⚫";
const LAST_CPU_TOKEN = "📀";
const RESTART_GAME = 1;
const TAKEBACK = 2;
const PLAY_COMPUTER = 3;

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class ReactBoard extends React.Component {
  renderSquare(r,c) {
    return (
      <Square
        value={this.props.squares[r][c]}
        onClick={() => this.props.onClick(r,c)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(5,0)}
          {this.renderSquare(5,1)}
          {this.renderSquare(5,2)}
          {this.renderSquare(5,3)}
          {this.renderSquare(5,4)}
          {this.renderSquare(5,5)}
          {this.renderSquare(5,6)}
        </div>
        <div className="board-row">
          {this.renderSquare(4,0)}
          {this.renderSquare(4,1)}
          {this.renderSquare(4,2)}
          {this.renderSquare(4,3)}
          {this.renderSquare(4,4)}
          {this.renderSquare(4,5)}
          {this.renderSquare(4,6)}
        </div>
        <div className="board-row">
          {this.renderSquare(3,0)}
          {this.renderSquare(3,1)}
          {this.renderSquare(3,2)}
          {this.renderSquare(3,3)}
          {this.renderSquare(3,4)}
          {this.renderSquare(3,5)}
          {this.renderSquare(3,6)}
        </div>
        <div className="board-row">
          {this.renderSquare(2,0)}
          {this.renderSquare(2,1)}
          {this.renderSquare(2,2)}
          {this.renderSquare(2,3)}
          {this.renderSquare(2,4)}
          {this.renderSquare(2,5)}
          {this.renderSquare(2,6)}
        </div>
        <div className="board-row">
          {this.renderSquare(1,0)}
          {this.renderSquare(1,1)}
          {this.renderSquare(1,2)}
          {this.renderSquare(1,3)}
          {this.renderSquare(1,4)}
          {this.renderSquare(1,5)}
          {this.renderSquare(1,6)}
        </div>
        <div className="board-row">
          {this.renderSquare(0,0)}
          {this.renderSquare(0,1)}
          {this.renderSquare(0,2)}
          {this.renderSquare(0,3)}
          {this.renderSquare(0,4)}
          {this.renderSquare(0,5)}
          {this.renderSquare(0,6)}
        </div>
      </div>
    );
  }
}




class ReactGame extends React.Component {
  
  game;
  computerWhite;

  
  constructor(props) {
    super(props);
    this.computerWhite = COMPUTER_WHITE;
    this.resetState();
  }


  resetState()
  {
    this.game = new Board(ROWS, COLUMNS, WIN);
    
    var firstMove = null;

    if (this.computerWhite)
    {
        firstMove = this.game.play(COMPUTER_PLY, true).advisedMove;
        this.game.move(firstMove);
    }

    var squares = new Array(ROWS);       
    for (let r = 0; r < ROWS; r++) 
    {
        squares[r] = new Array(COLUMNS);
        for (let c = 0; c < squares[r].length; c++)
            squares[r][c] = null;
    }

    if (this.computerWhite)
    {
       console.assert(firstMove != null);
       squares[0][firstMove] = WHITE_TOKEN;
    }

    this.state = {
      history: [
        {
          squares
        }
      ],
      stepNumber: 0,
      whiteNext: !this.computerWhite
    };


  }

  handleClick(r,c) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    //Integrate 
    if (this.game.outcome !== ONGOING)
    {
      return;
    }

    let row = this.game.move(c);
    if (row == null) //invalid move
    { 
      return;
    }
    squares[row][c] = this.computerWhite ? BLACK_TOKEN : WHITE_TOKEN;

    // Computer plays
    let computerMove = this.game.play(COMPUTER_PLY, true).advisedMove;
    if (computerMove != null)
    {
        row = this.game.move(computerMove);
        squares[row][computerMove] = this.computerWhite ? WHITE_TOKEN : BLACK_TOKEN;
    }

    this.setState({
      history: history.concat([
        {
          squares: squares
        }
      ]),
      stepNumber: history.length,
      whiteNext: this.state.whiteNext
    });
  }

  jumpTo(actionType) 
  {
    switch (actionType)
    {
      case RESTART_GAME:
        this.resetState();
        //this.render();

        break;

      case TAKEBACK:
        break;

      case PLAY_COMPUTER:
        break;

      default:
        console.assert(false);
    }
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    let status = "Game over: ";
    
    // If game is over with a win:
    if (this.game.outcome === WHITE_WIN || (this.game.outcome === BLACK_WIN))
    {
      let winningToken = (this.game.outcome === WHITE_WIN) ? WHITE_TOKEN : BLACK_TOKEN;
      if (this.computerWhite != null) // if computer played
      {
        if (this.computerWhite === this.game.whiteMoves)
        {
          status += `you ${winningToken} win!`;
        }
        else
        {
          status += `computer ${winningToken} wins!`;
        }
      }
      else
        status += `${winningToken} player wins!`;
    }
    else if (this.game.outcome === DRAW)
    {
      status += "DRAW!";
    }
    else // ongoing game
        status = (this.state.whiteNext ? WHITE_TOKEN : BLACK_TOKEN) + " plays next!"

    return (
      <div className="game">
        <div className="game-board">
          <ReactBoard
            squares={current.squares}
            onClick={(r,c) => this.handleClick(r,c)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div></div>
          <ol>
              <li><button onClick={() => this.jumpTo(1)}>{"Restart game"}</button></li><br></br>
              <li><button onClick={() => this.jumpTo(2)}>{"Take back"}</button></li><br></br>
              <li><button onClick={() => this.jumpTo(3)}>{"Play computer"}</button></li><br></br>
          </ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<ReactGame />, document.getElementById("root"));
