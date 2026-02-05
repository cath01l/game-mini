const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const teamSelect = document.getElementById("team-select");
const gameContainer = document.getElementById("game-container");
const dialogueBox = document.getElementById("dialogue-box");
const dialogueText = document.getElementById("dialogue-text");
const photoOverlay = document.getElementById("photo-overlay");
const memoryPhoto = document.getElementById("memory-photo");
const proposalScreen = document.getElementById("proposal-screen");
const sectorHUD = document.getElementById("sector");
const timerHUD = document.getElementById("timer");

// Game State
let keys = {};
let frozen = false;
let stage = 0;
let startTime = null;
let gameLoopId;

const car = {
    x: 50,
    y: 220, // Center of lane
    velocity: 0,
    maxSpeed: 5,
    accel: 0.2,
    friction: 0.05,
    emoji: "🏎️"
};

// ITEMS (Positions and Stories)
const items = [
    {
        x: 250, y: 220, emoji: "🍮",
        message: "Sector 1: Jellyace.\nLike this sweet treat, you bring comfort to my chaotic days.",
        photo: null // No photo for first item
    },
    {
        x: 500, y: 100, emoji: "📸", // High up
        message: "Sector 2: The Camera.\nWe don't need perfect poses. I just love capturing the real you.",
        // Using a placeholder image so it works immediately
        photo: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400" 
    },
    {
        x: 750, y: 350, emoji: "🌹", // Low down
        message: "Sector 3: The Rose.\nWe are almost at the finish line. Just one question remains...",
        photo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400"
    }
];

const finishLineX = 820;

// --- CONTROLS ---

// Team Selection
document.querySelectorAll("#team-select button").forEach(btn => {
    btn.onclick = () => {
        const team = btn.dataset.team;
        document.body.className = team; // Set theme
        car.emoji = team === "ferrari" ? "🐱" : "🐶"; // Avatar
        
        teamSelect.classList.add("hidden");
        gameContainer.classList.remove("hidden");
        
        startTime = Date.now();
        gameLoop(); // Start the loop ONLY after clicking
    };
});

// Key Listeners
document.addEventListener("keydown", e => keys[e.code] = true);
document.addEventListener("keyup", e => keys[e.code] = false);

// Spacebar Interaction
document.addEventListener("keydown", e => {
    if (e.code === "Space" && frozen) {
        hideDialogue();
        stage++;
        if (stage < 3) {
            sectorHUD.textContent = `SECTOR ${stage + 1} / 3`;
        } else {
            sectorHUD.textContent = "FINAL LAP";
        }
    }
});

// --- CORE FUNCTIONS ---

function showDialogue(item) {
    frozen = true;
    dialogueText.innerText = item.message; // Use innerText for newlines
    dialogueBox.classList.remove("hidden");

    if (item.photo) {
        memoryPhoto.src = item.photo;
        photoOverlay.classList.remove("hidden");
    }
}

function hideDialogue() {
    frozen = false;
    dialogueBox.classList.add("hidden");
    photoOverlay.classList.add("hidden");
}

function updateTimer() {
    if (!startTime) return;
    const t = Math.floor((Date.now() - startTime) / 1000);
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    timerHUD.textContent = `${m}:${s}`;
}

function update() {
    if (!frozen) {
        // Horizontal Movement
        if (keys["ArrowRight"]) car.velocity += car.accel;
        else if (keys["ArrowLeft"]) car.velocity -= car.accel; // Added Brake/Reverse
        else car.velocity -= car.friction; // Coasting

        // Vertical Movement (ADDED THIS SO YOU CAN REACH ITEMS)
        if (keys["ArrowUp"] && car.y > 20) car.y -= 3;
        if (keys["ArrowDown"] && car.y < canvas.height - 50) car.y += 3;

        // Cap speed
        car.velocity = Math.max(0, Math.min(car.velocity, car.maxSpeed));
        car.x += car.velocity;
    }

    // Check Item Collision
    if (stage < items.length) {
        const item = items[stage];
        // Distance check (Simple box collision)
        if (
            car.x < item.x + 40 &&
            car.x + 40 > item.x &&
            car.y < item.y + 40 &&
            car.y + 40 > item.y
        ) {
            showDialogue(item);
        }
    }

    // Check Finish Line
    if (stage >= items.length && car.x > finishLineX) {
        endGame();
    }

    updateTimer();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Track Lines (Moving effect)
    const offset = (Date.now() / 5) % 60; // Speed of lines
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < canvas.width; i += 60) {
        ctx.fillRect(i - offset, 100, 30, 4); // Top lane marker
        ctx.fillRect(i - offset, 400, 30, 4); // Bottom lane marker
    }
    ctx.globalAlpha = 1.0;

    // 2. Draw Finish Line
    if (stage >= items.length) {
        // Checkerboard pattern
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.fillStyle = y % 80 === 0 ? "white" : "black";
            ctx.fillRect(finishLineX, y, 20, 40);
            ctx.fillStyle = y % 80 === 0 ? "black" : "white";
            ctx.fillRect(finishLineX + 20, y, 20, 40);
        }
    }

    // 3. Draw Items (Only current one)
    if (stage < items.length) {
        const item = items[stage];
        ctx.font = "40px Arial"; // SET FONT SIZE (Critical Fix)
        ctx.fillText(item.emoji, item.x, item.y + 30);
        
        // Helper text
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText("TARGET", item.x - 10, item.y - 10);
    }

    // 4. Draw Car
    ctx.font = "50px Arial"; // Car size
    ctx.fillText(car.emoji, car.x, car.y + 30);
}

function gameLoop() {
    update();
    draw();
    if (gameContainer.classList.contains("hidden")) return; // Stop if game ended
    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameContainer.classList.add("hidden");
    proposalScreen.classList.remove("hidden");
    
    // You can replace these src URLs with your actual photos in the assets folder
    proposalScreen.innerHTML = `
        <h1>🏁 P1: POLE POSITION! 🏁</h1>
        <div style="display:flex; justify-content:center;">
            <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200">
            <img src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200">
        </div>
        <br>
        <h2>Will you be my Player 2?</h2>
        <br>
        <button id="yes">Yes ❤️</button>
        <button id="no">No</button>
    `;

    document.getElementById("yes").onclick = () => {
        alert("Yay! Happy Valentine's Day! 🏎️❤️");
    };

    const noBtn = document.getElementById("no");
    noBtn.onmouseover = () => {
        // Runaway Button Logic
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 50);
        noBtn.style.position = "fixed"; // Fixed is better than absolute here
        noBtn.style.left = x + "px";
        noBtn.style.top = y + "px";
    };
}

