# Indian Sky Event Alarm

## What This Is

An AI-powered sky event alarm web app for Indian users that tracks NASA and ISRO events. It provides a personalized "tonight's sky score" based on location, explains events using AI, and sends browser notifications before events occur. Built as a PWA for offline support.

## Core Value

Timely, accurate, and easily understandable alerts for space events, specifically tailored to users in India, taking into account local viewing conditions.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Implement The Space Devs API for ISRO/rocket launch data with fallback manual curation in Firestore for Gaganyaan.
- [ ] Integrate NASA Open APIs for general space events (ISS passes, eclipses, etc.).
- [ ] AI Event Explanations pre-generated via Gemini API and cached in Firestore (triggered on new event ingest).
- [ ] AI on-the-fly personalized viewing tips (e.g., specific directions based on location).
- [ ] Sky Score calculation (40% Cloud cover via Open-Meteo, 35% Light pollution from static Firestore lookup, 25% Moon phase via Astronomia JS). Integer 1-10.
- [ ] Home dashboard with tonight's sky score, upcoming events feed, and location selector.
- [ ] Event detail page with AI explanation, best viewing tips, and a countdown timer.
- [ ] PWA setup (installable, offline caching).
- [ ] Notification settings/preferences (choose which events to get notified about).
- [ ] Firebase Cloud Messaging for notifications (focused on Android + Desktop Chrome 30 minutes before an event). Warning banner on iOS to "Add to Home Screen".
- [ ] Deep space dark aesthetic, minimal and clean design ("Vercel design language but for space").

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- live tracking maps or complex astronomy star maps — would make the UI too cluttered. The design must be clean and modern.
- scraping the ISRO site for live data — fragile and prone to breaking. Using The Space Devs API instead.
- iOS push notifications without PWA — iOS Safari notification support is limited, so we handle it uniquely with an Add to Home Screen banner.

## Context

- **Target Audience:** Indian users interested in astronomy and space events. Focus is on 80%+ via Android and Desktop Chrome for notifications.
- **Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Firebase (Auth + Firestore + Hosting).
- **Design Guidelines:** Dark theme, deep space aesthetic. Clean and modern. Minimal UI with maximum information clarity.
- **Performance:** AI content needs to be instantaneous for users, hence the generation on ingest and caching in Firestore for major descriptions. On-the-fly generation only for user-location-specific viewing tips.

## Constraints

- **Tech Stack**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Firebase (Auth + Firestore + Hosting) — Mandatory per user request.
- **UI Components**: Use shadcn/ui for components, no custom component library.
- **Security**: Firebase config must be stored strictly in environment variables, never hardcoded.
- **Performance/Cost**: The Space Devs API free tier requires a simple in-memory cache layer to avoid rate limits.
- **Version Control**: Commit after every major step so Ralph Loop can track progress.
- **Cloud Cover APIs**: Must use Open-Meteo for free, keyless access.
- **Light Pollution data**: Must use static lookup from Firestore per major Indian city to avoid API costs/latency.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use Space Devs API | Provides ISRO filter natively, avoids scraping fragility | — Pending |
| Pre-generate AI Explanations | Ensures instant load times for users, avoids runtime latency | — Pending |
| FCM for Notifications | Native to Firebase, handles heavy lifting | — Pending |

---
*Last updated: 2026-04-11 after initialization*

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
