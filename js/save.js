//Save game//

//Kill Count//
function addKillCount(count){
    const totalKills =
    parseInt(localStorage.getItem("hunter_total_kills") || "0");
    localStorage.setItem(
        "hunter_total_kills",
        (totalKills + count).toString()
    );
}

//Mode//
function getScoreKeys() {
    const prefix =
        gameMode === "rock"
        ? "hunter_rock"
        : "hunter_game";

    return {
        best: `${prefix}_best_turn`,
        today: `${prefix}_today_best`,
        date: `${prefix}_today_date`
    };
}

//Best Score(記録保存用)//
function updateBestScores(turnCount) {
    const keys = getScoreKeys();
    const todayStr = new Date().toISOString().split("T")[0];

    // 今日のベスト
    if (turnCount > todayBest) {
        todayBest = turnCount;
        localStorage.setItem(
            keys.today,
            todayBest.toString()
        );

        localStorage.setItem(
            keys.date,
            todayStr
        );

    }

    // 総合ベスト
    if (turnCount > bestTurn) {
        bestTurn = turnCount;
        localStorage.setItem(
            keys.best,
            bestTurn.toString()
        );

    }
    refreshBestScoreDisplay();
}

//Best Score更新//
function refreshBestScoreDisplay() {
    const todayBestEl = document.getElementById("today-best");
    if (todayBestEl) {
        todayBestEl.textContent = todayBest;
    }

    const bestTurnEl = document.getElementById("best-turn");
    if (bestTurnEl) {
        bestTurnEl.textContent = bestTurn;
    }
}


//Save Game(途中セーブ)//
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

        nextPieceId,
        gameMode
    };
    localStorage.setItem(
        "hunter_save",
        JSON.stringify(saveData)
    );
}

//Load Game//
function loadGame() {
    const data = localStorage.getItem("hunter_save");
    if (!data) return false;

    const save = JSON.parse(data);
    gameMode = save.gameMode || "normal";
    resetBoard();

    isGameOver = false;
    isAnimating = false;
    isPlayerSelected = false;
    inspectedEnemyPos = null;
    const modeSelect =
        document.getElementById("mode-select");
    if (modeSelect) {
        modeSelect.value = gameMode;
    }

    nextPieceId = save.nextPieceId;
    turnCount = save.turnCount;
    nextSpawnTurn = save.nextSpawnTurn;
    noKillTurns = save.noKillTurns;
    hasFireAura = save.hasFireAura;
    lastAuraSpawnTurn = save.lastAuraSpawnTurn;

    loadBestScores();

    playerPos = save.playerPos;
    playerPieceId = save.playerPieceId;

    save.pieces.forEach(p => {
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