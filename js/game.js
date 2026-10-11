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
    };

    let board = [];
    let piecesMap = {};
    let nextPieceId = 1;

    let playerPos = { r: 0, c: 0 };
    let playerPieceId = null;

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

    function loadTodayBest() {
      const todayStr = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem('hunter_game_today_date');
      const savedScore = parseInt(localStorage.getItem('hunter_game_today_best') || '0', 10);

      if (savedDate === todayStr) {
        todayBest = savedScore;
      } else {
        localStorage.setItem('hunter_game_today_date', todayStr);
        localStorage.setItem('hunter_game_today_best', '0');
        todayBest = 0;
      }
      document.getElementById('today-best').textContent = todayBest;
      document.getElementById('best-turn').textContent = bestTurn;
    }

    function loadAchievementStats(){
      const totalKills =
      parseInt(localStorage.getItem("hunter_total_kills") || "0");
      const bestTurn =
      parseInt(localStorage.getItem("hunter_game_best_turn") || "0");
      document.getElementById("total-kills").textContent =
      totalKills;
      document.getElementById("best-survival").textContent =
      bestTurn;
    }

    function updateAchievements(){
      const achievements = [
        [40, "ach-40", "achievement_40"],
        [50, "ach-50", "achievement_50"],
        [80, "ach-80", "achievement_80"],
        [100, "ach-100", "achievement_100"]
      ];
      achievements.forEach(([turn, id, key]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (localStorage.getItem(key)) {
          el.textContent = "☑";
          el.style.color = "#fbbf24";
        } else {
          el.textContent = "☐";
          el.style.color = "#9ca3af";
        }
      });
    }
    function unlockAchievement(name){
      const popup = document.createElement("div");
      popup.className = "achievement-popup";
      popup.innerHTML = `
        <div style="font-size:36px;">🏆</div>
        <div style="font-weight:bold;">
            Achievement Unlocked
        </div>
        <div>${name}</div>
        `;
        document.body.appendChild(popup);
        requestAnimationFrame(()=>{
          popup.classList.add("show");
        });
        setTimeout(()=>{
          popup.classList.remove("show");
          setTimeout(()=>{
            popup.remove();
          },300);
        },2500);
    }

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

      loadTodayBest();
      updateTurnDisplay();
      document.getElementById('pieces-layer').innerHTML = '';
      const gridEl = document.getElementById('grid');
      gridEl.innerHTML = '';
      
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const cell = document.createElement('div');
          const isDark = (r + c) % 2 === 1;
          cell.className = `cell ${isDark ? 'dark-cell' : 'light-cell'}`;
          cell.addEventListener('click', () => onCellClick(r, c));
          gridEl.appendChild(cell);
        }
      }

      board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
      piecesMap = {};
      
    if(!loadMode){  
      playerPos = { r: 4, c: 4 };
      const playerPiece = createPiece('PLAYER', playerPos.r, playerPos.c);
      playerPieceId = playerPiece.id;

      const selectedMode = document.getElementById('mode-select').value;
      if (selectedMode === 'rock') {
        spawnRocks(getRandomInt(2, 3));
      }

      spawnAnimals(['SNAKE', 'FOX'], 4);
      setNextSpawnTurn();
    }
      renderHighlights();
      log(""); 
  }


    function showGameOver(message=""){
      const screen=document.getElementById("gameover-screen");
      if(!screen)return;
      document.getElementById("gameover-log").textContent=message;
      screen.classList.add("show");
    }

    function createPiece(typeKey, r, c, isAura = false) {
      const id = nextPieceId++;

      const el = document.createElement('div');
      el.className = `piece-element ${isAura ? 'aura' : ''}`;

      const img = document.createElement("img");
      img.src = PIECES[typeKey].image;
      img.className = "piece-image";
      el.appendChild(img);

      const aura = document.createElement("img");
      aura.src = "assets/effects/aura.png";
      aura.className = "aura-image";
      aura.style.display = isAura ? "block" : "none";
      el.appendChild(aura);

      document.getElementById('pieces-layer').appendChild(el);

      const piece = { id, typeKey, r, c, isAura, element: el };
      piecesMap[id] = piece;
      board[r][c] = { id, typeKey, isAura };

      updatePiecePositionDOM(piece);
      return piece;
    }

    function updatePiecePositionDOM(piece) {
      piece.element.style.transform = `translate(${piece.c * 100}%, ${piece.r * 100}%)`;
    }

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

    function addKillCount(count){
      const totalKills =
      parseInt(localStorage.getItem("hunter_total_kills") || "0");
      localStorage.setItem(
        "hunter_total_kills",
        (totalKills + count).toString()
      );
    }
    
    function saveGame() {
      const pieces = [];
      Object.values(piecesMap).forEach(piece => {
        pieces.push({
          id: piece.id,
          typeKey: piece.typeKey,
          r: piece.r,
          c: piece.c,
          isAura: piece.isAura
        });
      });
      const saveData = {
        pieces,

        playerPos,
        playerPieceId,

        turnCount,
        nextSpawnTurn,
        noKillTurns,

        hasFireAura,
        lastAuraSpawnTurn,

        bestTurn,
        todayBest,

        nextPieceId
      };
      
      localStorage.setItem(
        "hunter_save",
        JSON.stringify(saveData)
      );
    }
    function loadGame() {
      const data = localStorage.getItem("hunter_save");
      if (!data) return false;
      const save = JSON.parse(data);
      board = Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null));
      piecesMap = {};
      document.getElementById("pieces-layer").innerHTML = "";
      const gridEl = document.getElementById("grid");
      gridEl.innerHTML = "";
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const cell = document.createElement("div");
          const isDark = (r + c) % 2 === 1;
          cell.className = `cell ${isDark ? "dark-cell" : "light-cell"}`;
          cell.addEventListener("click", () => onCellClick(r, c));
          gridEl.appendChild(cell);
        }
      }
      isGameOver = false;
      isAnimating = false;
      isPlayerSelected = false;
      inspectedEnemyPos = null;
      
      nextPieceId = save.nextPieceId;
      
      turnCount = save.turnCount;
      
      nextSpawnTurn = save.nextSpawnTurn;
      noKillTurns = save.noKillTurns;
      hasFireAura = save.hasFireAura;
      lastAuraSpawnTurn = save.lastAuraSpawnTurn;

      nextSpawnTurn = save.nextSpawnTurn;
      noKillTurns = save.noKillTurns;
      hasFireAura = save.hasFireAura;
      lastAuraSpawnTurn = save.lastAuraSpawnTurn;
        
      bestTurn = save.bestTurn;
      todayBest = save.todayBest;
        
      playerPos = save.playerPos;
      playerPieceId = save.playerPieceId;
        
        save.pieces.forEach(p => {
          nextPieceId = p.id;
          const piece = createPiece(
            p.typeKey,
            p.r,
            p.c,
            p.isAura
          );
          
          piecesMap[p.id] = piece;

          board[p.r][p.c] = {
            id: p.id,
            typeKey: p.typeKey,
            isAura: p.isAura
          };

          if (p.id === playerPieceId && p.isAura) {
            const aura =
            piece.element.querySelector(".aura-image");
            if (aura) {
              aura.style.display = "block";
            }
          }
        });
        
        nextPieceId = save.nextPieceId;
        updateTurnDisplay();
        renderHighlights();
        return true;
      }
      
      
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

    function setNextSpawnTurn() {
      if (turnCount <= 5) {
        nextSpawnTurn = turnCount + getRandomInt(2, 3);
      } else if (turnCount <= 10) {
        nextSpawnTurn = turnCount + getRandomInt(3, 4);
      } else {
        nextSpawnTurn = turnCount + getRandomInt(4, 5);
      }
    }

    function getAvailableAnimalTypes() {
      if (turnCount < 15) return ['SNAKE', 'FOX'];
      if (turnCount < 35) return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT'];
      if (turnCount < 50) return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT', 'HAWK'];
      return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT', 'HAWK', 'LION'];
    }

    function getSnakeCount() {
      let count = 0;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (board[r][c] && board[r][c].typeKey === 'SNAKE') count++;
        }
      }
      return count;
    }

    function spawnAnimals(types, count) {
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

      if (validCells.length === 0) {
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            if (!board[r][c]) validCells.push({ r, c });
          }
        }
      }

      let currentSnakeCount = getSnakeCount();

      for (let i = 0; i < count && validCells.length > 0; i++) {
        const randIndex = Math.floor(Math.random() * validCells.length);
        const cell = validCells.splice(randIndex, 1)[0];
        
        let filteredTypes = [...types];
        if (currentSnakeCount >= 8) {
          filteredTypes = filteredTypes.filter(t => t !== 'SNAKE');
          if (filteredTypes.length === 0) filteredTypes = ['FOX'];
        }

        const typeKey = filteredTypes[Math.floor(Math.random() * filteredTypes.length)];
        if (typeKey === 'SNAKE') currentSnakeCount++;
        
        let isAura = false;
        if (typeKey === 'FOX' && (turnCount - lastAuraSpawnTurn >= 20)) {
          if (Math.random() < 0.05) {
            isAura = true;
            lastAuraSpawnTurn = turnCount;
          }
        }

        createPiece(typeKey, cell.r, cell.c, isAura);
      }
    }

    function getValidMoves(r, c, typeKey, currentBoard = board) {
      const moves = [];

      if (typeKey === 'PLAYER') {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        dirs.forEach(([dr, dc]) => {
          let step = 1;
          while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (!isInBounds(nr, nc)) break;
            const cell = currentBoard[nr][nc];
            
            if (cell && cell.typeKey === 'ROCK') break;

            moves.push({ r: nr, c: nc });
            if (cell) break;
            step++;
          }
        });


      } else if (typeKey === 'LION' || typeKey === 'SNAKE') {
        const dirs = (typeKey === 'LION') ? [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ] : [[-1, 0], [1, 0], [0, -1], [0, 1]];

        dirs.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (isInBounds(nr, nc)) {
            const cell = currentBoard[nr][nc];
            if (!cell || cell.typeKey !== 'ROCK') moves.push({ r: nr, c: nc });
          }
        });

      } else if (typeKey === 'FOX') {
        const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        dirs.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (isInBounds(nr, nc)) {
            const cell = currentBoard[nr][nc];
            if (!cell || cell.typeKey !== 'ROCK') moves.push({ r: nr, c: nc });
          }
        });

      } else if (typeKey === 'HAWK') {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        dirs.forEach(([dr, dc]) => {
          let hasObstacle = false;
          let step = 1;
          while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (!isInBounds(nr, nc)) break;

            const targetCell = currentBoard[nr][nc];
            if (targetCell) {
              if (targetCell.typeKey === 'PLAYER') {
                if (hasObstacle) moves.push({ r: nr, c: nc });
              } else {
                hasObstacle = true;
              }
            } else {
              moves.push({ r: nr, c: nc });
            }
            step++;
          }
        });

      } else if (typeKey === 'HORSE') {
        const dirs = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        dirs.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (isInBounds(nr, nc)) {
            const cell = currentBoard[nr][nc];
            if (!cell || cell.typeKey !== 'ROCK') moves.push({ r: nr, c: nc });
          }
        });

      } else if (typeKey === 'ELEPHANT') {
        const dirs = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
        dirs.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (isInBounds(nr, nc)) {
            const cell = currentBoard[nr][nc];
            if (!cell || cell.typeKey !== 'ROCK') moves.push({ r: nr, c: nc });
          }
        });
      }

      return moves;
    }

    function isInBounds(r, c) {
      return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
    }

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


