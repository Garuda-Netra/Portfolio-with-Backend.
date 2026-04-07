# Cybersecurity Portfolio Platform

This project is more than a static portfolio. It combines a polished frontend experience with an admin dashboard and an Express + MongoDB backend so content can be managed dynamically.

For visitors, the site feels interactive and story-driven (terminal UI, CTF flavor, smooth section animations, and theme switching). For the owner, it stays practical: profile, projects, certifications, and settings can be updated from the admin panel instead of hardcoding every change.

## What You Get

- Interactive terminal experience with command history, autocomplete, and animated output
- Rich landing sections (Hero, About, Skills, Projects, Training, Certifications, Contact, and more)
- Admin panel for managing content, settings, profile data, socials, and blog-style updates
- Express + MongoDB backend for dynamic data
- Light/dark theme support and extra polish features (loading flow, reveal animations, CTF flavor)

## Tech Stack

- Frontend: TypeScript + Vite + Tailwind CSS + vanilla DOM utilities
- Backend: Express + TypeScript + MongoDB (Mongoose)
- Media: Cloudinary (optional but recommended for uploads)

## Quick Start

### 1) Install dependencies

```bash
npm install
cd server && npm install
```

### 2) Add environment variables

Create a root .env file :

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret

# Optional but useful in local dev
ALLOWED_ORIGIN=http://localhost:3000
CLIENT_DEV_URL=http://localhost:3000
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1

# Optional (needed for image/file uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3) Run the app

From project root:

```bash
npm run dev
```

This starts both frontend and backend.

- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/api/health
- Admin login page: http://localhost:3000/admin/index.html

## Scripts

Root scripts:

- npm run dev -> run client + server together
- npm run dev:client -> Vite only
- npm run dev:server -> backend only
- npm run build -> build frontend bundle
- npm run preview -> preview frontend build

Server scripts (inside server/):

- npm run dev -> run backend with ts-node
- npm run build -> compile backend TypeScript
- npm run start -> run compiled backend from dist/

## Folder Overview

```text
PORTFo.lio/
  src/                 # Frontend app code
    components/
    sections/
    styles/
    terminal/
    utils/
  admin/               # Admin UI assets and logic
  server/              # Express + MongoDB backend
    routes/
    controllers/
    models/
  public/              # Static assets
```

## Terminal Commands (inside portfolio terminal)

Some built-in commands include:

- help
- whoami
- about
- skills
- projects
- contact
- experience
- certifications
- education
- socials
- neofetch
- banner
- date
- matrix
- ctf
- secret
- clear

## CTF Flags

This portfolio includes a built-in mini CTF with 4 hidden flags.

- Flag format: FLAG{some_text_here}
- Difficulty: Easy to Medium
- Start in terminal with: ctf

A
Useful CTF commands:

- ctf --status
- ctf --hint 1
- ctf --hint 2
- ctf --hint 3
- ctf --hint 4
- ctf --flag FLAG{your_discovered_flag}
- ctf --rules


ll flags (spoiler):

1. FLAG{prince_security_breach_2026}
2. FLAG{console_hacker_2026}
3. FLAG{hidden_in_the_shadows_2026}
4. FLAG{base64_master_2026}

## Common Setup Issues

### MongoDB SRV DNS errors

If you see SRV lookup failures, set:

```env
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
```

and restart the server.

### API 404s in browser console

If routes were changed recently, stop old dev processes and run npm run dev again from root so both client and server are on fresh code.

### Uploads not working

Cloudinary keys are required for upload features. Without them, upload-related endpoints may be limited.

## Final Notes

- Update metadata in index.html (canonical URL, OG image, and social URLs) before production deploy.
- Keep secrets in .env only; never commit them.
- If you are customizing the visual style, start with src/styles/globals.css and src/styles/premium-sections.css.
