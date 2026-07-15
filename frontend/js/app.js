import { NeonBreakerGame } from './game.js';
import { NeonBreakerUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI controller
  const ui = new NeonBreakerUI();
  
  // Initialize Game controller and wire its events to the UI
  const game = new NeonBreakerGame('gameCanvas', {
    onScoreChange: (score) => ui.updateScore(score),
    onLivesChange: (lives) => ui.updateLives(lives),
    onLevelChange: (level) => ui.updateLevel(level),
    
    onGameOver: (score) => {
      ui.showGameOverScreen(score);
    },
    
    onStateChange: (state) => {
      if (state === 'playing') {
        ui.showPlayingScreen();
      } else if (state === 'start') {
        ui.showStartScreen();
      }
    }
  });

  // Attach click listener for starting from UI overlay
  document.getElementById('startGameBtn').addEventListener('click', () => {
    game.start();
  });

  // Attach click listener for restarting from UI overlay
  document.getElementById('restartGameBtn').addEventListener('click', () => {
    game.resetGame();
    game.start();
  });

  // Load scoreboard items on boot
  ui.loadLeaderboard();
});
