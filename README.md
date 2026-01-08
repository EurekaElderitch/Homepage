# Arcade Dashboard & Firefox Cascade Theme

Dashboard utama yang menggabungkan estetika minimalis dengan fungsionalitas modern, lengkap dengan sinkronisasi cloud yang tangguh.

## 🚀 Fitur Utama

### 1. Modern Dashboard
- **Aesthetic Minimalist**: Desain bersih dengan glassmorphism dan tipografi premium.
- **Dual Theme**: Mendukung Dark Mode (default) dan Light Mode yang nyaman di mata.
- **Clock & Weather**: Jam digital interaktif dan info cuaca real-time (Open-Meteo).
- **Personalization**: Foto profil dan nama yang disesuaikan secara otomatis.

### 2. Authentication & Data Persistence
- **Clerk Auth**: Login resmi via Google. Profil Anda (nama & avatar) otomatis tersinkronisasi.
- **Supabase Database**: Penyimpanan link shortcut yang persisten di cloud.
- **Cross-Device Sync**: Akses dashboard Anda dari perangkat mana pun dengan data yang sama.

### 3. [CLASSIFIED] 📂
*"Ada kebocoran di dalam grid. Ketikkan rasa lapar yang menghantui sistem untuk memulai pembersihan. Waspadalah terhadap protokol Glitch yang bersembunyi di dalam labirin."*

### 4. Neural Link Synchronization 📡
*"Status hanyalah topeng. Lima ketukan pada titik pusat akan membuka pandangan sang pilot. Sinkronisasi dimulai sekarang."*

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

---
*Dibuat untuk para penjelajah grid yang mencari estetika dan fungsionalitas.* 👾🦾⚡
