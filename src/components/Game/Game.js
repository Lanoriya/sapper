import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { leaderboardState } from '../recoil/atoms';
import './Game.css';

function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialDifficulty = new URLSearchParams(location.search).get('difficulty') || 8;
  const initialBombCount = new URLSearchParams(location.search).get('bombCount') || 10;
  const [leaderboard, setLeaderboard] = useRecoilState(leaderboardState);

  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  // eslint-disable-next-line
  const [correctFlagCount, setCorrectFlagCount] = useState(0);
  const [leaderboardUpdated, setLeaderboardUpdated] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);
  const [name, setName] = useState('');
  const [win, setWin] = useState(false);

  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDifficulty, initialBombCount]);

  const handleDifficultySelection = () => {
    navigate('/');
  };

  const leaderBoardLink = () => {
    navigate('/leaderboard');
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
    for (let i = 0; i < initialDifficulty; i++) {
      const newRow = [];
      for (let j = 0; j < initialDifficulty; j++) {
        newRow.push({ isBomb: false, isOpen: false, isFlagged: false, isQuestion: false, adjacentBombs: 0, });
      }
      newBoard.push(newRow);
    }
    setBoard(newBoard);
    return newBoard;
  };

  const placeBombs = (currentBoard, firstClickRowIndex, firstClickCellIndex) => {
    const excludedCells = new Set(); // Хранение индексов клеток, которые нужно исключить из выбора для размещения мин
    // Исключить клетку первого клика из возможных местоположений для бомб
    excludedCells.add(`${firstClickRowIndex}-${firstClickCellIndex}`);

    // Создать копию текущего состояния поля
    const newBoard = [...currentBoard];

    for (let i = 0; i < initialBombCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * initialDifficulty);
        y = Math.floor(Math.random() * initialDifficulty);
      } while (excludedCells.has(`${x}-${y}`)); // Повторять выбор, пока не будет выбрана клетка, которая не была исключена

      // Обновить клетку на новом поле, устанавливая бомбу
      newBoard[x][y].isBomb = true;
    }

    return newBoard;
  };


  const countAdjacentBombs = (rowIndex, cellIndex) => {
    let count = 0;
    const minIndex = 0;
    const maxIndex = initialDifficulty - 1;

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
    let countOpen = 0;
    for (let i = 0; i < initialDifficulty; i++) {
      for (let j = 0; j < initialDifficulty; j++) {
        if (board[i][j].isOpen) {
          countOpen++;
        }
      }
    }
    setScore(countOpen * 10);

    if (countOpen === (initialDifficulty * initialDifficulty - initialBombCount)) {
      setWin(true);
    }
  }

  const handleClick = (rowIndex, cellIndex) => {
    const cell = board[rowIndex][cellIndex]

    if (!gameOver && !win && !cell.isFlagged && !cell.isQuestion) {
      if (score === 0 && !cell.isBomb) {
        const boardWithBombs = placeBombs(board, rowIndex, cellIndex);
        setBoard(boardWithBombs);
      }

      if (cell.isOpen) {
        return; // Игнорировать повторное нажатие, если клетка уже открыта
      }

      openCell(rowIndex, cellIndex)

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
    const minIndex = 0;
    const maxIndex = initialDifficulty - 1;

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

    if (flagCount === +initialBombCount && !isFlagged) {
      return '';
    }

    if (!isFlagged && !isQuestion) {
      setFlagCount(prevCount => prevCount + 1);
      cell.isFlagged = true;

      if (cell.isBomb) {
        setCorrectFlagCount(prevCount => prevCount + 1);
      }

    } else if (isFlagged && !isQuestion) {
      setFlagCount(prevCount => prevCount - 1);
      cell.isFlagged = false;

      if (cell.isBomb) {
        setCorrectFlagCount(prevCount => prevCount - 1);
      }

      cell.isQuestion = true;
    } else {
      cell.isQuestion = false;
      cell.isFlagged = false;
    }

    let correctFlags = 0;
    newBoard.forEach(row => {
      row.forEach(cell => {
        if (cell.isFlagged && cell.isBomb) {
          correctFlags++;
        }
      });
    });
    setCorrectFlagCount(correctFlags);

    if (correctFlags === (+initialBombCount)) {
      setWin(true);
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

  const updateLeaderboard = (currentTime) => {
    if (currentTime.name.trim() === "") {
      return; // Если имя игрока пустое, не добавляем запись в таблицу лидеров
    }
  
    const isBrokeRecord = leaderboard.some(entry => entry.time > currentTime.time);
    const isDuplicateRecord = leaderboard.some(entry => entry.time === currentTime.time && entry.name === currentTime.name);
    
    if ((isBrokeRecord || leaderboard.length < 10) && !isDuplicateRecord) {
      const updatedLeaderboard = [...leaderboard, currentTime];
      updatedLeaderboard.sort((a, b) => a.time - b.time);
      const trimmedLeaderboard = updatedLeaderboard.slice(0, 10);
      setLeaderboard(trimmedLeaderboard);
      localStorage.setItem('leaderboard', JSON.stringify(trimmedLeaderboard));
    }
  };

  useEffect(() => {
    if (win && !leaderboardUpdated) {
      setCurrentTime(time);
      updateLeaderboard({ name, time: currentTime });
      setLeaderboardUpdated(true);
    }
  }, [win, currentTime, time, leaderboardUpdated]);

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
        <div>Общее количество мин: {initialBombCount - flagCount}</div>
      </div>
      <div className={`board board-${initialDifficulty}`}>
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
        <button onClick={leaderBoardLink}>Таблица лидеров</button>
      </div>
      {(gameOver || win) &&
        <div className='end-game'>
          <div className='end-game-content'>
            {gameOver &&
            <div>
              <h5>Игра окончена!</h5>
              <button onClick={startNewGame}>Новая игра</button>
            </div>}
            {win && <div>Вы выиграли!</div>}
            {win &&
              <div className='win-about'>
                <h5>Введите ваше имя</h5>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <button onClick={() => { updateLeaderboard({ name: name, time: currentTime }); startNewGame(); }}>Сохранить имя</button>
              </div>
            }
          </div>
        </div>}
    </div >
  );
}

export default Game;
