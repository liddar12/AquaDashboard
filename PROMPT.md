# Master Build Prompt: AquaSmart Pool Intelligence

Use the following prompt in AI Studio, Claude Code, or Perplexity Max to initiate the build.

---

## The Prompt

"Build a full-stack Pool Management application called 'AquaSmart' that integrates with the Zodiac iAquaLink system. 

### Core Requirements:
1. **Frontend:** Use React (Vite) with Tailwind CSS and Framer Motion. Follow a "Maize & Blue" aesthetic (UofM Blue: `#00274C`, UofM Maize: `#FFCB05`). Ensure high contrast for accessibility.
...
    - **Weather Intelligence:** Calculate estimated heater and pump run times based on ambient and water temperatures.
    - **Manual Override:** Provide a manual entry system for pH, ORP, and run times to bypass automated sensors or AI analysis.
2. **Backend:** Node.js Express server to handle API requests.
3. **Database:** Firebase Firestore for real-time telemetry and user settings.
4. **iAquaLink Integration:** Implement a service that uses the reverse-engineered iAquaLink API. 
   - Login: `POST /users/v1/login` with `apiKey: E00EMOW4YR6QNB07`.
   - Endpoints: `https://iaqualink-api.realtime.io` for classic systems.
5. **Features:**
   - Dashboard with Pump Speed (gauge), Heater status (temp control), and equipment toggles.
   - **Water Quality:** Display pH and ORP levels with configurable alert thresholds and visual range indicators.
   - **Visual Intelligence:** Implement a camera interface for capturing test results. Use Gemini Vision (`gemini-3-flash-preview`) with structured JSON output to extract pH, ORP, and recommendations for sensor calibration.
   - **Smart Nudges:** Implement a proactive suggestion system that uses Gemini to analyze weather, schedule, and telemetry to provide context-aware advice (e.g., "High humidity expected, reduce heater runtime").
   - **Enhanced Alerting:** Implement an animated alert system with severity-based styling (Critical, Warning, Info), dismissal functionality, and a "nominal state" display.
   - Usage Tracking: Log and display 'Heater Run Time' and 'Pump Power Consumption' (estimated).
   - Predictive Maintenance: Use Gemini API to analyze telemetry and suggest filter cleanings or equipment checks.
   - Future-proofing: Create data structures for water chemistry (pH, ORP) and temperature alerts.
6. **UI/UX:**
   - Use 'Inter' for UI text and 'JetBrains Mono' for data.
   - Implement a 'Control Center' layout with a grid of equipment cards.
   - Add a 'Insights' panel for AI-driven recommendations.

### Technical Constraints:
- Ensure all Firestore operations use the `handleFirestoreError` pattern for debugging.
- Implement a PWA manifest for mobile installation.
- Use lazy initialization for all third-party SDKs.

### Reference Data:
- iAquaLink API uses a constant API key for authentication.
- Telemetry should be polled every 60 seconds and stored in a 'telemetry' collection in Firestore."

---

## Related Skills & Data
*   **Skill:** `frontend-design` (Recipe 3: Hardware Tool)
*   **Skill:** `Gemini API` (for predictive maintenance logic)
*   **Skill:** `realtime_guidelines` (for live status updates)
*   **Agent Data:** Ensure the agent has access to `FRD.md` and `DESIGN.md` in the root directory for context during the build.
