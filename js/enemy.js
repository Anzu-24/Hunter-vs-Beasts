//Enemy//

//駒の動き//
//Snake//
function getSnakeMoves(r, c, currentBoard) {
    const moves = [];
    const dirs = [
        [-1, 0],[1, 0],[0, -1],[0, 1]
    ];
    dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;

        if (!isInBounds(nr, nc)) return;
        const cell = currentBoard[nr][nc];
        if (!cell || cell.typeKey !== "ROCK") {
            moves.push({ r: nr, c: nc });
        }
    });
    return moves;
}

//Fox//
function getFoxMoves(r, c, currentBoard) {
    const moves = [];
    const dirs = [
        [-1, -1], [-1, 1], [1, -1], [1, 1]
    ];
    dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;

        if (!isInBounds(nr, nc)) return;
        const cell = currentBoard[nr][nc];
        if (!cell || cell.typeKey !== "ROCK") {
            moves.push({ r: nr, c: nc });
        }
    });
    return moves;
}

//Horse//
function getHorseMoves(r, c, currentBoard) {
    const moves = [];
    const dirs = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;

        if (!isInBounds(nr, nc)) return;
        const cell = currentBoard[nr][nc];
        if (!cell || cell.typeKey !== "ROCK") {
            moves.push({ r: nr, c: nc });
        }
    });
    return moves;
}

//Elephant//
function getElephantMoves(r, c, currentBoard) {
    const moves = [];
    const dirs = [
        [-2, -2], [-2, 2], [2, -2], [2, 2]
    ];
    dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;

        if (!isInBounds(nr, nc)) return;
        const cell = currentBoard[nr][nc];
        if (!cell || cell.typeKey !== "ROCK") {
            moves.push({ r: nr, c: nc });
        }
    });
    return moves;
}

//Lion//
function getLionMoves(r, c, currentBoard) {
    const moves = [];
    const dirs = [
        [-1, -1], [-1, 0], [-1, 1],[0, -1],[0, 1],[1, -1],[1, 0],[1, 1]
    ];
    dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;

        if (!isInBounds(nr, nc)) return;
        const cell = currentBoard[nr][nc];
        if (!cell || cell.typeKey !== "ROCK") {
            moves.push({ r: nr, c: nc });
        }
    });
    return moves;
}

//Hawk//
function getHawkMoves(r, c, currentBoard) {
    const moves = [];
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
    return moves;
}

//Dragon//
function getDragonMoves(r, c, currentBoard) {
    const moves = [];
    const crossDirs = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];
    crossDirs.forEach(([dr, dc]) => {
        let hasObstacle = false;
        let step = 1;
        while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (!isInBounds(nr, nc)) break;
            const cell = currentBoard[nr][nc];
            if (cell) {
                if (cell.typeKey === "PLAYER") {
                    if (hasObstacle) {
                        moves.push({ r: nr, c: nc });
                    }
                } else {
                    hasObstacle = true;
                }
            } else {
                moves.push({ r: nr, c: nc });
            }
            step++;
        }
    });

    const diagonal1 = [
        [-1,-1],
        [-1, 1],
        [ 1,-1],
        [ 1, 1]
    ];

    diagonal1.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (!isInBounds(nr, nc)) return;

        const cell = currentBoard[nr][nc];

        if (!cell) {
            moves.push({ r: nr, c: nc });
        }


    });
    
    const diagonal2 = [
    { dr:-2, dc:-2, mr:-1, mc:-1 },
    { dr:-2, dc: 2, mr:-1, mc: 1 },
    { dr: 2, dc:-2, mr: 1, mc:-1 },
    { dr: 2, dc: 2, mr: 1, mc: 1 }
];

diagonal2.forEach(({ dr, dc, mr, mc }) => {

    const nr = r + dr;
    const nc = c + dc;
    if (!isInBounds(nr, nc)) return;
    const middle = currentBoard[r + mr][c + mc];
    const target = currentBoard[nr][nc];
    if (!target) {
        moves.push({ r: nr, c: nc });
        return;
    }

    if (
        target.typeKey === "PLAYER" &&
        middle &&
        middle.typeKey !== "PLAYER" &&
        middle.typeKey !== "ROCK"
    ) {
        moves.push({ r: nr, c: nc });
    }
});

    return moves;
}

//AI//

