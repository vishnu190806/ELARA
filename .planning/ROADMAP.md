# Proposed Roadmap

**4 phases** | **15 requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Setup & Core APIs | Scaffold the Next.js app, configure Firebase, and establish primary external data pipelines. | DATA-01, DATA-02, DATA-04, DATA-05 | 4 |
| 2 | AI & Caching Infrastructure | Implement Gemini API integrations, pre-generation flows, and location-based on-the-fly tip endpoints. | AI-01, AI-02, DATA-03, DATA-06 | 3 |
| 3 | Core UI & Dashboard | Build the minimal dark theme UI, home dashboard, event details, and Sky Score aggregations. | CORE-01, CORE-02, CORE-03, CORE-04, AUTH-01, AUTH-02 | 4 |
| 4 | Offline Support & Notifications | Implement the PWA configuration, Firebase Cloud Messaging notifications, and iOS prompt logic. | NOTIF-01, NOTIF-02, NOTIF-03, PWA-01, PWA-02 | 4 |

### Phase Details

**Phase 1: Setup & Core APIs**
Goal: Scaffold the Next.js app, configure Firebase, and establish primary external data pipelines.
Requirements: DATA-01, DATA-02, DATA-04, DATA-05
**UI hint**: false
Success criteria:
1. Next.js 14 structured safely with Tailwind CSS matching a dark aesthetic.
2. Firebase Authentication, Firestore, and Hosting base configuration established.
3. NASA open data and Space Devs API endpoints mapped and tested.
4. Static Light Pollution and Open-Meteo API proxies/queries validated.

**Phase 2: AI & Caching Infrastructure**
Goal: Implement Gemini API integrations, pre-generation flows, and location-based on-the-fly tip endpoints.
Requirements: AI-01, AI-02, DATA-03, DATA-06
**UI hint**: false
Success criteria:
1. Background ingestion triggers exist that generate Gemini text for new NASA/ISRO events.
2. Generated event explanations save properly and persist in Firestore.
3. Client-side Astronomia JS moon phase calculator integrated and tested.

**Phase 3: Core UI & Dashboard**
Goal: Build the minimal dark theme UI, home dashboard, event details, and Sky Score aggregations.
Requirements: CORE-01, CORE-02, CORE-03, CORE-04, AUTH-01, AUTH-02
**UI hint**: yes
Success criteria:
1. Dashboard correctly renders unified feed of events and calculates Tonight's Sky Score based on mocked/tracked location.
2. Event Detail page loads instantly given pre-generated AI descriptions from Firestore.
3. Design enforces maximum information clarity with a deep space, Vercel-like aesthetic.
4. User login and location preference selection functions flawlessly.

**Phase 4: Offline Support & Notifications**
Goal: Implement the PWA configuration, Firebase Cloud Messaging notifications, and iOS prompt logic.
Requirements: NOTIF-01, NOTIF-02, NOTIF-03, PWA-01, PWA-02
**UI hint**: false
Success criteria:
1. PWA configuration (manifests, service workers) compiles and caches successful event data for offline access.
2. Users can register specific notification schedules for their subscribed events.
3. FCM dispatches trigger payloads to users 30 minutes before sky events.
4. The UX gently warns iOS users about needing "Add to Home Screen" interaction.
