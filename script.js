const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 12,
  paddleHeight = 80,
  paddleSpeed = 7;
const ballRadius = 9;
let leftPaddle = { x: 10, y: canvas.height / 2 - paddleHeight / 2, dy: 0 };
let rightPaddle = {
  x: canvas.width - 22,
  y: canvas.height / 2 - paddleHeight / 2,
  dy: 0,
};
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 5, dy: 4 };
let score = 0;
let highScore = localStorage.getItem("pongHighScore") || 0;
let running = false;
let paused = false;
let animationId = null;

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  // Random start direction
  ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
  ball.dy = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2);
}

function resetGame() {
  leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
  rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
  score = 0;
  updateScore();
  resetBall();
  paused = false;
}

function updateScore() {
  document.getElementById("score").textContent = score;
  document.getElementById("highScore").textContent = highScore;
}

function drawRect(x, y, w, h, color = "#fff") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color = "#fff") {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawNet() {
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = "#6dfde4";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawNet();
  drawRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight, "#6dfde4");
  drawRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight, "#e063fd");
  drawCircle(ball.x, ball.y, ballRadius, "#fff");
}

function movePaddles() {
  // Left paddle (player)
  leftPaddle.y += leftPaddle.dy;
  if (leftPaddle.y < 0) leftPaddle.y = 0;
  if (leftPaddle.y + paddleHeight > canvas.height)
    leftPaddle.y = canvas.height - paddleHeight;

  // Right paddle (AI)
  // Simple AI: follows ball.y with some lag
  let aiCenter = rightPaddle.y + paddleHeight / 2;
  if (aiCenter < ball.y - 16) rightPaddle.y += paddleSpeed - 2;
  else if (aiCenter > ball.y + 16) rightPaddle.y -= paddleSpeed - 2;
  // Keep in bounds
  if (rightPaddle.y < 0) rightPaddle.y = 0;
  if (rightPaddle.y + paddleHeight > canvas.height)
    rightPaddle.y = canvas.height - paddleHeight;
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Top/bottom wall collision
  if (ball.y - ballRadius < 0 || ball.y + ballRadius > canvas.height) {
    ball.dy = -ball.dy;
  }

  // Left paddle collision
  if (
    ball.x - ballRadius < leftPaddle.x + paddleWidth &&
    ball.y > leftPaddle.y &&
    ball.y < leftPaddle.y + paddleHeight
  ) {
    ball.dx = -ball.dx * 1.04;
    ball.x = leftPaddle.x + paddleWidth + ballRadius; // Avoid sticking
    // Add some "English" depending on hit position
    let hitPos =
      (ball.y - (leftPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
    ball.dy += hitPos * 2;
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("pongHighScore", highScore);
      updateScore();
    }
  }

  // Right paddle collision
  if (
    ball.x + ballRadius > rightPaddle.x &&
    ball.y > rightPaddle.y &&
    ball.y < rightPaddle.y + paddleHeight
  ) {
    ball.dx = -ball.dx * 1.04;
    ball.x = rightPaddle.x - ballRadius; // Avoid sticking
    let hitPos =
      (ball.y - (rightPaddle.y + paddleHeight / 2)) / (paddleHeight / 2);
    ball.dy += hitPos * 2;
  }

  // Missed left edge -> Game Over
  if (ball.x - ballRadius < 0) {
    running = false;
    cancelAnimationFrame(animationId);
    draw();
    ctx.font = "32px Arial";
    ctx.fillStyle = "#e063fd";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(
      "Click 'Restart' to try again",
      canvas.width / 2,
      canvas.height / 2 + 16
    );
    return false;
  }

  // Missed right edge (score for player)
  if (ball.x + ballRadius > canvas.width) {
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("pongHighScore", highScore);
    }
    updateScore();
    resetBall();
  }
  return true;
}

function gameLoop() {
  if (!running || paused) return;
  movePaddles();
  if (!moveBall()) return;
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "w" || e.key === "ArrowUp") leftPaddle.dy = -paddleSpeed;
  if (e.key === "s" || e.key === "ArrowDown") leftPaddle.dy = paddleSpeed;
});
document.addEventListener("keyup", (e) => {
  if (
    e.key === "w" ||
    e.key === "ArrowUp" ||
    e.key === "s" ||
    e.key === "ArrowDown"
  )
    leftPaddle.dy = 0;
});

// Buttons
document.getElementById("startBtn").onclick = () => {
  if (!running) {
    resetGame();
    running = true;
    draw();
    gameLoop();
  } else if (paused) {
    paused = false;
    gameLoop();
  }
};

document.getElementById("pauseBtn").onclick = () => {
  paused = !paused;
  if (!paused && running) gameLoop();
};

document.getElementById("restartBtn").onclick = () => {
  resetGame();
  draw();
  if (running) gameLoop();
};

function init() {
  updateScore();
  draw();
}
init();