function playExplosionAtCell(r, c) {

  const board = document.getElementById("board-container");
  if (!board) return;

  const rect = board.getBoundingClientRect();
  const size = rect.width / BOARD_SIZE;

  const img = document.createElement("img");

  img.src = "assets/effects/explosion.png";
  img.className = "effect explosion";

  img.style.position = "absolute";
  img.style.pointerEvents = "none";

  img.style.width = (size * 1.2) + "px";
  img.style.height = (size * 1.2) + "px";

  img.style.left = (c * size + size / 2) + "px";
  img.style.top  = (r * size + size / 2) + "px";

  img.style.transform = "translate(-50%,-50%) scale(.6)";
  img.style.opacity = "0";

  board.appendChild(img);

  requestAnimationFrame(() => {
    img.style.transition =
      "transform .16s ease-out, opacity .16s ease-out";

    img.style.transform =
      "translate(-50%,-50%) scale(1.15)";

    img.style.opacity = "1";
  });

  setTimeout(() => {

    img.style.opacity = "0";
    img.style.transform =
      "translate(-50%,-50%) scale(.9)";

  },120);

  setTimeout(() => {
    img.remove();
  },200);

}

function triggerInfiniteCrossBlast(r, c, onComplete) {
  const blastCells = [{ r, c }];
  const dirs = [
    { dr: -1, dc: 0, direction: 'up' },
    { dr: 1, dc: 0, direction: 'down' },
    { dr: 0, dc: -1, direction: 'left' },
    { dr: 0, dc: 1, direction: 'right' }
  ];

  playExplosionAtCell(r, c);
  dirs.forEach(({ dr, dc, direction }) => {
    let step = 1;

    while (true) {
      const nr = r + dr * step;
      const nc = c + dc * step;

      if (!isInBounds(nr, nc)) break;

      blastCells.push({ r: nr, c: nc });

      playFlameSweepCell(nr, nc, direction, step * 30);

      step++;
    }
  });

  let destroyedCount = 0;
  const gridEl = document.getElementById('grid');

  blastCells.forEach(cell => {
    const index = cell.r * BOARD_SIZE + cell.c;
    const cellEl = gridEl.children[index];

    if (cellEl) cellEl.classList.add('fire-blast');

    const occupant = board[cell.r][cell.c];

    if (
      occupant &&
      occupant.typeKey !== 'PLAYER' &&
      occupant.typeKey !== 'ROCK'
    ) {
      removePiece(occupant.id);
      destroyedCount++;
    } 
  });
  setTimeout(() => {
    blastCells.forEach(cell => {
      const index = cell.r * BOARD_SIZE + cell.c;
      const cellEl = gridEl.children[index];
      if (cellEl) cellEl.classList.remove('fire-blast');
    });
    if (destroyedCount > 0) {
      addKillCount(destroyedCount);
    }
    if (onComplete) onComplete(destroyedCount);
  }, 400);
}

  function executePlayerTurn(targetR, targetC) {
      isAnimating = true;

      const targetCell = board[targetR][targetC];
      let capturedAuraFox = false;
      let killedEnemy = false;

      if (targetCell && targetCell.typeKey !== 'ROCK') {
        killedEnemy = true;
        if (targetCell.isAura) capturedAuraFox = true;
      }

      const executeBlastThisTurn = hasFireAura;

      board[playerPos.r][playerPos.c] = null;
      const playerPiece = piecesMap[playerPieceId];
      playerPiece.r = targetR;
      playerPiece.c = targetC;
      playerPos = { r: targetR, c: targetC };
      board[targetR][targetC] = { id: playerPieceId, typeKey: 'PLAYER', isAura: hasFireAura };

      if (targetCell && targetCell.typeKey !== 'ROCK') {
        removePiece(targetCell.id);
        addKillCount(1);
      }

      updatePiecePositionDOM(playerPiece);

      setTimeout(() => {
        if (capturedAuraFox) {
          hasFireAura = true;
          playerPiece.isAura = true;
          const auraImg = playerPiece.element.querySelector(".aura-image");
          if (auraImg) auraImg.style.display = "block";
          log("オーラ獲得！次の一手で十字爆発発動");
        }

        if (executeBlastThisTurn) {
          triggerInfiniteCrossBlast(targetR, targetC, (destroyedCount) => {
            if (destroyedCount > 0) killedEnemy = true;
            
            hasFireAura = false;
            playerPiece.isAura = false;
            const auraImg = playerPiece.element.querySelector(".aura-image");
            if (auraImg) auraImg.style.display = "none";

            processKillStatusAndAI(killedEnemy);
          });
        } else {
          processKillStatusAndAI(killedEnemy);
        }
      }, 350);
  } 

    function processKillStatusAndAI(killedEnemy) {
      if (killedEnemy) {
        noKillTurns = 0;
      } else {
        noKillTurns++;
      }

      turnCount++;
      updateTurnDisplay();

      executeEnemyAITurn(() => {
        if (!isGameOver) {
          checkSpawns();
          saveGame();
          isAnimating = false;
        }
      });
    }


  function playFlameSweepCell(r, c, direction, delay = 0) {
    setTimeout(() => {
      const board = document.getElementById("board-container");
      if (!board) return;
      
      const rect = board.getBoundingClientRect();
      const size = rect.width / BOARD_SIZE;
      
      const img = document.createElement("img");
      img.src = "assets/effects/flame-sweep.png";
      img.className = "effect flame";
    
      img.style.position = "absolute";
      img.style.width = size + "px";
      img.style.height = size + "px";
      img.style.left = (c * size) + "px";
      img.style.top = (r * size) + "px";
      img.style.pointerEvents = "none";

      let rotation = 0;

      if (direction === "up") rotation = -90;
      else if (direction === "down") rotation = 90;
      else if (direction === "left") rotation = 180;

      img.style.transform = `rotate(${rotation}deg)`;

      board.appendChild(img);

      requestAnimationFrame(() => {
        img.style.opacity = "1";
      });
      
      setTimeout(() => {
        img.remove();
      }, 160);
    }, delay);
  }

    function executeEnemyAITurn(onComplete) {
      if (isGameOver) return;

      const bestMove = getBestMoveMinimax3(board, playerPos);

      if (!bestMove) {
        if (onComplete) onComplete();
        return;
      }

      const enemyPiece = piecesMap[bestMove.fromPieceId];
      const isCapturePlayer = (bestMove.to.r === playerPos.r && bestMove.to.c === playerPos.c);

      board[enemyPiece.r][enemyPiece.c] = null;
      enemyPiece.r = bestMove.to.r;
      enemyPiece.c = bestMove.to.c;

      if (!isCapturePlayer) {
        board[bestMove.to.r][bestMove.to.c] = { id: enemyPiece.id, typeKey: enemyPiece.typeKey, isAura: enemyPiece.isAura };
      }

      updatePiecePositionDOM(enemyPiece);

      setTimeout(() => {
        if (isCapturePlayer) {
          removePiece(playerPieceId);
          board[bestMove.to.r][bestMove.to.c] = { id: enemyPiece.id, typeKey: enemyPiece.typeKey, isAura: enemyPiece.isAura };
          triggerGameOver(enemyPiece.typeKey);
        } else {
          if (onComplete) onComplete();
        }
      }, 350);
    }

    function cloneBoard(b) {
      return b.map(row => row.map(cell => cell ? { ...cell } : null));
    }

    function isPositionExposedToHunter(pos, pPos, b) {
      if (pos.r !== pPos.r && pos.c !== pPos.c) return false;
      const dr = Math.sign(pPos.r - pos.r);
      const dc = Math.sign(pPos.c - pos.c);
      let step = 1;
      while (true) {
        const nr = pos.r + dr * step;
        const nc = pos.c + dc * step;
        if (nr === pPos.r && nc === pPos.c) break;
        if (b[nr][nc]) return false;
        step++;
      }
      return true;
    }

    function isProtectedByAnyAlly(targetPos, b) {
      const bCaptured = cloneBoard(b);
      bCaptured[targetPos.r][targetPos.c] = { typeKey: 'PLAYER' };

      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const cell = bCaptured[r][c];
          if (cell && cell.typeKey !== 'PLAYER' && cell.typeKey !== 'ROCK') {
            const moves = getValidMoves(r, c, cell.typeKey, bCaptured);
            if (moves.some(m => m.r === targetPos.r && m.c === targetPos.c)) {
              return true;
            }
          }
        }
      }
      return false;
    }

    function getBestMoveMinimax3(currentBoard, pPos) {
      const enemyPieces = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (currentBoard[r][c] && currentBoard[r][c].typeKey !== 'PLAYER' && currentBoard[r][c].typeKey !== 'ROCK') {
            enemyPieces.push({ r, c, piece: currentBoard[r][c] });
          }
        }
      }

      if (enemyPieces.length === 0) return null;

      for (const e of enemyPieces) {
        const moves = getValidMoves(e.r, e.c, e.piece.typeKey, currentBoard);
        if (moves.some(m => m.r === pPos.r && m.c === pPos.c)) {
          return { fromPieceId: e.piece.id, to: { r: pPos.r, c: pPos.c } };
        }
      }

      let bestScore = -Infinity;
      let bestMove = null;

      for (const e of enemyPieces) {
        const validMoves = getValidMoves(e.r, e.c, e.piece.typeKey, currentBoard)
          .filter(m => !currentBoard[m.r][m.c] || (m.r === pPos.r && m.c === pPos.c));

        for (const move of validMoves) {
          const b1 = cloneBoard(currentBoard);
          b1[move.r][move.c] = b1[e.r][e.c];
          b1[e.r][e.c] = null;

          if (move.r === pPos.r && move.c === pPos.c) {
            return { fromPieceId: e.piece.id, to: move };
          }

          const pMoves = getValidMoves(pPos.r, pPos.c, 'PLAYER', b1);
          let minPlayerScore = Infinity;

          if (pMoves.length === 0) {
            minPlayerScore = -10000;
          } else {
            for (const pm of pMoves) {
              const b2 = cloneBoard(b1);
              b2[pm.r][pm.c] = b2[pPos.r][pPos.c];
              b2[pPos.r][pPos.c] = null;

              const score3 = evaluateBoardForEnemies(b2, pm, move, e.piece.typeKey, currentBoard, { r: e.r, c: e.c });
              if (score3 < minPlayerScore) {
                minPlayerScore = score3;
              }
            }
          }

          if (minPlayerScore > bestScore) {
            bestScore = minPlayerScore;
            bestMove = { fromPieceId: e.piece.id, to: move };
          }
        }
      }

      return bestMove;
    }

    function evaluateBoardForEnemies(b, pPos, lastMovePos, movedTypeKey, initialBoard = null, originPos = null) {
      let score = 0;
      const pMoves = getValidMoves(pPos.r, pPos.c, 'PLAYER', b);
      
      score += (30 - pMoves.length * 5);

      const inHunterLine = (lastMovePos.r === pPos.r || lastMovePos.c === pPos.c);
      const isRushActive = (noKillTurns >= 5);

      function hasObstacleBetween(r1, c1, r2, c2, currentB) {
        if (r1 !== r2 && c1 !== c2) return false;
        const dr = Math.sign(r2 - r1);
        const dc = Math.sign(c2 - c1);
        let step = 1;
        while (true) {
          const nr = r1 + dr * step;
          const nc = c1 + dc * step;
          if (nr === r2 && nc === c2) break;
          if (currentB[nr][nc]) return true;
          step++;
        }
        return false;
      }

      if (initialBoard && originPos && !isRushActive) {
        for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            const initCell = initialBoard[r][c];
            if (initCell && initCell.typeKey !== 'PLAYER' && initCell.typeKey !== 'ROCK' && initCell.typeKey !== 'HAWK') {
              const isExposed = isPositionExposedToHunter({ r, c }, pPos, initialBoard);
              const isProtected = isProtectedByAnyAlly({ r, c }, initialBoard);

              if (isExposed && !isProtected) {
                if (originPos.r === r && originPos.c === c) {
                  const nowExposed = isPositionExposedToHunter(lastMovePos, pPos, b);
                  if (!nowExposed) {
                    score += 220;
                  }
                } 
                else {
                  const nowProtected = isProtectedByAnyAlly({ r, c }, b);
                  if (nowProtected) {
                    score += 200;
                  }
                }
              }
            }
          }
        }
      }

      const isPieceRushActive = (movedTypeKey === 'HAWK') ? false : isRushActive;

      if (inHunterLine && !isPieceRushActive) {
        let isProtectedByAlly = isProtectedByAnyAlly(lastMovePos, b);

        if (movedTypeKey === 'HAWK') {
          const hasObstacle = hasObstacleBetween(lastMovePos.r, lastMovePos.c, pPos.r, pPos.c, b);
          if (hasObstacle) {
            score += 180;
          } else {
            score -= 350;
          }
        } else {
          if (isProtectedByAlly) {
            score += 150;
          } else {
            score -= 250;
          }
        }
      }

      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          const cell = b[r][c];
          if (cell && cell.typeKey !== 'PLAYER' && cell.typeKey !== 'ROCK') {
            const eMoves = getValidMoves(r, c, cell.typeKey, b);
            
            if (eMoves.some(m => m.r === pPos.r && m.c === pPos.c)) {
              score += 500;
            }

            const dist = Math.hypot(r - pPos.r, c - pPos.c);
            
            if (isRushActive && cell.typeKey !== 'HAWK') {
              score -= dist * 40;
            } else {
              score -= dist * 10;
            }

            if (cell.typeKey === 'SNAKE' && dist <= 2) {
              score += 30;
            }

            if (cell.typeKey === 'LION') {
              const isDiagonal = Math.abs(r - pPos.r) === Math.abs(c - pPos.c);
              if (isDiagonal) score += 40;
              if (dist <= 2) score += 60;
            }

            if (cell.typeKey === 'HAWK') {
              const inLine = (r === pPos.r || c === pPos.c);
              const hasObstacle = inLine ? hasObstacleBetween(r, c, pPos.r, pPos.c, b) : false;
              if (inLine && hasObstacle) {
                score += 100;
              } else if (!inLine) {
                score += 20;
              }
            }
          }
        }
      }
      return score;
    }

    function checkSpawns() {
      if (isGameOver) return;

      let animalCount = 0;
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if (board[r][c] && board[r][c].typeKey !== 'PLAYER' && board[r][c].typeKey !== 'ROCK') animalCount++;
        }
      }

      const availableTypes = getAvailableAnimalTypes();

      if (noKillTurns >= 3 && noKillTurns < 5) {
        if (nextSpawnTurn > turnCount + 1) {
          nextSpawnTurn = turnCount + 1;
        }
      }

      if (noKillTurns >= 7) {
        spawnAnimals(availableTypes, 3);
        return;
      }

      if (animalCount === 1) {
        spawnAnimals(availableTypes, 2);
        return;
      }

      if (animalCount === 0 || turnCount >= nextSpawnTurn) {
        let spawnCount = 2;

        if (animalCount === 0) {
          spawnCount = getRandomInt(3, 4);
        } else if (turnCount <= 5) {
          spawnCount = 3;
        } else if (turnCount <= 10) {
          spawnCount = getRandomInt(2, 3);
        } else if (turnCount <= 15) {
          spawnCount = getRandomInt(2, 3);
        } else {
          if (animalCount <= 4) {
            spawnCount = 3;
          } else if (animalCount <= 7) {
            spawnCount = 2;
          } else {
            spawnCount = 1;
          }
        }

        spawnAnimals(availableTypes, spawnCount);
        setNextSpawnTurn();
      }
    }

    function triggerGameOver(killerTypeKey) {
      isGameOver = true;
      localStorage.removeItem("hunter_save");
      isAnimating = false;
      const killerName = PIECES[killerTypeKey] ? PIECES[killerTypeKey].name : '敵';
      log(`GAME OVER - Captured by ${killerName} (${turnCount} Turns)`);
      showGameOver(
        `${killerName}の餌食になった\n\n${turnCount} turns`
      );

      const todayStr = new Date().toISOString().split('T')[0];

      if (turnCount > todayBest) {
        todayBest = turnCount;
        localStorage.setItem('hunter_game_today_best', todayBest.toString());
        localStorage.setItem('hunter_game_today_date', todayStr);
        document.getElementById('today-best').textContent = todayBest;
      }

      if (turnCount > bestTurn) {
        bestTurn = turnCount;
        localStorage.setItem('hunter_game_best_turn', bestTurn.toString());
        document.getElementById('best-turn').textContent = bestTurn;
      }
      const achievements = [
        { turn: 40, key: "achievement_40", name: "初心者" },
        { turn: 50, key: "achievement_50", name: "一人前" },
        { turn: 80, key: "achievement_80", name: "プロ" },
        { turn: 100, key: "achievement_100", name: "伝説" }
      ];
      achievements.forEach(a => {
        if (
          turnCount >= a.turn &&
          !localStorage.getItem(a.key)
        ) {
          localStorage.setItem(a.key, "1");
          unlockAchievement(a.name);
        }
      });
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

    // ===============================
    // // タイトル画面
    // // ===============================
  window.addEventListener("load", () => {
    const titleScreen = document.getElementById("title-screen");
    const startButton = document.getElementById("start-button");
    const continueButton =document.getElementById("continue-button");
    const achievementButton = document.getElementById("achievement-button");
    const achievementScreen = document.getElementById("achievement-screen");
    const backButton = document.getElementById("back-button");
    const retryButton =document.getElementById("retry-button");
    const titleButton =document.getElementById("title-button");
    const gameoverScreen =document.getElementById("gameover-screen");
      
    startButton.addEventListener("click", () => {
      titleScreen.classList.add("hide");
      setTimeout(() => {
        titleScreen.style.display = "none";
        initGame();
      }, 450);
    });

    if(localStorage.getItem("hunter_save")){
      continueButton.style.display="block";
    }
    continueButton.addEventListener("click",()=>{
       loadGame();
       titleScreen.style.display="none";
      });

    achievementButton.addEventListener("click", () => {
      loadAchievementStats();
      updateAchievements();
      achievementScreen.classList.add("show");
      titleScreen.style.display = "none";
    });
    
    backButton.addEventListener("click", () => {
      achievementScreen.classList.remove("show");
      titleScreen.style.display = "flex";
    });
    
    retryButton.addEventListener("click",()=>{
      gameoverScreen.classList.remove("show");
      initGame();
    });
    
    titleButton.addEventListener("click", () => {
      gameoverScreen.classList.remove("show");
      titleScreen.classList.remove("hide");
      titleScreen.style.display = "flex";
      document.getElementById("continue-button").style.display =
      localStorage.getItem("hunter_save")
      ? "block"
      : "none";
      });

    titleButton.addEventListener("click", () => {
      gameoverScreen.classList.remove("show");
      titleScreen.classList.remove("hide");
      titleScreen.style.display = "flex";
      document.getElementById("pieces-layer").innerHTML = "";
      document.getElementById("grid").innerHTML = "";
      isGameOver = false;
    });
  });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js");
  });
}