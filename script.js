const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas Size (Laptop Friendly)
canvas.width = 800;
canvas.height = 600;

// Game State
let player = { x: 380, y: 500, size: 40, speed: 5, color: 'red', avatar: '🐱' };
let items = [
    { name: 'Jellyace', emoji: '🍮', x: 100, y: 100, collected: false },
    { name: 'Camera', emoji: '📸', x: 650, y: 100, collected: false },
    { name: 'Rose', emoji: '🌹', x: 100, y: 500, collected: false },
    { name: 'Finish', emoji: '🏁', x: 380, y: 280, collected: false } // Center
];
let itemsCollected = 0;
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
let gameLoopId;

// 1. Device Check (Run immediately)
function checkDevice() {
    // If width is less than 800px, it's likely a phone or tablet
    if (window.innerWidth < 800) {
        document.getElementById('mobile-blocker').classList.remove('hidden');
        document.getElementById('start-screen').classList.add('hidden');
    }
}
checkDevice();
window.onresize = checkDevice;

// 2. Start Game
function startGame(team) {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    if (team === 'ferrari') {
        player.color = '#ff2800'; // Red
        player.avatar = '🐱';
    } else {
        player.color = '#C0C0C0'; // Silver
        player.avatar = '🐶';
    }
    update();
}

// 3. Controls (Keyboard)
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
});

// 4. Game Loop
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Track (Simple Oval)
    ctx.fillStyle = '#636e72'; // Road
    ctx.beginPath();
    ctx.ellipse(400, 300, 350, 250, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#55efc4'; // Grass Center
    ctx.beginPath();
    ctx.ellipse(400, 300, 200, 100, 0, 0, Math.PI * 2);
    ctx.fill();

    // Move Player
    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.size) player.x += player.speed;

    // Draw Items
    items.forEach(item => {
        if (!item.collected) {
            // Only show Finish line if 3 items are collected
            if (item.name === 'Finish' && itemsCollected < 3) return;

            ctx.font = '30px Arial';
            ctx.fillText(item.emoji, item.x, item.y + 30);

            // Collision Detection
            if (
                player.x < item.x + 30 &&
                player.x + player.size > item.x &&
                player.y < item.y + 30 &&
                player.y + player.size > item.y
            ) {
                collectItem(item);
            }
        }
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.roundRect(player.x, player.y, player.size, player.size, 8);
    ctx.fill();
    ctx.font = '24px Arial';
    ctx.fillText(player.avatar, player.x + 5, player.y + 28);

    gameLoopId = requestAnimationFrame(update);
}

// 5. Collection Logic
function collectItem(item) {
    if (item.name === 'Finish') {
        endGame();
        return;
    }
    item.collected = true;
    itemsCollected++;
    document.getElementById('item-count').innerText = itemsCollected;
}

// 6. End Game
function endGame() {
    cancelAnimationFrame(gameLoopId);
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('proposal-screen').classList.remove('hidden');
}

// 7. Proposal Logic
const noBtn = document.getElementById('no-btn');
const yesBtn = document.getElementById('yes-btn');

// Runaway "No" Button
noBtn.addEventListener('mouseover', () => {
    const x = Math.random() * (window.innerWidth - noBtn.offsetWidth);
    const y = Math.random() * (window.innerHeight - noBtn.offsetHeight);
    noBtn.style.position = 'absolute';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
});

yesBtn.addEventListener('click', () => {
    // You can customize this alert or redirect to a song/video!
    alert("YAY! See you on Valentine's Day! ❤️🏎️");
});