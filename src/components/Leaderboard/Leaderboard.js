import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { leaderboardState } from '../recoil/atoms';
import './Leaderboard.css';

function Leaderboard() {
  const leaderboard = [...useRecoilValue(leaderboardState)];
  const navigate = useNavigate();

  const handleDifficultySelection = () => {
    navigate('/');
  };

  const goBack = () => {
    navigate(-1); // Возвращает на одну вкладку назад
  };

  return (
    <div className='leaderboard'>
      <div className='leaderboard-list'>
        <h2>Таблица лидеров</h2>
        <ol>
          {leaderboard
            .sort((a, b) => a.time - b.time)
            .slice(0, 10)
            .map((entry, index) => (
              <li key={index}>
                {entry.name} - {entry.time} секунд
              </li>
            ))}
        </ol>
      </div>
      <div className='buttons'>
        <button onClick={handleDifficultySelection}>Выбор сложности</button>
        <button onClick={goBack}>Вернуться к игре</button>
      </div>
    </div>
  );
}

export default Leaderboard;
