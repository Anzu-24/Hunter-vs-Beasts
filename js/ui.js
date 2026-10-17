//UI/Screens//
const UI = {
    title: {},
    gameover: {},
    achievement: {}
};

function initializeUI() {
    //Title//
    UI.title.screen = document.querySelector(".title-screen");
    UI.title.start = document.querySelector(".start-button");
    UI.title.continue = document.querySelector(".continue-button");
    UI.title.menu =document.querySelector(".menu-open-button");
    UI.title.achievement = document.querySelector(".achievement-button");
    UI.title.mode = document.querySelector(".mode-select");
  
    //menu//
    UI.menu = {};
    UI.menu.screen =document.querySelector(".menu-screen");
    UI.menu.export =document.querySelector(".menu-screen .export-button");
    UI.menu.import =document.querySelector(".menu-screen .import-button");
    UI.menu.importFile =document.querySelector(".menu-screen .import-file");
    UI.menu.back = UI.menu.screen.querySelector(".back-button");

    //reset//
    UI.reset =document.querySelector(".reset-button");
    UI.nextSpawn =document.querySelector(".next-spawn-count");

    //Reset//
    UI.confirm = {};
    UI.confirm.screen =document.querySelector(".confirm-screen");
    UI.confirm.yes =document.querySelector(".confirm-yes");
    UI.confirm.no =document.querySelector(".confirm-no");

    // Achievement
    UI.achievement.screen = document.querySelector(".achievement-screen");
    UI.achievement.back =UI.achievement.screen.querySelector(".back-button");

    // Game Over
    UI.gameover.screen = document.querySelector(".gameover-screen");
    UI.gameover.retry = document.querySelector(".retry-button");
    UI.gameover.title = document.querySelector(".title-button");

    setupUIEvents();
    gameMode = UI.title.mode.value;
    loadBestScores();
    document.querySelector(".game-author").textContent =
    GAME.AUTHOR;

    document.querySelector(".game-version").textContent =
    GAME.VERSION;

}

//Screen Control//
function showTitleScreen() {
    UI.gameover.screen.classList.add("hidden");
    UI.achievement.screen.classList.add("hidden");
    UI.title.screen.classList.remove("hidden");
    UI.title.screen.classList.remove("hide");
    UI.title.continue.classList.toggle(
        "hidden",
        !localStorage.getItem("hunter_save")
    );
}

function hideTitleScreen() {
    UI.title.screen.classList.add("hide");
    setTimeout(() => {
        UI.title.screen.classList.add("hidden");
    }, UI_ANIMATION_TIME);
}

function showAchievementScreen() {
    loadAchievementStats();
    updateAchievements();
    UI.title.screen.classList.add("hidden");
    UI.achievement.screen.classList.remove("hidden");
    UI.achievement.screen.classList.add("show");
}

function hideAchievementScreen() {
    UI.achievement.screen.classList.remove("show");
    UI.achievement.screen.classList.add("hidden");
    UI.title.screen.classList.remove("hidden");
}

function showMenuScreen(){
    UI.title.screen.classList.add("hidden");
    UI.menu.screen.classList.remove("hidden");
}

function hideMenuScreen(){
    UI.menu.screen.classList.add("hidden");
    UI.title.screen.classList.remove("hidden");
}


let confirmCallback = null;
function showConfirm(callback){
    confirmCallback = callback;
    UI.confirm.screen.classList.remove("hidden");
}

function hideConfirm(){
    UI.confirm.screen.classList.add("hidden");
}

//Set up//
function setupUIEvents() {
    //Start//
    UI.title.start.addEventListener("click", () => {
        hideTitleScreen();
        setTimeout(() => {
            initGame();
        }, 450);
    });

    //Mode Change//
    UI.title.mode.addEventListener("change", () => {
        gameMode = UI.title.mode.value;
        loadBestScores();
    });

    //Continue//
    UI.title.continue.classList.toggle(
        "hidden",
        !localStorage.getItem("hunter_save")
    );
    // Continue
    UI.title.continue.addEventListener("click", () => {
        hideTitleScreen();
        setTimeout(() => {
            loadGame();
        }, 450);
    });

    // Achievement//
    UI.title.achievement.addEventListener("click", () => {
        showAchievementScreen();
    });

    //Back//
    UI.achievement.back.addEventListener("click", () => {
        hideAchievementScreen();
    });

    // Retry//
    UI.gameover.retry.addEventListener("click", () => {
        UI.gameover.screen.classList.add("hidden");
        if(localStorage.getItem("hunter_save")){
            showConfirm(()=>{
                localStorage.removeItem("hunter_save");
                initGame();
            });
        }else{
            initGame();
        }
    });

    //Reset//
    UI.reset.addEventListener("click", () => {
        if (localStorage.getItem("hunter_save")) {
            showConfirm(() => {
                localStorage.removeItem("hunter_save");
                initGame();
            });
        } else {
            initGame();
        }
    });
    //confirm//
    UI.confirm.yes.addEventListener("click",()=>{
        hideConfirm();
        confirmCallback?.();
    });

    UI.confirm.no.addEventListener("click",()=>{
        hideConfirm();
    });

    //Change//
    UI.title.mode.addEventListener("change",()=>{
        if(localStorage.getItem("hunter_save")){
            showConfirm(()=>{
                localStorage.removeItem("hunter_save");
                gameMode = UI.title.mode.value;
                initGame();
            });
        }else{
            gameMode = UI.title.mode.value;
            initGame();
        }
    });

    // Title//
    UI.gameover.title.addEventListener("click", () => {
        document.querySelector(".grid").innerHTML = "";
        isGameOver = false;
        showTitleScreen();
    });

    //menu//
    UI.title.menu.addEventListener("click", () => {
        showMenuScreen();
    });

    //menu.back//
    UI.menu.back.addEventListener("click", () => {
        hideMenuScreen();
    });


    // Export
    UI.menu.export.addEventListener("click", () => {
        exportGameData();
    });

    // Import
    UI.menu.import.addEventListener("click", () => {
        UI.menu.importFile.click();
    });

    UI.menu.importFile.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            importGameData(e.target.files[0]);
        }
    });
}

async function preloadImages() {
    const imageList = [
        // Pieces
        "assets/pieces/hunter.png",
        "assets/pieces/snake.png",
        "assets/pieces/fox.png",
        "assets/pieces/horse.png",
        "assets/pieces/elephant.png",
        "assets/pieces/hawk.png",
        "assets/pieces/lion.png",
        "assets/pieces/rock.png",
        "assets/pieces/dragon.png",

        // UI
        "assets/ui/title.png",
        "assets/ui/achievement.png",
        "assets/ui/gameover.png",

        // Effects
        "assets/effects/aura.png",
        "assets/effects/explosion.png",
        "assets/effects/flame-sweep.png"
    ];
    await Promise.all(
        imageList.map(src => {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = resolve;

                img.src = src;

                imageCache[src] = img;

            });

        })
    );
}


window.addEventListener("load", async () => {
    await preloadImages();
    initializeUI();
});

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

