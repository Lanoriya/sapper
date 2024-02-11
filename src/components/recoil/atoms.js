// atoms.js
import { atom } from 'recoil';

export const leaderboardState = atom({
  key: 'leaderboardState',
  default: JSON.parse(localStorage.getItem('leaderboard')) || [],
});
