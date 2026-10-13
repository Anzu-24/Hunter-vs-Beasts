const BOARD_SIZE = 8;
    const PIECES = {
      PLAYER: {
        image: 'assets/pieces/hunter.png',
        name: '狩人'
      },
      ROCK: {
        image: 'assets/pieces/rock.png',
        name: '岩'
      },
      SNAKE: {
        image: 'assets/pieces/snake.png',
        name: '蛇'
      },
      FOX: {
        image: 'assets/pieces/fox.png',
        name: '狐'
      },
      HORSE: {
        image: 'assets/pieces/horse.png',
        name: '馬'
      },
      ELEPHANT: {
        image: 'assets/pieces/elephant.png',
        name: '象'
      },
      HAWK: {
        image: 'assets/pieces/hawk.png',
        name: '鷹'
      },
      LION: {
        image: 'assets/pieces/lion.png',
        name: 'ライオン'
      },
      DRAGON: {
        image: 'assets/pieces/dragon.png',
        name: "Dragon",
      }
    };

let board = [];
let piecesMap = {};
let nextPieceId = 1;

let playerPos = { r: 0, c: 0 };
let playerPieceId = null;

let gameMode = "normal";
let turnCount = 0;
let nextSpawnTurn = 0;
let noKillTurns = 0;
let hasFireAura = false;
let lastAuraSpawnTurn = -99;
let isGameOver = false;
let isAnimating = false;

let isPlayerSelected = false;
let inspectedEnemyPos = null;

let bestTurn = parseInt(localStorage.getItem('hunter_game_best_turn') || '0', 10);
let todayBest = 0;

//ピクセル数//
function updatePiecePositionDOM(piece) {
    piece.element.style.transform =
        `translate(${piece.c * 100}%, ${piece.r * 100}%)`;
}



//Best Score//
function loadBestScores() {
  const keys = getScoreKeys();
  bestTurn =
  parseInt(localStorage.getItem(keys.best) || "0");
  const todayStr =
  new Date().toISOString().split("T")[0];
  const savedDate =
  localStorage.getItem(keys.date);
  const savedScore =
  parseInt(localStorage.getItem(keys.today) || "0");
  
  if (savedDate === todayStr) {
    todayBest = savedScore;
  } else {
    localStorage.setItem(keys.date, todayStr);
    localStorage.setItem(keys.today, "0");
    todayBest = 0;
  }
  refreshBestScoreDisplay();
  syncTurnAchievements();
}

//Board//
function createBoard() {
  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement("div");
      const isDark = (r + c) % 2 === 1;
      cell.className =
      `cell ${isDark ? "dark-cell" : "light-cell"}`;
      cell.addEventListener("click", () => onCellClick(r, c));
      gridEl.appendChild(cell);
    }
  }
}
function resetBoard() {
  board = Array(BOARD_SIZE)
  .fill(null)
  .map(() => Array(BOARD_SIZE).fill(null));
  piecesMap = {};
  document.getElementById("pieces-layer").innerHTML = "";
  createBoard();
}




//オーラ駒生成//
function createPiece(typeKey, r, c, isAura = false) {
    const id = nextPieceId++;
    
    const el = document.createElement('div');
    el.className = `piece-element ${isAura ? 'aura' : ''}`;

    const img = document.createElement("img");
    img.src = PIECES[typeKey].image;
    img.className = "piece-image";
    el.appendChild(img);

    img.animate(
      [
        {
          transform: "translateY(24px) scale(0.3)",
          opacity: 0,
          filter: "brightness(0) blur(2px)"
        },
        {
          transform: "translateY(10px) scale(0.8)",
          opacity: 0.8,
          filter: "brightness(0.5) blur(1px)"
        },
        {
          transform: "translateY(0px) scale(1)",
          opacity: 1,
          filter: "brightness(1) blur(0px)"
        }
      ],
      {
        duration: 450,
        easing: "cubic-bezier(.18,.8,.22,1)"
      });

    const aura = document.createElement("img");
    aura.src = "assets/effects/aura.png";
    aura.className = "aura-image";
    aura.style.display = isAura ? "block" : "none";
    el.appendChild(aura);

    if (isAura) {
      aura.animate(
        [
          {
            transform: "translateY(18px) scale(0.2)",
            opacity: 0
          },
          {
            transform: "translateY(12px) scale(0.6)",
            opacity: 0
          },
          {
            transform: "translateY(0px) scale(1)",
            opacity: 1
          }
        ],
        {
          duration: 450,
          delay: 180,
          easing: "ease-out",
          fill: "backwards"
        });
      }

    document.getElementById('pieces-layer').appendChild(el);

    const piece = { id, typeKey, r, c, isAura, element: el };
    piecesMap[id] = piece;
    board[r][c] = { id, typeKey, isAura };

    updatePiecePositionDOM(piece);
    return piece;
}

//ゲームの基盤//
function initGame(loadMode = false) {
  turnCount = 0;
  noKillTurns = 0;
  nextPieceId = 1;
  isGameOver = false;
  isAnimating = false;
  hasFireAura = false;
  lastAuraSpawnTurn = -99;
  isPlayerSelected = false;
  inspectedEnemyPos = null;

  loadBestScores();
  updateTurnDisplay();
  resetBoard();
      
  if(!loadMode){  
    playerPos = { r: 4, c: 4 };
    const playerPiece = createPiece('PLAYER', playerPos.r, playerPos.c);
    playerPieceId = playerPiece.id;

    gameMode = document.getElementById("mode-select").value;
    if (gameMode === "rock") {
      spawnRocks(getRandomInt(3, 4));
    }

    spawnAnimals(['SNAKE', 'FOX'], 4);
    setNextSpawnTurn();
  }
  renderHighlights();
  log(""); 
}