//map//
function cloneBoard(b) {
    return b.map(row => row.map(cell => cell ? { ...cell } : null));
}
//Hunter攻撃判定//
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
//Beast守備判定//
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
//盤面把握//
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
    function hasDiagonalObstacleBetween(r1, c1, r2, c2, currentB) {
        const dr = r2 - r1;
        const dc = c2 - c1;

        // 斜め2マスだけ判定
        if (
             Math.abs(dr) !== 2 ||
             Math.abs(dc) !== 2
            ) return false;

            const mr = r1 + dr / 2;
            const mc = c1 + dc / 2;

            return (
                currentB[mr][mc] &&
                currentB[mr][mc].typeKey !== "ROCK"
            );
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

    const isPieceRushActive = (movedTypeKey === 'HAWK'|| movedTypeKey === "LION"|| movedTypeKey === "DRAGON") 
    ? false : isRushActive;

    if (inHunterLine && !isPieceRushActive) {
        const isProtectedByAlly = isProtectedByAnyAlly(lastMovePos, b);

        if (movedTypeKey === "HAWK" || movedTypeKey === "DRAGON") {

            const hasObstacle =
            hasObstacleBetween(
                lastMovePos.r,
                lastMovePos.c,
                pPos.r,
                pPos.c,
                b
            );

            if (hasObstacle) {
                score += 180;
            } else {
                score -= 350;
            }

            if (movedTypeKey === "DRAGON") {

                const diagonal2 =
                Math.abs(lastMovePos.r - pPos.r) === 2 &&
                Math.abs(lastMovePos.c - pPos.c) === 2;

                if (
                    diagonal2 &&
                    hasDiagonalObstacleBetween(
                        lastMovePos.r,
                        lastMovePos.c,
                        pPos.r,
                        pPos.c,
                        b
                    )
                ) {
                    score += 180;
                }
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
                if (cell.typeKey === "DRAGON") {
                    const inLine =
                    (r === pPos.r || c === pPos.c);

                    const hasCrossObstacle =
                    inLine &&
                    hasObstacleBetween(r, c, pPos.r, pPos.c, b);

                    if (hasCrossObstacle) {
                        score += 100;
                    }

                    const diagonal2 =
                    Math.abs(r - pPos.r) === 2 &&
                    Math.abs(c - pPos.c) === 2;

                    if (
                        diagonal2 &&
                        hasDiagonalObstacleBetween(
                            r,
                            c,
                            pPos.r,
                            pPos.c,
                            b
                        )
                    ) {
                        score += 100;
                    }
                }
                
            }
        }
    }
    return score;
}

//行動判定//
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

//行動実行//
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



//Beast 追加ターン//
function getAvailableAnimalTypes() {
  if (turnCount < 15) return ['SNAKE', 'FOX'];
  if (turnCount < 30) return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT'];
  if (turnCount < 50) return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT', 'HAWK'];
  if (turnCount < 100) return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT', 'HAWK','LION'];
  return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT', 'HAWK', 'LION','DRAGON'];
}

//Beast Count//
function getPieceCount(typeKey) {
    return Object.values(piecesMap)
        .filter(piece => piece.typeKey === typeKey)
        .length;
}
//上限//
const MAX_PIECE_COUNT = {
    SNAKE: 6,
    FOX: 6,
    HORSE: 4,
    ELEPHANT: 4,
    HAWK: 3,
    LION: 2,
    DRAGON: 1
};

//駒生成の種類//
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

    for (let i = 0; i < count && validCells.length > 0; i++) {        
        const filteredTypes = types.filter(type => {
            switch (type) {
                case "FOX":return getPieceCount("FOX") < MAX_PIECE_COUNT.FOX;
                case "HORSE":return getPieceCount("HORSE") < MAX_PIECE_COUNT.HORSE;
                case "ELEPHANT":return getPieceCount("ELEPHANT") < MAX_PIECE_COUNT.ELEPHANT;
                case "HAWK":return getPieceCount("HAWK") < MAX_PIECE_COUNT.HAWK;
                case "LION":return getPieceCount("LION") < MAX_PIECE_COUNT.LION;
                case "DRAGON":return getPieceCount("DRAGON") < MAX_PIECE_COUNT.DRAGON;
                default:
                    return true;
                }
        });
        if (filteredTypes.length === 0) break;
        const randIndex = Math.floor(Math.random() * validCells.length);
        const cell = validCells.splice(randIndex, 1)[0];
        const typeKey =
        filteredTypes[Math.floor(Math.random() * filteredTypes.length)];
        const AURA_SPAWN_RATE = {
            FOX: 0.05,
            DRAGON: 0.25,
        };
        let isAura = false;
        if (
            AURA_SPAWN_RATE[typeKey] &&
            (turnCount - lastAuraSpawnTurn >= 20) &&
            Math.random() < AURA_SPAWN_RATE[typeKey]
        ) {
            isAura = true;
            lastAuraSpawnTurn = turnCount;
        }
        createPiece(typeKey, cell.r, cell.c, isAura);
    }
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

function isInBounds(r, c) {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

//駒の追加速度//
function setNextSpawnTurn() {
    let min = 2;
    if (turnCount > 20) {
        min = 4;
    } else if (turnCount > 5) {
        min = 3;
    }
    nextSpawnTurn = turnCount + getRandomInt(min, min + 1);
}

//駒生成間隔の短縮//
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
        spawnAnimals(availableTypes, 2);
        return;
    }

    if (animalCount === 1) {
        spawnAnimals(availableTypes, 3);
        return;
    }

    if (animalCount === 0 || turnCount >= nextSpawnTurn) {
        let spawnCount = 4;

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
