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
//間に障害物//
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

//障害物ドラゴン//
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

//遠近判定//
function evaluateMobility(b, pPos){
    const pMoves =
        getValidMoves(
            pPos.r,
            pPos.c,
            "PLAYER",
            b
        );
    return 30 - pMoves.length * 5;
}

//防御判定//
function evaluateProtection(
    b,
    pPos,
    lastMovePos,
    initialBoard,
    originPos,
    isRushActive
){
    let score = 0;
    if (initialBoard && originPos && !isRushActive) {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const initCell = initialBoard[r][c];
                if (initCell && initCell.typeKey !== 'PLAYER' && initCell.typeKey !== 'ROCK' && initCell.typeKey !== 'HAWK') {
                    const isExposed = isPositionExposedToHunter({ r, c }, pPos, initialBoard);
                    const isProtected = isProtectedByAnyAlly({ r, c }, initialBoard);
                    
                    if (isExposed && !isProtected) {

                        if (originPos.r === r && originPos.c === c) {

                            const nowExposed =
                            isPositionExposedToHunter(
                                lastMovePos,
                                pPos,
                                b
                            );

                            if (!nowExposed) {
                                score += 350;
                            }

                        } else {

                            const nowProtected =
                            isProtectedByAnyAlly(
                                { r, c },
                                b
                            );

                            if (nowProtected) {
                                score += 300;
                            }
                        }
                    }
                }
            }
        }
    }
    return score;
}

//特性//
function evaluatePieceTraits(
    cell,
    r,
    c,
    pPos,
    b,
    dist
){
    let score = 0;
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
    return score;
}

//接近//
function evaluatePressure(
    cell,
    dist,
    isRushActive
){
    if(
        isRushActive &&
        cell.typeKey!="HAWK"
    ){
        return -dist*40;
    }
    return -dist*10;
}

//隊列//
function evaluateFormation(b,r,c){
    let score=0;
    score += evaluateCrowding(b,r,c);
    score += evaluateMixedGroup(b,r,c);
    score += evaluateLinePenalty(b,r,c);
    score += evaluateTriangle(b,r,c);
    score += evaluateSquad(b,r,c);
    return score;
}

//隊列密集//
function evaluateCrowding(b,r,c){
    let score = 0;
    let nearbyEnemy = 0;
    for (let rr = 0; rr < BOARD_SIZE; rr++) {
        for (let cc = 0; cc < BOARD_SIZE; cc++) {
            if (rr === r && cc === c) continue;
            const other = b[rr][cc];
            if (
                other &&
                other.typeKey !== "PLAYER" &&
                other.typeKey !== "ROCK"
            ) {
                const d = Math.hypot(rr - r, cc - c);
                if (d <= 1.5) nearbyEnemy++;
            }
        }
    }
    score -= Math.max(0, nearbyEnemy - 2) * 15;
    return score;
}

//隊列異種ボーナス//
function evaluateMixedGroup(b, r, c) {
    let score = 0;
    const self = b[r][c];
    if (!self) return 0;
    for (let rr = Math.max(0, r - 2); rr <= Math.min(BOARD_SIZE - 1, r + 2); rr++) {
        for (let cc = Math.max(0, c - 2); cc <= Math.min(BOARD_SIZE - 1, c + 2); cc++) {
            if (rr === r && cc === c) continue;
            const other = b[rr][cc];

            if (
                !other ||
                other.typeKey === "PLAYER" ||
                other.typeKey === "ROCK"
            ) continue;
            const d = Math.hypot(rr - r, cc - c);
            if (d > 2.2) continue;
            if (other.typeKey === self.typeKey) {
                score -= 8;
            } else {
                score += 15;
            }
        }
    }
    return score;
}

