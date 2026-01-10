// Spotify Vinyl Widget - Hybrid Logic
// Guest: LocalStorage | User: Supabase

const DEFAULT_TRACK = "4cOdK2wGLETKBW3PvgPWqT"; // Initial Track (Rick Roll? No, "Never Gonna Give You Up" is 4cOd..., let's use something LoFi)
// Actually let's use a cool LoFi track: "Code LoFi" - generic ID
const FALLBACK_TRACK = "5DAca2oQ17cWc8q2A8yAeb"; // Example Track (lofi hip hop)

const DUMMY_LIBRARY = {
    "lofi": "5DAca2oQ17cWc8q2A8yAeb",
    "rick": "4cOdK2wGLETKBW3PvgPWqT",
    "rock": "08mG3Y1vljYA6bvDtLLk15", // Queen - We Will Rock You
    "anime": "3k3NWjySp5LAlhC99IiZl3", // Naruto - Blue Bird
    "jazz": "1YQCdJdu721OzXzDT1i195", // Jazz standard
    "pop": "60nZcImufyMA1KT4eoro2W" // Joji - Die For You
};

const VinylWidget = {
    state: {
        isLoggedIn: false,
        trackId: FALLBACK_TRACK,
        accessToken: null,
    },

    init() {
        console.log("Vinyl Widget Initializing...");
        this.render();
        this.checkAuth();

        // Input Listener - Scoped to Widget
        // Use timeout to ensure DOM is ready if needed, though render is sync.
        setTimeout(() => {
            const input = document.querySelector('.vinyl-search-input');
            if (input) {
                console.log("Vinyl: Search Listener Attached");
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        console.log("Vinyl: Enter pressed", e.target.value);
                        this.handleSearch(e.target.value);
                    }
                });
            } else {
                console.error("Vinyl: Search Input NOT found");
            }
        }, 100);
    },

    render() {
        const container = document.createElement('div');
        container.className = 'vinyl-widget';
        // Note: Panel is now integrated next to disc
        container.innerHTML = `
            <div class="vinyl-disc spinning" id="vinylDisc"></div>
            
            <div class="vinyl-panel">
                <div class="panel-content">
                    <div class="guest-msg" id="guestMsg">Login to Search</div>
                    
                    <div class="search-container logged-in" id="searchBox" style="display:none;">
                        <input type="text" class="vinyl-search-input" placeholder="Search track...">
                    </div>
                    
                    <div class="spotify-embed-container">
                        <iframe id="spotifyFrame" src="https://open.spotify.com/embed/track/${this.state.trackId}?utm_source=generator&theme=0" 
                            allow="encrypted-media; clipboard-write; picture-in-picture" 
                            loading="lazy"></iframe>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);

        // Remove old style check auth immediately after render
        this.checkAuth();
    },

    async checkAuth() {
        // Assume 'db' is the global Supabase client from script.js
        if (typeof db === 'undefined') {
            console.warn("Supabase client not found. Running in Offline Mode.");
            this.loadLocal();
            return;
        }

        const { data: { session } } = await db.auth.getSession();
        if (session && session.user) {
            this.state.isLoggedIn = true;
            this.setupUserMode(session.user);
        } else {
            this.setupGuestMode();
        }
    },

    setupGuestMode() {
        console.log("Vinyl: Guest Mode");
        const sBox = document.getElementById('searchBox');
        const gMsg = document.getElementById('guestMsg');
        if (sBox) sBox.style.display = 'none';
        if (gMsg) gMsg.style.display = 'block';

        // Load from LocalStorage
        const localTrack = localStorage.getItem('vinyl_last_track');
        if (localTrack) {
            this.updatePlayer(localTrack, false); // Don't save to DB
        }
    },

    async setupUserMode(user) {
        console.log("Vinyl: User Mode");
        const sBox = document.getElementById('searchBox');
        const gMsg = document.getElementById('guestMsg');
        if (sBox) sBox.style.display = 'block';
        if (gMsg) gMsg.style.display = 'none';

        // Load from DB Profile
        try {
            const { data, error } = await db
                .from('user_profiles')
                .select('last_played_track')
                .eq('id', user.id)
                .single();

            if (data && data.last_played_track) {
                this.updatePlayer(data.last_played_track, false);
            } else {
                // If DB empty, check local or keep default. 
                // Don't auto-push local to DB to avoid overwriting cloud with stale local data immediately
            }
        } catch (e) {
            console.error("Vinyl: DB Load Error", e);
        }
    },

    async handleSearch(query) {
        if (!this.state.isLoggedIn) return; // Guard

        try {
            // 1. Get Keys from Secure Table
            const { data, error } = await db
                .from('api_secrets')
                .select('key_value, secret_value')
                .eq('service', 'spotify')
                .single();

            if (error || !data) {
                console.warn("Vinyl: Keys missing. Using Dummy Mode.");
                const dummyId = DUMMY_LIBRARY[query.toLowerCase()];
                if (dummyId) {
                    this.updatePlayer(dummyId, true);
                    return;
                } else {
                    alert("DUMMY MODE ACTIVE: Keys not found.\nTry searching: 'lofi', 'rock', 'anime', 'jazz', 'rick'");
                    return;
                }
            }

            const clientId = data.key_value;
            const clientSecret = data.secret_value;

            // 2. Auth to Spotify
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                },
                body: 'grant_type=client_credentials'
            });
            const tokenData = await tokenRes.json();
            const token = tokenData.access_token;

            // 3. Search
            const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const searchData = await searchRes.json();

            if (searchData.tracks.items.length > 0) {
                const track = searchData.tracks.items[0];
                this.updatePlayer(track.id, true);
            } else {
                alert("Track not found!");
            }

        } catch (e) {
            console.error("Search Failed:", e);
        }
    },

    updatePlayer(trackId, saveToStorage = true) {
        this.state.trackId = trackId;
        const frame = document.getElementById('spotifyFrame');
        frame.src = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;

        // Animate
        const disc = document.getElementById('vinylDisc');
        disc.classList.remove('spinning');
        void disc.offsetWidth; // Trigger reflow
        disc.classList.add('spinning');

        if (saveToStorage) {
            // Hybrid Save
            if (this.state.isLoggedIn) {
                this.saveToDB(trackId);
            } else {
                localStorage.setItem('vinyl_last_track', trackId);
            }
        }
    },

    async saveToDB(trackId) {
        const { data: { session } } = await db.auth.getSession();
        if (session && session.user) {
            await db.from('user_profiles').upsert({
                id: session.user.id,
                last_played_track: trackId,
                updated_at: new Date()
            });
        }
    }
};

// Auto-init on load
window.addEventListener('DOMContentLoaded', () => {
    // Wait slightly for main script DB init
    setTimeout(() => VinylWidget.init(), 1000);
});
