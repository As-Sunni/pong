const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");
const btn = document.querySelector(".btn");

// Game settings
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 12;
const playerX = 10;
const aiX = canvas.width - paddleWidth - 10;

// Initial positions
let playerY = (canvas.height - paddleHeight) / 2;
let aiY = (canvas.height - paddleHeight) / 2;
let ballX = canvas.width / 2 - ballSize / 2;
let ballY = canvas.height / 2 - ballSize / 2;

// Ball movement
let ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
let ballSpeedY = 3 * (Math.random() * 2 - 1);

// Scores
let playerScore = 0;
let aiScore = 0;

// Mouse control for player paddle

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = mouseY - paddleHeight / 2;
  // Keep paddle inside bounds
  playerY = Math.max(Math.min(playerY, canvas.height - paddleHeight), 0);
});

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}

function drawScore() {
  ctx.font = "32px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(playerScore, canvas.width / 4, 40);
  ctx.fillText(aiScore, (canvas.width * 3) / 4, 40);
}

function resetBall() {
  ballX = canvas.width / 2 - ballSize / 2;
  ballY = canvas.height / 2 - ballSize / 2;
  ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ballSpeedY = 3 * (Math.random() * 2 - 1);
}

// Simple AI movement
function moveAI() {
  const target = ballY + ballSize / 2 - paddleHeight / 2;
  if (aiY < target) {
    aiY += Math.min(4, target - aiY);
  } else if (aiY > target) {
    aiY -= Math.min(4, aiY - target);
  }
  aiY = Math.max(Math.min(aiY, canvas.height - paddleHeight), 0);
}

function collision(x, y, w, h, bx, by, bs) {
  return x < bx + bs && x + w > bx && y < by + bs && y + h > by;
}

function update() {
  // Move ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Top/bottom wall collision
  if (ballY <= 0 || ballY + ballSize >= canvas.height) {
    ballSpeedY = -ballSpeedY;
    ballY = Math.max(0, Math.min(ballY, canvas.height - ballSize));
  }

  // Paddle collision
  if (
    collision(
      playerX,
      playerY,
      paddleWidth,
      paddleHeight,
      ballX,
      ballY,
      ballSize
    )
  ) {
    ballSpeedX = Math.abs(ballSpeedX);
    // Add some randomness based on hit position
    let collidePoint = ballY + ballSize / 2 - (playerY + paddleHeight / 2);
    ballSpeedY = collidePoint * 0.2;
  } else if (
    collision(aiX, aiY, paddleWidth, paddleHeight, ballX, ballY, ballSize)
  ) {
    ballSpeedX = -Math.abs(ballSpeedX);
    let collidePoint = ballY + ballSize / 2 - (aiY + paddleHeight / 2);
    ballSpeedY = collidePoint * 0.2;
  }

  // Left/right wall (score)
  if (ballX < 0) {
    aiScore++;
    resetBall();
  } else if (ballX + ballSize > canvas.width) {
    playerScore++;
    resetBall();
  }

  moveAI();
}

function render() {
  // Clear
  drawRect(0, 0, canvas.width, canvas.height, "#111");
  // Net
  for (let i = 0; i < canvas.height; i += 30) {
    drawRect(canvas.width / 2 - 1, i, 2, 20, "#444");
  }
  // Paddles & Ball
  drawRect(playerX, playerY, paddleWidth, paddleHeight, "#fff");
  drawRect(aiX, aiY, paddleWidth, paddleHeight, "#fff");
  drawBall(ballX, ballY, ballSize, "#fff");
  // Score
  drawScore();
}

// Game Loop
btn.addEventListener("click", function () {
  function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }
});
gameLoop();