//一直線ペナルティ//
function evaluateLinePenalty(b, r, c) {
    const self = b[r][c];
    if (!self) return 0;
    let score = 0;
    const dirs = [
        [1, 0],
        [0, 1]
    ];

    for (const [dr, dc] of dirs) {
        let count = 1;

        // 前方向
        let nr = r + dr;
        let nc = c + dc;

        while (
            isInBounds(nr, nc) &&
            b[nr][nc] &&
            b[nr][nc].typeKey === self.typeKey
        ) {
            count++;
            nr += dr;
            nc += dc;
        }
        // 後方向
        nr = r - dr;
        nc = c - dc;

        while (
            isInBounds(nr, nc) &&
            b[nr][nc] &&
            b[nr][nc].typeKey === self.typeKey
        ) {
            count++;
            nr -= dr;
            nc -= dc;
        }

        if (count >= 4) {
            score -= 120;
        }
        else if (count >= 3) {
            score -= 40;
        }
    }
    return score;
}

//隊列陣形//
function evaluateTriangle(b,r,c){
    let score = 0;
    const me = b[r][c];
    if(!me) return 0;
    let allies = 0;
    let different = 0;
    for(let rr=r-2; rr<=r+2; rr++){
        for(let cc=c-2; cc<=c+2; cc++){

            if(!isInBounds(rr,cc)) continue;
            if(rr===r && cc===c) continue;

            const other = b[rr][cc];
            if(!other) continue;
            if(other.typeKey==="PLAYER"||other.typeKey==="ROCK") continue;

            if(Math.hypot(rr-r,cc-c)<=2){
                allies++;

                if(other.typeKey!==me.typeKey){
                    different++;
                }
            }
        }
    }
    if(allies>=2) score+=20;
    score+=different*10;
    return score;
}

//隊列の距離//
function evaluateSquad(b,r,c){
    let score = 0;
    let nearby = 0;
    for(let rr=0; rr<BOARD_SIZE; rr++){
        for(let cc=0; cc<BOARD_SIZE; cc++){

            if(rr===r && cc===c) continue;

            const other=b[rr][cc];

            if(!other) continue;
            if(other.typeKey==="PLAYER") continue;
            if(other.typeKey==="ROCK") continue;

            const d=Math.hypot(rr-r,cc-c);

            if(d<=3){
                nearby++;
            }
        }
    }
    if(nearby>=2 && nearby<=4){
        score+=30;
    }
    if(nearby>=6){
        score-=40;
    }
    return score;
}

