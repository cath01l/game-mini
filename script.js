const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');

canvas.width = 800;
canvas.height = 600;

// GAME STATE
let gameState = 'START'; // START, PLAY, DIALOGUE, END
let currentLevel = 0; // 0=Intro, 1=Jellyace, 2=Camera, 3=Rose, 4=Finish

// PLAYER
let player = { x: 400, y: 500, size: 40, speed: 5, color: 'red', avatar: '🐱' };
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

// OBSTACLES (Traffic Cones / Oil)
const obstacles = [
    { x: 200, y: 200, w: 50, h: 50, type: 'cone' },
    { x: 500, y: 350, w: 50, h: 50, type: 'cone' },
    { x: 300, y: 100, w: 50, h: 50, type: 'cone' },
    { x: 600, y: 500, w: 50, h: 50, type: 'cone' }
];

// ITEMS (The Story Chapters)
const items = [
    { 
        name: 'Jellyace', emoji: '🍮', x: 100, y: 100, 
        message: "Radio Check: Jellyace acquired! \nIt's sweet and wobbly... reminds me of how I feel when I see you." 
    },
    { 
        name: 'Camera', emoji: '📸', x: 650, y: 450, 
        message: "Pit Stop: The Digital Camera. \nWe've captured so many memories, but I think the best ones are yet to come." 
    },
    { 
        name: 'Rose', emoji: '🌹', x: 400, y: 300, 
        message: "Lap 3: A Rose. \nFor the person who makes my life bloom. We are almost at the finish line!" 
    },
    { 
        name: 'Finish', emoji: '🏁', x: 400, y: 100, 
        message: "Checkered Flag! \nYou made it. Park the car and look at the screen..." 
    }
];

// --- CORE FUNCTIONS ---

function checkDevice() {
    if (window.innerWidth < 800) {
        document.getElementById('mobile-blocker').classList.remove('hidden');
        document.getElementById('start-screen').classList.add('hidden');
    }
}
checkDevice();

function startGame(team) {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    if (team === 'ferrari') {
        player.color = '#ff2800'; 
        player.avatar = '🐱';
    } else {
        player.color = '#b2bec3';
        player.avatar = '🐶';
    }

    // Trigger Intro Dialogue
    showDialogue("Team Radio: Welcome to the track. \nWe need to collect supplies for the big date. First up: Find the sweet fuel!");
    update();
}

function showDialogue(text) {
    gameState = 'DIALOGUE';
    dialogueBox.classList.remove('hidden');
    dialogueText.innerText = text;
}

// Controls
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
    
    // Spacebar to advance dialogue
    if (e.code === 'Space' && gameState === 'DIALOGUE') {
        dialogueBox.classList.add('hidden');
        
        if (currentLevel >= items.length) {
            endGame();
        } else {
            gameState = 'PLAY';
        }
    }
});
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// --- GAME LOOP ---
function update() {
    if (gameState === 'PLAY') {
        movePlayer();
        checkCollisions();
    }
    draw();
    requestAnimationFrame(update);
}

function movePlayer() {
    let prevX = player.x;
    let prevY = player.y;

    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.size) player.x += player.speed;

    // Obstacle Collision (Bounce back)
    obstacles.forEach(obs => {
        if (
            player.x < obs.x + obs.w &&
            player.x + player.size > obs.x &&
            player.y < obs.y + obs.h &&
            player.y + player.size > obs.y
        ) {
            player.x = prevX; // Undo move
            player.y = prevY;
        }
    });
}

function checkCollisions() {
    // Check collision with CURRENT level item only
    if (currentLevel < items.length) {
        let item = items[currentLevel];
        if (
            player.x < item.x + 40 &&
            player.x + player.size > item.x &&
            player.y < item.y + 40 &&
            player.y + player.size > item.y
        ) {
            // Item Found!
            showDialogue(item.message);
            currentLevel++;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Track
    ctx.fillStyle = '#636e72'; // Road
    ctx.beginPath();
    ctx.roundRect(50, 50, 700, 500, 100);
    ctx.fill();
    ctx.fillStyle = '#2d3436'; // Inner Grass (Hole)
    ctx.beginPath();
    ctx.roundRect(150, 150, 500, 300, 50);
    ctx.fill();

    // 2. Draw Obstacles (Cones)
    ctx.fillStyle = '#e17055'; // Orange
    obstacles.forEach(obs => {
        ctx.beginPath();
        ctx.moveTo(obs.x + 25, obs.y);
        ctx.lineTo(obs.x, obs.y + 50);
        ctx.lineTo(obs.x + 50, obs.y + 50);
        ctx.fill();
    });

    // 3. Draw CURRENT Item Only (Story Mode)
    if (currentLevel < items.length) {
        let item = items[currentLevel];
        ctx.font = '40px Arial';
        ctx.fillText(item.emoji, item.x, item.y + 35);
        
        // Helper Arrow (optional)
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText("TARGET", item.x, item.y - 5);
    }

    // 4. Draw Player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.size, player.size, 8);
    ctx.fill();
    ctx.font = '24px Arial';
    ctx.fillText(player.avatar, player.x + 5, player.y + 28);
}

function endGame() {
    gameState = 'END';
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('proposal-screen').classList.remove('hidden');
}

// Runaway No Button
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');

noBtn.addEventListener('mouseover', () => {
    const x = Math.random() * (window.innerWidth - 200);
    const y = Math.random() * (window.innerHeight - 100);
    noBtn.style.position = 'absolute';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
});

yesBtn.addEventListener('click', () => {
    alert("Happy Valentine's Day! ❤️🏎️");
});
