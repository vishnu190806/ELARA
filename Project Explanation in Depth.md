# ELARA: Project Explanation in Depth

## 🌌 Overview
**Elara** is a high-performance, real-time Progressive Web Application (PWA) designed for space enthusiasts in India. It synchronizes planetary data, orbital mechanics, and local atmospheric conditions to provide a "Sky Score"—a metric for observational quality—and real-time tracking of the International Space Station (ISS) and other celestial events.

---

## 🏗️ Architecture
Elara is built on the **Next.js 14** framework, utilizing the **App Router** for optimized routing and layout management.

### 🌓 Frontend vs. Backend
- **Client Side (React)**: Handles 3D visualizations (Globe), Canvas-based Sky Map, and user interaction. Uses **Framer Motion** for premium animations.
- **Server Side (Next.js API Routes)**: Orchestrates data fetching from multiple external APIs (NASA, Space Devs, Celestrak), manages caching in **Firebase**, and runs background cron jobs for notification triggers.

---

## 📂 Logic Deep-Dive: File by File

### 📡 Core Services (`src/lib`)

#### 1. `skyScore.ts`
The heart of the visibility calculation. It evaluates three primary metrics:
- **Cloud Cover (40%)**: Fetched via weather APIs (OpenWeatherMap fallback).
- **Light Pollution (35%)**: Hardcoded or retrieved per city coordinate.
- **Moon Brightness (25%)**: Calculated dynamically using astronomical formulas.
**Formula**: `rawScore = 10 - (cloudCover * 0.4 + lightPollution * 0.35 + moonBrightness * 0.25) / 10`.

#### 2. `astronomy.ts`
Calculates the **Moon Illumination Percentage**. It converts the current Date to **Julian Date** and applies a synodic month calculation (approx. 29.53 days) to determine the phase of the moon.

#### 3. `tleFetcher.ts`
A resilient orbital data engine. It attempts to fetch Two-Line Element sets (TLE) for the ISS from 4 different sources:
1. `wheretheiss.at`
2. `ivanstanojevic.me`
3. `celestrak.org (GP)`
4. `celestrak.org (Satcat)`
It includes a **Firestore caching layer** (2-hour TTL) to prevent API rate limiting and ensure high availability.

#### 4. `explanationService.ts`
Uses the **Gemini 1.5 Flash** model to generate human-readable, 2-sentence summaries for complex astronomical events fetched from raw API data. This data is cached in Firestore to optimize cost and performance.

---

### 🌐 UI Components (`src/components`)

#### 1. `EarthGlobe.tsx`
A high-performance 3D visualization.
- **Orbit Projection**: Uses real-time TLE data to project the ISS orbit as a path around the Earth.
- **Markers**: Dynamically places markers for the User's location and the ISS position.
- **Visuals**: Uses custom atmospheric shaders for a "premium" space glow.

#### 2. `SkyMap.tsx`
A 2D Canvas-based star field generator.
- **Performance**: Draws 1,000+ stars using pure Canvas API instead of DOM elements, ensuring 60fps performance even on mobile.
- **Constellations**: Renders major constellation lines based on astronomical coordinate data.

#### 3. `ISSTracker.tsx`
Provides a tactical 2D "Mission Control" view. It updates position and velocity metrics in real-time, pulling from specialized `/api/iss-position` endpoints.

---

### ⚡ API Routes (`src/app/api`)

- **`/api/events`**: Aggregates launches and astronomical events. Integrates mapping to enhance raw titles with AI-generated descriptions.
- **`/api/notifications/subscribe`**: Stores Firebase Cloud Messaging (FCM) tokens in Firestore for push notifications.
- **`/api/cron/*`**: Automated tasks that run on a schedule to:
    - Refresh TLE data.
    - Detect highly visible events and send push notifications to users in specific regions.

---

### 📦 Environment & Infrastructure
- **Firebase Admin SDK**: Used for secure server-side database access and notification delivery.
- **Firebase Client SDK**: Handles anonymous authentication and frontend messaging.
- **Vercel**: Deployment platform with edge-ready API routes.

---

## 🔒 Security & Optimization
- **API Caching**: All high-latency external requests are wrapped in an `api-cache` utility to minimize redundant network traffic.
- **PWA Optimization**: Implements service workers for "Home Screen" installation and offline "View Only" modes.
- **SEO**: Dynamic metadata generation for every event page based on the event's name and AI description.

---
*Document produced as part of the ELARA v1.0 Final Release.*
