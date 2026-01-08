// --- CONFIG ---
const SUPABASE_URL = "https://wnudtnsirntmgjshnthf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_IUTbAM3zNg9_iWLsJIzdGA_sW9BkLPk";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const defaultCategories = [
    {
        title: "Work",
        icon: "grid_view",
        items: [
            { name: "Gmail", url: "https://gmail.com", icon: "mail" },
            { name: "Slack", url: "https://slack.com", icon: "chat" },
            { name: "Notion", url: "https://notion.so", icon: "description" },
        ]
    },
    {
        title: "Social",
        icon: "public",
        items: [
            { name: "Twitter / X", url: "https://twitter.com", icon: "tag" },
            { name: "Discord", url: "https://discord.com", icon: "forum" },
            { name: "Instagram", url: "https://instagram.com", icon: "photo_camera" },
            { name: "Reddit", url: "https://reddit.com", icon: "group" },
        ]
    },
    {
        title: "Media",
        icon: "play_circle",
        items: [
            { name: "YouTube", url: "https://youtube.com", icon: "movie" },
            { name: "Spotify", url: "https://open.spotify.com", icon: "headphones" },
            { name: "Netflix", url: "https://netflix.com", icon: "tv" },
        ]
    },
    {
        title: "Tools",
        icon: "terminal",
        items: [
            { name: "GitHub", url: "https://github.com", icon: "code" },
            { name: "ChatGPT", url: "https://chat.openai.com", icon: "smart_toy" },
            { name: "Figma", url: "https://figma.com", icon: "brush" },
            { name: "Vercel", url: "https://vercel.com", icon: "rocket_launch" },
        ]
    },
    {
        title: "Playground",
        icon: "sports_esports",
        items: [
            { name: "Codepen", url: "https://codepen.io", icon: "html" },
            { name: "Dribbble", url: "https://dribbble.com", icon: "draw" },
        ]
    }
];

// --- STATE ---
let categories = JSON.parse(localStorage.getItem('dashboardCategories')) || defaultCategories;
let isEditing = false;
const grid = document.getElementById('grid-container');
const editBtn = document.getElementById('edit-fab');

// --- RENDER ---
function render() {
    grid.innerHTML = '';
    categories.forEach((cat, cIdx) => {
        // Col Structure
        const col = document.createElement('div');
        col.className = "flex flex-col gap-4";

        // Header
        col.innerHTML = `
            <div class="flex items-center justify-between px-1 pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
                <span class="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase">${cat.title}</span>
                <span class="material-symbols-outlined text-[16px] text-gray-300 dark:text-gray-700">${cat.icon}</span>
            </div>
        `;

        // List
        const list = document.createElement('div');
        list.className = "flex flex-col gap-3 max-h-[180px] overflow-y-auto custom-scroll p-2 pt-2 pr-1";

        cat.items.forEach((item, iIdx) => {
            const card = document.createElement(isEditing ? 'div' : 'a');
            card.className = "card flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer";

            if (!isEditing) {
                card.href = item.url;
                card.target = "_blank";
            } else {
                card.onclick = () => editItem(cIdx, iIdx);
            }

            card.innerHTML = `
                <span class="material-symbols-outlined text-[18px] text-gray-400 dark:text-gray-500">${item.icon || 'link'}</span>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-grow truncate">${item.name}</span>
                ${isEditing ? `
                    <div class="flex gap-2">
                        <span class="material-symbols-outlined text-[14px] text-blue-400" onclick="event.stopPropagation(); editItem(${cIdx}, ${iIdx})">edit</span>
                        <span class="material-symbols-outlined text-[14px] text-red-400" onclick="event.stopPropagation(); deleteItem(${cIdx}, ${iIdx})">delete</span>
                    </div>
                ` : ''}
            `;
            list.appendChild(card);
        });

        // Add Button (Edit Mode)
        if (isEditing) {
            const addBtn = document.createElement('button');
            addBtn.className = "w-full py-2 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-xs text-gray-400 hover:text-gray-600 uppercase tracking-widest";
            addBtn.innerText = "+ ADD";
            addBtn.onclick = () => addItem(cIdx);
            list.appendChild(addBtn);
        }

        col.appendChild(list);
        grid.appendChild(col);
    });
}

