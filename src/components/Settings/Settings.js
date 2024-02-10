import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

function Settings({ difficulty, bombCount }) {
  const navigate = useNavigate();
  const [boardSize, setBoardSize] = useState(8);
  const [minesCount, setMinesCount] = useState(10);
  const [customSize, setCustomSize] = useState(false);

  const handleSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    if (newSize === -1) {
      setCustomSize(true);
    } else {
      setBoardSize(newSize);
    }
  };

  const handleCustomSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setBoardSize(newSize);
  };

  const handleMinesChange = (event) => {
    const newMinesCount = parseInt(event.target.value);
    setMinesCount(newMinesCount);
  };

  const handleStartGame = () => {
    navigate(`/game?difficulty=${boardSize}&bombCount=${minesCount}`);
  };

  return (
    <div className="settings">
      <div className='settings-container'>
        <label htmlFor="difficulty">Выберите размер поля:</label>
        <select id="board-size" value={customSize ? -1 : boardSize} onChange={handleSizeChange}>
          <option value={8}>8x8</option>
          <option value={16}>16x16</option>
          <option value={32}>32x32</option>
          <option value={-1}>Другой размер</option>
        </select>
        {customSize && (
          <div className='custom'>
            <input type="number" min="3" max="512" value={boardSize} onChange={handleCustomSizeChange} />
            <label htmlFor="mines-count">Введите количество мин:</label>
            <input type="number" id="mines-count" min="1" value={minesCount} onChange={handleMinesChange} />
          </div>
        )}
        <button onClick={handleStartGame}>Начать игру</button>
      </div>
    </div>
  );
}

export default Settings;
