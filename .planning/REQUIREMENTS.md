# Requirements

## v1 Requirements

### Authentication
- [ ] **AUTH-01**: User can log in utilizing Firebase Authentication.
- [ ] **AUTH-02**: User can manage their profile and store their location preference.

### Data Aggregation & APIs
- [ ] **DATA-01**: Fetch space event data from NASA Open APIs.
- [ ] **DATA-02**: Fetch ISRO and general launch data from The Space Devs API.
- [ ] **DATA-03**: Support manual curation fallback in Firestore for unique events like Gaganyaan.
- [ ] **DATA-04**: Fetch cloud cover data transparently from Open-Meteo based on the user's location.
- [ ] **DATA-05**: Access static Light Pollution map data via Firestore lookup for major Indian cities.
- [ ] **DATA-06**: Calculate moon brightness/phase dynamically via client-side Astronomia JS.

### AI & Event Context
- [ ] **AI-01**: Pre-generate layman's terminology AI Event Explanations via Gemini API upon new event ingestion and cache in Firestore.
- [ ] **AI-02**: Fetch on-the-fly personalized viewing tip calculations using Gemini API (e.g. precise relative direction viewing for specific cities).

### Core Features & UX
- [ ] **CORE-01**: Display "Tonight's Sky Score" (40% Cloud Cover, 35% Light Pollution, 25% Moon Phase) as an integer 1-10 on the Home Dashboard.
- [ ] **CORE-02**: Display a chronological feed of upcoming NASA and ISRO space events on the Home Dashboard.
- [ ] **CORE-03**: Display an Event Detail Page for selected events containing the AI explanation, viewing tips, and a countdown timer.
- [ ] **CORE-04**: Use a dark-themed, "deep space aesthetic" minimal user interface inspired by Vercel for maximum clarity and no clutter.

### Notifications & Push
- [ ] **NOTIF-01**: User can specify which events they want to receive notifications for within a dedicated Settings view.
- [ ] **NOTIF-02**: System automatically pushes Firebase Cloud Messaging (FCM) notifications 30 minutes prior to a subscribed ongoing event (Android & Desktop Chrome support).
- [ ] **NOTIF-03**: Display an aggressive "Add to Home Screen" warning prompt for iOS/Safari users to ensure PWA and push functionality.

### Progressive Web App (PWA)
- [ ] **PWA-01**: Make the application installable as a standard PWA manifest.
- [ ] **PWA-02**: Provide offline support utilizing service worker caching for previously viewed events.

## v2 Requirements
(Deferred to later)
- Integration with smart home lighting or secondary physical alarm triggers.
- Support for granular local weather API integrations beyond open-meteo if accuracy becomes an issue.

## Out of Scope
- **Live tracking maps or star maps**: explicitly excluded as they clutter minimal design.
- **ISRO direct scraping**: excluded due to high fragility. We rely solely on the Space Devs API.
- **iOS-native Push mechanisms bypassing PWA**: iOS users must use native Safari Add to Home Screen features to bridge notification discrepancies.

## Traceability
*(To be updated when ROADMAP is created)*
