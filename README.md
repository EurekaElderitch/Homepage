# Arcade Dashboard & Firefox Cascade Theme

Dashboard utama yang menggabungkan estetika minimalis dengan fungsionalitas modern, lengkap dengan fitur tersembunyi "System Breach" dan sinkronisasi cloud.

## 🚀 Fitur Utama

### 1. Modern Dashboard
- **Aesthetic Minimalist**: Desain bersih dengan glassmorphism dan tipografi premium.
- **Dual Theme**: Mendukung Dark Mode (default) dan Light Mode yang nyaman di mata.
- **Clock & Weather**: Jam digital interaktif dan info cuaca real-time (Open-Meteo).
- **Personalization**: Foto profil dan nama yang disesuaikan secara otomatis.

### 2. Authentication & Data Persistence (Main Course)
- **Clerk Auth**: Login resmi via Google. Profil Anda (nama & avatar) otomatis tersinkronisasi.
- **Supabase Database**: Penyimpanan link shortcut yang persisten. Data Anda tersimpan aman di cloud, bukan lagi di browser.
- **Cross-Device Sync**: Akses dashboard Anda dari perangkat mana pun dengan data yang sama.

### 3. "Grid Eater" Easter Egg
- **System Breach Transitions**: Sekuens pembuka naratif ala hacker saat masuk ke game.
- **Arcade Gameplay**: Mini-game berburu data bits di dalam labirin cyber.
- **Optimized AI**: Musuh "Glitch" dengan logika pengejaran *Target-Tile* yang cerdas dan efisien.
- **Narrative Outro**: Sekuens pemulihan sistem setelah menang atau keluar dari grid.

### 4. Mecha Overdrive HUD
- **System Overdrive**: UI kokpit mecha pilot anime dengan status bar dinamis (Reactor, Heat, Sync Rate) yang muncul melalui trigger rahasia pada titik status.

## 🛠️ Cara Penggunaan & Setup

### Persiapan API Keys
Proyek ini membutuhkan API Keys agar fitur Auth dan Database berjalan:
1.  **Clerk**: Daftarkan aplikasi di [clerk.com](https://clerk.com/) dan ambil `Publishable Key`.
2.  **Supabase**: Buat project di [supabase.com](https://supabase.com/) dan ambil `URL` serta `Anon Public Key`.

### Sinkronisasi Database
Jalankan script SQL berikut di Editor Supabase Anda:
```sql
create table user_profiles (
  id text primary key,
  shortcuts jsonb default '[]'::jsonb,
  victory_hero boolean default false,
  updated_at timestamp with time zone default now()
);
alter table user_profiles enable row level security;
create policy "Allow all access" on user_profiles for all using (true) with check (true);
```

### Deployment
Dashboard ini bisa dijalankan langsung via file `index.html` atau di-host di layanan seperti **GitHub Pages**, **Vercel**, atau **Netlify**.

## 🎨 Teknologi
- **Core**: Vanilla HTML5, JavaScript (ES6+), CSS3
- **Styling**: Tailwind CSS (CDN)
- **Auth**: Clerk JS SDK
- **Database**: Supabase JS Client
- **Game Engine**: HTML5 Canvas
- **Icons**: Material Symbols Outlined (Google Fonts)

---
*Dibuat untuk para penjelajah grid yang mencari estetika dan fungsionalitas.* 👾🦾⚡
