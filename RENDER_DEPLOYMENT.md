# QuestAI Deployment on Render

## Quick Deploy in 5 Minutes

### Step 1: Go to Render
1. Visit https://render.com
2. Click **"Sign Up"** (or login)
3. Connect your GitHub account

### Step 2: Deploy Backend

1. Click **"New"** → **"Web Service"**
2. Select **GitHub repo `QuestAI`**
3. Configure:
   - **Name:** `questai-backend`
   - **Environment:** `Python 3`
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free tier ✓

4. **Add Environment Variables:**
   - Click **"Advanced"** → **"Add Environment Variable"**
   - `GROQ_API_KEY` = Your Groq API key (get from https://console.groq.com/keys)

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for deployment
7. Copy your backend URL (e.g., `https://questai-backend.onrender.com`)

### Step 3: Deploy Frontend

1. Click **"New"** → **"Static Site"**
2. Select **GitHub repo `QuestAI`**
3. Configure:
   - **Name:** `questai-frontend`
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/dist`
   - **Plan:** Free tier ✓

4. **Add Environment Variables:**
   - `VITE_API_URL` = Your backend URL from Step 2 (e.g., `https://questai-backend.onrender.com`)

5. Click **"Create Static Site"**
6. Wait 5-10 minutes
7. Your frontend will be live! 🎉

---

## Full Deployment Guide

### Prerequisites
- ✅ GitHub account with QuestAI repo pushed
- ✅ Groq API key (free account at https://console.groq.com)
- ✅ Render account (free at https://render.com)

---

## Backend Deployment (Detailed)

### Backend Service Setup

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect Repository:**
   - Click **"Connect a new repository"** OR select existing
   - Choose **`QuestAI`** repo

4. **Configuration:**
   ```
   Name: questai-backend
   Environment: Python 3.11
   Region: (Choose closest to you)
   Branch: main
   ```

5. **Build & Start Commands:**
   ```
   Build Command: cd backend && pip install -r requirements.txt
   Start Command: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

6. **Advanced Settings:**
   - Scroll down → **"Advanced"**
   - Add Environment Variables:
     - `GROQ_API_KEY` = Your key from https://console.groq.com/keys
     - Optional:
       - `TWILIO_ACCOUNT_SID` (for WhatsApp)
       - `TELEGRAM_BOT_TOKEN` (for Telegram)
       - `SLACK_BOT_TOKEN` (for Slack)

7. **Plan:** Select Free tier
8. Click **"Create Web Service"**
9. Wait for deployment (~10 minutes)

### Get Backend URL
After deployment:
1. Dashboard → Your service
2. Copy the URL (e.g., `https://questai-backend.onrender.com`)
3. Keep it for frontend deployment

---

## Frontend Deployment (Detailed)

### Frontend Static Site Setup

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. **Connect Repository:**
   - Click **"Connect a new repository"** OR select existing
   - Choose **`QuestAI`** repo

4. **Configuration:**
   ```
   Name: questai-frontend
   ```

5. **Build Settings:**
   ```
   Build Command: cd frontend && npm install && npm run build
   Publish Directory: frontend/dist
   ```

6. **Environment Variables:**
   - Click **"Advanced"**
   - Add:
     - `VITE_API_URL` = Your **backend URL** from above
     - Example: `https://questai-backend.onrender.com`

7. **Plan:** Free tier
8. Click **"Create Static Site"**
9. Wait for build and deployment (~5 minutes)

### Get Frontend URL
After deployment, you'll get a URL like:
```
https://questai-frontend.onrender.com
```

**This is your live app!** 🚀

---

## Test Your Deployment

1. Visit your frontend URL
2. Try sending a message
3. Should connect to backend
4. Check console (F12) for any errors

---

## Environment Variables Reference

### Backend (Required)
- `GROQ_API_KEY` - Get free key from https://console.groq.com

### Backend (Optional - Messaging Integrations)
- `TWILIO_ACCOUNT_SID` - For WhatsApp via Twilio
- `TWILIO_AUTH_TOKEN` - For WhatsApp
- `TWILIO_WHATSAPP_NUMBER` - For WhatsApp
- `TELEGRAM_BOT_TOKEN` - For Telegram bot
- `SLACK_BOT_TOKEN` - For Slack bot
- `SLACK_SIGNING_SECRET` - For Slack verification

### Frontend
- `VITE_API_URL` - Your Render backend URL

---

## Monitoring & Logs

### Backend Logs
1. Dashboard → `questai-backend` service
2. Click **"Logs"** tab
3. See real-time startup and API logs

### Frontend Logs
1. Dashboard → `questai-frontend` service
2. Click **"Logs"** tab
3. See build and deployment logs

---

## Performance

- **First startup:** ~30 seconds (model loading)
- **Subsequent requests:** ~200-500ms
- **Free tier limit:** 750 hours/month (enough for 1 service always running)

---

## Custom Domain (Optional)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Render dashboard:
   - Service → Settings → Custom Domain
   - Add your domain
   - Follow DNS setup

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check logs, verify Python version |
| "Cannot reach backend" on frontend | Ensure `VITE_API_URL` env is set correctly |
| Build fails | Run `npm run build` locally to debug |
| Service sleeps after idle | Upgrade plan or use cron job to ping service |
| CORS errors | Backend already configured with CORS headers |

---

## Free Tier Limits

- ✅ Always on (no sleep!)
- ✅ 750 CPU hours/month
- ✅ 3 free Web Services
- ✅ 3 free Static Sites
- ❌ Shared CPU

Perfect for testing/demo deployments!

---

## Next Steps

1. ✅ Go to https://render.com
2. ✅ Connect GitHub account
3. ✅ Deploy backend (add `GROQ_API_KEY`)
4. ✅ Deploy frontend (add `VITE_API_URL`)
5. ✅ Test your app!

**Your QuestAI is live!** 🎉
