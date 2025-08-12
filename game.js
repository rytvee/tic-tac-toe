// ================================
//       DOM ELEMENTS & SETUP
// ================================
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const scoreboard = document.getElementById("scoreboard");

const startEndMatchBtn = document.getElementById("startMatch"); // same button
let matchStarted = false; // track state

const nextRoundBtn = document.getElementById("nextRoundBtn");
const restartMatchBtn = document.getElementById("restartMatchBtn");

let isComputerOpponent = false; // default is 2 players
let boardState = Array(9).fill("");
let cells = [];
let gameActive = false;
let currentPlayer = "X";

let scoreX = 0;
let scoreO = 0;
let playerX = "playerX";
let playerO = "playerO";

const winningCombo = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
  [0, 4, 8], [2, 4, 6]             // Diagonal
];

const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
  isComputerOpponent = !isComputerOpponent;
  modeToggle.textContent = isComputerOpponent
    ? "Mode: Vs Computer"
    : "Mode: 2 Players";

  const nameXInput = document.getElementById("playerXName");
  const nameOInput = document.getElementById("playerOName");
  const nameError = document.getElementById("nameError");

  nameError.textContent = "";
  playerX = "";
  playerO = isComputerOpponent ? "Computer" : "";

  nameXInput.value = "";
  nameOInput.value = playerO;

  // Enable inputs to allow editing names on toggle:
  nameXInput.disabled = false;
  nameOInput.disabled = false;

  // Disable Player O input only if vs computer:
  if (isComputerOpponent) {
    nameOInput.disabled = true;
  }

  restartMatch();

  // Reset match state
  matchStarted = false;
  startEndMatchBtn.textContent = "Start Match";

  statusText.textContent = isComputerOpponent
    ? "Enter player name and start match"
    : "Enter player names and start match";

  // Prevent playing until Start Match is clicked
  gameActive = false;
});

// ================================
//         GAME INITIALIZATION
// ================================
function createBoard() {
  board.innerHTML = "";
  cells = [];

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleMove);
    cell.style.backgroundColor = "#444";
    cell.textContent = "";
    board.appendChild(cell);
    cells.push(cell);
  }
}

function startGame() {
  const nameXInput = document.getElementById("playerXName");
  const nameOInput = document.getElementById("playerOName");
  const nameError = document.getElementById("nameError");
  const nameX = nameXInput.value.trim();
  const nameO = nameOInput.value.trim();

  nameError.textContent = "";

  if (!nameX) {
    nameError.textContent = "Player X must enter a name.";
    return;
  }

  if (isComputerOpponent) {
    playerO = "Computer";
    nameOInput.value = "Computer";
    nameOInput.disabled = true;
  } else {
    if (!nameO) {
      nameError.textContent = "Player O must enter a name.";
      return;
    }
    if (nameX.toLowerCase() === nameO.toLowerCase()) {
      nameError.textContent = "Players must have different names.";
      return;
    }
  }

  playerX = nameX;
  playerO = isComputerOpponent ? "Computer" : nameO;

  // Lock inputs now that game is starting
  nameXInput.disabled = true;
  nameOInput.disabled = true;

  gameActive = true;
  currentPlayer = "X";
  boardState = Array(9).fill("");
  scoreX = 0;
  scoreO = 0;

  updateScoreboard();
  createBoard();

  statusText.textContent = `${playerX}'s Turn (${currentPlayer})`;
  statusText.style.color = "#FFFFFF";
  statusText.style.textShadow = "none";

  restartMatchBtn.disabled = false;
  nextRoundBtn.disabled = true;
}

startEndMatchBtn.addEventListener("click", () => {
  if (!matchStarted) {
    const nameXInput = document.getElementById("playerXName");
    const nameOInput = document.getElementById("playerOName");
    const nameError = document.getElementById("nameError");
    const nameX = nameXInput.value.trim();
    const nameO = nameOInput.value.trim();

    nameError.textContent = "";

    if (!nameX) {
      nameError.textContent = "Player X must enter a name.";
      return;
    }
    if (!isComputerOpponent && !nameO) {
      nameError.textContent = "Player O must enter a name.";
      return;
    }
    if (!isComputerOpponent && nameX.toLowerCase() === nameO.toLowerCase()) {
      nameError.textContent = "Players must have different names.";
      return;
    }

    startGame();
    matchStarted = true;
    startEndMatchBtn.textContent = "End Match";
  } else {
    endGame();
    matchStarted = false;
    startEndMatchBtn.textContent = "Start Match";
  }
});

function endGame() {
  gameActive = false;
  boardState = Array(9).fill("");
  cells.forEach(cell => {
    cell.textContent = "";
    cell.style.backgroundColor = "";
    cell.style.color = "";
    cell.style.textShadow = "";
  });

  scoreX = 0;
  scoreO = 0;
  scoreboard.innerHTML = `Player X: ${scoreX} | Player O: ${scoreO}`;

  document.getElementById("playerXName").disabled = false;
  document.getElementById("playerOName").disabled = isComputerOpponent;

  restartMatchBtn.disabled = true;
  nextRoundBtn.disabled = true;

  statusText.textContent = isComputerOpponent
    ? "Enter player name and start match"
    : "Enter player names and start match";
  statusText.style.color = "#FFFFFF";
  statusText.style.textShadow = "none";
}

