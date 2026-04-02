# QuestAI Frontend - Vercel Deployment Guide

## Quick Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to** https://vercel.com/new
2. **Select GitHub** → Authorize Vercel
3. **Find and select** `QuestAI` repository
4. **Configure:**
   - Framework: `Vite` (auto-detected)
   - Root Directory: `frontend`
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)
5. **Add Environment Variables:**
   - `VITE_API_URL` = Your Railway backend URL (e.g., `https://questai-backend-xyz.up.railway.app`)
6. Click **Deploy**
7. Wait 2-3 minutes ✅

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd campus-chatbot/frontend

# Deploy
vercel deploy --prod

# When prompted:
# - Link to existing project? No
# - Set project name: questai
# - Set directory: ./ (current)
```

---

## Environment Setup for Local Testing

### Create `.env.local` in `frontend/` folder:

```env
VITE_API_URL=http://localhost:8000
```

For production (Vercel sets this automatically):
```env
VITE_API_URL=https://your-railway-backend-url.up.railway.app
```

---

## How Frontend Connects to Backend

**Local development:**
- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:8000`

**Production (Vercel + Railway):**
- Frontend (Vercel): `https://questai.vercel.app` (or your custom domain)
- Backend (Railway): `https://questai-backend-xyz.up.railway.app`
- Connection via: `VITE_API_URL` environment variable

---

## Deployment Steps (Complete Flow)

### Step 1: Deploy Backend to Railway ✅ (Already Ready)
1. https://railway.app → New Project
2. Deploy from GitHub (QuestAI repo)
3. Add `GROQ_API_KEY` environment variable
4. Copy backend URL

### Step 2: Deploy Frontend to Vercel (This Step)
1. https://vercel.com/new
2. Select QuestAI GitHub repo
3. Root directory: `frontend`
4. Add environment variable: `VITE_API_URL=<your-railway-backend-url>`
5. Deploy

### Step 3: Test Everything
- Visit your Vercel URL
- Try sending a message
- Should connect to Railway backend ✅

---

## Custom Domain (Optional)

### On Vercel:
1. Project Settings → Domains
2. Add your domain
3. Follow DNS setup

### On Railway (Backend):
1. Service Settings → Domain
2. Add your domain
3. Follow DNS setup

---

## Environment Variables in Vercel

### Set via Dashboard:
1. Project → Settings → Environment Variables
2. Add: `VITE_API_URL`
3. Set value: `https://your-backend-url.up.railway.app`
4. Save and re-deploy

### Or via Vercel CLI:
```bash
vercel env add VITE_API_URL https://your-backend-url.up.railway.app
```

---

## Verify Frontend API URL

**Check that API URL is correct in production:**

Open browser DevTools (F12):
```javascript
// In console, run:
console.log(import.meta.env.VITE_API_URL)
```

Should show your Railway backend URL, not localhost.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot reach localhost" on production | Ensure `VITE_API_URL` env var is set to Railway backend URL |
| Build fails | Check `npm run build` works locally first |
| CORS errors | Backend needs proper CORS headers (FastAPI configured) |
| Environment variables not showing | Redeploy after setting env vars |

---

## Performance

- **Frontend on Vercel:** ~300ms first load (CDN, cached)
- **API on Railway:** ~200-500ms depending on cold start
- **Total:** Fast ⚡

---

## Summary

```
┌─────────────────────────────────────┐
│     Your Browser / User             │
└────────────┬────────────────────────┘
             │
    ┌────────▼─────────────┐
    │   Vercel Frontend    │
    │ questai.vercel.app   │
    └────────┬─────────────┘
             │ (VITE_API_URL)
    ┌────────▼──────────────────────┐
    │   Railway Backend API          │
    │ questai-backend.up.railway.app │
    └────────────────────────────────┘
```

---

## Next Steps

1. ✅ Deploy Backend to Railway
2. ✅ Deploy Frontend to Vercel
3. Test the full application
4. Set up custom domains (optional)
5. Configure messaging integrations (optional)

**You're ready to deploy!** 🚀
