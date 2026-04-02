# QuestAI Deployment Guide (Railway.app)

## Pre-Deployment Checklist

✅ QuestAI is ready to deploy to Railway.app!

### What You Need:
1. **GitHub Account** (already have - repo is pushed)
2. **Railway Account** (free at https://railway.app)
3. **API Keys:**
   - Groq API Key (from https://console.groq.com)
   - Optional: Twilio, Telegram, Slack credentials for integrations

---

## Step-by-Step Deployment

### 1. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub (recommended)
- Create a new project

### 2. Deploy Backend API

1. Click **"+ New Project"** → **"Deploy from GitHub repo"**
2. Select **`QuestAI`** repository
3. Railway will auto-detect the Dockerfile
4. Configure environment variables:

| Variable | Value |
|----------|-------|
| `GROQ_API_KEY` | Your Groq API key |
| `HF_TOKEN` | (Optional) Hugging Face token |
| `TWILIO_ACCOUNT_SID` | (Optional) Twilio account ID |
| `TWILIO_AUTH_TOKEN` | (Optional) Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | (Optional) Twilio WhatsApp number |
| `TELEGRAM_BOT_TOKEN` | (Optional) Telegram bot token |
| `SLACK_BOT_TOKEN` | (Optional) Slack bot token |
| `SLACK_SIGNING_SECRET` | (Optional) Slack signing secret |

5. Click **Deploy**
6. Wait for deployment (~5-10 minutes)
7. Copy your Backend URL (e.g., `https://questai-backend-production.up.railway.app`)

### 3. Deploy Frontend

1. Click **"+ New"** in your Railway project
2. Select **"GitHub Repo"** → **`QuestAI`** again
3. In Dockerfile field, use: `Dockerfile.frontend`
4. Set Port: `3000`
5. In build commands, set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `serve -s dist -l 3000`

6. **Important:** Add environment variable:
   - `VITE_API_URL` = Your backend URL from step 2

7. Deploy
8. Copy your Frontend URL (e.g., `https://questai-frontend-production.up.railway.app`)

### 4. Configure API Endpoints in Frontend

After deployment, update your frontend to use the deployed backend:

In `frontend/src/components/RagLayout.jsx` and `frontend/public/widget.html`:
- Change `http://localhost:8000` to your Railway backend URL

### 5. Test Webhooks (Optional)

If using messaging integrations:

- **WhatsApp webhook:** `https://your-backend-url/webhook/whatsapp`
- **Telegram webhook:** `https://your-backend-url/webhook/telegram`
- **Slack webhook:** `https://your-backend-url/webhook/slack/events`

Configure these in your respective platform's settings.

---

## Environment Variables Reference

### Required
- `GROQ_API_KEY` - Get from https://console.groq.com/keys

### Optional (Messaging Integrations)
- **Twilio (WhatsApp):**
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_WHATSAPP_NUMBER`
  - Get from https://www.twilio.com

- **Telegram:**
  - `TELEGRAM_BOT_TOKEN`
  - Create bot via @BotFather on Telegram

- **Slack:**
  - `SLACK_BOT_TOKEN`
  - `SLACK_SIGNING_SECRET`
  - Create at https://api.slack.com/apps

---

## Monitoring & Logs

In Railway dashboard:
- Click your service
- Go to **"Logs"** tab to see real-time logs
- Check for errors and API responses

---

## Custom Domain (Optional)

1. In Railway project settings
2. Add domain: `yourdomain.com`
3. Follow DNS configuration steps
4. Point both frontend and backend to custom domains

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check logs, ensure all dependencies in requirements.txt |
| Frontend can't reach backend | Verify `VITE_API_URL` env var matches backend URL |
| Webhooks not working | Check firewall, ensure Railway isn't blocking requests |
| Out of memory errors | Increase Railway plan or optimize FAISS index |

---

## Database Persistence

- SQLite database is stored in `/app/backend/data/`
- FAISS indices are cached in the same directory
- Data persists across deployments

---

## Performance Tips

1. **First request slow?** → FAISS index loading, subsequent requests are faster
2. **Model downloads on startup** → Normal for first deploy, cached thereafter
3. **High memory usage?** → Expected with Sentence Transformers + FAISS
4. **Want to scale?** → Railway supports horizontal scaling with higher plans

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Test in browser
4. ✅ Configure webhooks if using integrations
5. ✅ Set up custom domain
6. ✅ Monitor logs and performance

**Your QuestAI is now live!** 🚀