// --- ACTIONS ---
function editItem(cIdx, iIdx) {
    const item = categories[cIdx].items[iIdx];
    const newName = prompt("Name:", item.name);
    if (newName === null) return;
    const newUrl = prompt("URL:", item.url);
    if (newUrl === null) return;
    const newIcon = prompt("Material Icon Name:", item.icon || 'link');

    categories[cIdx].items[iIdx] = {
        ...item,
        name: newName || item.name,
        url: newUrl || item.url,
        icon: newIcon || item.icon
    };
    save();
}

function deleteItem(cIdx, iIdx) {
    if (confirm("Delete this link?")) {
        categories[cIdx].items.splice(iIdx, 1);
        save();
    }
}

function addItem(cIdx) {
    const name = prompt("Name:");
    if (!name) return;
    const url = prompt("URL:", "https://");
    const icon = prompt("Icon Name:", "link");
    categories[cIdx].items.push({ name, url, icon: icon || 'link' });
    save();
}

async function save() {
    localStorage.setItem('dashboardCategories', JSON.stringify(categories));
    render();

    // Sync to Supabase if logged in
    if (window.Clerk && window.Clerk.user && supabase) {
        try {
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    id: window.Clerk.user.id,
                    shortcuts: categories,
                    updated_at: new Date()
                });
            if (error) console.error("Supabase Save Error:", error);
        } catch (e) {
            console.error("Supabase Sync Failed:", e);
        }
    }
}

editBtn.addEventListener('click', () => {
    isEditing = !isEditing;
    document.body.classList.toggle('is-editing', isEditing);
    render();
});

// --- THEME ---
const html = document.documentElement;
const body = document.body;

function setTheme(isDark) {
    if (isDark) {
        html.classList.add('dark');
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        html.classList.remove('dark');
        body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
}

// Toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
    setTheme(!html.classList.contains('dark'));
});

// Init Theme (Persist or Default to Dark)
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme === 'dark');

// --- CLOCK ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Fixed colon color: Light Mode = gray-400, Dark Mode = gray-500 (visible on both)
    document.getElementById('clock').innerHTML = `${hours}<span class="animate-pulse text-gray-400 dark:text-gray-500 mx-1">:</span>${minutes}`;

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    document.getElementById('date').innerHTML = `
        ${days[now.getDay()]} <span class="text-gray-300 dark:text-gray-700 mx-2">/</span> ${months[now.getMonth()]} ${now.getDate()}
    `;
}
setInterval(updateClock, 1000);
updateClock();

// --- WEATHER (Open-Meteo) ---
const weatherIcon = document.getElementById('weather-icon');
const weatherText = document.getElementById('weather-text');

function requestLocalWeather() {
    if (!navigator.geolocation) {
        weatherText.innerText = "NOT SUPPORTED";
        return;
    }

    weatherText.innerText = "LOCATING...";
    navigator.geolocation.getCurrentPosition(success, error);
}

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetchWeather(lat, lon);
}

function error() {
    weatherText.innerText = "LOCATION DENIED";
}

async function fetchWeather(lat, lon) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        const { temperature, weathercode } = data.current_weather;

        // Map WMO codes to Icons
        // 0: Clear, 1-3: Cloud, 45-48: Fog, 51-67: Rain, 71-77: Snow, 95-99: Thunder
        let icon = "cloud";
        if (weathercode === 0) icon = "sunny";
        else if (weathercode <= 3) icon = "partly_cloudy_day";
        else if (weathercode <= 48) icon = "foggy";
        else if (weathercode <= 67) icon = "rainy";
        else if (weathercode <= 77) icon = "ac_unit";
        else icon = "thunderstorm";

        weatherIcon.innerText = icon;
        weatherText.innerText = `UPDATED // ${temperature}°C`;

        // Save to localStorage so we don't ask next time (optional, simplistic)
        localStorage.setItem('cachedCoords', JSON.stringify({ lat, lon }));

    } catch (e) {
        weatherText.innerText = "API ERROR";
    }
}

