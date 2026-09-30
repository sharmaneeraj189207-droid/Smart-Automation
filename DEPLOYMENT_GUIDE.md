# FlowPilot AI — Production Deployment Guide

This guide walks you through deploying FlowPilot AI to production using:
- **Database**: MongoDB Atlas
- **Backend API**: Render (Node.js Web Service)
- **Frontend App**: Vercel (React + Vite)

---

## 1. Phase 1: MongoDB Atlas Setup

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new project named `flowpilot-ai`.
3. Deploy a free **M0 Sandbox** cluster in your preferred region.
4. Set up Database Access:
   - Create a database user (e.g. `flowpilot_admin`) with a secure generated password.
   - Grant `Read and write to any database` privileges.
5. Set up Network Access:
   - Add IP Address: `0.0.0.0/0` (Allow access from anywhere) so Render backend can connect.
6. Retrieve Connection String:
   - Click **Connect** -> **Drivers** -> **Node.js**.
   - Copy the URI:
     ```
     mongodb+srv://flowpilot_admin:<password>@cluster0.xxxxx.mongodb.net/flowpilot?retryWrites=true&w=majority
     ```

---

## 2. Phase 2: Deploy Backend to Render

1. Push your code to a GitHub repository.
2. Sign in to [Render](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure service details:
   - **Name**: `flowpilot-api`
   - **Region**: Closest to your MongoDB cluster
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: Free
5. Configure Environment Variables in Render:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `10000` | Render default port (injected automatically) |
   | `NODE_ENV` | `production` | Production environment flag |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `your_64_char_secure_random_key` | Secret key for JWT signing |
   | `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
   | `CLIENT_URL` | `https://flowpilot-ai.vercel.app` | Your deployed Vercel frontend URL |
6. Click **Deploy Web Service**.
7. Once deployed, test the health check:
   ```bash
   curl https://flowpilot-api.onrender.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "service": "FlowPilot AI Core Automation API",
     "version": "1.0.0"
   }
   ```

---

## 3. Phase 3: Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Select your `flowpilot-ai` repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. Add Environment Variable:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://flowpilot-api.onrender.com/api` |
5. Click **Deploy**.
6. When deployment finishes, copy your live production URL (e.g. `https://flowpilot-ai.vercel.app`).
7. Update the `CLIENT_URL` environment variable on your Render backend service with this URL so CORS whitelist allows requests from your Vercel domain.

---

## 4. Phase 4: Production Seeding (Optional)

To seed your production database with initial departments, demo credentials, and baseline workflow rules:

1. Open Render Web Service Dashboard -> **Shell** tab.
2. Run:
   ```bash
   npm run seed
   ```
3. The script will initialize:
   - `admin@flowpilot.ai` / `Admin@123`
   - `manager@flowpilot.ai` / `Manager@123`
   - `employee@flowpilot.ai` / `Employee@123`
   - Baseline Enterprise Workflow Rules and Departments

---

## 5. Troubleshooting & Common Pitfalls

### Issue: CORS Policy Blocked
- **Symptoms**: `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`.
- **Fix**: Check `CLIENT_URL` in Render environment variables. Ensure it matches your Vercel domain without trailing slashes.

### Issue: MongoDB Connection Timeout (MongooseServerSelectionError)
- **Symptoms**: `Could not connect to primary MongoDB: connection timed out`.
- **Fix**: Verify MongoDB Atlas Network Access has `0.0.0.0/0` whitelisted, and verify database user password does not contain unescaped special characters.

### Issue: Gemini API Rate Limit / Quota Exceeded (429)
- **Symptoms**: `[AI Service] Gemini API call error: 429 Too Many Requests`.
- **Fix**: FlowPilot includes automatic cognitive heuristic fallback that immediately activates if Gemini returns 429 or invalid JSON. The application will never crash.

### Issue: Client Routing Returns 404 on Refresh in Vercel
- **Fix**: A `vercel.json` rewrite file ensures client-side routing works for all URLs:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/" }]
  }
  ```
