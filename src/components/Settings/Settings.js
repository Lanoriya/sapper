import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState(8);
  const [minesCount, setMinesCount] = useState(10);
  const [customSize, setCustomSize] = useState(false);

  const handleSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setCustomSize(newSize === 3);
  
    let newMinesCount;
    switch (newSize) {
      case 8:
        newMinesCount = 10;
        break;
      case 16:
        newMinesCount = 40;
        break;
      case 32:
        newMinesCount = 100;
        break;
      default:
        newMinesCount = minesCount;
        break;
    }
  
    setBoardSize(newSize);
    setMinesCount(newMinesCount);
  };

  const handleCustomSizeChange = (event) => {
    let newSize = parseInt(event.target.value);
    // Установить максимальный размер поля 100x100
    if (newSize <= 0) {
      newSize = 1;
    }

    if (newSize > 100) {
      newSize = 100;
    }
    
    setBoardSize(newSize);
  };

  const handleMinesChange = (event) => {
    let newMinesCount = parseInt(event.target.value);
    const maxMines = (boardSize * boardSize) - 1;

    if (newMinesCount <= 0) {
      newMinesCount = 1;
    }

    if (newMinesCount > maxMines) {
      newMinesCount = maxMines;
    }
    setMinesCount(newMinesCount);
  };

  const handleStartGame = () => {
    let newSize = parseInt(boardSize);
    if (newSize < 3) {
      newSize = 3;
      setBoardSize(newSize);
    }

    let updatedMinesCount = minesCount;
    if (minesCount > (newSize * newSize) - 1) {
      updatedMinesCount = 1; // Обновляем количество мин, если оно больше максимально допустимого значения
      setMinesCount(updatedMinesCount); // Обновляем состояние
    }

    if (minesCount > 1000) {
      updatedMinesCount = 1000;
      setMinesCount(updatedMinesCount)
    }

    navigate(`/game?difficulty=${newSize}&bombCount=${updatedMinesCount}`);
  };

  return (
    <div className="settings">
      <div className='settings-container'>
        <label htmlFor="difficulty">Выберите размер поля:</label>
        <select id="board-size" value={customSize ? 3 : boardSize} onChange={handleSizeChange}>
          <option value={8}>8x8</option>
          <option value={16}>16x16</option>
          <option value={32}>32x32</option>
          <option value={3}>Другой размер</option>
        </select>
        {customSize && (
          <div className='custom'>
            <label htmlFor="mines-count">Введите размер поля (max 100x100):</label>
            <input type="number" min="3" max="100" value={boardSize} onChange={handleCustomSizeChange} />
            <label htmlFor="mines-count">Введите количество мин (max 1000):</label>
            <input type="number" id="mines-count" min="1" max='1000' value={minesCount} onChange={handleMinesChange} />
          </div>
        )}
        <button onClick={handleStartGame}>Начать игру</button>
      </div>
    </div>
  );
}

export default Settings;
