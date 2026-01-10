// --- CONFIG (v2.1 - 2026-01-08) ---
const SUPABASE_URL = "https://wnudtnsirntmgjshnthf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudWR0bnNpcm50bWdqc2hudGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NjE1OTgsImV4cCI6MjA4MzQzNzU5OH0.EEu30MQL10mhr-Rdbf7li_yDD1jQkn2g6OXFt8IKI2o";

let db = null;
try {
    if (window.supabase) {
        db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase Client Initialized.");
    } else {
        console.warn("Supabase SDK not found on window. Persistence disabled.");
    }
} catch (e) {
    console.error("Supabase Init Error:", e);
}

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
// --- STATE ---
let categories = JSON.parse(JSON.stringify(defaultCategories)); // Deep copy defaults initially

// Note: Logic moved to InitAuth. 
// Guest = Always Default. 
// User = Load potentially cached data or Cloud data.

let isEditing = false;
// Selectors as functions to ensure availability
const getGrid = () => document.getElementById('grid-container');
const getEditBtn = () => document.getElementById('edit-fab');

// --- RENDER ---
function render() {
    const grid = getGrid();
    if (!grid) {
        console.error("Critical Error: #grid-container not found in DOM.");
        return;
    }
    grid.innerHTML = '';

    // Safety check for categories
    if (!Array.isArray(categories) || categories.length === 0) {
        console.warn("Categories data invalid, falling back to defaults.");
        categories = defaultCategories;
    }

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

// --- SYNC STATUS LED ---
function setSyncStatus(status) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('system-status');
    if (!dot || !text) return;

    switch (status) {
        case 'synced':
            dot.className = 'w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]';
            text.innerText = 'SYNCED';
            break;
        case 'syncing':
            dot.className = 'w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)] animate-pulse';
            text.innerText = 'SYNCING...';
            break;
        case 'offline':
            dot.className = 'w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
            text.innerText = 'OFFLINE';
            break;
        case 'guest':
            dot.className = 'w-1.5 h-1.5 rounded-full bg-gray-500 shadow-[0_0_8px_rgba(107,114,128,0.4)]';
            text.innerText = 'GUEST';
            break;
    }
}

async function forceSync() {
    const { data: { session } } = await db.auth.getSession();
    if (!session || !session.user) {
        alert('Please login to sync');
        return;
    }

    setSyncStatus('syncing');
    try {
        const { data } = await db.from('user_profiles').select('shortcuts').eq('id', session.user.id).single();
        if (data && data.shortcuts) {
            categories = data.shortcuts;
            localStorage.setItem('dashboardCategories', JSON.stringify(categories));
            render();
            setSyncStatus('synced');
            console.log('Force Sync Complete');
        }
    } catch (e) {
        console.error('Force Sync Failed:', e);
        setSyncStatus('offline');
    }
}

let isSaving = false; // Save Queue Lock

async function save() {
    localStorage.setItem('dashboardCategories', JSON.stringify(categories));
    render();

    // Sync to Supabase if logged in
    const { data: { session } } = await db.auth.getSession();
    if (session && session.user) {
        isSaving = true; // Lock
        setSyncStatus('syncing'); // LED: Yellow
        // Visual Feedback (Cursor wait)
        document.body.style.cursor = 'wait';
        try {
            const { error } = await db
                .from('user_profiles')
                .upsert({
                    id: session.user.id,
                    shortcuts: categories,
                    updated_at: new Date()
                });
            if (error) throw error;
            console.log("Cloud Save Complete");
            setSyncStatus('synced'); // LED: Green
        } catch (e) {
            console.error("Supabase Save Failed:", e);
            setSyncStatus('offline'); // LED: Red
            alert("Sync Failed: Check Internet Connection");
        } finally {
            document.body.style.cursor = 'default';
            isSaving = false; // Unlock
        }
    }
}

