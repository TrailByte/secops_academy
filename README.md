<div align="center">

# SecOps Academy

**Next-Generation Security Operations Training Platform**

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

*Helping security professionals with hands-on training and interactive learning experiences*

[Features](#features) • [Screenshots](#screenshots) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start)

</div>

---

## Overview

SecOps Academy is a self-contained web platform for hands-on cybersecurity training. It combines theory modules, knowledge-check quizzes, and CTF-style challenges into structured learning paths, with progress tracking and a rank system.

Two learning paths ship with the platform:

| Path | Focus |
|---|---|
| **Malware Analysis** | Static PE analysis, dynamic sandbox behaviour, process injection, C2 communication, anti-analysis evasion |
| **Android Security** | Application sandbox and UID isolation, permissions, secure IPC, data protection and Keystore, SELinux, Verified Boot |

---

## Features

**Learning paths and modules**
Markdown-authored theory modules with diagrams, grouped into ordered learning paths. Each module ends with a knowledge check.

**CTF challenges**
Flag-submission challenges tied to each learning path. Challenges can ship a downloadable artifact - for example an Android APK for static analysis with `unzip`, `apktool`, or `jadx`. Progressive hints are available without penalty.

**Mascot narration (accessibility)**
Every module has a *Listen* control. An animated mascot narrates the content aloud using a local neural text-to-speech engine (Piper), cycling through expressions while it speaks. Runs entirely offline - no external API, no key required.

**Authentication and progress**
Email/password accounts with scrypt hashing and Postgres-backed sessions. Guests can browse and attempt challenges, but only registered users have progress persisted. Completing modules and capturing flags earns XP across seven security-analyst ranks.

**Admin content management**
A full CMS built into the app, gated by an admin role:
- Learning paths - create, edit, reorder
- Modules - metadata, Markdown content, and a visual quiz builder for nested questions
- Challenges - flags, hints, artifacts, and file uploads

**Interface**
Dark terminal aesthetic with per-path theming, CRT scanline and grain effects, and per-path mascots.

---

## Screenshots

<div align="center">

### Introduction
<img src="https://raw.githubusercontent.com/TrailByte/secops_academy/main/.github/screenshots/introduction.png" alt="Introduction" width="800"/>

*Introductory Page*

### Learning Paths
<img src="https://raw.githubusercontent.com/TrailByte/secops_academy/main/.github/screenshots/LearningPaths.png" alt="Learning Paths" width="800"/>

*Curriculum from beginner to advanced users*

### User Dashboard
<img src="https://raw.githubusercontent.com/TrailByte/secops_academy/main/.github/screenshots/dashboard.png" alt="Dashboard" width="800"/>

*Track your progress with real-time statistics and quick access to training modules*

</div>

---

## Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### Backend
![Express](https://img.shields.io/badge/Express-5.0-000000?style=for-the-badge&logo=express&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-0.39-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

### Infrastructure
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Piper](https://img.shields.io/badge/Piper-Neural_TTS-8A2BE2?style=for-the-badge)

</div>

Routing with Wouter, server state with TanStack Query, auth with Passport (local strategy), sessions via `connect-pg-simple`, uploads via Multer, and text-to-speech via Piper (ONNX/VITS voice models running on CPU).

---

## Quick Start

### Option A - Docker (recommended)

The only requirement is Docker. The image bundles the app, its dependencies, and the TTS voice models; Compose provisions PostgreSQL, applies the schema, and seeds all content on first start.

```bash
git clone https://github.com/TrailByte/secops_academy.git
cd secops_academy
```

Create a `.env` file in the project root:

```env
SESSION_SECRET=<generate with: openssl rand -hex 32>
ADMIN_EMAIL=you@example.com
```

Start the stack:

```bash
docker compose -f docker-compose.prod.yml up -d
```

Open [http://localhost:5000](http://localhost:5000), register with the address set in `ADMIN_EMAIL`, then restart the app container once to apply admin rights:

```bash
docker compose -f docker-compose.prod.yml restart app
```

A step-by-step walkthrough - including Windows instructions and troubleshooting - is available in [DEPLOYMENT.md](DEPLOYMENT.md).

### Option B - Local development

**Prerequisites:** Node.js 20+, PostgreSQL 14+, and (for narration) Python 3 with `piper-tts`.

```bash
git clone https://github.com/TrailByte/secops_academy.git
cd secops_academy
npm install
```

Create a `.env` file:

```env
DATABASE_URL=postgresql://secops:secops@localhost:5432/secops
SESSION_SECRET=<generate with: openssl rand -hex 32>
PIPER_VOICES_DIR=/absolute/path/to/piper-voices
PORT=5000
```

Apply the schema and seed content:

```bash
npm run db:push

npx tsx script/seed-learning-paths.ts
npx tsx script/seed-malware-analysis.ts
npx tsx script/seed-android-security-model.ts
npx tsx script/seed-android-challenges.ts
npx tsx script/seed-android-apk-challenges.ts
```

Start the dev server:

```bash
npm run dev
```

Grant yourself admin rights:

```bash
psql $DATABASE_URL -c "UPDATE users SET is_admin = true WHERE email = 'you@example.com';"
```

<details>
<summary><strong>Setting up Piper voices for local development</strong></summary>

Narration requires two voice models. Install Piper and download them:

```bash
pip install piper-tts --break-system-packages

mkdir -p ~/piper-voices && cd ~/piper-voices

# Android Security path
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx.json

# Malware Analysis path
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx
wget https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx.json
```

Point `PIPER_VOICES_DIR` at that directory. The Docker image ships these models already, so this step is only needed for local runs.

</details>

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret used to sign session cookies |
| `PIPER_VOICES_DIR` | For narration | Directory holding the `.onnx` voice models |
| `ADMIN_EMAIL` | No | Docker only - promotes this account to admin at startup |
| `COOKIE_SECURE` | No | Set to `true` when serving over HTTPS |
| `PORT` | No | Defaults to `5000` |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build production-ready application |
| `npm start` | Run production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

Content seed scripts live in `script/` and are safe to re-run - each clears its own records before inserting.

---

## Project Structure

```
secops_academy/
├── client/                 # React frontend
│   ├── public/
│   │   ├── images/         # Mascots, module diagrams
│   │   └── files/          # Challenge artifacts (e.g. APKs)
│   └── src/
│       ├── components/     # Layout, MascotNarrator, UI primitives
│       ├── hooks/          # Data fetching and mutations
│       ├── lib/            # Ranks, TTS text preparation
│       └── pages/          # Routes, including the admin panel
├── server/                 # Express backend
│   ├── auth.ts             # Passport strategy, password hashing, guards
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data access layer
│   ├── tts.ts              # Piper text-to-speech integration
│   └── upload.ts           # Multer file uploads
├── shared/                 # Schema and route contracts shared by both sides
├── script/                 # Build and content seed scripts
├── Dockerfile
├── docker-compose.prod.yml
├── docker-entrypoint.sh    # Waits for DB, migrates, seeds, starts
└── DEPLOYMENT.md           # End-user deployment guide
```

---

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Issues?

[Open an Issue](https://github.com/TrailByte/secops_academy/issues)

</div>