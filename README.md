<div align="center">

# SecOps Academy

**Next-Generation Security Operations Training Platform**

[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)

*Helping security professionals with hands-on training and interactive learning experiences*

[Features](#features) • [Screenshots](#screenshots) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start)

</div>

---

## Overview

SecOps Academy is a modern web application designed to provide training for security professionals. It offers an interactive learning environment for mastering security concepts, tools, and best practices. For now it support basic Malware Analysis concepts.

### Features

- **Interactive Learning Modules** - Hands-on labs and exercises
- **Progress Tracking** - Monitor learning journey with detailed analytics
- **Dark Mode Support** - Comfortable learning in any environment

---

## Screenshots

<div align="center">

### Dashboard Overview
<img src="https://raw.githubusercontent.com/TrailByte/secops_academy/main/.github/screenshots/dashboard.jpg" alt="Dashboard" width="800"/>

*Track your progress with real-time statistics and quick access to training modules*

### Training Modules
<img src="https://raw.githubusercontent.com/TrailByte/secops_academy/main/.github/screenshots/training-modules.jpg" alt="Training Modules" width="800"/>

*Curriculum from beginner to advanced malware analysis techniques*

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
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Drizzle](https://img.shields.io/badge/Drizzle_ORM-0.39-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)

</div>

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/TrailByte/secops_academy.git
cd secops_academy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/secops_academy
PORT=5000
POSTGRES_DB=secops_academy
POSTGRES_USER=username
POSTGRES_PASSWORD=password
```

### 4. Database Setup

```bash
# Push database schema
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

**Success!** Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build production-ready application |
| `npm start` | Run production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

---

## Project Structure

```
secops_academy/
├── client/          # React frontend application
│   ├── src/
│   ├── components/
│   └── ...
├── server/          # Express backend server
│   ├── routes/
│   ├── middleware/
│   └── index.ts
├── shared/          # Shared types and utilities
│   ├── types/
│   └── utils/
├── script/          # Build and utility scripts
├── drizzle.config.ts    # Database ORM configuration
├── vite.config.ts       # Vite build configuration
├── tailwind.config.ts   # TailwindCSS configuration
└── package.json         # Project dependencies
```

## License

This project is licensed under the **GNU General Public License v3.0** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Questions or Issues?

[Open an Issue](https://github.com/TrailByte/secops_academy/issues) • [Discussions](https://github.com/TrailByte/secops_academy/discussions)

</div>
