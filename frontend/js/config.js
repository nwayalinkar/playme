// Global game and server settings
// ─────────────────────────────────────────────────────────────
// Scores are stored in a free JSONBin.io "bin" (cloud JSON storage).
// HOW TO SET UP (one-time, takes 2 minutes):
//   1. Go to https://jsonbin.io → Create a free account
//   2. Click "Create Bin" → paste: []  → Save
//   3. Copy the Bin ID from the URL and paste it as JSONBIN_BIN_ID below
//   4. Go to API Keys → copy your Master Key → paste as JSONBIN_API_KEY below
// ─────────────────────────────────────────────────────────────
export const CONFIG = {
  JSONBIN_BIN_ID: 'PASTE_YOUR_BIN_ID_HERE',
  JSONBIN_API_KEY: 'PASTE_YOUR_MASTER_KEY_HERE',
  DEFAULT_PLAYER_NAME: 'CyberPlayer',
  MAX_SCORES: 10,
  GAME: {
    CANVAS_WIDTH: 700,
    CANVAS_HEIGHT: 450,
    PADDLE_WIDTH: 100,
    PADDLE_HEIGHT: 12,
    BALL_RADIUS: 8,
    INITIAL_BALL_SPEED_Y: -4,
    INITIAL_BALL_SPEED_X: 3,
    BALL_SPEED_MULTIPLIER: 1.05,
    BRICK_ROWS: 5,
    BRICK_COLS: 8,
    BRICK_HEIGHT: 20,
    BRICK_PADDING: 10,
    BRICK_TOP_OFFSET: 50,
    BRICK_LEFT_OFFSET: 35,
    LIVES: 3
  }
};