setTimeout(() => {
    const editBtn = getEditBtn();
    if (editBtn) {
        let pressTimer;
        let isLongPress = false;

        // Mouse events
        editBtn.addEventListener('mousedown', () => {
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                forceSync();
                editBtn.classList.add('scale-95');
            }, 1000); // 1 second hold
        });

        editBtn.addEventListener('mouseup', () => {
            clearTimeout(pressTimer);
            editBtn.classList.remove('scale-95');
            if (!isLongPress) {
                // Normal click = Toggle Edit Mode
                isEditing = !isEditing;
                document.body.classList.toggle('is-editing', isEditing);
                render();
            }
        });

        editBtn.addEventListener('mouseleave', () => {
            clearTimeout(pressTimer);
            editBtn.classList.remove('scale-95');
        });

        // Touch events (Mobile)
        editBtn.addEventListener('touchstart', (e) => {
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                forceSync();
                editBtn.classList.add('scale-95');
            }, 1000);
        });

        editBtn.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
            editBtn.classList.remove('scale-95');
            if (!isLongPress) {
                isEditing = !isEditing;
                document.body.classList.toggle('is-editing', isEditing);
                render();
            }
        });

        editBtn.addEventListener('touchcancel', () => {
            clearTimeout(pressTimer);
            editBtn.classList.remove('scale-95');
        });
    }
}, 1000);

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
setTimeout(() => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            setTheme(!html.classList.contains('dark'));
        });
    }
}, 1000);

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
            "EXTRACTING ENCRYPTION_KEYS...",
            "HOSTILE ENTITIES DETECTED: VIRUS_WAVE",
            "INITIATING DEFENSE PROTOCOL...",
            "PREPARING COUNTER ATTACK..."
        ];

        playNarrative(termText, narrative, 0, () => {
            // Flash before start
            document.body.classList.add('glitch-active');
            setTimeout(() => {
                document.body.classList.remove('glitch-active');
                termOverlay.style.opacity = '0';

                // Launch Game FIRST (behind the black screen)
                SysDef.init();

                // Then remove the black screen after a tiny delay to prevent dashboard flash
                setTimeout(() => {
                    document.getElementById('game-overlay').classList.add('hidden');
                }, 300);
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

// --- GAME ENGINE: SYSTEM DEFENSE PROTOCOL (TD) ---
const SysDef = {
    canvas: null,
    ctx: null,
    path: [{ x: 0, y: 300 }, { x: 250, y: 300 }, { x: 250, y: 100 }, { x: 550, y: 100 }, { x: 550, y: 450 }, { x: 150, y: 450 }, { x: 150, y: 550 }, { x: 800, y: 550 }],
    towerTypes: {
        laser: { cost: 80, range: 120, damage: 5, color: '#0ff', type: 'laser' },
        slow: { cost: 120, range: 100, damage: 1, color: '#0f0', type: 'slow' },
        multi: { cost: 200, range: 150, damage: 15, color: '#f0f', type: 'multi' }
    },

    State: {
        money: 800,
        health: 100,
        wave: 0,
        enemies: [],
        towers: [],
        bullets: [],
        floatingTexts: [],
        pulses: [],
        particles: [],
        running: false,
        paused: false,
        selectedTowerType: null,
        selectedPlacedTower: null,
        mouse: { x: 0, y: 0 },
        gridSize: 40,
        meta: { highWave: 1, totalKills: 0, startMoneyLv: 0, coreHealthLv: 0 },
        mapColor: '#050510',
        hasShownWave10Msg: false
    },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        document.body.classList.add('defense-mode');
        document.getElementById('defense-protocol').classList.remove('hidden');
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('endScreen').classList.add('hidden');
        document.getElementById('controlPanel').classList.add('hidden');

        this.loadSave();
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input Handlers
        this.canvas.addEventListener('pointerdown', (e) => this.handleInput(e));
        this.canvas.addEventListener('pointermove', (e) => {
            const r = this.canvas.getBoundingClientRect();
            this.State.mouse.x = e.clientX - r.left;
            this.State.mouse.y = e.clientY - r.top;
        });

        // Global Key Handler
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.State.running) {
                this.exitGame();
            }
        });
    },

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight; // Fullscreen game
    },

    loadSave() {
        const data = localStorage.getItem("sysdef_meta_v1");
        if (data) this.State.meta = JSON.parse(data);
        this.updateMetaDisplay();
    },

    updateMetaDisplay() {
        document.getElementById('metaInfo').innerHTML = `MAX WAVE: ${this.State.meta.highWave}<br>PACKETS INTERCEPTED: ${this.State.meta.totalKills}`;
    },

    saveGame() {
        this.State.meta.highWave = Math.max(this.State.meta.highWave, this.State.wave);
        localStorage.setItem("sysdef_meta_v1", JSON.stringify(this.State.meta));
        this.updateMetaDisplay();
    },

    startGame() {
        this.State.money = 800 + (this.State.meta.startMoneyLv * 100);
        this.State.health = 100 + (this.State.meta.coreHealthLv * 25);
        this.State.wave = 0;
        this.State.hasShownWave10Msg = false;
        this.State.enemies = []; this.State.towers = []; this.State.bullets = [];
        this.State.paused = false;

        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('endScreen').classList.add('hidden');
        document.getElementById('controlPanel').classList.remove('hidden');
        this.State.running = true;
        this.gameLoop();
    },

    gameLoop() {
        if (!this.State.running || this.State.paused) return;

        try {
            const ctx = this.ctx;
            ctx.fillStyle = '#050510';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Path Glow
            ctx.shadowBlur = 15; ctx.shadowColor = '#0ff';
            ctx.strokeStyle = '#001a1a'; ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(this.path[0].x, this.path[0].y); this.path.forEach(p => ctx.lineTo(p.x, p.y)); ctx.stroke();

            // Active Path
            ctx.shadowBlur = 5; ctx.strokeStyle = '#003333'; ctx.lineWidth = 4;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Spawning Logic
            if (this.State.enemies.length === 0) {
                if (this.State.wave === 10 && !this.State.hasShownWave10Msg) {
                    this.triggerWave10Choice();
                    this.State.hasShownWave10Msg = true;
                    return;
                }

                this.State.wave++;
                this.saveGame();
                const count = 5 + this.State.wave * 2;
                for (let i = 0; i < count; i++) {
                    setTimeout(() => { if (this.State.running && !this.State.paused) this.State.enemies.push(new this.Enemy(this.State.wave)); }, i * Math.max(200, 600 - this.State.wave * 10));
                }
            }

            // Passive Income (Mining Logic)
            if (this.State.running && !this.State.paused && Math.random() < 0.02) { // Buffed: 2% chance (~1.2 hits/sec)
                this.State.money += 5 + this.State.wave; // Buffed: Base 5 + Wave (was 1 + 0.5*Wave)
            }

            // Entities Update
            this.State.towers.forEach(t => { t.update(); t.draw(ctx); });
            this.State.bullets = this.State.bullets.filter(b => { if (b.update()) return false; b.draw(ctx); return true; });
            this.State.enemies = this.State.enemies.filter(e => {
                if (e.health <= 0) {
                    e.die();
                    // Buffed Reward: Base 35 + 3*Wave (was 25 + 2*Wave)
                    this.State.money += e.reward + 10 + this.State.wave;
                    this.State.meta.totalKills++;
                    return false;
                }
                if (e.targetIdx >= this.path.length) {
                    this.State.health -= 10; // Lose integrity
                    this.State.health = Math.max(0, this.State.health);
                    return false;
                }
                e.update(); e.draw(ctx); return true;
            });

            // VFX
            this.State.pulses = this.State.pulses.filter(p => {
                ctx.strokeStyle = p.c; ctx.globalAlpha = p.life; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - p.life), 0, Math.PI * 2); ctx.stroke();
                p.life -= 0.04; return p.life > 0;
            });
            this.State.floatingTexts = this.State.floatingTexts.filter(f => {
                ctx.fillStyle = `rgba(255,255,255,${f.life})`; ctx.font = '10px monospace'; ctx.fillText(f.text, f.x, f.y - (1 - f.life) * 20);
                f.life -= 0.02; return f.life > 0;
            });

            // UI Updates
            document.getElementById('moneyEl').innerText = Math.floor(this.State.money);
            document.getElementById('healthEl').innerText = Math.floor(this.State.health) + '%';
            document.getElementById('waveEl').innerText = this.State.wave;
            document.getElementById('skillNuke').disabled = this.State.money < 500;

            if (this.State.health <= 0) this.endGame("SYSTEM COMPROMISED");

            ctx.globalAlpha = 1;
        } catch (e) {
            console.error("SysDef Game Loop Error:", e);
        }

        requestAnimationFrame(() => this.gameLoop());
    },

    handleInput(e) {
        if (!this.State.running || this.State.paused) return;
        const r = this.canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const gx = Math.floor(x / this.State.gridSize), gy = Math.floor(y / this.State.gridSize);

        const clicked = this.State.towers.find(t => t.gx === gx && t.gy === gy);
        if (clicked) {
            this.State.selectedPlacedTower = clicked;
            this.State.selectedTowerType = null;
            this.updateUI();
        } else if (this.State.selectedTowerType) {
            const cfg = this.towerTypes[this.State.selectedTowerType];
            if (this.State.money >= cfg.cost && !this.isOnPath(gx, gy) && !clicked) {
                this.State.towers.push(new this.Tower(gx, gy, cfg));
                this.State.money -= cfg.cost;
                this.updateUI();
            }
        } else {
            this.State.selectedPlacedTower = null;
            this.updateUI();
        }
    },

    isOnPath(gx, gy) {
        const cx = gx * this.State.gridSize + 20, cy = gy * this.State.gridSize + 20;
        for (let i = 0; i < this.path.length - 1; i++) {
            if (this.distToSegment({ x: cx, y: cy }, this.path[i], this.path[i + 1]) < 25) return true;
        }
        return false;
    },

    distToSegment(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 == 0) return Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt((p.x - (v.x + t * (w.x - v.x))) ** 2 + (p.y - (v.y + t * (w.y - v.y))) ** 2);
    },

    // --- CLASSES ---
    Enemy: class {
        constructor(wave) {
            this.x = SysDef.path[0].x; this.y = SysDef.path[0].y;
            this.targetIdx = 1;
            const waveMult = Math.pow(1.15, wave);
            this.maxHealth = 20 + (wave * 15 * waveMult);
            this.health = this.maxHealth;
            this.speed = 1.2 + (Math.min(wave, 30) * 0.05);
            this.slowed = 0;
            this.reward = 25 + Math.floor(wave * 2);
            this.isBoss = (wave % 5 === 0);
            if (this.isBoss) { this.maxHealth *= 5; this.speed *= 0.6; this.reward *= 5; }
        }
        update() {
            if (this.slowed > 0) this.slowed--;
            const target = SysDef.path[this.targetIdx];
            const dx = target.x - this.x, dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const move = this.slowed > 0 ? this.speed * 0.4 : this.speed;
            if (dist < move) {
                this.targetIdx++;
            } else {
                this.x += (dx / dist) * move; this.y += (dy / dist) * move;
            }
        }
        draw(ctx) {
            let color = this.slowed > 0 ? '#0ff' : (this.isBoss ? '#f0f' : '#f33');
            ctx.shadowBlur = 10; ctx.shadowColor = color;
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.isBoss ? 16 : 10, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            // Health bar
            ctx.fillStyle = '#0f0'; ctx.fillRect(this.x - 10, this.y - 18, (this.health / this.maxHealth) * 20, 3);
        }
        takeDamage(dmg) {
            this.health -= dmg;
        }
        die() {
            // Particles?
        }
    },

    Tower: class {
        constructor(gx, gy, cfg) {
            this.gx = gx; this.gy = gy;
            this.x = gx * 40 + 20; this.y = gy * 40 + 20;
            this.range = cfg.range; this.damage = cfg.damage;
            this.color = cfg.color; this.type = cfg.type;
            this.lv = { speed: 1, power: 1, range: 1 };
            this.cooldown = 0;
            this.targetMode = 'first';
            this.isElite = false;
        }
        update() {
            if (this.cooldown > 0) this.cooldown--;
            if (this.cooldown <= 0) {
                const targets = SysDef.State.enemies.filter(e => Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2) < this.range);
                if (targets.length) {
                    let target = targets[0]; // Simple first targeting
                    this.fire(target);
                    let baseCd = (this.type === 'multi' ? 50 : 20);
                    if (this.isElite) baseCd *= 0.6;
                    this.cooldown = baseCd / (1 + this.lv.speed * 0.3);
                }
            }
        }
        fire(target) {
            let dmg = this.damage * this.lv.power;
            if (this.isElite) dmg *= 2.5;

            if (this.type === 'slow' && (this.lv.range >= 3 || this.isElite)) {
                // AOE Slow
                SysDef.State.enemies.forEach(e => {
                    if (Math.sqrt((e.x - this.x) ** 2 + (e.y - this.y) ** 2) < this.range) {
                        e.takeDamage(dmg);
                        e.slowed = this.isElite ? 120 : 60;
                    }
                });
                SysDef.State.pulses.push({ x: this.x, y: this.y, r: this.range, c: this.color, life: 1 });
            } else {
                SysDef.State.bullets.push(new SysDef.Bullet(this.x, this.y, target, dmg, this.color, this.type === 'slow', this.isElite));
            }
        }
        draw(ctx) {
            ctx.shadowBlur = this.isElite ? 15 : 0;
            ctx.shadowColor = this.color;
            ctx.strokeStyle = this.color; ctx.lineWidth = this.isElite ? 4 : 2;
            ctx.strokeRect(this.x - 12, this.y - 12, 24, 24);
            if (this.isElite) {
                ctx.strokeRect(this.x - 8, this.y - 8, 16, 16);
                ctx.fillStyle = this.color; ctx.globalAlpha = 0.3;
                ctx.fillRect(this.x - 12, this.y - 12, 24, 24); ctx.globalAlpha = 1;
            }
            if (SysDef.State.selectedPlacedTower === this) {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0,255,255,0.2)'; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
            }
            ctx.shadowBlur = 0;
        }
    },

    Bullet: class {
        constructor(x, y, target, dmg, color, isSlow, isElite) {
            this.x = x; this.y = y; this.target = target; this.dmg = dmg; this.color = color; this.isSlow = isSlow;
            this.isElite = isElite;
            this.speed = isElite ? 15 : 10;
        }
        update() {
            // Safety: If target dead or undefined, remove bullet
            if (!this.target || this.target.health <= 0) return true;

            const dx = this.target.x - this.x, dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.speed) {
                this.target.takeDamage(this.dmg);
                if (this.isSlow) this.target.slowed = this.isElite ? 120 : 60;
                // Text?
                return true;
            }
            this.x += (dx / dist) * this.speed; this.y += (dy / dist) * this.speed;
            return false;
        }
        draw(ctx) {
            ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.isElite ? 5 : 3, 0, Math.PI * 2); ctx.fill();
        }
    },

    // --- ACTIONS ---
    selectTower(type) {
        this.State.selectedTowerType = type;
        this.State.selectedPlacedTower = null;
        // Simple DOM update:
        document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('btn-' + type).classList.add('selected');
        this.updateUI();
    },

    updateUI() {
        const box = document.getElementById('upgradeBox');
        if (!this.State.selectedPlacedTower) { box.classList.add('hidden'); return; }

        box.classList.remove('hidden');
        const t = this.State.selectedPlacedTower;
        document.getElementById('towerInfo').innerText = (t.isElite ? "ELITE " : "") + `${t.type.toUpperCase()} LV.${Math.max(t.lv.speed, t.lv.power, t.lv.range)}`;

        this.updateBtn('upSpeed', 'THROUGHPUT', t.lv.speed);
        this.updateBtn('upPower', 'INTEGRITY', t.lv.power);
        this.updateBtn('upRange', 'COVERAGE', t.lv.range);

        const canPrestige = t.lv.speed >= 5 && t.lv.power >= 5 && t.lv.range >= 5 && !t.isElite;
        const pBtn = document.getElementById('prestigeBtn');
        pBtn.classList.toggle('hidden', !canPrestige);
    },

    updateBtn(id, label, lv) {
        const btn = document.getElementById(id);
        const cost = lv * 100;
        btn.innerHTML = lv >= 5 ? 'MAX' : `${label} ($${cost})`;
        btn.disabled = lv >= 5 || this.State.money < cost;
    },

    applyUpgrade(cat) {
        const t = this.State.selectedPlacedTower;
        const cost = t.lv[cat] * 100;
        if (this.State.money >= cost && t.lv[cat] < 5) {
            this.State.money -= cost;
            t.lv[cat]++;
            if (cat === 'range') t.range += 30;
            this.updateUI();
        }
    },

    prestigeTower() {
        const t = this.State.selectedPlacedTower;
        if (this.State.money >= 1000 && !t.isElite) {
            this.State.money -= 1000;
            t.isElite = true;
            t.range += 50;
            this.updateUI();
        }
    },

    useNuke() {
        if (this.State.money >= 500) {
            this.State.money -= 500;
            this.State.enemies.forEach(e => e.takeDamage(1000));
            this.State.pulses.push({ x: this.canvas.width / 2, y: this.canvas.height / 2, r: 1000, c: '#f00', life: 1 });
        }
    },

    sellSelected() {
        const t = this.State.selectedPlacedTower;
        if (t) {
            // Refund 70% of base cost
            const type = t.type;
            const refund = Math.floor(this.towerTypes[type].cost * 0.7);
            this.State.money += refund;

            // Remove from towers array
            this.State.towers = this.State.towers.filter(tower => tower !== t);

            // Particles/Effect?
            this.State.floatingTexts.push({ x: t.x, y: t.y, text: `+${refund}`, life: 1 });

            this.State.selectedPlacedTower = null;
            this.updateUI();
        }
    },

    triggerWave10Choice() {
        this.State.paused = true;
        document.getElementById('waveNotify').classList.remove('hidden');
    },

    continuePlaying() {
        this.State.paused = false;
        document.getElementById('waveNotify').classList.add('hidden');
    },

    finishGame() {
        document.getElementById('waveNotify').classList.add('hidden');
        this.endGame("THREAT ELIMINATED");
    },

    endGame(status) {
        this.State.running = false;
        this.saveGame();
        document.getElementById('endScreen').classList.remove('hidden');
        document.getElementById('controlPanel').classList.add('hidden');
        document.getElementById('endStatus').innerText = status;
        document.getElementById('finalScore').innerHTML = `WAVES SURVIVED: ${this.State.wave}<br>TOTAL PACKETS: ${this.State.meta.totalKills}`;
    },

    upgradeMeta(type) {
        if (type === 'startMoney' && this.State.meta.totalKills >= 100) {
            this.State.meta.totalKills -= 100;
            this.State.meta.startMoneyLv++;
        } else if (type === 'coreHealth' && this.State.meta.totalKills >= 150) {
            this.State.meta.totalKills -= 150;
            this.State.meta.coreHealthLv++;
        }
        this.saveGame();
    },

    resetGameUI() {
        this.startGame();
    },

    exitGame() {
        this.State.running = false;
        document.body.classList.remove('defense-mode');
        document.getElementById('defense-protocol').classList.add('hidden');
    }
};

