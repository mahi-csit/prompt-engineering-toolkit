# Quick Start: Production Deployment

**TL;DR** - Deploy this project to production in 3 steps.

## Step 1: Backend (Render)

```bash
# 1. Create MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
# 2. Go to https://render.com and create new Web Service
# 3. Connect your GitHub repo, point to /backend folder
# 4. Set environment variables in Render dashboard:

MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=prompt_toolkit
SECRET_KEY=<generate-strong-key>
ENVIRONMENT=production
```

**Generate SECRET_KEY:**
```python
python -c "import secrets; print(secrets.token_hex(32))"
```

## Step 2: Frontend (Vercel)

```bash
# 1. Go to https://vercel.com and import your GitHub repo
# 2. Set Root Directory to: frontend
# 3. Add environment variable:

VITE_API_URL=https://your-render-backend.onrender.com
```

## Step 3: Verify

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Test demo model
curl -X POST https://your-backend.onrender.com/api/playground/quick-test \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "provider": "mock", "model": "demo-fast"}'
```

## What's Included

✓ **Demo Models** - No API keys needed, works out of the box
✓ **MongoDB Atlas** - Free tier available
✓ **Render** - Free tier available  
✓ **Vercel** - Free tier available

## Key Features

- **Frontend**: React + Vite on Vercel
- **Backend**: FastAPI on Render
- **Database**: MongoDB Atlas
- **Models**: Demo models (fast, creative, detailed)

## Files Created for Deployment

- `backend/render.yaml` - Render configuration
- `frontend/vercel.json` - Vercel configuration
- `frontend/.env.production` - Frontend prod env
- `DEPLOYMENT.md` - Detailed instructions

## First Deploy

1. Commit and push all changes to GitHub
2. Render auto-deploys when it detects changes
3. Vercel auto-deploys when it detects changes
4. Both should take 3-5 minutes

## After Deploy

- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-project.onrender.com`
- API Docs: `https://your-project.onrender.com/api/docs`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend deployment fails | Check render.yaml is in /backend folder |
| Frontend can't reach API | Verify VITE_API_URL is set in Vercel env vars |
| Database connection fails | Check MONGODB_URL format and IP whitelist |
| Models don't work | Verify provider="mock" and model="demo-fast" |

## Support

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **MongoDB Docs**: https://docs.mongodb.com

## Next Steps

Once deployed:
1. Create a custom domain (both platforms support this)
2. Set up monitoring/alerts
3. Configure backups for MongoDB
4. Plan for scaling if needed

---

**Ready to deploy?** See `DEPLOYMENT.md` for detailed instructions.
