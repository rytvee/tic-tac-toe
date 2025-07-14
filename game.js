// ================================
//       DOM ELEMENTS & SETUP
// ================================

// Access HTML elements for board display, status message, and scoreboard
const board = document.getElementById("board");
const statusText = document.getElementById("status");
const scoreboard = document.getElementById("scoreboard");

// Game state variables
let boardState = Array(9).fill(""); // Represents the current state of the 9 cells
let cells = [];                     // Stores references to cell DOM elements
let gameActive = false;             // Flag to track if game is ongoing
let currentPlayer = "X";            // Tracks current player ("X" or "O")

// Player names and scores
let scoreX = "0";
let scoreO = "0";
let playerX = "playerX";
let playerO = "playerO";

// All possible winning combinations (horizontal, vertical, diagonal)
const winningCombo = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],    //Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8],    //Vertical 
    [0, 4, 8], [2, 4, 6]                //Diagonal
];

// ================================
//         GAME INITIALIZATION
// ================================

// Create the game board UI with 9 clickable cells
function createBoard() {
    board.innerHTML = "";
    cells = [];

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        cell.addEventListener("click", handleMove);
        cell.style.backgroundColor = "#444";
        board.appendChild(cell);
        cells.push(cell);
    }
}

// Start a new game with names and initial scores
function startGame() {
    const nameXInput = document.getElementById("playerXName");
    const nameOInput = document.getElementById("playerOName");
    const nameX = nameXInput.value.trim();
    const nameO = nameOInput.value.trim();

    // Set custom player names if provided
    if (nameX) playerX = nameX;
    if (nameO) playerO = nameO;

   // Disable name input to prevent changes mid-match
   nameXInput.disabled = true;
   nameOInput.disabled = true;

   // Initialize/reset game state
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

// Handle a player's move when a cell is clicked
function handleMove(e) {
    const index = e.target.dataset.index;
    if (!gameActive || boardState[index] !== "") return;

    boardState[index] = currentPlayer;
    cells[index].textContent = currentPlayer; //Writes X and O

    if (checkGameStatus(currentPlayer)) return;

     // Switch player turn
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})`;
}

// Check for a win or draw condition
function checkGameStatus(player) {
    const winCombo = checkWinner(player);

    // Player wins
    if (winCombo) {
        gameActive = false;
        winCombo.forEach(i => {
            cells[i].style.backgroundColor = "#2ecc71";
        });

        if (player === "X") scoreX++;
        else scoreO++;

        updateScoreboard();

        statusText.textContent = `${getPlayerName(player)} wins this round!`;

        // Check for match win (first to 2 rounds)
        if (scoreX === 2 || scoreO === 2) {
            const winner = scoreX === 2 ? playerX : playerO;
            statusText.textContent = `${winner} wins the match`;
            gameActive = false;
        }
        return true;
    }

    // If all cells filled and no winner => draw
    if (boardState.every(cell => cell !== "")) {
        statusText.textContent = "It's a draw";
        gameActive = false;
        return true;
    }
    return false;
}

// Check if current player has a winning combination
function checkWinner(player) {
    return winningCombo.find(([a, b, c]) => 
        boardState[a] === player &&
        boardState[b] === player &&
        boardState[c] === player
    );
}

// Get player's display name by symbol
function getPlayerName(symbol) {
    return symbol === "X" ? playerX : playerO;
}

// ================================
//         SCORE & RESET
// ================================

// Update the scoreboard text
function updateScoreboard() {
    scoreboard.textContent = `${playerX} (X): ${scoreX} | ${playerO} (X): ${scoreO}`
}

// Reset the current game round, but keep the scores
function resetGame() {
    if (scoreX === 2 || scoreO === 2) {
        statusText.textContent = "Match over! Click 'Restart Match' to play again";
        return;
    }
    boardState = Array(9).fill("");
    gameActive = true;
    currentPlayer = "X";
    statusText.textContent = `${getPlayerName(currentPlayer)}'s Turn (${currentPlayer})` ;
    createBoard();
}

// Completely restart the match, reset scores and re-enable name inputs
function restartMatch() {
    // Re-enable name inputs for new players
    document.getElementById("playerXName").disabled = false;
    document.getElementById("playerOName").disabled = false;

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

// Prepare the empty board on page load
createBoard();
