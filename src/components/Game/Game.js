import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Game.css';

function Game() {
  const location = useLocation();
  const initialDifficulty = new URLSearchParams(location.search).get('difficulty') || 8;
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(parseInt(initialDifficulty));
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [win, setWin] = useState(false);

  useEffect(() => {
    startNewGame();
  }, [difficulty]);

  const handleDifficultySelection = () => {
    navigate('/');
  };

  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  const getBombCountByDifficulty = (difficulty) => {
    switch (difficulty) {
      case 8:
        return 10;
      case 16:
        return 40;
      case 32:
        return 100;
      default:
        return 10;
    }
  };

  const getSizeByDifficulty = (difficulty) => {
    switch (difficulty) {
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      default:
        return 8;
    }
  };

  const getColorClass = (adjacentBombs) => {
    switch (adjacentBombs) {
      case 1:
        return 'blue';
      case 2:
        return 'green';
      case 3:
        return 'red';
      case 4:
        return 'darkblue';
      case 5:
        return 'brown';
      case 6:
        return 'turquoise';
      case 7:
        return 'black';
      case 8:
        return 'white';
      default:
        return '';
    }
  };

  const createEmptyBoard = () => {
    const newBoard = [];
    const size = getSizeByDifficulty(difficulty);
    for (let i = 0; i < size; i++) {
      const newRow = [];
      for (let j = 0; j < size; j++) {
        newRow.push({ isBomb: false, isOpen: false, isFlagged: false, isQuestion: false, adjacentBombs: 0, });
      }
      newBoard.push(newRow);
      setBoard(newBoard)
    }
    return newBoard;
  };
  
  const placeBombs = (emptyBoard) => {
    const bombCount = getBombCountByDifficulty(difficulty);
    const size = getSizeByDifficulty(difficulty);
    for (let i = 0; i < bombCount; i++) {
      let x = Math.floor(Math.random() * size);
      let y = Math.floor(Math.random() * size);
      emptyBoard[x][y].isBomb = true;
    }
    return emptyBoard;
  };

  const countAdjacentBombs = (rowIndex, cellIndex) => {
    let count = 0;
    const size = getSizeByDifficulty(difficulty);
    
    for (let i = Math.max(0, rowIndex - 1); i <= Math.min(rowIndex + 1, size -1); i++) {
      for (let j = Math.max(0, cellIndex - 1); j <= Math.min(cellIndex + 1, size -1); j++) {
        if (board[i][j].isBomb) {
          count++;
        }
      }
    }
    return count;
  }

  const revealAllMines = (board) => {
    const newBoard = [...board];
    for (let i = 0; i < newBoard.length; i++) {
      for (let j = 0; j < newBoard[i].length; j++) {
        if (newBoard[i][j].isBomb) {
          newBoard[i][j].isOpen = true;
        }
      }
    }
    return newBoard;
  };

  const checkWin = () => {
    const size = getSizeByDifficulty(difficulty);
    const bombCount = getBombCountByDifficulty(difficulty);

    let countOpen = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (board[i][j].isOpen) {
          countOpen++;
        }
      }
    }
    setScore(countOpen * 10);
    
    if (countOpen === (size * size - bombCount)) {
      setWin(true);
    }
  }

  const handleClick = (rowIndex, cellIndex) => {
    const cell = board[rowIndex][cellIndex]

    if (!gameOver && !win) {
      if (cell.isOpen) {
        return; // Игнорировать повторное нажатие, если клетка уже открыта
      }

      if (!cell.isFlagged && !cell.isQuestion) {
        openCell(rowIndex, cellIndex)
      }

      if (cell.isBomb) {
        setGameOver(true)
        const revealedBoard = revealAllMines(board);
        setBoard(revealedBoard);
      } else {
        checkWin();
      }
    }
  };

  const openAdjacentCells = (rowIndex, cellIndex, newBoard) => {
    const size = getSizeByDifficulty(difficulty);

    if (rowIndex < 0 || rowIndex >= size || cellIndex < 0 || cellIndex >= size || newBoard[rowIndex][cellIndex].isOpen || board[rowIndex][cellIndex].isFlagged || board[rowIndex][cellIndex].isQuestion) {
      return;
    }

    const countBombs = countAdjacentBombs(rowIndex, cellIndex);
    newBoard[rowIndex][cellIndex].isOpen = true;
    newBoard[rowIndex][cellIndex].adjacentBombs = countBombs;

    if (countBombs === 0) {
      openAdjacentCells(rowIndex - 1, cellIndex, newBoard);
      openAdjacentCells(rowIndex + 1, cellIndex, newBoard);
      openAdjacentCells(rowIndex, cellIndex - 1, newBoard);
      openAdjacentCells(rowIndex, cellIndex + 1, newBoard);
      openAdjacentCells(rowIndex - 1, cellIndex - 1, newBoard);
      openAdjacentCells(rowIndex - 1, cellIndex + 1, newBoard);
      openAdjacentCells(rowIndex + 1, cellIndex - 1, newBoard);
      openAdjacentCells(rowIndex + 1, cellIndex + 1, newBoard);
    }
  }

  const openCell = (rowIndex, cellIndex) => {
    const newBoard = [...board];

    const countBombs = countAdjacentBombs(rowIndex, cellIndex)
    if (countBombs > 0) {
      newBoard[rowIndex][cellIndex].isOpen = true;
      newBoard[rowIndex][cellIndex].adjacentBombs = countBombs;
    }

    else if (countBombs === 0) {
      openAdjacentCells(rowIndex, cellIndex, newBoard);
    }
    setBoard(newBoard);
  }

  // Правой кнопкой
  const handleContextMenu = (event, rowIndex, cellIndex) => {
    event.preventDefault();
    const newBoard = [...board];
    const cell = newBoard[rowIndex][cellIndex];

    if (!gameOver && !win && !cell.isOpen) {
      toggleElement(rowIndex, cellIndex, board[rowIndex][cellIndex].isFlagged, board[rowIndex][cellIndex].isQuestion)
    }
  };

  // Выбор элемента для правой
  const toggleElement = (rowIndex, cellIndex, isFlagged, isQuestion) => {
    const newBoard = [...board]
    const cell = newBoard[rowIndex][cellIndex];

    if (flagCount === getBombCountByDifficulty(difficulty) && !isFlagged) {
      return '';
    }

    if (!isFlagged && !isQuestion) {
      setFlagCount(prevCount => prevCount + 1);
      cell.isFlagged = true;
    } else if (isFlagged && !isQuestion) {
      setFlagCount(prevCount => prevCount - 1);
      cell.isFlagged = false;
      cell.isQuestion = true;
    } else {
      cell.isQuestion = false;
      cell.isFlagged = false;
    }
    setBoard(newBoard);
  }

  const startNewGame = () => {
    setFlagCount(0)
    setScore(0);
    setTime(0)
    setWin(false);
    setGameOver(false);
    const emptyBoard = createEmptyBoard();
    const boardBombs = placeBombs(emptyBoard)
    setBoard(boardBombs);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prevCount) => prevCount + 1);
    }, 1000);
    
    if (win || gameOver) {
      clearInterval(intervalId)
    }
    
    return () => clearInterval(intervalId);
  }, [win, gameOver]);

  return (
    <div className="game">
      <div className='score'>
        <div>Счёт: {score}</div>
        <div>Время: {time}</div>
        <div>Общее количество мин: {getBombCountByDifficulty(difficulty) - flagCount}</div>
      </div>
      <div className={`board board-${getSizeByDifficulty(difficulty)}`}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className='row'>
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="cell" onClick={() => handleClick(rowIndex, cellIndex)} onContextMenu={(event) => handleContextMenu(event, rowIndex, cellIndex)}>
                {cell.isOpen && !cell.isBomb && cell.adjacentBombs !== 0 && (
                  <div className={`cell-clear cell-number ${getColorClass(cell.adjacentBombs)}`}>
                    {cell.adjacentBombs}
                  </div>
                )}
                {cell.isOpen && !cell.isBomb && cell.adjacentBombs === 0 && <div className="cell-clear" style={{ background: '#282828' }}></div>}
                {cell.isOpen && cell.isBomb && <div className='cell-bomb' style={{ background: '#CD5C5C' }}>💣</div>}
                {!cell.isOpen && cell.isFlagged && <div className="cell-clear" style={{ background: '#282828' }}>🚩</div>}
                {!cell.isOpen && cell.isQuestion && <div className="cell-clear" style={{ background: '#282828' }}>❓</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className='buttons'>
        <button onClick={startNewGame}>Начать заново</button>
        <button onClick={handleDifficultySelection}>Выбор сложности</button>
      </div>
      {(gameOver || win) && 
      <div className='end-game'>
        <div className='end-game-content'>
          {gameOver && <div>Игра окончена!</div>}
          {win && <div>Вы выиграли!</div>}
          <button onClick={startNewGame}>Новая игра</button>
        </div>
      </div>}
    </div >
  );
}

export default Game;
