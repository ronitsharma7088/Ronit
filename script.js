const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const statusEl = document.getElementById('status');

const tileCount = 20;
const tileSize = canvas.width / tileCount;
const speedMs = 120;

let snake;
let direction;
let pendingDirection;
let food;
let score;
let bestScore = Number(localStorage.getItem('snake-best')) || 0;
let gameInterval;
let started;
let gameOver;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  direction = { x: 1, y: 0 };
  pendingDirection = { ...direction };
  food = randomFood();
  score = 0;
  started = false;
  gameOver = false;
  statusEl.textContent = 'Press any movement key to start.';
  statusEl.classList.remove('game-over');
  updateScore();
  draw();
}

function randomFood() {
  while (true) {
    const candidate = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    if (!snake.some((part) => part.x === candidate.x && part.y === candidate.y)) {
      return candidate;
    }
  }
}

function updateScore() {
  scoreEl.textContent = score;
  bestScoreEl.textContent = bestScore;
}

function startLoop() {
  clearInterval(gameInterval);
  gameInterval = setInterval(step, speedMs);
}

function step() {
  if (!started || gameOver) {
    draw();
    return;
  }

  direction = pendingDirection;
  const head = snake[0];
  const next = { x: head.x + direction.x, y: head.y + direction.y };

  const hitWall = next.x < 0 || next.x >= tileCount || next.y < 0 || next.y >= tileCount;
  const hitSelf = snake.some((part) => part.x === next.x && part.y === next.y);

  if (hitWall || hitSelf) {
    gameOver = true;
    statusEl.textContent = 'Game over! Press Space to restart.';
    statusEl.classList.add('game-over');
    draw();
    return;
  }

  snake.unshift(next);

  if (next.x === food.x && next.y === food.y) {
    score += 1;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('snake-best', String(bestScore));
    }
    food = randomFood();
    updateScore();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = '#101010';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < tileCount; i += 1) {
    for (let j = 0; j < tileCount; j += 1) {
      if ((i + j) % 2 === 0) {
        ctx.fillStyle = '#141414';
        ctx.fillRect(i * tileSize, j * tileSize, tileSize, tileSize);
      }
    }
  }

  ctx.fillStyle = '#f05454';
  roundRect(food.x * tileSize + 2, food.y * tileSize + 2, tileSize - 4, tileSize - 4, 6);

  snake.forEach((part, idx) => {
    ctx.fillStyle = idx === 0 ? '#5aff9a' : '#2dce6d';
    roundRect(part.x * tileSize + 2, part.y * tileSize + 2, tileSize - 4, tileSize - 4, 6);
  });
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

function handleMove(key) {
  const map = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const nextDir = map[key];
  if (!nextDir) return;

  const reversing = nextDir.x === -direction.x && nextDir.y === -direction.y;
  if (reversing && started) return;

  pendingDirection = nextDir;
  if (!started) {
    started = true;
    statusEl.textContent = 'Good luck!';
  }
}

document.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

  if (key === ' ' && gameOver) {
    resetGame();
    return;
  }

  handleMove(key);
});

bestScoreEl.textContent = bestScore;
resetGame();
startLoop();
