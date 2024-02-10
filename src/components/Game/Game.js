import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Game.css';

function Game() {
  const location = useLocation();
  const initialDifficulty = new URLSearchParams(location.search).get('difficulty') || 8;
  const initialBombCount = new URLSearchParams(location.search).get('bombCount') || 10;
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState(parseInt(initialDifficulty));
  const [bombCount, setBombCount] = useState(parseInt(initialBombCount));
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [win, setWin] = useState(false);

  useEffect(() => {
    startNewGame();
  }, [difficulty, bombCount]);

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
      case +initialDifficulty:
        return +initialBombCount;
      default:
        return 10;
    }
  };

  const getSizeByDifficulty = (difficulty) => {
    return difficulty;
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
    }
    setBoard(newBoard);
    return newBoard;
  };
  
  const placeBombs = (currentBoard, firstClickRowIndex, firstClickCellIndex) => {
    const size = getSizeByDifficulty(difficulty);
  
    const excludedCells = new Set(); // Хранение индексов клеток, которые нужно исключить из выбора для размещения мин
    // Исключить клетку первого клика из возможных местоположений для бомб
    excludedCells.add(`${firstClickRowIndex}-${firstClickCellIndex}`);
  
    // Создать копию текущего состояния поля
    const newBoard = [...currentBoard];
  
    for (let i = 0; i < bombCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * size);
        y = Math.floor(Math.random() * size);
      } while (excludedCells.has(`${x}-${y}`)); // Повторять выбор, пока не будет выбрана клетка, которая не была исключена
  
      // Обновить клетку на новом поле, устанавливая бомбу
      newBoard[x][y].isBomb = true;
    }
  
    return newBoard;
  };
  

  const countAdjacentBombs = (rowIndex, cellIndex) => {
    let count = 0;
    const size = getSizeByDifficulty(difficulty);
    const minIndex = 0;
    const maxIndex = size - 1;
    
    for (let i = Math.max(minIndex, rowIndex - 1); i <= Math.min(rowIndex + 1, maxIndex); i++) {
      for (let j = Math.max(minIndex, cellIndex - 1); j <= Math.min(cellIndex + 1, maxIndex); j++) {
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
      if (score === 0 && !cell.isBomb) {
        const boardWithBombs = placeBombs(board, rowIndex, cellIndex);
        setBoard(boardWithBombs);
      }

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
    const minIndex = 0;
    const maxIndex = size - 1;

    if (rowIndex < minIndex || rowIndex > maxIndex || cellIndex < minIndex || cellIndex > maxIndex || newBoard[rowIndex][cellIndex].isOpen || board[rowIndex][cellIndex].isFlagged || board[rowIndex][cellIndex].isQuestion) {
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

    if (flagCount === bombCount && !isFlagged) {
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
    setBoard(emptyBoard);
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
        <div>Общее количество мин: {bombCount - flagCount}</div>
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
