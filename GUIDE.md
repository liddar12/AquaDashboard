# AquaSmart: User & Developer Guide

Welcome to AquaSmart. This guide explains how to use the different data input methods and how to finalize your deployment.

## 1. Data Input Options

### 🔐 Authentication (Login/Signup)
*   **Method:** Email and Password.
*   **Requirements:** Password must be 8+ characters and contain both letters and numbers.
*   **Reset:** Use the "Forgot Password" link on the login screen to receive a reset email via Supabase.

### 📸 Visual Calibration (Camera)
*   **How to use:** Click the **"Calibrate"** button in the header.
*   **Function:** Point your camera at a pH test strip, a drop test kit, or an analog pressure gauge. 
*   **AI Logic:** Gemini Vision analyzes the image to extract pH and ORP values, comparing them against your digital sensors for calibration.

### ✍️ Manual Override (Manual Entry)
*   **How to use:** Click the **"Refresh/Manual"** icon (next to Calibrate) in the header.
*   **Function:** Manually enter pH, ORP, or equipment run times.
*   **Use Case:** Use this if your sensors are offline or if you prefer manual testing methods.

### 🤖 Weather Intelligence (Automated)
*   **Function:** The system automatically calculates estimated run times based on ambient and water temperatures.
*   **Logic:** It suggests longer heater runs in cold snaps and more pump circulation in high heat.

---

## 2. Deployment & Publishing Steps

To move from this preview to a live production site on Netlify/Supabase, follow these steps:

### Step 1: Connect GitHub to Netlify
1.  Push this code to a private GitHub repository.
2.  In **Netlify**, select "New site from Git" and choose your repository.
3.  **Build Settings:**
    *   Build Command: `npm run build`
    *   Publish Directory: `dist`

### Step 2: Configure Environment Variables
In the Netlify dashboard (Site Settings > Environment Variables), add the following:
*   `VITE_SUPABASE_URL`: Your Supabase Project URL.
*   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anonymous Key.
*   `GEMINI_API_KEY`: Your Google AI Studio API Key.

### Step 3: Supabase Setup
1.  **Auth:** Go to Authentication > Providers and ensure **Email** is enabled. Disable "Confirm email" if you want the "no verification" flow we implemented.
2.  **Database:** Run the SQL provided in the `telemetry` section of our FRD to create the necessary tables.

### Step 4: iAquaLink Polling (The "Automation" Bridge)
To get real-time data from your pool, you need a background worker:
1.  Sign up for **Inngest**.
2.  Deploy a simple Inngest function (we can write this for you) that:
    *   Polls the iAquaLink API every minute.
    *   Updates the `telemetry` table in Supabase.

---

## 3. Automation vs. Manual Work
*   **Automated here:** UI code, Auth logic, AI analysis logic, and styling are 100% complete here.
*   **Manual work:** You must physically create the Supabase project and paste the API keys into Netlify. The "Polling" bridge (Inngest) requires a one-time setup of your iAquaLink credentials in a secure environment variable.
