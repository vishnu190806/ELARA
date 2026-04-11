# Sky Event Alarm

## What This Is

An AI-powered sky event alarm web app for Indian users. It tracks NASA and ISRO events (ISS passes, meteor showers, eclipses, ISRO launches, planetary events) and uses AI to explain every event in plain language. It calculates a "tonight's sky score" based on local cloud cover, light pollution, and moon phase, and sends browser notifications before events happen. Built as a Progressive Web App (PWA).

## Core Value

Clear, contextual, and timely awareness of significant sky events, personalized for the user's location and explained with AI-driven plain language, accessible directly from the browser.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Interactive Dashboard: Tonight's sky score, upcoming events feed, and location selector
- [ ] Astronomical Data Integration: Track NASA events (ISS passes, meteor showers, eclipses, planetary events) and ISRO launches
- [ ] AI Explanations: Plain language context and best viewing tips for every event
- [ ] Sky Score Calculation: Algorithm combining cloud cover, light pollution, and moon phase based on user's location
- [ ] Notification System: Browser push notifications 30 minutes before selected events
- [ ] User Alert Settings: Preferences to choose which types of events trigger notifications
- [ ] ISRO Missions Hub: Dedicated tab for upcoming ISRO launches with AI context
- [ ] Progressive Web App (PWA): Installable on devices with offline support for cached events
- [ ] Minimalist Dark Theme: "Deep space" aesthetic, clean, modern (Vercel-like), high information clarity

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- [Telescope Control/Integration] — Focus is on naked-eye or basic binocular observation for the general public, not advanced amateur astronomy equipment.
- [Real-time Star Map/Planetarium View] — Requires complex WebGL/Canvas rendering that clutters the UI. Focus is on *events* rather than real-time positional tracking.
- [Community Forums/Social Features] — Current scope is personal utility and awareness. Social features add significant moderation and database overhead.
- [Mobile App (iOS/Android native)] — PWA fulfills the requirement for installability and push notifications without the overhead of app store deployment and native development.

## Context

- **Target Audience:** Indian users interested in space and astronomy, ranging from casual observers to enthusiasts who want plain-language explanations.
- **Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Firebase (Auth + Firestore + Hosting).
- **Data Sources:** NASA Open APIs, ISRO launch data APIs/scraping, weather/location APIs for sky score (cloud cover, light pollution, moon phase).
- **Design Inspiration:** Vercel's design language applied to space. Minimal UI, high signal-to-noise ratio, dark theme.

## Constraints

- **[Tech Stack]**: Next.js 14, TypeScript, Tailwind CSS, Firebase — Specified by the user; ensures modern, scalable, and type-safe development.
- **[Deployment]**: Firebase Hosting — Specified by the user; requires Next.js deployment configuration compatible with Firebase.
- **[Design]**: Minimalist Dark Theme ("Deep Space") — Specified by the user; prohibits cluttered, traditional astronomy app layouts. Needs to feel premium and clean.
- **[Platform]**: Progressive Web App (PWA) — Must meet PWA criteria (manifest, service worker, offline caching) to allow installation and reliable browser notifications.
- **[Performance]**: Must load quickly and function offline for cached events — Requirement for the PWA experience.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use standard Context API/Zustand for state | App is mostly dashboard/feed based, global state needs aren't exceptionally complex beyond user prefs and current location. | — Pending |
| AI Integration Approach | Use Gemini API for generating explanations dynamically or pre-generating them for known events to save costs and latency. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 after initialization*
