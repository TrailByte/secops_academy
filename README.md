<div align="center">

# 🛡️ SecOps Academy

**Next-Generation Security Operations Training Platform**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)

*Empowering security professionals with hands-on training and interactive learning experiences*

[Features](#-features) • [Screenshots](#-screenshots) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start)

</div>

---

## 🌟 Overview

SecOps Academy is a modern, full-stack web application designed to provide comprehensive training for security operations professionals. Built with cutting-edge technologies, it offers an interactive learning environment for mastering security concepts, tools, and best practices.

### ✨ Features

- 🎯 **Interactive Learning Modules** - Hands-on labs and exercises
- 🔐 **Secure Authentication** - Passport.js-powered user management
- ⚡ **Real-time Updates** - WebSocket integration for live interactions
- 🎨 **Modern UI/UX** - Beautiful interface with TailwindCSS and Radix UI
- 📊 **Progress Tracking** - Monitor learning journey with detailed analytics
- 🌙 **Dark Mode Support** - Comfortable learning in any environment
- 📱 **Responsive Design** - Seamless experience across all devices

---

## 📸 Screenshots

<div align="center">

### Dashboard Overview
![Dashboard](.github/screenshots/dashboard.jpg)
*Track your progress with real-time statistics and quick access to training modules*

### Training Modules
![Training Modules](.github/screenshots/training-modules.jpg)
*Comprehensive curriculum from beginner to advanced malware analysis techniques*

</div>

---

## 🚀 Tech Stack

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

### 🔧 Core Technologies

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7 for lightning-fast development
- **Styling**: TailwindCSS 3.4 with custom theming
- **UI Components**: Radix UI primitives for accessibility
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state
- **Backend**: Express 5 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js (Local Strategy)
- **Real-time**: WebSocket (ws) for live features
- **Session Store**: PostgreSQL-backed sessions
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth transitions

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

---

## ⚡ Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/TrailByte/secops_academy.git
cd secops_academy
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/secops_academy

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this

# Application Configuration
NODE_ENV=development
PORT=3000

# WebSocket Configuration
WS_PORT=3001
```

### 4️⃣ Database Setup

```bash
# Push database schema
npm run db:push
```

### 5️⃣ Start Development Server

```bash
npm run dev
```

🎉 **Success!** Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build production-ready application |
| `npm start` | Run production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

---

## 📁 Project Structure

```
secops_academy/
├── 📂 client/          # React frontend application
│   ├── src/
│   ├── components/
│   └── ...
├── 📂 server/          # Express backend server
│   ├── routes/
│   ├── middleware/
│   └── index.ts
├── 📂 shared/          # Shared types and utilities
│   ├── types/
│   └── utils/
├── 📂 script/          # Build and utility scripts
├── 📄 drizzle.config.ts    # Database ORM configuration
├── 📄 vite.config.ts       # Vite build configuration
├── 📄 tailwind.config.ts   # TailwindCSS configuration
└── 📄 package.json         # Project dependencies
```

---

## 🔒 Security Features

- 🔐 **Secure Authentication** - Password hashing with industry-standard algorithms
- 🛡️ **Session Management** - PostgreSQL-backed sessions for enhanced security
- 🚫 **CSRF Protection** - Built-in protection against cross-site attacks
- ✅ **Input Validation** - Zod schema validation on all user inputs
- 🔑 **Environment Variables** - Sensitive data stored securely

---

## 🎨 UI Components

Built with **Radix UI** primitives for maximum accessibility:

- Accordion, Alert Dialog, Avatar
- Checkbox, Dialog, Dropdown Menu
- Navigation Menu, Popover, Progress
- Select, Slider, Tabs, Toast
- And many more...

All styled with **TailwindCSS** and customizable through theme configuration.

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push to the branch (`git push origin feature/AmazingFeature`)
5. 🔃 Open a Pull Request

### Development Guidelines

- Write clean, maintainable TypeScript code
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass before submitting PR

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ by the TrailByte team
- Powered by amazing open-source projects
- Special thanks to all contributors

---

<div align="center">

### 💡 Questions or Issues?

[Open an Issue](https://github.com/TrailByte/secops_academy/issues) • [Discussions](https://github.com/TrailByte/secops_academy/discussions)

**Made with ☕ and 🛡️ by security professionals, for security professionals**

⭐ **Star this repo if you find it useful!** ⭐

</div>
