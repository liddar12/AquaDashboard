# Functional Requirements Document (FRD): AquaSmart

## 1. Core Features & Functionalities

### 1.1. Authentication & Device Management
*   **User Login:** Secure login using iAquaLink credentials (email/password).
*   **Token Management:** Handle session tokens and automatic re-authentication.
*   **Device Discovery:** List all pool systems associated with the user account.

### 1.2. Equipment Monitoring (Real-time)
*   **Pump Status:** Show if the pump is ON/OFF and current speed (if variable speed).
*   **Heater Status:** Show if the heater is firing and current vs. target temperature.
*   **Power Consumption:** Estimate power usage based on pump speed and heater state (or read directly if hardware supports it).
*   **Usage Tracking:** Log "Run Time" for each piece of equipment daily/weekly.

### 1.3. Advanced Features (Upstream/Downstream)
*   **Predictive Maintenance:** 
    *   *Logic:* If pump pressure is rising over time (downstream data), suggest filter cleaning.
    *   *Logic:* If heater run time is increasing for the same temp delta, suggest heat exchanger inspection.
*   **Chemical & Water Quality (Future):**
    *   Integration with pH/ORP sensors.
    *   Alerts for "Out of Range" parameters (e.g., pH > 7.8).
*   **Smart Nudges:** "It's going to be cold tonight; should I pre-heat the spa for your 8 PM routine?"

## 2. Technical Logic Flow
1.  **Ingestion:** App polls iAquaLink API every 60 seconds (or uses WebSockets if available).
2.  **Storage:** Raw data is pushed to Firestore with a timestamp.
3.  **Processing:** Cloud Functions calculate daily totals and run-time metrics.
4.  **Analysis:** Gemini API analyzes weekly patterns to generate "Insights".
5.  **Notification:** Push notifications (via FCM) for critical alerts (e.g., "Heater Failure").

## 3. Data Schema (Draft)
*   **Users:** `{ uid, email, iAquaToken }`
*   **Devices:** `{ deviceId, name, model, firmware }`
*   **Telemetry:** `{ deviceId, timestamp, pumpSpeed, heaterTemp, airTemp, statusFlags }`
*   **MaintenanceLogs:** `{ deviceId, type, message, severity, date }`
