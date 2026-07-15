import { getScores, submitScore } from './api.js';
import { CONFIG } from './config.js';

export class NeonBreakerUI {
  constructor() {
    // Cache DOM Elements
    this.scoreSpan = document.getElementById('hudScore');
    this.livesSpan = document.getElementById('hudLives');
    this.levelSpan = document.getElementById('hudLevel');
    
    this.leaderboardList = document.getElementById('leaderboardList');
    this.refreshBtn = document.getElementById('refreshScoresBtn');
    
    this.usernameInput = document.getElementById('usernameInput');
    this.saveNameBtn = document.getElementById('saveNameBtn');
    
    this.startOverlay = document.getElementById('startOverlay');
    this.gameoverOverlay = document.getElementById('gameoverOverlay');
    this.finalScoreSpan = document.getElementById('finalScore');
    this.submitScoreBtn = document.getElementById('submitScoreBtn');
    
    this.toastContainer = document.getElementById('toastContainer');
    
    // Load player name from local storage or config default
    this.playerName = localStorage.getItem('playerName') || CONFIG.DEFAULT_PLAYER_NAME;
    this.usernameInput.value = this.playerName;
    
    this.setupListeners();
  }

  setupListeners() {
    // Save profile name
    this.saveNameBtn.addEventListener('click', () => {
      const newName = this.usernameInput.value.trim();
      if (newName) {
        this.playerName = newName;
        localStorage.setItem('playerName', newName);
        this.showToast('Profile name updated!', 'success');
      } else {
        this.showToast('Name cannot be empty', 'error');
      }
    });

    // Refresh scoreboard manually
    this.refreshBtn.addEventListener('click', () => {
      this.loadLeaderboard();
    });
  }

  // Update real-time gameplay HUD
  updateScore(score) {
    if (this.scoreSpan) this.scoreSpan.textContent = score;
  }

  updateLives(lives) {
    if (this.livesSpan) this.livesSpan.textContent = lives;
  }

  updateLevel(level) {
    if (this.levelSpan) this.levelSpan.textContent = level;
  }

  // Display toast alerts
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const msgSpan = document.createElement('span');
    msgSpan.className = 'toast-message';
    msgSpan.textContent = message;
    
    const closeBtn = document.createElement('span');
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.marginLeft = '1rem';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => toast.remove());
    
    toast.appendChild(msgSpan);
    toast.appendChild(closeBtn);
    
    this.toastContainer.appendChild(toast);
    
    // Auto remove after 3.5s
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3500);
  }

  // Retrieve and draw the scoreboard list
  async loadLeaderboard() {
    this.leaderboardList.innerHTML = '<li class="empty-state">Loading scores...</li>';
    try {
      const scores = await getScores();
      this.leaderboardList.innerHTML = '';
      
      if (scores.length === 0) {
        this.leaderboardList.innerHTML = '<li class="empty-state">No scores yet. Be the first!</li>';
        return;
      }
      
      scores.forEach((entry, index) => {
        const item = document.createElement('li');
        item.className = 'leaderboard-item';
        if (index < 3) {
          item.classList.add('top-three');
        }
        
        const rankNameDiv = document.createElement('div');
        rankNameDiv.className = 'rank-name';
        
        const rankSpan = document.createElement('span');
        rankSpan.className = 'rank';
        rankSpan.textContent = index + 1;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.textContent = entry.name;
        
        rankNameDiv.appendChild(rankSpan);
        rankNameDiv.appendChild(nameSpan);
        
        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'score';
        scoreSpan.textContent = entry.score.toLocaleString();
        
        item.appendChild(rankNameDiv);
        item.appendChild(scoreSpan);
        
        this.leaderboardList.appendChild(item);
      });
    } catch (err) {
      this.leaderboardList.innerHTML = '<li class="empty-state" style="color: var(--neon-pink)">Offline - Server Unreachable</li>';
      this.showToast('Could not load leaderboard. Is the server running?', 'error');
    }
  }

  // Handle Game States overlays
  showStartScreen() {
    this.startOverlay.classList.remove('hidden');
    this.gameoverOverlay.classList.add('hidden');
  }

  showPlayingScreen() {
    this.startOverlay.classList.add('hidden');
    this.gameoverOverlay.classList.add('hidden');
  }

  showGameOverScreen(finalScore, submitCallback) {
    this.finalScoreSpan.textContent = finalScore;
    this.gameoverOverlay.classList.remove('hidden');
    this.startOverlay.classList.add('hidden');
    
    // Enable submit buttons
    this.submitScoreBtn.disabled = false;
    this.submitScoreBtn.textContent = 'Submit Score';
    
    // Set up click handler for submitting
    // We clean up existing listeners by recreating button element or doing a one-off event listener
    const newSubmitBtn = this.submitScoreBtn.cloneNode(true);
    this.submitScoreBtn.parentNode.replaceChild(newSubmitBtn, this.submitScoreBtn);
    this.submitScoreBtn = newSubmitBtn;
    
    this.submitScoreBtn.addEventListener('click', async () => {
      this.submitScoreBtn.disabled = true;
      this.submitScoreBtn.textContent = 'Submitting...';
      
      try {
        await submitScore(this.playerName, finalScore);
        this.showToast('Score saved successfully!', 'success');
        this.submitScoreBtn.textContent = 'Saved!';
        this.loadLeaderboard();
      } catch (error) {
        this.showToast(`Submission failed: ${error.message}`, 'error');
        this.submitScoreBtn.disabled = false;
        this.submitScoreBtn.textContent = 'Submit Score';
      }
    });
  }
}