//盤面把握//
function evaluateBoardForEnemies(b, pPos, lastMovePos, movedTypeKey, initialBoard = null, originPos = null) {
    let score = 0;
    score += evaluateMobility(b, pPos);

    const inHunterLine = (lastMovePos.r === pPos.r || lastMovePos.c === pPos.c);
    const isRushActive = (noKillTurns >= 5);

    
    score += evaluateProtection(
        b,
        pPos,
        lastMovePos,
        initialBoard,
        originPos,
        isRushActive
    );
    
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
                score -= 350;
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
                score += evaluatePressure(
                    cell,
                    dist,
                    isRushActive
                );
                score += evaluateFormation(
                    b,
                    r,
                    c
                );
                score += evaluatePieceTraits(
                    cell,
                    r,
                    c,
                    pPos,
                    b,
                    dist
                );
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
async function executeEnemyAITurn() {
    if (isGameOver) return;
    const bestMove = getBestMoveMinimax3(board, playerPos);
    if (!bestMove) {
        return false;
    }
    const enemyPiece = piecesMap[bestMove.fromPieceId];

    const isCapturePlayer =
        bestMove.to.r === playerPos.r &&
        bestMove.to.c === playerPos.c;

    if (isCapturePlayer) {
        removePiece(playerPieceId);
    }
    await moveEnemyPiece(enemyPiece, bestMove);

    if (isCapturePlayer) {
        triggerGameOver(enemyPiece.typeKey);
    }
    return true;
}

//Beast 追加ターン//
function getAvailableAnimalTypes() {
    if (turnCount < 20) return ['SNAKE', 'FOX'];
    if (turnCount < 40) return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT'];
    if (turnCount < 75) return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT', 'HAWK'];
    if (turnCount < 120) return ['SNAKE', 'FOX', 'HORSE', 'ELEPHANT', 'HAWK','LION'];
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
    SNAKE: 7,
    FOX: 7,
    HORSE: 4,
    ELEPHANT: 4,
    HAWK: 3,
    LION: 2,
    DRAGON: 1
};

//Dragonスポーン場所//
function getBestDragonSpawnCell(cells){
    let bestCell = cells[0];
    let bestScore = -Infinity;
    for(const cell of cells){
        let score = Math.random() * 5;
        let nearestEnemy = 999;
        let nearbyEnemy = 0;
        for(let r = 0; r < BOARD_SIZE; r++){
            for(let c = 0; c < BOARD_SIZE; c++){
                const p = board[r][c];
                if(
                    !p ||
                    p.typeKey === "PLAYER" ||
                    p.typeKey === "ROCK"
                ) continue;
                const d = Math.hypot(
                    cell.r - r,
                    cell.c - c
                );
                nearestEnemy = Math.min(nearestEnemy, d);
                if(d <= 1.5){
                    nearbyEnemy++;
                }
            }
        }

        score += Math.max(0, 5 - nearestEnemy) * 30;
        score -= Math.max(0, nearbyEnemy - 1) * 40;
        if(score > bestScore){
            bestScore = score;
            bestCell = cell;
        }
    }
    return bestCell;
}

//駒生成の種類//
function spawnAnimals(types, count) {
    const forceAuraFox = reserveAuraFox;
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
        if (
            forceAuraFox &&
            getPieceCount("FOX") < MAX_PIECE_COUNT.FOX &&
            !filteredTypes.includes("FOX")
        ) {
            filteredTypes.push("FOX");
        }
        let typeKey;
        if (forceAuraFox && filteredTypes.includes("FOX")) {
            typeKey = "FOX";
        } else {
            typeKey =
            filteredTypes[Math.floor(Math.random() * filteredTypes.length)];
        }
        let cell;
        if (typeKey === "DRAGON") {
            cell = getBestDragonSpawnCell(validCells);
            validCells.splice(
                validCells.indexOf(cell),
                1
            );

        } else {
            const randIndex =
            Math.floor(Math.random() * validCells.length);
            cell = validCells.splice(randIndex, 1)[0];
        }

        const AURA_SPAWN_RATE = {
            FOX: 0.05,
            DRAGON: 0.25,
        };

        let isAura = false;
        if (forceAuraFox && typeKey === "FOX") {
            isAura = true;
            lastAuraSpawnTurn = turnCount;
            reserveAuraFox = false;
        } else if (
            AURA_SPAWN_RATE[typeKey] &&
            (turnCount - lastAuraSpawnTurn >= 15) &&
            Math.random() < AURA_SPAWN_RATE[typeKey]
        ) {

            isAura = true;
            lastAuraSpawnTurn = turnCount;

        }
        createPiece(typeKey, cell.r, cell.c, isAura);
    }
}

//駒を取ったとき//
async function processKillStatusAndAI(killedEnemy) {
    if (killedEnemy) {
        noKillTurns = 0;
    } else {
        noKillTurns++;
    }

    turnCount++;
    updateTurnDisplay();
    updateNextSpawnUI();

    if (
        !reserveAuraFox &&
        turnCount >= 50 &&
        turnCount - Math.max(lastAuraSpawnTurn, 0) >= 50
    ) {
        reserveAuraFox = true;
    }
    
    await executeEnemyAITurn();

    if (!isGameOver) {
        checkSpawns();
        saveGame();
        isAnimating = false;
    }
}

//駒の追加速度//
function setNextSpawnTurn() {
    let min = 2;
    if (turnCount >= 80) {
        min = 4;
    }
    else if (turnCount >= 5) {
        min = 3;
    }
    nextSpawnTurn =turnCount + getRandomInt(min, min + 1);
    updateNextSpawnUI();
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

        } else if (turnCount <= 15) {
            spawnCount = getRandomInt(2, 3);

        } else {
            if (animalCount <= 4) {
                spawnCount = 3;

            } else if (
                (turnCount >= 200 && animalCount <= 9) ||
                (turnCount < 200 && animalCount <= 8)
            ) {
                spawnCount = 2;

            } else {
                spawnCount = 1;
            }
        }
        spawnAnimals(availableTypes, spawnCount);
        setNextSpawnTurn();
    }
}