// Auto-load if previously granted
const cached = localStorage.getItem('cachedCoords');
if (cached) {
    const { lat, lon } = JSON.parse(cached);
    fetchWeather(lat, lon);
}

// --- INITIAL RENDER ---
render();
updateClock();

// --- EASTER EGG: DETECT CODE ---
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        if (e.target.value.toLowerCase() === 'grid eater') {
            e.target.value = '';
            initSystemBreach();
        }
    });
}

// --- SYSTEM BREACH & GRID LEAK ---
function initSystemBreach() {
    const overlay = document.getElementById('game-overlay');
    const container = document.getElementById('grid-leak-container');
    const termOverlay = document.getElementById('terminal-overlay');
    const termText = document.getElementById('terminal-text');

    overlay.classList.remove('hidden');
    container.innerHTML = '';

    // Create Grid
    const cols = 10;
    const rows = 10;
    const size = 100 / cols;

    for (let i = 0; i < cols * rows; i++) {
        const box = document.createElement('div');
        box.className = 'grid-box';
        box.style.width = size + 'vw';
        box.style.height = size + 'vh';
        box.style.left = (i % cols) * size + 'vw';
        box.style.top = Math.floor(i / cols) * size + 'vh';
        container.appendChild(box);
    }

    // Animate Leak
    const boxes = Array.from(container.children);
    boxes.sort(() => Math.random() - 0.5);

    boxes.forEach((box, i) => {
        setTimeout(() => box.classList.add('active'), i * 10);
    });

    // Narrative
    setTimeout(() => {
        termOverlay.style.opacity = '1';
        termText.innerHTML = ''; // Reset

        const narrative = [
            "SCANNING FOR VULNERABILITIES...",
            "BYPASSING KERNEL SECURITY...",
            "EXTRACTING GRID_TILESET...",
            "HOSTILE ENTITIES DETECTED: GLITCH_PROTOCOLS",
            "INITIATING COUNTER-MEASURES...",
            "LOADING GRID_EATER.EXE..."
        ];

        playNarrative(termText, narrative, 0, () => {
            // Flash before start
            document.body.classList.add('glitch-active');
            setTimeout(() => {
                document.body.classList.remove('glitch-active');
                termOverlay.style.opacity = '0';
                setTimeout(startGame, 500);
            }, 1000);
        });
    }, 1500);
}

function playNarrative(el, lines, index, cb) {
    if (index < lines.length) {
        const line = document.createElement('div');
        line.style.animation = 'terminal-reveal 0.3s ease-out forwards';
        line.innerText = `> ${lines[index]}`;
        el.appendChild(line);

        // Scroll to bottom
        el.scrollTop = el.scrollHeight;

        setTimeout(() => playNarrative(el, lines, index + 1, cb), 600);
    } else if (cb) {
        setTimeout(cb, 1000);
    }
}


