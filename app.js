const canvas = document.getElementById("canvas");
const devicePixelRatio = window.devicePixelRatio || 1;
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
const width = 200;
const height = 200;
let isGameOver = false;

canvas.width = width * devicePixelRatio;
canvas.height = height * devicePixelRatio;
ctx.scale(devicePixelRatio, devicePixelRatio);

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

function distance(x1, y1, x2, y2) {
  const xDistance = x2 - x1;
  const yDistance = y2 - y1;
  return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function Cell(row, col, size, isBomb) {
  this.x = Math.floor(col * size);
  this.y = Math.floor(row * size);
  this.size = size;
  this.isBomb = isBomb;
  this.isShown = false;
  this.nearbyBombs = 0;
}

Cell.prototype.draw = function () {
  ctx.save();
  ctx.beginPath();
  if (this.isShown) {
    ctx.fillStyle = "#CCCCCC";
  } else {
    ctx.fillStyle = "#FFFFFF";
  }
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.rect(this.x, this.y, this.size, this.size);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  ctx.restore();

  if (this.isShown) {
    if (this.isBomb) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.arc(
        this.x + this.size / 2,
        this.y + this.size / 2,
        this.size / 4,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    } else {
      if (this.nearbyBombs > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "#000000";
        ctx.font = "14px Arial";
        ctx.fillText(
          this.nearbyBombs,
          this.x + this.size / 2 - 4,
          this.y + this.size / 2 + 5
        );
        ctx.closePath();
        ctx.restore();
      }
    }
  }
};

const size = 20;

const grid = [];
for (let row = 0; row < height / size; row++) {
  grid[row] = [];
  for (let col = 0; col < width / size; col++) {
    const cell = new Cell(row, col, size, false);
    grid[row].push(cell);
  }
}

const allCells = [];
for (let i = 0; i < grid.length; i++) {
  for (let j = 0; j < grid[i].length; j++) {
    allCells.push(grid[i][j]);
  }
}

const numberOfBombs = 10;
for (let i = 0; i < numberOfBombs; i++) {
  const randomIndex = randomIntFromRange(0, allCells.length - 1);
  allCells[randomIndex].isBomb = true;
  allCells[randomIndex].isShown = true;

  allCells.splice(randomIndex, 1);
}

for (let i = 0; i < grid.length; i++) {
  for (let j = 0; j < grid[i].length; j++) {
    const cell = grid[i][j];
    for (let row = i - 1; row <= i + 1; row++) {
      for (let col = j - 1; col <= j + 1; col++) {
        if (
          row >= 0 &&
          row < grid.length &&
          col >= 0 &&
          col < grid[i].length &&
          !(row === i && col === j)
        ) {
          if (grid[row][col].isBomb) {
            cell.nearbyBombs++;
          }
        }
      }
    }
  }
}

function showCell(cell, i, j) {
  const stack = [];
  const visited = new Set();
  const key = `${i}-${j}`;
  stack.push([i, j, cell]);
  visited.add(key);
  while (stack.length > 0) {
    const [i, j, cell] = stack.pop();
    if (cell.isShown) {
      continue;
    }
    cell.isShown = true;
    if (cell.isBomb) {
      continue;
    }
    if (cell.nearbyBombs === 0) {
      for (let row = i - 1; row <= i + 1; row++) {
        for (let col = j - 1; col <= j + 1; col++) {
          if (
            row >= 0 &&
            row < grid.length &&
            col >= 0 &&
            col < grid[i].length &&
            !visited.has(`${row}-${col}`)
          ) {
            stack.push([row, col, grid[row][col]]);
            visited.add(`${row}-${col}`);
          }
        }
      }
    }
  }
}

function drawGrid() {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      grid[i][j].draw();
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
}

function animate() {
  draw();
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("mousemove", function (event) {
  if (event.target !== canvas) {
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(event.clientX - rect.left);
  const y = Math.floor(event.clientY - rect.top);
});

window.addEventListener("mousedown", function (event) {
  if (event.target !== canvas) {
    return;
  }
  if (isGameOver) {
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(event.clientX - rect.left);
  const y = Math.floor(event.clientY - rect.top);
  const row = Math.floor(y / devicePixelRatio / size);
  const col = Math.floor(x / devicePixelRatio / size);
  const cell = grid[row][col];
  showCell(cell, row, col);
  if (cell.isBomb) {
    isGameOver = true;
    setTimeout(() => {
      alert("Game Over");
    }, 100);
  } else {
    let isWin = true;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const cell = grid[i][j];
        if (!cell.isShown && !cell.isBomb) {
          isWin = false;
          break;
        }
      }
      if (!isWin) {
        break;
      }
    }
    if (isWin) {
      isGameOver = true;
      setTimeout(() => {
        alert("You Win!");
      }, 100);
    }
  }
});
