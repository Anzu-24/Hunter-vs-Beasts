//Effects//

//位置調整//
function createEffect(imagePath, className, r, c, width, height) {
    const board = document.querySelector(".board-container");
    if (!board) return null;

    const rect = board.getBoundingClientRect();
    const size = rect.width / BOARD_SIZE;

    const img = document.createElement("img");

    img.src = imagePath;
    img.className = `effect ${className}`;

    img.style.position = "absolute";
    img.style.pointerEvents = "none";

    img.style.width = (width * size) + "px";
    img.style.height = (height * size) + "px";

    img.style.left = (c * size + size / 2) + "px";
    img.style.top  = (r * size + size / 2) + "px";

    board.appendChild(img);

    return { img, size };
}

//アニメーション間隔//
function wait(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

//行動アニメーション//
async function moveEnemyPiece(enemyPiece, bestMove) {

    board[enemyPiece.r][enemyPiece.c] = null;

    enemyPiece.r = bestMove.to.r;
    enemyPiece.c = bestMove.to.c;

    board[enemyPiece.r][enemyPiece.c] = {
        id: enemyPiece.id,
        typeKey: enemyPiece.typeKey,
        isAura: enemyPiece.isAura
    };

    const newCell =
        cellElements[enemyPiece.r * BOARD_SIZE + enemyPiece.c];

    await playMoveAnimation(enemyPiece, () => {
        newCell.appendChild(enemyPiece.element);
    });
}

//爆発//
async function playExplosionAtCell(r, c) {
    const effect = createEffect(
        "assets/effects/explosion.png",
        "explosion",
        r,
        c,
        1.2,
        1.2
    );
    if (!effect) return;
    const img = effect.img;

    img.style.transform = "translate(-50%,-50%) scale(.6)";
    img.style.opacity = "0";
    requestAnimationFrame(() => {
        img.style.transition =
            "transform .16s ease-out, opacity .16s ease-out";

        img.style.transform =
            "translate(-50%,-50%) scale(1.15)";
        img.style.opacity = "1";
    });
    await wait(120);

    img.style.opacity = "0";
    img.style.transform =
        "translate(-50%,-50%) scale(.9)";
    await wait(80);
    img.remove();
}

//炎//
async function playFlameSweepCell(r,c,direction,delay = 0){
    await wait(delay);
    const effect = createEffect(
        "assets/effects/flame-sweep.png",
        "flame",
        r,
        c,
        1,
        1
    );
    if (!effect) return;
    const img = effect.img;
    const rotations = {
        right: 0,
        down: 90,
        left: 180,
        up: -90
    };
    img.style.transform =
    `translate(-50%,-50%) rotate(${rotations[direction] ?? 0}deg)`;
    requestAnimationFrame(() => {
        img.style.opacity = "1";
    });

    await wait(300);
    img.remove();
}

//十時爆発//
async function playCrossBlastAnimation(r, c) {

    const blastCells = [{ r, c }];

    const dirs = [
        { dr: -1, dc: 0, direction: "up" },
        { dr: 1, dc: 0, direction: "down" },
        { dr: 0, dc: -1, direction: "left" },
        { dr: 0, dc: 1, direction: "right" }
    ];

    playExplosionAtCell(r, c);
    dirs.forEach(({ dr, dc, direction }) => {

        let step = 1;
        while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (!isInBounds(nr, nc))
                break;
            blastCells.push({ r: nr, c: nc });

            playFlameSweepCell(
                nr,
                nc,
                direction,
                step * 30
            );
            step++;
        }

    });

    let destroyedCount = 0;

    const gridEl =
        document.querySelector(".grid");

    blastCells.forEach(cell => {

        const index =
            cell.r * BOARD_SIZE + cell.c;

        const cellEl =
            gridEl.children[index];

        cellEl?.classList.add("fire-blast");

        const occupant =
            board[cell.r][cell.c];
        if (
            occupant &&
            occupant.typeKey !== "PLAYER" &&
            occupant.typeKey !== "ROCK"
        ) {
            removePiece(occupant.id);
            destroyedCount++;
        }
    });
    await wait(400);
    blastCells.forEach(cell => {
        const index =
            cell.r * BOARD_SIZE + cell.c;

        const cellEl =
            gridEl.children[index];

        cellEl?.classList.remove("fire-blast");
    });

    if (destroyedCount > 0) {
        addKillCount(destroyedCount);
    }
    return destroyedCount;
}

//生成アニメーション//
async function playSpawnAnimation(piece){
    const img =
    piece.element.querySelector(".piece-image");
    if(!img) return;
    img.animate(
        [
            {
                transform:"translateY(24px) scale(.3)",
                opacity:0,
                filter:"brightness(0) blur(2px)"
            },
            {
                transform:"translateY(10px) scale(.8)",
                opacity:.8,
                filter:"brightness(.5) blur(1px)"
            },
            {
                transform:"translateY(0) scale(1)",
                opacity:1,
                filter:"brightness(1) blur(0)"
            }
        ],
        {
            duration:450,
            easing:"cubic-bezier(.18,.8,.22,1)"
        }
    );
    if(piece.isAura){
        playAuraSpawnAnimation(piece);
    }
    await wait(450);
}

//オーラアニメーション//
function playAuraSpawnAnimation(piece){
    const aura =
    piece.element.querySelector(".aura-image");
    if(!aura) return;
    aura.animate(
        [
            {
                transform:"translateY(18px) scale(.2)",
                opacity:0
            },
            {
                transform:"translateY(12px) scale(.6)",
                opacity:0
            },
            {
                transform:"translateY(0) scale(1)",
                opacity:1
            }
        ],
        {
            duration:450,
            delay:180,
            easing:"ease-out",
            fill:"backwards"
        }
    );
}

// FLIP移動アニメーション
async function playMoveAnimation(piece, moveCallback) {

    const first = piece.element.getBoundingClientRect();
    moveCallback();
    const last = piece.element.getBoundingClientRect();

    const dx = first.left - last.left;
    const dy = first.top - last.top;

    piece.element.style.transition = "none";
    piece.element.style.transform =
        `translate(${dx}px, ${dy}px)`;

    piece.element.offsetWidth;
    piece.element.style.transition =
        "transform .35s cubic-bezier(.22,.8,.25,1)";

    piece.element.style.transform = "translate(0,0)";

    await wait(350);

    piece.element.style.transition = "";
    piece.element.style.transform = "";
}