//Game Overの表示//
function showGameOver(message=""){
  const screen=document.getElementById("gameover-screen");
  if(!screen)return;
  document.getElementById("gameover-log").textContent=message;
  screen.classList.add("show");
}

//岩生成//
function spawnRocks(count) {
  let validCells = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!board[r][c]) {
        const isNearPlayer = Math.abs(r - playerPos.r) <= 1 && Math.abs(c - playerPos.c) <= 1;
        if (!isNearPlayer) {
          validCells.push({ r, c });
        }
      }
    }
  }
  for (let i = 0; i < count && validCells.length > 0; i++) {
    const randIndex = Math.floor(Math.random() * validCells.length);
    const cell = validCells.splice(randIndex, 1)[0];
    createPiece('ROCK', cell.r, cell.c);
  }
}

//駒の動き//
function getValidMoves(r, c, typeKey, currentBoard = board) {
    switch (typeKey) {
      case "PLAYER":return getPlayerMoves(r, c, currentBoard);
      case "SNAKE":return getSnakeMoves(r, c, currentBoard);
      case "FOX":return getFoxMoves(r, c, currentBoard);
      case "HORSE":return getHorseMoves(r, c, currentBoard);
      case "ELEPHANT":return getElephantMoves(r, c, currentBoard);
      case "HAWK":return getHawkMoves(r, c, currentBoard);
      case "LION":return getLionMoves(r, c, currentBoard);
      case "DRAGON":return getDragonMoves(r, c, currentBoard);
      default:
        return [];
    }
}

//駒の除去//
function removePiece(id) {
  if (!piecesMap[id]) return;
  const p = piecesMap[id];
  if (p.element && p.element.parentNode) {
    p.element.parentNode.removeChild(p.element);
  }
  if (board[p.r][p.c] && board[p.r][p.c].id === id) {
    board[p.r][p.c] = null;
  }
  delete piecesMap[id];
}
//行動範囲表示//
function onCellClick(r, c) {
    if (isGameOver || isAnimating) return;

    const targetCell = board[r][c];

    if (r === playerPos.r && c === playerPos.c) {
        isPlayerSelected = !isPlayerSelected;
        inspectedEnemyPos = null;
        log("");
        renderHighlights();
        return;
    }

    if (!isPlayerSelected && targetCell && targetCell.typeKey !== 'PLAYER' && targetCell.typeKey !== 'ROCK') {
        if (inspectedEnemyPos && inspectedEnemyPos.r === r && inspectedEnemyPos.c === c) {
            inspectedEnemyPos = null;
            log("");
        } else {
            inspectedEnemyPos = { r, c };
            log(`${PIECES[targetCell.typeKey].name} の移動予測`);
        }
        renderHighlights();
        return;
    }


    if (isPlayerSelected) {

        const playerMoves = getValidMoves(playerPos.r, playerPos.c, 'PLAYER');
        const isMovable = playerMoves.some(m => m.r === r && m.c === c);

        if (isMovable) {
          isPlayerSelected = false;
          inspectedEnemyPos = null;
          renderHighlights();

          executePlayerTurn(r, c);
        } else {
          log("");
        }
    }
}

//Game Over処理//
function triggerGameOver(killerTypeKey) {
  isGameOver = true;
  localStorage.removeItem("hunter_save");
  isAnimating = false;

  const killerName =
    PIECES[killerTypeKey]
    ? PIECES[killerTypeKey].name
      : "敵";

  log(`GAME OVER - Captured by ${killerName} (${turnCount} Turns)`);

  showGameOver(
    `${killerName}の餌食になった\n\n${turnCount} turns`
  );
  updateBestScores(turnCount);
  checkAchievements(turnCount);
}

function updateTurnDisplay() {
  document.getElementById('current-turn').textContent = turnCount;
}

function renderHighlights() {
  const gridEl = document.getElementById('grid');
  const playerMoves = (isPlayerSelected && !isGameOver) 
  ? getValidMoves(playerPos.r, playerPos.c, 'PLAYER') 
  : [];
      
  let enemyMoves = [];
  if (inspectedEnemyPos && board[inspectedEnemyPos.r][inspectedEnemyPos.c]) {
    const cell = board[inspectedEnemyPos.r][inspectedEnemyPos.c];
    enemyMoves = getValidMoves(inspectedEnemyPos.r, inspectedEnemyPos.c, cell.typeKey);
  }

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const idx = r * BOARD_SIZE + c;
      const cellEl = gridEl.children[idx];
          
      const isDark = (r + c) % 2 === 1;
      cellEl.className = `cell ${isDark ? 'dark-cell' : 'light-cell'}`;

      if (isPlayerSelected && r === playerPos.r && c === playerPos.c) {
        cellEl.classList.add('selected');
      }

      if (playerMoves.some(m => m.r === r && m.c === c)) {
        cellEl.classList.add('movable');
      }

      if (enemyMoves.some(m => m.r === r && m.c === c)) {
        cellEl.classList.add('enemy-movable');
      }

      if (inspectedEnemyPos && inspectedEnemyPos.r === r && inspectedEnemyPos.c === c) {
        cellEl.classList.add('selected');
      }
    }
  }
}

function log(msg) {
  document.getElementById('log').textContent = msg;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}
