// ================================
//       DOM ELEMENTS & SETUP
// ================================

const board = document.getElementById("board");
const statusText = document.getElementById("status");
const scoreboard = document.getElementById("scoreboard");

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
  [0, 1, 2], [3, 4, 5], [6, 7, 8],    // Horizontal
  [0, 3, 6], [1, 4, 7], [2, 5, 8],    // Vertical
  [0, 4, 8], [2, 4, 6]                // Diagonal
];

const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
  isComputerOpponent = !isComputerOpponent;
  modeToggle.textContent = isComputerOpponent ? "Mode: Vs Computer" : "Mode: 2 Players";

  // Update Player O input immediately for clarity
  const nameOInput = document.getElementById("playerOName");
  nameOInput.value = isComputerOpponent ? "Computer" : "";
  nameOInput.disabled = isComputerOpponent;
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
    cell.textContent = ""; // clear
    board.appendChild(cell);
    cells.push(cell);
  }
}

function startGame() {
  const nameXInput = document.getElementById("playerXName");
  const nameOInput = document.getElementById("playerOName");
  const nameError = document.getElementById("nameError");
  const nameX = nameXInput.value.trim();
  let nameO = nameOInput.value.trim();

  // Clear previous error
  nameError.textContent = "";

  // Handle Computer Mode
  if (isComputerOpponent) {
    playerO = "Computer";
    nameOInput.value = "Computer";
    nameOInput.disabled = true;
  } else {
    if (!nameO) {
      nameError.textContent = "Both players must enter a name.";
      return;
    }
    playerO = nameO;
    nameOInput.disabled = true;
  }

  // Validate X
  if (!nameX) {
    nameError.textContent = "Both players must enter a name.";
    return;
  }

  // Prevent same-name clash in 2-player mode
  if (!isComputerOpponent && nameX.toLowerCase() === nameO.toLowerCase()) {
    nameError.textContent = "Players must have different names.";
    return;
  }

  playerX = nameX;
  // playerO already set above

  // Lock name inputs while match is on
  nameXInput.disabled = true;
  nameOInput.disabled = true;

  // reset scores and state
  scoreX = 0;
  scoreO = 0;
  currentPlayer = "X";
  gameActive = true;
  boardState = Array(9).fill("");

  updateScoreboard();
  statusText.textContent = `${playerX}'s Turn (X)`;
  createBoard();
}

// ================================
//            GAME LOGIC
// ================================

function handleMove(e) {
  const index = Number(e.target.dataset.index); // ensure number
  if (!gameActive || boardState[index] !== "") return;

  // centralised move
  makeMove(index, currentPlayer);

  if (checkGameStatus(currentPlayer)) return;

  // switch player
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;

  // If computer mode and it's O's turn, let the computer play
  if (isComputerOpponent && currentPlayer === "O" && gameActive) {
    setTimeout(() => {
      // double-check state before acting
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
      statusText.style.color = "#FFD700"; // Gold
      statusText.style.textShadow = "0 0 6px #FFD700, 0 0 12px #FFD700";
      gameActive = false;
    }

    return true;
  }

  if (boardState.every(cell => cell !== "")) {
    statusText.textContent = "It's a draw";
    statusText.style.color = "#AAAAAA";
    statusText.style.textShadow = "none";
    gameActive = false;
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
  scoreboard.textContent = `${playerX} (X): ${scoreX} | ${playerO} (O): ${scoreO}`;
}

function resetGame() {
  statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
  statusText.style.color = "#FFFFFF";
  statusText.style.textShadow = "none";

  if (scoreX === 2 || scoreO === 2) {
    statusText.textContent = "Match over! Click 'Restart Match' to play again";
    return;
  }

  boardState = Array(9).fill("");
  gameActive = true;
  currentPlayer = "X";
  statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
  createBoard();

  // Keep names disabled between rounds
  document.getElementById("playerXName").disabled = true;
  document.getElementById("playerOName").disabled = true;
}

function makeMove(index, player) {
  // centralised move setter
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
  // smarter-but-readable AI (win -> block -> center -> corners -> sides)

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

  // 1. Win if possible
  let move = findBestMove("O");
  if (move !== null) {
    makeMove(move, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }

  // 2. Block player
  move = findBestMove("X");
  if (move !== null) {
    makeMove(move, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }

  // 3. Center
  if (boardState[4] === "") {
    makeMove(4, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }

  // 4. Corner
  const corners = [0, 2, 6, 8].filter(i => boardState[i] === "");
  if (corners.length) {
    move = corners[Math.floor(Math.random() * corners.length)];
    makeMove(move, "O");
    if (checkGameStatus("O")) return;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
    return;
  }

  // 5. Sides
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
  statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
  statusText.style.color = "#FFFFFF";
  statusText.style.textShadow = "none";

  // Allow changing Player X name; keep Player O disabled if computer mode
  document.getElementById("playerXName").disabled = false;
  document.getElementById("playerOName").disabled = isComputerOpponent;
  if (isComputerOpponent) document.getElementById("playerOName").value = "Computer";

  scoreX = 0;
  scoreO = 0;
  currentPlayer = "X";
  gameActive = true;
  boardState = Array(9).fill("");

  updateScoreboard();
  statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
  createBoard();
}

// ================================
//       INITIAL BOARD SETUP
// ================================

createBoard();
