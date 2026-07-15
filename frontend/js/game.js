import { CONFIG } from './config.js';

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() * 3 + 1.5;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.02;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98; // slight drag
    this.vy *= 0.98;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

export class NeonBreakerGame {
  constructor(canvasId, callbacks = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Set internal resolution
    this.canvas.width = CONFIG.GAME.CANVAS_WIDTH;
    this.canvas.height = CONFIG.GAME.CANVAS_HEIGHT;

    // Callbacks
    this.onScoreChange = callbacks.onScoreChange || (() => {});
    this.onLivesChange = callbacks.onLivesChange || (() => {});
    this.onLevelChange = callbacks.onLevelChange || (() => {});
    this.onGameOver = callbacks.onGameOver || (() => {});
    this.onStateChange = callbacks.onStateChange || (() => {});

    // Game state variables
    this.score = 0;
    this.lives = CONFIG.GAME.LIVES;
    this.level = 1;
    this.state = 'start'; // 'start', 'playing', 'paused', 'gameover'
    
    // Game Entities
    this.paddle = {
      x: (this.canvas.width - CONFIG.GAME.PADDLE_WIDTH) / 2,
      y: this.canvas.height - CONFIG.GAME.PADDLE_HEIGHT - 15,
      width: CONFIG.GAME.PADDLE_WIDTH,
      height: CONFIG.GAME.PADDLE_HEIGHT,
      speed: 8
    };

    this.ball = {
      x: this.canvas.width / 2,
      y: this.paddle.y - CONFIG.GAME.BALL_RADIUS,
      vx: CONFIG.GAME.INITIAL_BALL_SPEED_X,
      vy: CONFIG.GAME.INITIAL_BALL_SPEED_Y,
      radius: CONFIG.GAME.BALL_RADIUS
    };

    this.bricks = [];
    this.particles = [];
    
    // Controls state
    this.keys = {
      ArrowLeft: false,
      ArrowRight: false,
      KeyA: false,
      KeyD: false
    };

    // Screenshake settings
    this.shakeDuration = 0;
    this.shakeIntensity = 0;

    // Set up listeners
    this.initInput();
    
    // Reset layout
    this.resetBricks();
  }