// ================================
//            GAME LOGIC
// ================================
function handleMove(e) {
  const index = Number(e.target.dataset.index);
  if (!gameActive || boardState[index] !== "") return;

  makeMove(index, currentPlayer);

  if (checkGameStatus(currentPlayer)) return;

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;

  if (isComputerOpponent && currentPlayer === "O" && gameActive) {
    setTimeout(() => {
      if (gameActive && currentPlayer === "O") computerMove();
    }, 500);
  }
}

function checkGameStatus(player) {
  const winCombo = checkWinner(player);

  if (winCombo) {
    gameActive = false;
    const winColor = player === "X" ? "#EA3D5E" : "#00A1FF";

    winCombo.forEach(i => {
      cells[i].style.backgroundColor = winColor;
      cells[i].style.color = "#fff";
      cells[i].style.textShadow = `0 0 12px ${winColor}, 0 0 24px ${winColor}`;
    });

    if (player === "X") scoreX++;
    else scoreO++;

    updateScoreboard();
    statusText.textContent = `${getPlayerName(player)} wins this round!`;
    statusText.style.color = winColor;
    statusText.style.textShadow = `0 0 6px ${winColor}`;

    if (scoreX === 2 || scoreO === 2) {
      const winner = scoreX === 2 ? playerX : playerO;
      statusText.textContent = `${winner} wins the match`;
      statusText.style.color = "#FFD700";
      statusText.style.textShadow = "0 0 6px #FFD700, 0 0 12px #FFD700";
      gameActive = false;

      nextRoundBtn.disabled = true;
      restartMatchBtn.disabled = true;

      document.getElementById("playerXName").disabled = false;
      document.getElementById("playerOName").disabled = isComputerOpponent;

      startEndMatchBtn.textContent = "Start Match";
      matchStarted = false;
    } else {
      nextRoundBtn.disabled = false;
      nextRoundBtn.style.backgroundColor = "#00bcdd";
      restartMatchBtn.disabled = false;
    }

    return true;
  }

  if (boardState.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw";
    statusText.style.color = "#AAAAAA";
    statusText.style.textShadow = "none";
    gameActive = false;

    nextRoundBtn.disabled = false;
    restartMatchBtn.disabled = false;

    document.getElementById("playerXName").disabled = false;
    document.getElementById("playerOName").disabled = false;

    return true;
  }

  return false;
}

function checkWinner(player) {
  return winningCombo.find(([a, b, c]) =>
    boardState[a] === player &&
    boardState[b] === player &&
    boardState[c] === player
  );
}

function getPlayerName(symbol) {
  return symbol === "X" ? playerX : playerO;
}

// ================================
//         SCORE & RESET
// ================================
function updateScoreboard() {
  const playerXDisplay = playerX || "Player X";
  const playerODisplay = isComputerOpponent ? "Computer" : (playerO || "Player O");

  scoreboard.innerHTML = `
    ${playerXDisplay}: ${scoreX} | ${playerODisplay}: ${scoreO}
  `;
}

function resetGame() {
  nextRoundBtn.disabled = true;
  boardState = Array(9).fill("");
  gameActive = true;
  currentPlayer = "X";

  updateScoreboard();
  createBoard();

  statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
  statusText.style.color = "#FFFFFF";
  statusText.style.textShadow = "none";

  document.getElementById("playerXName").disabled = true;
  document.getElementById("playerOName").disabled = true;
}

function makeMove(index, player) {
  boardState[index] = player;
  cells[index].textContent = player;

  if (player === "X") {
    cells[index].style.color = "#EA3D5E";
    cells[index].style.textShadow = "0 0 10px #EA3D5E, 0 0 20px #EA3D5E";
  } else {
    cells[index].style.color = "#00A1FF";
    cells[index].style.textShadow = "0 0 10px #00A1FF, 0 0 20px #00A1FF";
  }
}

function computerMove() {
  function findBestMove(symbol) {
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === "") {
        boardState[i] = symbol;
        const wouldWin = Boolean(checkWinner(symbol));
        boardState[i] = "";
        if (wouldWin) return i;
      }
    }
    return null;
  }

  let move = findBestMove("O");
  if (move !== null) {
    makeMove(move, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }

  move = findBestMove("X");
  if (move !== null) {
    makeMove(move, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }

  if (boardState[4] === "") {
    makeMove(4, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }

  const corners = [0, 2, 6, 8].filter(i => boardState[i] === "");
  if (corners.length) {
    move = corners[Math.floor(Math.random() * corners.length)];
    makeMove(move, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }

  const sides = [1, 3, 5, 7].filter(i => boardState[i] === "");
  if (sides.length) {
    move = sides[Math.floor(Math.random() * sides.length)];
    makeMove(move, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }
}

function restartMatch() {
  scoreX = 0;
  scoreO = 0;
  currentPlayer = "X";
  gameActive = true;
  boardState = Array(9).fill("");

  restartMatchBtn.disabled = false;
  nextRoundBtn.disabled = true;

  updateScoreboard();
  createBoard();

  statusText.textContent = `${playerX}'s Turn (X)`;
  statusText.style.color = "#FFFFFF";
  statusText.style.textShadow = "none";
}

// ================================
//       INITIAL BOARD SETUP
// ================================
createBoard();
