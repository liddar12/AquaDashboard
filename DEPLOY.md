# AquaSmart: Deployment & Publishing Guide

This guide provides the exact steps to deploy the AquaSmart platform (Team: **AquaIQ**, App: **Aquapoolpwa**) to a live environment using Netlify, Supabase, and Inngest.

## 1. Prerequisites
*   **GitHub Account:** To host your source code.
*   **Netlify Account:** For frontend hosting and serverless functions.
*   **Supabase Account:** For Authentication and PostgreSQL database.
*   **Inngest Account:** For background polling of the iAquaLink API.

---

## 2. Step-by-Step Deployment Order

### Phase 1: Supabase Setup (Database & Auth)
1.  **Create Project:** Create a new project in Supabase named `Aquapoolpwa`.
2.  **Database Schema:** Go to the SQL Editor and run the following to create the telemetry table:
    ```sql
    CREATE TABLE telemetry (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      pump_speed INTEGER,
      heater_temp FLOAT,
      air_temp FLOAT,
      ph FLOAT,
      orp FLOAT,
      status_flags JSONB
    );
    ```
3.  **Authentication:**
    *   Go to **Authentication > Providers**.
    *   Ensure **Email** is enabled.
    *   **Disable** "Confirm email" for a faster onboarding experience (as requested).

### Phase 2: GitHub & Netlify (Frontend & API)
1.  **Push Code:** Push this project to a private GitHub repository.
2.  **Netlify Import:**
    *   In Netlify, click **"Add new site" > "Import an existing project"**.
    *   Select your GitHub repository.
3.  **Build Settings:**
    *   **Build Command:** `npm run build`
    *   **Publish Directory:** `dist`
    *   **Functions Directory:** (Leave default or set to `netlify/functions` if you move the server logic there).
    *   *Note: Since we are using a custom Express server, you may need to use the [Netlify Express](https://www.netlify.com/blog/2018/09/13/how-to-run-express.js-apps-on-netlify-functions/) pattern or deploy to Cloud Run for the full-stack features.*
4.  **Environment Variables:** Add these in Netlify (Site Settings > Environment Variables):
    *   `VITE_SUPABASE_URL`: Your Supabase Project URL.
    *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    *   `GEMINI_API_KEY`: Your Google AI Studio API Key.
    *   `INNGEST_EVENT_KEY`: (From Inngest Cloud).
    *   `INNGEST_SIGNING_KEY`: (From Inngest Cloud).

### Phase 3: Inngest Setup (Automation)
1.  **Connect App:** In Inngest Cloud, add a new app and point the URL to your deployed Netlify/Cloud Run endpoint: `https://your-app.netlify.app/api/inngest`.
2.  **Verify Cron:** Ensure the `poll-iaqualink-data` function is visible and scheduled. This will now poll your pool data every minute and push it to Supabase.

---

## 3. Manual Tasks Summary
| Task | Location | Frequency |
| :--- | :--- | :--- |
| Create Supabase Tables | Supabase SQL Editor | Once |
| Disable Email Confirmation | Supabase Auth Settings | Once |
| Add API Keys | Netlify Env Vars | Once |
| Connect Inngest Endpoint | Inngest Cloud | Once |

## 4. Build Instructions (Netlify)
*   **Team:** AquaIQ
*   **Site Name:** Aquapoolpwa
*   **Framework:** Vite + React
*   **Node Version:** 18+
*   **Build Command:** `npm run build`
*   **Dist Folder:** `dist`

---

**Approval Required:** All systems are ready for deployment. Please review the `DEPLOY.md` and `GUIDE.md` files. Once you approve, you can proceed with the manual steps above to go live.