  // Input bindings
  initInput() {
    window.addEventListener('keydown', (e) => {
      if (e.code in this.keys) {
        this.keys[e.code] = true;
      }
      
      // Pause toggling
      if (e.code === 'KeyP' && this.state === 'playing') {
        this.setState('paused');
      } else if (e.code === 'KeyP' && this.state === 'paused') {
        this.setState('playing');
      }
      
      // Start / restart mapping
      if ((e.code === 'Space' || e.code === 'Enter')) {
        if (this.state === 'start') {
          this.start();
        } else if (this.state === 'gameover') {
          this.resetGame();
          this.start();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code in this.keys) {
        this.keys[e.code] = false;
      }
    });

    // Mouse control support
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.state !== 'playing') return;
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const scaleX = this.canvas.width / rect.width;
      this.paddle.x = mouseX * scaleX - this.paddle.width / 2;
      if (this.paddle.x < 0) this.paddle.x = 0;
      else if (this.paddle.x + this.paddle.width > this.canvas.width)
        this.paddle.x = this.canvas.width - this.paddle.width;
    });

    // Touch control support (mobile & tablet)
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault(); // prevent page scroll while playing
      if (this.state !== 'playing') return;
      const rect = this.canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      const scaleX = this.canvas.width / rect.width;
      this.paddle.x = touchX * scaleX - this.paddle.width / 2;
      if (this.paddle.x < 0) this.paddle.x = 0;
      else if (this.paddle.x + this.paddle.width > this.canvas.width)
        this.paddle.x = this.canvas.width - this.paddle.width;
    }, { passive: false });

    // Touch tap to start / restart
    this.canvas.addEventListener('touchstart', (e) => {
      if (this.state === 'start') { this.start(); }
      else if (this.state === 'gameover') { this.resetGame(); this.start(); }
    });
  }

  // Build the levels brick configuration
  resetBricks() {
    this.bricks = [];
    const colors = [
      '#ff007f', // Pink
      '#ff7f00', // Orange
      '#ffdf00', // Yellow
      '#39ff14', // Green
      '#00f0ff'  // Cyan
    ];
    
    for (let r = 0; r < CONFIG.GAME.BRICK_ROWS; r++) {
      this.bricks[r] = [];
      const rowColor = colors[r % colors.length];
      const points = (CONFIG.GAME.BRICK_ROWS - r) * 10; // Top rows reward higher points

      for (let c = 0; c < CONFIG.GAME.BRICK_COLS; c++) {
        this.bricks[r][c] = {
          x: c * (CONFIG.GAME.BRICK_WIDTH + CONFIG.GAME.BRICK_PADDING) + CONFIG.GAME.BRICK_LEFT_OFFSET,
          y: r * (CONFIG.GAME.BRICK_HEIGHT + CONFIG.GAME.BRICK_PADDING) + CONFIG.GAME.BRICK_TOP_OFFSET,
          width: 0, // Will calculate dynamically in reset layout calculations
          height: CONFIG.GAME.BRICK_HEIGHT,
          color: rowColor,
          points: points,
          status: 1 // 1 = active, 0 = broken
        };
      }
    }
    
    // Automatically size brick width based on canvas sizing columns
    const totalPadding = CONFIG.GAME.BRICK_PADDING * (CONFIG.GAME.BRICK_COLS - 1);
    const availableWidth = this.canvas.width - (CONFIG.GAME.BRICK_LEFT_OFFSET * 2) - totalPadding;
    const computedWidth = availableWidth / CONFIG.GAME.BRICK_COLS;
    
    for (let r = 0; r < CONFIG.GAME.BRICK_ROWS; r++) {
      for (let c = 0; c < CONFIG.GAME.BRICK_COLS; c++) {
        this.bricks[r][c].width = computedWidth;
        this.bricks[r][c].x = c * (computedWidth + CONFIG.GAME.BRICK_PADDING) + CONFIG.GAME.BRICK_LEFT_OFFSET;
      }
    }
  }

  triggerScreenShake(duration = 10, intensity = 5) {
    this.shakeDuration = duration;
    this.shakeIntensity = intensity;
  }

  createExplosion(x, y, color) {
    for (let i = 0; i < 12; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  setState(newState) {
    const prev = this.state;
    this.state = newState;
    this.onStateChange(this.state);
    // Restart game loop if resuming from pause
    if (newState === 'playing' && prev === 'paused') {
      this.gameLoop();
    }
  }

  resetGame() {
    this.score = 0;
    this.lives = CONFIG.GAME.LIVES;
    this.level = 1;
    this.particles = [];
    this.resetBricks();
    this.resetBall();
    this.onScoreChange(this.score);
    this.onLivesChange(this.lives);
    this.onLevelChange(this.level);
  }

  resetBall() {
    this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
    this.ball.x = this.canvas.width / 2;
    this.ball.y = this.paddle.y - this.ball.radius - 2;
    
    // Keep speeds moderate
    const angle = (Math.random() * 0.4 + 0.3) * Math.PI; // random angle pointing upwards
    const speed = Math.abs(CONFIG.GAME.INITIAL_BALL_SPEED_Y) + (this.level - 1) * 0.5;
    
    this.ball.vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
    this.ball.vy = -Math.sin(angle) * speed;
  }

  start() {
    if (this.state === 'playing') return;
    this.setState('playing');
    if (this.score === 0 && this.lives === CONFIG.GAME.LIVES && this.level === 1) {
      this.onScoreChange(this.score);
      this.onLivesChange(this.lives);
      this.onLevelChange(this.level);
    }
    this.gameLoop();
  }

  gameLoop() {
    if (this.state !== 'playing') return;
    
    this.update();
    this.draw();
    
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    // 1. Move Paddle via keyboard keys if mouse is not in use
    const leftActive = this.keys.ArrowLeft || this.keys.KeyA;
    const rightActive = this.keys.ArrowRight || this.keys.KeyD;
    
    if (leftActive && this.paddle.x > 0) {
      this.paddle.x -= this.paddle.speed;
    }
    if (rightActive && this.paddle.x + this.paddle.width < this.canvas.width) {
      this.paddle.x += this.paddle.speed;
    }

    // 2. Move Ball
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // 3. Wall collisions (Left & Right)
    if (this.ball.x - this.ball.radius < 0) {
      this.ball.x = this.ball.radius;
      this.ball.vx = -this.ball.vx;
      this.triggerScreenShake(4, 2);
    } else if (this.ball.x + this.ball.radius > this.canvas.width) {
      this.ball.x = this.canvas.width - this.ball.radius;
      this.ball.vx = -this.ball.vx;
      this.triggerScreenShake(4, 2);
    }

    // 4. Roof collision
    if (this.ball.y - this.ball.radius < 0) {
      this.ball.y = this.ball.radius;
      this.ball.vy = -this.ball.vy;
      this.triggerScreenShake(4, 2);
    }

    // 5. Paddle collision
    if (
      this.ball.y + this.ball.radius >= this.paddle.y &&
      this.ball.y - this.ball.radius <= this.paddle.y + this.paddle.height &&
      this.ball.x >= this.paddle.x &&
      this.ball.x <= this.paddle.x + this.paddle.width
    ) {
      // Calculate bounce angle offset depending on where ball hits paddle
      const collidePoint = this.ball.x - (this.paddle.x + this.paddle.width / 2);
      const normalizedCollide = collidePoint / (this.paddle.width / 2);
      const bounceAngle = normalizedCollide * (Math.PI / 3); // max 60 degrees

      const speed = Math.sqrt(this.ball.vx * this.ball.vx + this.ball.vy * this.ball.vy);
      
      this.ball.vx = speed * Math.sin(bounceAngle);
      this.ball.vy = -speed * Math.cos(bounceAngle);
      
      // Prevent ball sticky issues by setting ball directly above paddle
      this.ball.y = this.paddle.y - this.ball.radius;
      
      this.triggerScreenShake(6, 3);
      this.createExplosion(this.ball.x, this.ball.y, '#00f0ff');
    }

    // 6. Bottom boundary collision (Lose a life)
    if (this.ball.y + this.ball.radius > this.canvas.height) {
      this.lives--;
      this.onLivesChange(this.lives);
      this.triggerScreenShake(20, 8);
      this.createExplosion(this.ball.x, this.canvas.height - 5, '#ff007f');
      
      if (this.lives <= 0) {
        this.setState('gameover');
        this.onGameOver(this.score);
      } else {
        this.resetBall();
      }
    }

    // 7. Brick collisions
    let allBricksCleared = true;
    for (let r = 0; r < CONFIG.GAME.BRICK_ROWS; r++) {
      for (let c = 0; c < CONFIG.GAME.BRICK_COLS; c++) {
        const b = this.bricks[r][c];
        if (b.status === 1) {
          allBricksCleared = false;
          
          // Simple box-circle collision logic
          const closestX = Math.max(b.x, Math.min(this.ball.x, b.x + b.width));
          const closestY = Math.max(b.y, Math.min(this.ball.y, b.y + b.height));
          
          const distanceX = this.ball.x - closestX;
          const distanceY = this.ball.y - closestY;
          const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
          
          if (distanceSquared < (this.ball.radius * this.ball.radius)) {
            // Collision detected!
            b.status = 0;
            this.score += b.points;
            this.onScoreChange(this.score);
            this.createExplosion(closestX, closestY, b.color);
            this.triggerScreenShake(8, 4);

            // Determine collision edge to deflect ball correctly
            const overlapX = this.ball.radius - Math.abs(distanceX);
            const overlapY = this.ball.radius - Math.abs(distanceY);
            
            if (overlapX < overlapY) {
              // Left or right hit
              this.ball.vx = -this.ball.vx;
              this.ball.x += this.ball.vx > 0 ? overlapX : -overlapX;
            } else {
              // Top or bottom hit
              this.ball.vy = -this.ball.vy;
              this.ball.y += this.ball.vy > 0 ? overlapY : -overlapY;
            }
            break; // break inner loop to prevent multi-collision bugs in single tick
          }
        }
      }
    }

    // 8. Level complete verification
    if (allBricksCleared) {
      this.level++;
      this.onLevelChange(this.level);
      this.triggerScreenShake(15, 6);
      this.resetBricks();
      this.resetBall();
    }

    // 9. Particles updates
    this.particles.forEach((p, idx) => {
      p.update();
      if (p.alpha <= 0) {
        this.particles.splice(idx, 1);
      }
    });
  }

  draw() {
    this.ctx.save();
    
    // Screenshake application
    if (this.shakeDuration > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(dx, dy);
      this.shakeDuration--;
    }

    // Clear Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid background effects
    this.drawBackgroundGrid();

    // Draw Bricks
    for (let r = 0; r < CONFIG.GAME.BRICK_ROWS; r++) {
      for (let c = 0; c < CONFIG.GAME.BRICK_COLS; c++) {
        const b = this.bricks[r][c];
        if (b.status === 1) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.rect(b.x, b.y, b.width, b.height);
          this.ctx.fillStyle = b.color;
          this.ctx.shadowBlur = 12;
          this.ctx.shadowColor = b.color;
          this.ctx.fill();
          this.ctx.restore();
        }
      }
    }

    // Draw Paddle
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.fill();
    this.ctx.restore();

    // Draw Ball
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ff007f';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = '#ff007f';
    this.ctx.fill();
    this.ctx.restore();

    // Draw Particles
    this.particles.forEach(p => p.draw(this.ctx));

    this.ctx.restore();
  }

  drawBackgroundGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.lineWidth = 1;
    const gridSpacing = 40;
    
    // Draw columns
    for (let x = 0; x < this.canvas.width; x += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    // Draw rows
    for (let y = 0; y < this.canvas.height; y += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }
}
