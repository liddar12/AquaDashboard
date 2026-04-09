# Design Documentation: AquaSmart UI/UX

## 1. Aesthetic Direction: "Maize & Blue"
Inspired by the University of Michigan colors and high-end hardware interfaces.

*   **Color Palette:**
    *   **Background:** `#00274C` (UofM Blue)
    *   **Surface:** `#001A33` (Darker Blue for cards)
    *   **Accent (Active):** `#FFCB05` (UofM Maize)
    *   **Accent (Warning):** `#F43F5E` (Coral Red)
    *   **Accent (Success):** `#10B981` (Emerald)
*   **Typography:**
    *   **Headings:** `Inter` (Semi-bold, tight tracking)
    *   **Data Values:** `JetBrains Mono` (Precision feel)

## 2. Wireframe Concepts

### 2.1. Main Dashboard (The "Control Center")
*   **Top Bar:** System Status (Online/Offline), Air Temp, Water Temp.
*   **Hero Section:** Large circular "Pump Speed" gauge with a dashed radial track.
*   **Equipment Grid:** 2x2 grid of cards:
    *   **Heater:** Toggle switch + "Time to Target" countdown.
    *   **Cleaner:** Schedule status + manual override.
    *   **Lights:** Color picker + brightness slider.
    *   **Salt Cell:** Chlorine production % + salt level.
*   **Bottom Sheet:** "Intelligence Nudges" (e.g., "Filter pressure is 5 PSI above baseline").

### 2.2. Analytics View
*   **Heater Run Time:** Bar chart showing hours per day over the last week.
*   **Energy Estimate:** Line chart showing estimated kWh usage.
*   **Chemical Trends:** (Placeholder) Sparklines for pH and Chlorine.

### 2.3. Water Quality Dashboard
*   **Status Gauges:** Twin vertical or circular gauges for pH and ORP.
*   **Range Indicators:** Visual "Safe Zone" overlays on the gauges.
*   **Trend Sparklines:** 24-hour history for chemical stability.
*   **Alert Banners:** High-visibility warnings at the top of the screen for critical imbalances.

### 2.5. Smart Nudges Section
*   **Location:** Right column, above System Alerts.
*   **Visual Style:** 
    *   Subtle left-border accent (Maize).
    *   Type-specific icons (Wind for weather, Clock for events, Zap for efficiency).
    *   Actionable text links with `ChevronRight` icons.
    *   Entrance animations: `opacity` and `y` offset using `motion`.

### 2.6. Weather Intelligence Card
*   **Visual Style:** Monospace data points for estimated run times.
*   **Logic:** Displays calculated hours for heater and pump based on ambient vs. water temperature.

### 2.7. Manual Entry Modal
*   **Visual Style:** High-contrast form inputs with Maize focus borders.
*   **Fields:** pH, ORP, Pump Time, Heater Time.

## 3. Interaction Details
*   **Alert Lifecycle:**
    *   **Entrance:** Subtle "slide and fade" animation for new alerts using `motion`.
    *   **Severity Styling:** 
        *   *Critical:* Pulse animation on the icon, rose-colored border, high-contrast text.
        *   *Warning:* Amber border, static icon.
        *   *Info/Success:* Emerald or sky-blue border, subtle appearance.
    *   **Dismissal:** Explicit "X" button with exit animation; "All systems nominal" state when empty.
*   **Haptic Feedback:** (For PWA/Native) Subtle vibrations when toggling equipment.
*   **Glow Effects:** Active equipment cards have a subtle outer glow in the accent color.
*   **Micro-animations:** The "Pump" icon rotates slowly when the pump is running; speed increases with RPM.

## 4. UI Examples (CSS/Tailwind Snippets)
```html
<!-- Hardware-style Card -->
<div class="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl">
  <div class="flex justify-between items-start mb-4">
    <span class="text-xs font-mono text-slate-400 uppercase tracking-wider">Heater</span>
    <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
  </div>
  <div class="text-3xl font-mono text-white">82°F</div>
  <div class="text-xs text-slate-500 mt-1">Target: 84°F</div>
</div>
```
