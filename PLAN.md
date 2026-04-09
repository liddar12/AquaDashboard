# AquaSmart: Project Implementation Plan

## 1. Project Overview
AquaSmart is a comprehensive pool intelligence platform designed to integrate with Zodiac iAquaLink systems. It provides real-time monitoring, historical usage tracking, and predictive maintenance insights for pool owners.

## 2. Proposed Technology Stack (Optimized for your Ecosystem)
| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | **Vue.js 3 / Nuxt** | User preference. Nuxt provides excellent SSR/SSG for Vercel/Netlify. |
| **Backend/DB** | **Supabase** | Replaces Firebase. Handles Auth (Email/Password), PostgreSQL (Telemetry), and Realtime updates. |
| **Hosting** | **Vercel / Netlify** | For the frontend and Edge Functions. |
| **CMS** | **Storyblok** | Manages equipment manuals, maintenance guides, and dynamic UI content. |
| **Workflow/Cron** | **Inngest / Upstash** | **REQUIRED.** To poll the iAquaLink API every minute and push data to Supabase. |
| **AI/Insights** | **Gemini API / OpenAI** | For predictive maintenance logic and natural language recommendations. |
| **Mobile** | **Capacitor** | To wrap the Vue app into a native iOS/Android app for side-loading. |

## 3. Additional Technologies Required
1.  **Inngest:** Essential for managing the "polling" lifecycle. iAquaLink doesn't push data; you must fetch it. Inngest handles retries and scheduling.
2.  **PostgREST (via Supabase):** To provide a clean API layer for the frontend.
3.  **Edge Functions:** To keep iAquaLink credentials secure and handle the API proxying.
*   **UI/UX Design Team:** Focuses on the "Hardware Specialist Tool" aesthetic. High contrast, clear status indicators, and intuitive navigation.
*   **Frontend Development (FED) Team:** Implements the Vue/React interface, ensuring responsive design and smooth animations (using `motion`).
*   **Backend Engineering Team:** Manages the iAquaLink API integration (reverse-engineered), authentication flows, and Firestore data structure.
*   **Full Stack Integration Team:** Bridges the gap between frontend state management and backend API responses.
*   **AI/Data Science Team:** Develops the predictive maintenance logic using usage patterns and Gemini API.
*   **QA/Stability Team:** Automated testing for API connectivity and UI regression.

## 4. Hardware Requirements

### 4.1. Core System (Existing)
*   **iAquaLink Web Interface Module:** (iAquaLink 2.0 or 3.0) installed on your Jandy/Zodiac power center.
*   **Jandy/Zodiac Controller:** (AquaLink RS, PDA, or Z4).

### 4.2. Enhancement Hardware (Future Upgrades)
*   **Water Temperature:** Standard Jandy temp sensors (usually already installed).
*   **Chemical Monitoring:**
    *   **Commercial Option:** **WaterGuru SENSE S2** or **Blue Connect Plus**. These have APIs that can be integrated into your Supabase backend.
    *   **DIY Option:** **ESP32** microcontroller + **Atlas Scientific EZO** probes (pH, ORP, Temp). Requires a custom bridge to push data to your Supabase Edge Functions.
*   **Power Monitoring:**
    *   **Variable Speed Pumps:** Most modern Jandy VSP pumps report wattage via iAquaLink.
    *   **Single Speed Pumps:** Requires a **Shelly EM** or **Aeotec Home Energy Meter** installed in the sub-panel to track actual draw.

## 5. Autonomous Development Strategy
To maximize autonomous coding (using AI Studio, Claude Code, or Perplexity Max):
*   **Code Generation:** 80% of boilerplate, UI components, and API wrappers can be generated autonomously.
*   **API Integration:** The reverse-engineered endpoints can be mapped into TypeScript interfaces automatically.
*   **Deployment:** CI/CD pipelines (GitHub Actions) can be set up to deploy to Cloud Run or Firebase Hosting on every push.
*   **Refinement:** Human intervention is primarily needed for fine-tuning the "feel" of the UI and validating the reverse-engineered API behavior against real hardware.

## 5. Future Roadmap
*   **Phase 1:** Core iAquaLink integration (Pump/Heater control & status).
*   **Phase 2:** Historical data visualization (D3.js/Recharts).
*   **Phase 3:** Chemical & Temp tracking (Hardware expansion).
*   **Phase 4:** AI Predictive Maintenance & Smart Alerts.
