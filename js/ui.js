//UI/Screens//
const UI = {
    title: {},
    gameover: {},
    achievement: {}
};

function initializeUI() {
    //Title//
    UI.title.screen =document.getElementById("title-screen");
    UI.title.start =document.getElementById("start-button");
    UI.title.continue =document.getElementById("continue-button");
    UI.title.achievement =document.getElementById("achievement-button");
    UI.title.mode = document.getElementById("mode-select");
    UI.title.export = document.getElementById("export-button");
    UI.title.import = document.getElementById("import-button");
    UI.title.importFile = document.getElementById("import-file");

    //Achievement//
    UI.achievement.screen =document.getElementById("achievement-screen");
    UI.achievement.back =document.getElementById("back-button");

    // Game Over//
    UI.gameover.screen =document.getElementById("gameover-screen");
    UI.gameover.retry =document.getElementById("retry-button");
    UI.gameover.title =document.getElementById("title-button");

    setupUIEvents();
    gameMode = UI.title.mode.value;
    loadBestScores();

}

//Screen Control//
function showTitleScreen() {
    UI.gameover.screen.classList.remove("show");
    UI.achievement.screen.classList.remove("show");
    UI.title.screen.classList.remove("hide");
    UI.title.screen.style.display = "flex";
    UI.title.continue.style.display =
    localStorage.getItem("hunter_save")
    ? "block"
    : "none";

}
function hideTitleScreen() {
    UI.title.screen.classList.add("hide");
    setTimeout(() => {
        UI.title.screen.style.display = "none";
    }, 450);
}
function showAchievementScreen() {
    loadAchievementStats();
    updateAchievements();
    UI.title.screen.style.display = "none";
    UI.achievement.screen.classList.add("show");
}
function hideAchievementScreen() {
    UI.achievement.screen.classList.remove("show");
    UI.title.screen.style.display = "flex";
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
    if (localStorage.getItem("hunter_save")) {
        UI.title.continue.style.display = "block";
    }
    UI.title.continue.addEventListener("click", () => {
        hideTitleScreen();
        loadGame();
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
        UI.gameover.screen.classList.remove("show");
        initGame();
    });

    // Title//
    UI.gameover.title.addEventListener("click",()=>{
        document.getElementById("pieces-layer").innerHTML = "";
        document.getElementById("grid").innerHTML = "";
        isGameOver = false;
        showTitleScreen();
    });

    // Export
    UI.title.export.addEventListener("click", () => {
        exportGameData();
    });
    // Import
    UI.title.import.addEventListener("click", () => {
        UI.title.importFile.click();
    });

    UI.title.importFile.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            importGameData(e.target.files[0]);
        }
    });
}

window.addEventListener("load", initializeUI);
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

