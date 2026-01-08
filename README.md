# Project Homepage / Dashboard

A modern, highly responsive personal dashboard designed for efficiency and aesthetics. Built with **Vanilla HTML/CSS/JS** and powered by **Supabase** for real-time data persistence.

![Dashboard Preview](https://img.shields.io/badge/Status-Operational-success)

## ✨ Key Features

- **Personalized Experience**: Sign in securely with Google via Supabase Auth. Your profile and shortcuts travel with you across devices.
- **Dynamic Shortcuts**: Add, edit, and organize your favorite links effectively. Data is synced to the cloud instantly.
- **Adaptive Interface**: Fully responsive design that scales from desktop setups to mobile viewports.
  - *Fluid Grid*: Categories adjust automatically.
  - *Smart Navigation*: Optimized touch controls for mobile users.
- **Integrated Utilities**:
  - Live local weather updates.
  - Real-time digital clock with date tracking.
  - Fast search bar with Google integration.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Tailwind CSS (CDN), Vanilla JavaScript.
- **Backend / Auth**: Supabase (PostgreSQL, GoTrue Auth).
- **Icons**: Material Symbols & Google Fonts (Inter).

## 🚀 Setup & Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/homepage-new.git
    cd homepage-new
    ```
2.  **Configure Supabase**:
    -   Create a new project at [supabase.com](https://supabase.com).
    -   Enable **Google Auth** provider in the Authentication settings.
    -   Run the following SQL in your Supabase SQL Editor to set up the database:
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
3.  **Update API Keys**:
    -   Open `script.js`.
    -   Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project's credentials.
    -   Update `REDIRECT_URL` in your Supabase Auth settings to match your hosted URL (e.g., `https://your-site.com/` or `http://localhost:3000/`).

4.  **Run**:
    -   Simply open `index.html` in your browser. No build steps required.

---

> _"Protocol MK-01 is dormant but listening. The signal frequency is 5 Hz."_