// --- STATUS DOT EASTER EGG ---
let statusClicks = 0;
let hudInterval = null;

const statusDot = document.getElementById('status-dot');
if (statusDot) {
    statusDot.addEventListener('click', () => {
        statusClicks++;
        if (statusClicks >= 5) {
            const isOverdrive = document.body.classList.toggle('mecha-mode');
            const status = document.getElementById('system-status');
            if (status) status.innerText = isOverdrive ? "SYSTEM OVERDRIVE" : "SYSTEM ONLINE";

            if (isOverdrive) {
                startMechaHUD();
            } else {
                stopMechaHUD();
            }

            statusClicks = 0;
        }
    });
}

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

// --- GLOBAL AUTH UI INIT ---
function initAuth() {
    console.log("Auth Init...");
    const authBtn = document.getElementById('auth-btn');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');

    if (!authBtn || !userName || !userAvatar) return;

    if (!db) {
        authBtn.innerText = "DB ERROR";
        return;
    }

    const startLogin = async () => {
        try {
            const { error } = await db.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin + window.location.pathname }
            });
            if (error) throw error;
        } catch (e) {
            alert("Login Error: " + e.message);
        }
    };

    // Default to Login
    authBtn.onclick = startLogin;

    // Handle Session State
    db.auth.onAuthStateChange(async (event, session) => {
        const editFab = document.getElementById('edit-fab');

        if (session && session.user) {
            console.log("Auth: User Logged In", session.user.email);
            const user = session.user;

            // 1. User Mode: Allow Editing (Enforce Visuals)
            if (editFab) {
                editFab.classList.remove('hidden');
                editFab.style.display = 'flex'; // Failsafe
            }
            userName.innerText = user.user_metadata.full_name || "User";
            userAvatar.src = user.user_metadata.avatar_url || "";
            authBtn.innerText = "SIGN OUT";

            // 2. Load Cached User Data (if any) or Default
            try {
                const saved = localStorage.getItem('dashboardCategories');
                if (saved) categories = JSON.parse(saved);
            } catch (e) { }
            render();

            // Override Click for Logout
            authBtn.onclick = async () => {
                // Wait for any pending saves
                if (isSaving) {
                    authBtn.innerText = "SAVING...";
                    while (isSaving) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }

                authBtn.innerText = "LOGGING OUT...";
                try {
                    // 1. API SignOut with Timeout
                    const signOutPromise = db.auth.signOut();
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Timeout")), 3000)
                    );
                    await Promise.race([signOutPromise, timeoutPromise]);
                } catch (e) {
                    console.warn("SignOut forced locally:", e);
                } finally {
                    // 2. FORCE CLEAR Local Storage (Nuclear Option)
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('sb-')) localStorage.removeItem(key);
                    });
                    localStorage.removeItem('dashboardCategories');

                    // 3. Reload
                    window.location.reload();
                }
            };

            // Sync Shortcuts (Initial Load)
            setSyncStatus('syncing');
            try {
                const { data, error } = await db.from('user_profiles').select('shortcuts').eq('id', user.id).single();

                if (error && error.code === 'PGRST116') {
                    // User profile doesn't exist yet, create it
                    console.log('Creating new user profile...');
                    await db.from('user_profiles').insert({
                        id: user.id,
                        shortcuts: defaultCategories,
                        updated_at: new Date()
                    });
                    categories = JSON.parse(JSON.stringify(defaultCategories));
                    localStorage.setItem('dashboardCategories', JSON.stringify(categories));
                    render();
                    setSyncStatus('synced');
                } else if (data && data.shortcuts) {
                    categories = data.shortcuts;
                    localStorage.setItem('dashboardCategories', JSON.stringify(categories));
                    render();
                    setSyncStatus('synced');
                } else {
                    setSyncStatus('synced'); // No data yet, but connected
                }
            } catch (err) {
                console.error('Initial Sync Error:', err);
                setSyncStatus('offline');
            }

            // Realtime Sync (Live Updates)
            const channel = db.channel('custom-all-channel')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'user_profiles', filter: `id=eq.${user.id}` },
                    (payload) => {
                        console.log('Realtime Update:', payload);
                        if (payload.new && payload.new.shortcuts) {
                            categories = payload.new.shortcuts;
                            render();
                            document.body.classList.add('flash-update');
                            setTimeout(() => document.body.classList.remove('flash-update'), 500);
                        }
                    }
                )
                .subscribe();

        } else {
            // Reset to Guest
            userName.innerText = "GUEST";
            userAvatar.src = "";
            authBtn.innerText = "SIGN IN";
            authBtn.onclick = startLogin;
        }
    });
}

initAuth();
