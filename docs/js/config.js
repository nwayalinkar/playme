// ═══════════════════════════════════════════════════════════════
// LEADERBOARD SETUP — takes 2 minutes, do this once:
//
//  1. Go to https://jsonbin.io → Sign up free
//  2. Click "CREATE BIN" → paste  []  → click Save
//  3. Copy the Bin ID shown in the URL bar (looks like: 6849f3...)
//  4. Click "API KEYS" in left sidebar → copy the Master Key
//  5. Paste both below and save this file → push to GitHub
// ═══════════════════════════════════════════════════════════════
export const CONFIG = {
  JSONBIN_BIN_ID:  'PASTE_YOUR_BIN_ID_HERE',   // e.g. '6849f3abc123456789'
  JSONBIN_API_KEY: 'PASTE_YOUR_MASTER_KEY_HERE', // e.g. '$2a$10$abc...'
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