// --- GAME ENGINE: GRID EATER ---
let gameActive = false;
let currentLevel = 1;
let score = 0;
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const TILE_SIZE = 20;
const mazeLayouts = [
    [
        "##############################",
        "#............##............#",
        "#.####.#####.##.#####.####.#",
        "#.####.#####.##.#####.####.#",
        "#..........................#",
        "#.####.##.########.##.####.#",
        "#......##....##....##......#",
        "######.#####.##.#####.######",
        "     #.##..........##.#     ",
        "######.##.###--###.##.######",
        "      .   #      #   .      ",
        "######.##.########.##.######",
        "     #.##..........##.#     ",
        "######.##.########.##.######",
        "#............##............#",
        "#.####.#####.##.#####.####.#",
        "#.####.#####.##.#####.####.#",
        "#...##................##...#",
        "###.##.##.########.##.##.###",
        "#......##....##....##......#",
        "##############################"
    ],
    [
        "##############################",
        "#............##............#",
        "#.####.#####.##.#####.####.#",
        "#.#  #.#   #.##.#   #.#  #.#",
        "#.####.#####.##.#####.####.#",
        "#..........................#",
        "#.####.##.########.##.####.#",
        "#.#    ##....##....##    #.#",
        "#.######.###-##-###.######.#",
        "#.      .   #  #   .      .#",
        "#.######.##########.######.#",
        "#.#    ##    ##    ##    #.#",
        "#.####.##.########.##.####.#",
        "#..........................#",
        "#.####.#####.##.#####.####.#",
        "#.#  #.#   #.##.#   #.#  #.#",
        "#.####.#####.##.#####.####.#",
        "#...##................##...#",
        "#......##....##....##......#",
        "##############################"
    ],
    [
        "##############################",
        "#............##............#",
        "#.####.#####.##.#####.####.#",
        "#.#  #.#   #.##.#   #.#  #.#",
        "#.####.#####.##.#####.####.#",
        "#..........................#",
        "#.####.##.########.##.####.#",
        "#.#    ##....##....##    #.#",
        "#.######.###.##.###.######.#",
        "#.#    ##....##....##    #.#",
        "#.####.##.########.##.####.#",
        "#..........................#",
        "#.####.#####.##.#####.####.#",
        "#.####.#####.##.#####.####.#",
        "#.####.#####.##.#####.####.#",
        "#..........................#",
        "#.###.####.##--##.####.###.#",
        "#.#.#.#  #.######.#  #.#.#.#",
        "#... ... ...... ...... ... #",
        "##############################"
    ]
];

let player, enemies, dots, walls;
let currentDir = null;
let nextDir = null;

function startGame() {
    gameActive = true;
    canvas.classList.remove('hidden');
    document.getElementById('game-ui').classList.remove('hidden');

    const layout = mazeLayouts[currentLevel - 1];
    canvas.width = layout[0].length * TILE_SIZE;
    canvas.height = layout.length * TILE_SIZE;

    initLevel(currentLevel);
    gameLoop();
}

function initLevel(lvl) {
    const layout = mazeLayouts[lvl - 1];
    player = { x: 0, y: 0, size: 8, speed: 2 };
    dots = [];
    walls = [];
    enemies = [];
    score = 0;

    for (let r = 0; r < layout.length; r++) {
        for (let c = 0; c < layout[r].length; c++) {
            const char = layout[r][c];
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;

            if (char === "#") {
                walls.push({ x, y, w: TILE_SIZE, h: TILE_SIZE });
            } else if (char === ".") {
                dots.push({ x: x + TILE_SIZE / 2, y: y + TILE_SIZE / 2 });
            }
        }
    }

    // Start positions
    // Player starts at bottom center
    player.x = 15 * TILE_SIZE + TILE_SIZE / 2;
    player.y = (layout.length - 4) * TILE_SIZE + TILE_SIZE / 2;

    // Create Enemies in the center "Ghost House"
    for (let i = 0; i < lvl; i++) {
        enemies.push({
            x: (14 + (i % 3)) * TILE_SIZE + TILE_SIZE / 2,
            y: 10 * TILE_SIZE + TILE_SIZE / 2,
            speed: 1 + (lvl * 0.3),
            dir: null
        });
    }

    document.getElementById('game-level').innerText = lvl;
    document.getElementById('game-score').innerText = 0;
    document.getElementById('game-total').innerText = dots.length;

    currentDir = null;
    nextDir = null;
}

