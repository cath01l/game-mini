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

let keys = {};
let frozen = false;
let stage = 0;
let team = "";
let startTime = null;
let secretInput = [];

const car = {
  x: 60,
  y: 240,
  velocity: 0,
  maxSpeed: 4,
  accel: 0.08,
  friction: 0.04,
  emoji: "🏎️"
};

const items = [
  {
    x: 300,
    y: 250,
    emoji: "🍮",
    message:
      "Jellyace acquired.\nBack when we were still figuring things out...\nbeing around you already felt like comfort.",
    photo: null
  },
  {
    x: 520,
    y: 200,
    emoji: "📸",
    message:
      "A camera.\nNot for perfect moments.\nJust the real ones.",
    photo: "assets/photo1.jpg"
  },
  {
    x: 720,
    y: 300,
    emoji: "🌹",
    message:
      "Final sector.\nYou turned chaos into something soft.\nOne kiss from you fixes everything.",
    photo: "assets/photo2.jpg"
  }
];

const finishLineX = 860;

// TEAM SELECT
document.querySelectorAll("#team-select button").forEach(btn => {
  btn.onclick = () => {
    team = btn.dataset.team;
    document.body.classList.add(team);
    car.emoji = team === "ferrari" ? "🐱🏎️" : "🐶🏎️";
    teamSelect.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    startTime = Date.now();
  };
});

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

document.addEventListener("keydown", e => {
  if (e.code === "Space" && frozen) {
    hideDialogue();
    stage++;
    sectorHUD.textContent = `SECTOR ${Math.min(stage + 1, 3)} / 3`;
  }
});

// SECRET BONUS
const secretCode = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"
];

document.addEventListener("keydown", e => {
  secretInput.push(e.key);
  secretInput = secretInput.slice(-secretCode.length);
  if (secretInput.join() === secretCode.join()) {
    unlockBonus();
  }
});

function showDialogue(item) {
  frozen = true;
  dialogueText.textContent = item.message;
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
  const t = Math.floor((Date.now() - startTime) / 1000);
  const m = String(Math.floor(t / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  timerHUD.textContent = `${m}:${s}`;
}

function update() {
  if (!frozen) {
    if (keys["ArrowRight"]) car.velocity += car.accel;
    else car.velocity -= car.friction;

    car.velocity = Math.max(0, Math.min(car.velocity, car.maxSpeed));
    car.x += car.velocity;
  }

  const item = items[stage];
  if (item && Math.abs(car.x - item.x) < 20 && Math.abs(car.y - item.y) < 20) {
    showDialogue(item);
  }

  if (stage >= items.length && car.x > finishLineX) {
    endGame();
  }

  updateTimer();
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Track motion
  const offset = (Date.now() / 8) % 40;
  ctx.fillStyle = "#444";
  for (let y = -40; y < canvas.height; y += 40) {
    ctx.fillRect(450, y + offset, 6, 20);
  }

  // Items
  if (items[stage]) {
    const float = Math.sin(Date.now() / 400) * 5;
    ctx.fillText(items[stage].emoji, items[stage].x, items[stage].y + float);
  }

  // Finish line
  if (stage >= items.length) {
    ctx.fillStyle = "white";
    ctx.fillRect(finishLineX, 0, 6, canvas.height);
  }

  // Car
  ctx.fillText(car.emoji, car.x, car.y);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

function endGame() {
  gameContainer.classList.add("hidden");
  proposalScreen.classList.remove("hidden");
  proposalScreen.innerHTML = `
    <h1>🏁 Our Race So Far</h1>
    <img src="assets/photo1.jpg">
    <img src="assets/photo2.jpg">
    <img src="assets/photo3.jpg">
    <h2>Will you be my permanent teammate?</h2>
    <button id="yes">Yes ❤️</button>
    <button id="no">No</button>
  `;

  document.getElementById("yes").onclick = () =>
    alert("Contract signed. Season after season ❤️");

  const noBtn = document.getElementById("no");
  noBtn.onmouseover = () => {
    noBtn.style.position = "absolute";
    noBtn.style.left = Math.random() * 80 + "%";
    noBtn.style.top = Math.random() * 80 + "%";
  };
}

function unlockBonus() {
  document.body.innerHTML = `
    <h1>💖 Bonus Lap</h1>
    <p>I wasn’t looking.</p>
    <p>You kept showing up.</p>
    <p><strong>And I fell in love.</strong></p>
  `;
}

