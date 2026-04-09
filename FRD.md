# Functional Requirements Document (FRD): AquaSmart

## 1. Core Features & Functionalities

### 1.1. Authentication & Device Management
*   **User Login:** Secure login using email and password.
*   **Password Requirements:** Minimum 8 characters, must include both letters and numbers.
*   **Password Reset:** Ability for users to request a password reset link via email.
*   **Multi-User Support:** Each user has their own profile and associated pool systems.
*   **No Verification:** Email verification is disabled for streamlined onboarding (configured in Supabase).

### 1.2. Equipment Monitoring (Real-time)
*   **Pump Status:** Show if the pump is ON/OFF and current speed (if variable speed).
*   **Heater Status:** Show if the heater is firing and current vs. target temperature.
*   **Power Consumption:** Estimate power usage based on pump speed and heater state (or read directly if hardware supports it).
*   **Usage Tracking:** Log "Run Time" for each piece of equipment daily/weekly.

### 1.3. Water Quality Monitoring (New)
*   **pH Monitoring:** Real-time display of water acidity/alkalinity.
*   **ORP Monitoring:** Display of Oxidation-Reduction Potential (sanitizer effectiveness).
*   **Configurable Ranges:** Users can set "Safe Zones" for pH (e.g., 7.2 - 7.6) and ORP (e.g., 650mV - 750mV).
*   **Smart Alerts:** Instant notifications when parameters drift outside of configured ranges.

### 1.5. Visual Intelligence (Calibration)
*   **Photo Input:** Ability to take photos of manual testing tools (test strips, drop tests) or analog gauges.
*   **OCR & Vision Analysis:** Use Gemini Vision (`gemini-3-flash-preview`) to extract numbers and colors from photos.
*   **Calibration Logic:** Compare AI-extracted data with digital sensor readings to update system calibration.
*   **AI Model Improvement:** Manual photo inputs serve as "ground truth" to improve predictive maintenance and nudge accuracy.
*   **User Feedback:** Display "Scanning" animation and confidence scores during analysis.

### 1.6. Advanced Features (Upstream/Downstream)
*   **Predictive Maintenance:** 
    *   *Logic:* If pump pressure is rising over time (downstream data), suggest filter cleaning.
    *   *Logic:* If heater run time is increasing for the same temp delta, suggest heat exchanger inspection.
*   **Chemical & Water Quality (Future):**
    *   Integration with pH/ORP sensors.
    *   Alerts for "Out of Range" parameters (e.g., pH > 7.8).
*   **Smart Nudges:**
    *   Proactive, context-aware suggestions based on weather, schedule, and telemetry.
    *   Examples: "High humidity expected tomorrow, consider reducing heater runtime" or "Pool party planned? Ensure chemical levels are optimal by X time."
    *   Actionable buttons for each nudge (e.g., "Adjust Schedule", "Check Levels").

### 1.7. Weather-Based Intelligence
*   **Run Time Estimation:** Calculate required heater and pump run times based on ambient temperature, water temperature, and target temperature.
*   **Proactive Adjustments:** Suggest schedule changes based on forecasted weather (e.g., high humidity, cold snaps).

### 1.8. Manual Override & Entry
*   **Manual Data Input:** Allow users to manually enter pH, ORP, and equipment run times if automated sensors or camera analysis are unavailable.
*   **System Override:** Provide a way to manually trigger equipment or override AI suggestions.

## 2. Aesthetic Direction: "Maize & Blue"
*   **Primary Color:** UofM Blue (`#00274C`) for backgrounds and primary surfaces.
*   **Accent Color:** UofM Maize (`#FFCB05`) for icons, buttons, and active states.
*   **Contrast:** Ensure all Maize-on-Blue combinations meet ADA accessibility standards for readability.

## 3. Technical Logic Flow
1. **Ingestion:** **Inngest** worker polls iAquaLink API every 60 seconds.
2. **Storage:** Raw data is pushed to **Supabase (PostgreSQL)** with a timestamp.
3. **Processing:** **Inngest** workers calculate daily totals and run-time metrics.
4. **Analysis:** Gemini API analyzes weekly patterns to generate "Insights".
5. **Notification:** Push notifications (via **Supabase Edge Functions + OneSignal**) for critical alerts.

## 3. Data Schema (Draft - Supabase/PostgreSQL)
*   **profiles:** `{ id (uuid), email, iaqua_token_encrypted }`
*   **devices:** `{ id, profile_id, device_id, name, model }`
*   **telemetry:** `{ id, device_id, created_at, pump_speed, heater_temp, air_temp, status_flags }`
*   **maintenance_logs:** `{ id, device_id, type, message, severity, created_at }`
