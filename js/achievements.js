//Achievements//

//Achievement name//
const ACHIEVEMENTS = [

    {
        turn: 40,
        id: "ach-40",
        key: "achievement_40",
        name: "初心者",
        description: "40 Turns"
    },

    {
        turn: 50,
        id: "ach-50",
        key: "achievement_50",
        name: "一人前",
        description: "50 Turns"
    },

    {
        turn: 80,
        id: "ach-80",
        key: "achievement_80",
        name: "プロ",
        description: "80 Turns"
    },

    {
        turn: 100,
        id: "ach-100",
        key: "achievement_100",
        name: "伝説",
        description: "100 Turns"
    },

    {
        turn: 150,
        id: "ach-150",
        key: "achievement_150",
        name: "狩人王",
        description: "150 Turns"
    },

    {
        turn: 200,
        id: "ach-200",
        key: "achievement_200",
        name: "神",
        description: "200 Turns"
    },
    {
        turn: 300,
        id: "ach-300",
        key: "achievement_300",
        name: "Beast Hunter",
        description: "300 Turns"
    }
];

function checkAchievements(turnCount) {
    ACHIEVEMENTS.forEach(a => {
        if (
            turnCount >= a.turn &&
            !localStorage.getItem(a.key)
        ) {
            localStorage.setItem(a.key, "1");
            unlockAchievement(a.name);
        }

    });
}

function updateAchievements() {
    ACHIEVEMENTS.forEach(a => {
        const el = document.getElementById(a.id);
        if (!el) return;
        const unlocked = localStorage.getItem(a.key);
        el.textContent = unlocked ? "☑" : "☐";
        el.style.color = unlocked
            ? "#fbbf24"
            : "#9ca3af";
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

function loadAchievementStats(){
    const totalKills =parseInt(localStorage.getItem("hunter_total_kills") || "0");
    const bestTurn =parseInt(localStorage.getItem("hunter_game_best_turn") || "0");
    const rockbestTurn =parseInt(localStorage.getItem("hunter_rock_best_turn") || "0");
    document.getElementById("total-kills").textContent = totalKills;
    document.getElementById("best-survival").textContent =bestTurn;
    document.getElementById("rock-best-survival").textContent =rockbestTurn;
}