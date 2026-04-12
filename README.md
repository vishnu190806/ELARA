# 🌌 ELARA: The Ultimate Sky Event Companion

**Elara** is a premium, real-time Progressive Web Application (PWA) designed for celestial observation and orbital tracking, specifically optimized for the Indian night sky.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-blue?style=flat-square)](https://ai.google.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green?style=flat-square)](https://web.dev/progressive-web-apps/)

---

## ✨ Features

- **🔭 Smart Sky Score**: A real-time observability metric calculated from cloud cover, light pollution, and moon illumination.
- **🛰️ Live ISS Tracking**: High-fidelity 3D Globe and 2D Mission Control views for the International Space Station, using SGP4 orbital propagation.
- **🌠 Event Enhancer**: Astronomical events and rocket launches from NASA and Space Devs, enriched with AI-generated human-readable explanations.
- **📦 Multi-Source Resiliency**: Orbital TLE data fetched from 4+ sources with a Firestore caching layer for maximum availability.
- **📱 PWA First**: Installable on iOS/Android with offline visibility and instant push notifications for rare celestial events.

---

## 🚀 Tech Stack

- **Core**: Next.js 14 (App Router), TypeScript.
- **Styling**: Tailwind CSS, Framer Motion (for fluid animations).
- **Visualization**: Three.js (3D Globe), HTML5 Canvas (2D Sky Map).
- **Backend/Storage**: Firebase (Firestore, Auth, Cloud Messaging).
- **AI**: Google Gemini 1.5 Flash via AI SDK.

---

## 🛠️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vishnu190806/ELARA.git
   cd ELARA
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file with the following keys:
   ```env
   FIREBASE_PROJECT_ID=your-id
   FIREBASE_CLIENT_EMAIL=your-email
   FIREBASE_PRIVATE_KEY="your-key"
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   GEMINI_API_KEY=your-gemini-key
   ```

4. **Run in Development**:
   ```bash
   npm run dev
   ```

---

## 📖 In-Depth Analysis

For a line-by-line logical analysis of the codebase, refer to the local `Project Explanation in Depth.md` file (generated for local reference).

---

## 📜 License

Created by **Vishnu** for the Space Apps Challenge / College Project. See the repository for full contribution details.