window.addEventListener('keydown', e => {
    if (e.code === 'ArrowUp') nextDir = 'up';
    if (e.code === 'ArrowDown') nextDir = 'down';
    if (e.code === 'ArrowLeft') nextDir = 'left';
    if (e.code === 'ArrowRight') nextDir = 'right';
    if (e.code === 'Escape' && gameActive) abortGame();
});

function gameLoop() {
    if (!gameActive) return;

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function checkWallCollision(x, y, size) {
    return walls.some(w => {
        return x + size > w.x && x - size < w.x + w.w &&
            y + size > w.y && y - size < w.y + w.h;
    });
}

function update() {
    // 1. Try to apply nextDir (Direction Buffer)
    if (nextDir) {
        let testX = player.x;
        let testY = player.y;

        // Snapping: only allow turns when roughly aligned with grid center
        const centerX = Math.floor(player.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
        const centerY = Math.floor(player.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;

        if (Math.abs(player.x - centerX) < 5 && Math.abs(player.y - centerY) < 5) {
            if (nextDir === 'up') { testX = centerX; testY = centerY - player.speed; }
            if (nextDir === 'down') { testX = centerX; testY = centerY + player.speed; }
            if (nextDir === 'left') { testX = centerX - player.speed; testY = centerY; }
            if (nextDir === 'right') { testX = centerX + player.speed; testY = centerY; }

            if (!checkWallCollision(testX, testY, player.size)) {
                player.x = centerX;
                player.y = centerY;
                currentDir = nextDir;
                nextDir = null;
            }
        }
    }

    // 2. Continuous Automatic Movement
    if (currentDir) {
        let nextX = player.x;
        let nextY = player.y;

        if (currentDir === 'up') nextY -= player.speed;
        if (currentDir === 'down') nextY += player.speed;
        if (currentDir === 'left') nextX -= player.speed;
        if (currentDir === 'right') nextX += player.speed;

        if (!checkWallCollision(nextX, nextY, player.size)) {
            player.x = nextX;
            player.y = nextY;
        } else {
            currentDir = null; // Stop at wall
        }
    }

    // Eat Dots
    dots = dots.filter(d => {
        const dist = Math.hypot(player.x - d.x, player.y - d.y);
        if (dist < 10) {
            score++;
            document.getElementById('game-score').innerText = score;
            return false;
        }
        return true;
    });

    // Enemies AI (Target Tile Logic - Optimized)
    enemies.forEach(e => {
        const eR = Math.floor(e.y / TILE_SIZE);
        const eC = Math.floor(e.x / TILE_SIZE);
        const centerX = eC * TILE_SIZE + TILE_SIZE / 2;
        const centerY = eR * TILE_SIZE + TILE_SIZE / 2;

        // At tile center, decide next direction
        if (Math.abs(e.x - centerX) < 2 && Math.abs(e.y - centerY) < 2) {
            e.x = centerX;
            e.y = centerY;

            const neighbors = [
                { dir: 'up', r: eR - 1, c: eC },
                { dir: 'down', r: eR + 1, c: eC },
                { dir: 'left', r: eR, c: eC - 1 },
                { dir: 'right', r: eR, c: eC + 1 }
            ];

            // Prevent immediate reversal and filter walls
            const layout = mazeLayouts[currentLevel - 1];
            const valid = neighbors.filter(n => {
                if (n.r < 0 || n.r >= layout.length || n.c < 0 || n.c >= layout[0].length) return false;
                if (layout[n.r][n.c] === '#') return false;
                if (e.dir === 'up' && n.dir === 'down') return false;
                if (e.dir === 'down' && n.dir === 'up') return false;
                if (e.dir === 'left' && n.dir === 'right') return false;
                if (e.dir === 'right' && n.dir === 'left') return false;
                return true;
            });

            if (valid.length > 0) {
                const pR = Math.floor(player.y / TILE_SIZE);
                const pC = Math.floor(player.x / TILE_SIZE);

                // Pick neighbor closest to Target Tile (Player)
                valid.sort((a, b) => {
                    const distA = Math.hypot(pR - a.r, pC - a.c);
                    const distB = Math.hypot(pR - b.r, pC - b.c);
                    return distA - distB;
                });
                e.dir = valid[0].dir;
            } else {
                // If stuck (rare), allow reverse
                e.dir = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' }[e.dir];
            }
        }

        // Apply movement
        if (e.dir === 'up') e.y -= e.speed;
        if (e.dir === 'down') e.y += e.speed;
        if (e.dir === 'left') e.x -= e.speed;
        if (e.dir === 'right') e.x += e.speed;

        // Collision with Player
        const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
        if (distToPlayer < 12) gameOver();
    });

    // Win Condition
    if (dots.length === 0) {
        if (currentLevel < 3) {
            currentLevel++;
            initLevel(currentLevel);
        } else {
            winGame();
        }
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Walls
    ctx.fillStyle = '#1e3a8a'; // Deep blue walls
    walls.forEach(w => {
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = '#3b82f6'; // Lighter blue border
        ctx.strokeRect(w.x, w.y, w.w, w.h);
    });

    // Player
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();

    // Dots
    ctx.fillStyle = '#FFF';
    dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    // Enemies
    ctx.fillStyle = '#FF4444';
    enemies.forEach(e => {
        ctx.fillRect(e.x - 7, e.y - 7, 14, 14);
    });
}

function abortGame() {
    gameActive = false;
    const termOverlay = document.getElementById('terminal-overlay');
    const termText = document.getElementById('terminal-text');

    termOverlay.style.opacity = '1';
    termText.innerHTML = '';

    const narrative = [
        "EMERGENCY ABORT SIGNAL DETECTED.",
        "STABILIZING CORE...",
        "DISCONNECTING FROM GRID..."
    ];

    playNarrative(termText, narrative, 0, () => {
        exitTransition("ABORTED");
    });
}

function gameOver() {
    document.body.classList.add('glitch-active');
    const termOverlay = document.getElementById('terminal-overlay');
    const termText = document.getElementById('terminal-text');

    termText.innerHTML = "<div class='text-red-500 font-bold tracking-widest'>> GLITCH DETECTED: REBOOTING LEVEL...</div>";
    termOverlay.style.opacity = '1';

    gameActive = false;

    setTimeout(() => {
        document.body.classList.remove('glitch-active');
        termOverlay.style.opacity = '0';
        initLevel(currentLevel);
        gameActive = true;
        gameLoop();
    }, 1500);
}

function winGame() {
    gameActive = false;
    const termOverlay = document.getElementById('terminal-overlay');
    const termText = document.getElementById('terminal-text');

    termOverlay.style.opacity = '1';
    termText.innerHTML = '';

    const narrative = [
        "CORE DATA FRAGMENTS RECOVERED.",
        "THREAT NEUTRALIZED.",
        "PURGING CORRUPTED SECTORS...",
        "SYSTEM STABILIZATION IN PROGRESS...",
        "REBOOTING HOME_DASHBOARD..."
    ];

    playNarrative(termText, narrative, 0, async () => {
        localStorage.setItem('gridEaterHero', 'true');
        localStorage.setItem('victoryDate', new Date().toLocaleDateString());

        // Sync Victory to Supabase
        if (window.Clerk && window.Clerk.user && supabase) {
            try {
                await supabase
                    .from('user_profiles')
                    .upsert({
                        id: window.Clerk.user.id,
                        victory_hero: true,
                        updated_at: new Date()
                    });
            } catch (e) {
                console.error("Supabase Victory Sync Failed:", e);
            }
        }

        showMedal();
        exitTransition("RESTORED");
    });
}

function exitTransition(status) {
    document.body.classList.add('glitch-active');

    const container = document.getElementById('grid-leak-container');
    const boxes = Array.from(container.children);
    boxes.sort(() => Math.random() - 0.5);

    boxes.forEach((box, i) => {
        setTimeout(() => box.classList.remove('active'), i * 2);
    });

    setTimeout(() => {
        document.body.classList.remove('glitch-active');
        document.getElementById('game-overlay').classList.add('hidden');
        canvas.classList.add('hidden');
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('terminal-overlay').style.opacity = '0';
        document.getElementById('terminal-text').innerHTML = '';
        currentLevel = 1;

        if (status === "RESTORED") {
            alert("SYSTEM RESTORED: YOU ARE A HERO!");
        }
    }, 1200);
}

// --- REWARDS ---
function showMedal() {
    if (localStorage.getItem('gridEaterHero') === 'true') {
        document.getElementById('medal-container').classList.remove('hidden');
    }
}

function showVictoryLog() {
    const date = localStorage.getItem('victoryDate');
    const name = localStorage.getItem('userName') || 'GUEST';
    alert(`System successfully restored by ${name} on ${date}.`);
}

// --- STATUS DOT EASTER EGG ---
let statusClicks = 0;
let hudInterval = null;

document.getElementById('status-dot').addEventListener('click', () => {
    statusClicks++;
    if (statusClicks >= 5) {
        const isOverdrive = document.body.classList.toggle('mecha-mode');
        const status = document.getElementById('system-status');
        status.innerText = isOverdrive ? "SYSTEM OVERDRIVE" : "SYSTEM ONLINE";

        if (isOverdrive) {
            startMechaHUD();
        } else {
            stopMechaHUD();
        }

        statusClicks = 0;
    }
});

function startMechaHUD() {
    if (hudInterval) clearInterval(hudInterval);
    hudInterval = setInterval(() => {
        // Randomize bars slightly for "living" UI feel
        const reactor = document.getElementById('bar-reactor');
        const heat = document.getElementById('bar-heat');
        const sync = document.getElementById('bar-sync');
        const link = document.getElementById('bar-link');

        if (reactor) reactor.style.height = (70 + Math.random() * 20) + '%';
        if (heat) heat.style.height = (30 + Math.random() * 40) + '%';
        if (sync) sync.style.width = (95 + Math.random() * 4) + '%';
        if (link) link.style.width = (80 + Math.random() * 15) + '%';

    }, 2000);
}

function stopMechaHUD() {
    if (hudInterval) {
        clearInterval(hudInterval);
        hudInterval = null;
    }
}

// --- CLERK AUTHENTICATION ---
async function initAuth() {
    const authBtn = document.getElementById('auth-btn');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    // Wait for Clerk to be available on window
    const checkClerk = setInterval(async () => {
        if (window.Clerk) {
            clearInterval(checkClerk);
            try {
                await window.Clerk.load();

                if (window.Clerk.user) {
                    // Logged In
                    userName.innerText = window.Clerk.user.fullName || "USER";
                    userAvatar.src = window.Clerk.user.imageUrl;
                    authBtn.innerText = "SIGN OUT";
                    authBtn.onclick = () => window.Clerk.signOut();

                    // Sync to localStorage for legacy features if needed
                    localStorage.setItem('userName', userName.innerText);

                    // --- SUPABASE SYNC ---
                    if (supabase) {
                        const { data, error } = await supabase
                            .from('user_profiles')
                            .select('shortcuts, victory_hero')
                            .eq('id', window.Clerk.user.id)
                            .single();

                        if (data && data.shortcuts) {
                            categories = data.shortcuts;
                            render();
                        }
                        if (data && data.victory_hero) {
                            localStorage.setItem('gridEaterHero', 'true');
                            showMedal();
                        }
                    }
                } else {
                    // Not Logged In
                    userName.innerText = "GUEST";
                    userAvatar.src = `https://ui-avatars.com/api/?name=Guest&background=random&color=fff`;
                    authBtn.innerText = "SIGN IN";
                    authBtn.onclick = () => window.Clerk.openSignIn();
                }
            } catch (err) {
                console.error("Clerk Load Error:", err);
            }
        }
    }, 100);
}

// Final Init
initAuth();
showMedal();
