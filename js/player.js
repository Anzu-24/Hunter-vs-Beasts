//Player//
//駒の動き//
function getPlayerMoves(r, c, currentBoard) {
    const moves = [];
    const dirs = [
        [-1, 0],[1, 0],[0, -1],[0, 1]
    ];
    dirs.forEach(([dr, dc]) => {
        let step = 1;

        while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (!isInBounds(nr, nc)) break;
            const cell = currentBoard[nr][nc];
            if (cell && cell.typeKey === "ROCK") break;
            moves.push({ r: nr, c: nc });
            if (cell) break;
            step++;
        }
    });
    return moves;
}

//Player turn 処理//
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
            log("次の一手で十字に爆発");
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

//炎生成//
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
