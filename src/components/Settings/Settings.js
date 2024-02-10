import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css'

function Settings({ difficulty }) {
  const navigate = useNavigate();

  const handleDifficultyChange = (event) => {
    const newDifficulty = parseInt(event.target.value);
    navigate(`/game?difficulty=${newDifficulty}`);
  };

  return (
    <div className="settings">
      <div className='settings-container'>
        <label htmlFor="difficulty">Выберите размер поля:</label>
        <select id="difficulty" value={difficulty} onChange={handleDifficultyChange}>
          <option>Сложность</option>
          <option value={8}>8x8</option>
          <option value={16}>16x16</option>
          <option value={32}>32x32</option>
        </select>
      </div>
    </div>
  );
}

export default Settings;
