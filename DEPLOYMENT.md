# Production Deployment Guide

This project is configured for production deployment using:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
- **Models**: Demo Models only (no external API dependencies)

## Prerequisites

1. MongoDB Atlas cluster (free tier available)
2. Render account (free tier available)
3. Vercel account (free tier available)
4. GitHub repository

## Backend Deployment (Render)

### Step 1: Prepare MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster or use existing cluster
3. Create a database user with appropriate permissions
4. Whitelist IP addresses or allow all (0.0.0.0/0) for Render
5. Copy the connection string

### Step 2: Deploy to Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set the following:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`

### Step 3: Configure Environment Variables on Render

Add these environment variables in Render dashboard:

```
MONGODB_URL=mongodb+srv://username:password@your-cluster.mongodb.net/
MONGODB_DB_NAME=prompt_toolkit
SECRET_KEY=<generate-strong-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=production
LOG_LEVEL=INFO
```

Generate SECRET_KEY with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 4: Enable Auto-Deploy

Set your Render service to auto-deploy on push to main branch.

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set the following:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Configure Environment Variables

Add this environment variable in Vercel project settings:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

Replace `your-render-backend-url` with your actual Render service URL.

### Step 3: Enable Auto-Deploy

Vercel automatically deploys on push to main branch.

## Demo Models

The application uses **Demo Models only** in production:

- **demo-fast**: Quick, concise responses (2-3 sentences)
- **demo-creative**: Creative responses with emojis and examples
- **demo-detailed**: Comprehensive, multi-paragraph responses

These models work without any external API keys and provide realistic, relevant responses for demonstration purposes.

## Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Render backend deployed with environment variables set
- [ ] Vercel frontend deployed with API URL configured
- [ ] CORS origins updated in backend for production domain
- [ ] Database backups configured in MongoDB Atlas
- [ ] Custom domain names configured (optional)
- [ ] SSL certificates enabled (automatic on both platforms)
- [ ] Health check endpoint working: `/health`
- [ ] API documentation accessible: `https://your-api.onrender.com/api/docs`

## Security Notes

1. **Never commit real secrets** to GitHub - use platform environment variables
2. **Update CORS origins** if using custom domains
3. **Enable MongoDB IP whitelist** for additional security
4. **Monitor logs** on both Render and Vercel dashboards
5. **Set up alerts** for deployment failures or errors

## Health Check

Verify your backend is running:

```bash
curl https://your-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "prompt-engineering-toolkit",
  "database": "mongodb",
  "environment": "production",
  "version": "1.0.0"
}
```

## Monitoring

- **Render**: View logs in the Render dashboard under "Logs"
- **Vercel**: View logs in the Vercel dashboard or use CLI
- **MongoDB**: View metrics in MongoDB Atlas dashboard

## Troubleshooting

### Backend not deploying
- Check that `render.yaml` is in the backend directory
- Verify environment variables are set correctly
- Check build logs in Render dashboard

### Frontend can't reach API
- Verify `VITE_API_URL` is set correctly in Vercel
- Check CORS configuration in backend
- Use browser DevTools to inspect network requests

### Database connection issues
- Verify MongoDB connection string format
- Check IP whitelist in MongoDB Atlas
- Ensure database user has proper permissions
- Verify `MONGODB_DB_NAME` matches your database name

## Local Development

For local development, use the included `.env` and `.env.example` files:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` for the frontend and `http://localhost:8000/api/docs` for API docs.
