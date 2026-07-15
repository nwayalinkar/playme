// Global game and server settings
// Supabase cloud database keys for unlimited 24/7 leaderboard services
export const CONFIG = {
  SUPABASE_URL: 'https://nhybmmozbdrguyeenztq.supabase.co',
  SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeWJtbW96YmRyZ3V5ZWVuenRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMjEwNTMsImV4cCI6MjA5OTY5NzA1M30.5Ga-Z8jS5yCO8WU7SaZBJQXexuTNY5yENloIQnWtLA0',
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
