# 🌌 ELARA: The Ultimate Sky Event Companion

**ELARA** is a premium, real-time Progressive Web Application (PWA) designed for celestial observation, satellite tracking, and space launch awareness, specifically optimized for the Indian night sky.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue?style=flat-square)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://elara-livid.vercel.app)
[![PWA](https://img.shields.io/badge/PWA-Ready-green?style=flat-square)](https://web.dev/progressive-web-apps/)

---

## ✨ Features

- **🔭 Smart Sky Score**: A real-time observability metric calculated from cloud cover, light pollution, and moon illumination.
- **🛰️ Live ISS Tracking**: High-fidelity 3D Globe and 2D Mission Control views for the International Space Station, using SGP4 orbital propagation.
- **🌠 Event Enhancer**: Astronomical events and rocket launches from NASA and Space Devs, enriched with Google Gemini AI explanations.
- **📦 Multi-Source Resiliency**: Orbital TLE data fetched from 4+ sources with a Firestore caching layer for maximum availability.
- **📱 PWA First**: Installable on iOS/Android with offline visibility and instant push notifications for rare celestial events.

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Visualization**: Three.js (3D Earth), HTML5 Canvas (Zenith Sky Map)
- **Backend**: Firebase (Firestore, Auth, FCM)
- **Logic**: SGP4 Orbit Propagation, Custom Sun/Moon Algorithm
- **AI**: Google Generative AI (Gemini 1.5 Flash)

---

## 🛠️ Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/vishnu190806/ELARA.git
cd ELARA
npm install --legacy-peer-deps
```

> [!CAUTION]
> ⚠️ **Warning**: Always use `--legacy-peer-deps`. Standard `npm install` will fail due to peer dependency conflicts between `react-globe.gl` and Next.js 14.

### 2. Environment Variables
Create a `.env.local` file with the variables listed in the [Master Documentation](docs/ELARA_MASTER_DOC.md#2-environment-configuration).

### 3. Verify Build & Run
```bash
npm run build
npm run dev
```

---

## 📖 Documentation

For a deep-dive into the architecture, detailed file analysis, and database schema, please refer to the **[ELARA Master Documentation](docs/ELARA_MASTER_DOC.md)**.

### Available Docs:
- 🗺️ **[Master Document (Markdown)](docs/ELARA_MASTER_DOC.md)**: Includes all architecture and flow diagrams.
- 📄 **[Master Document (Text)](docs/ELARA_MASTER_DOC.txt)**: Plain text version for portability.

---

## 📜 Project Origins

Created by **Vishnu** for the Space Apps Challenge / College Project. ELARA combines high-end 3D graphics with practical utility for amateur astronomers in India.

**Live Project**: [elara-livid.vercel.app](https://elara-livid.vercel.app)
