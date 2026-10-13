//Effects//


function createEffect(imagePath, className, r, c, width, height) {
    const board = document.getElementById("board-container");
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
//爆発//
function playExplosionAtCell(r, c) {
    const effect =
        createEffect(
            "assets/effects/explosion.png",
            "explosion",
            r,
            c,
            1.2,
            1.2
        );
    if (!effect) return;
    const img = effect.img;
    img.style.transform =
        "translate(-50%,-50%) scale(.6)";
    img.style.opacity = "0";

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
    setTimeout(() => img.remove(),200);
}

//炎//
function playFlameSweepCell(
    r,
    c,
    direction,
    delay = 0
){
    setTimeout(()=>{
        const effect =
            createEffect(
                "assets/effects/flame-sweep.png",
                "flame",
                r,
                c,
                1,
                1
            );
        if(!effect) return;
        const img = effect.img;
        const rotations = {
            right:0,
            down:90,
            left:180,
            up:-90
        };
        img.style.transform =
            `translate(-50%,-50%) rotate(${rotations[direction] ?? 0}deg)`;
        requestAnimationFrame(()=>{
            img.style.opacity = "1";
        });
        setTimeout(()=>{
            img.remove();
        },300);
    },delay);
}
