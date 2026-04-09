# Design Documentation: AquaSmart UI/UX

## 1. Aesthetic Direction: "The Digital Pool Room"
Inspired by high-end audio equipment and scientific instruments (Design Recipe 3).

*   **Color Palette:**
    *   **Background:** `#0F172A` (Deep Navy/Slate)
    *   **Surface:** `#1E293B` (Muted Matte Cards)
    *   **Accent (Active):** `#38BDF8` (Pool Blue)
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

## 3. Interaction Details
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
