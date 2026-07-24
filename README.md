# Enterprise Prompt Engineering Toolkit

A production-ready platform for creating, testing, versioning, evaluating, and comparing LLM prompts.

## 🚀 Quick Deploy to Production

**See [QUICK_START_PRODUCTION.md](QUICK_START_PRODUCTION.md) for 3-step deployment guide.**

Full deployment instructions: [DEPLOYMENT.md](DEPLOYMENT.md)

## Project Structure

```
project/
├── backend/               FastAPI backend (Python 3.11)
│   ├── app/
│   │   ├── api/           Route handlers
│   │   ├── core/          Config, database, security, logging
│   │   ├── models/        Beanie ODM models (MongoDB)
│   │   ├── providers/     LLM providers (OpenAI, Gemini, Anthropic, Demo)
│   │   ├── schemas/       Pydantic request/response schemas
│   │   ├── services/      Business logic layer
│   │   └── main.py        FastAPI app entry point
│   ├── .env               Environment variables
│   ├── .env.example       Template for environment variables
│   ├── render.yaml        Render deployment config
│   └── requirements.txt
├── frontend/              React + Vite + TailwindCSS
│   ├── .env.production    Production environment config
│   ├── .env.example       Template for environment variables
│   ├── vercel.json        Vercel deployment config
│   └── src/               React components and pages
├── database/              MongoDB schema
├── evaluations/           Evaluation rubrics (JSON)
├── docs/                  API reference and setup guides
├── DEPLOYMENT.md          Complete deployment guide
├── QUICK_START_PRODUCTION.md  3-step deployment
├── PRODUCTION_CHECKLIST.md    Pre/post deployment checklist
└── README.md
```

## ✨ Features

| Feature | Status |
|---------|--------|
| Prompt Builder (templates + variables) | ✅ |
| Prompt Library (CRUD, search, favorites) | ✅ |
| Playground (multi-model comparison) | ✅ |
| Prompt Optimizer | ✅ |
| Prompt Evaluator | ✅ |
| Version History + Rollback | ✅ |
| JWT Authentication | ✅ |
| Analytics Dashboard | ✅ |
| Dark / Light Mode | ✅ |
| Responsive UI | ✅ |
| Demo Models (no API keys needed) | ✅ |

## 🛠 Tech Stack

**Backend:** FastAPI · Beanie ODM · MongoDB · JWT · Pydantic v2

**Frontend:** React 18 · Vite · TailwindCSS · React Router · Axios

**LLM Providers:**
- ✅ OpenAI GPT (with API key)
- ✅ Google Gemini (with API key)
- ✅ Anthropic Claude (with API key)
- ✅ **Demo Models** (no API key needed)

## 🏃 Quick Start (Local Development)

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

Configure `.env`:
```
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=prompt_toolkit
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
```

Run:
```bash
uvicorn app.main:app --reload --port 8000
```

API Docs → http://localhost:8000/api/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App → http://localhost:5173

## 🔑 Environment Variables

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URL` | MongoDB connection string | Yes |
| `MONGODB_DB_NAME` | Database name | Yes |
| `SECRET_KEY` | JWT signing key | Yes |
| `ENVIRONMENT` | `production` or `development` | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `GEMINI_API_KEY` | Google Gemini API key | Optional |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Optional |

### Frontend (.env.production)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |

## 📚 Documentation

- [QUICK_START_PRODUCTION.md](QUICK_START_PRODUCTION.md) - 3-step deployment guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment instructions
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Pre/post deployment checklist
- [docs/API.md](docs/API.md) - API endpoint reference
- [docs/SETUP.md](docs/SETUP.md) - Detailed setup guide

## 🚀 Production Deployment

### Quickest Way (3 steps)
1. Read [QUICK_START_PRODUCTION.md](QUICK_START_PRODUCTION.md)
2. Deploy backend to Render
3. Deploy frontend to Vercel

### Complete Guide
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed, step-by-step instructions.

### Deployment Platforms
- ✅ **Backend:** Render.com (free tier available)
- ✅ **Frontend:** Vercel (free tier available)
- ✅ **Database:** MongoDB Atlas (free tier available)

## 📝 Demo Models

Three demo models included that work without API keys:

- **demo-fast** - Quick, concise responses (2-3 sentences)
- **demo-creative** - Creative responses with emojis and examples
- **demo-detailed** - Comprehensive, multi-paragraph responses

All models are topic-aware and provide realistic responses for testing.

## 🔒 Security

- ✅ JWT authentication
- ✅ No credentials in source code
- ✅ Environment variable configuration
- ✅ CORS properly configured
- ✅ Secure password hashing
- ✅ Production-ready configuration

## 💡 Quick Tips

**First Time Deploying?**
1. Start with [QUICK_START_PRODUCTION.md](QUICK_START_PRODUCTION.md)
2. Demo models work without any API keys
3. Optional: Add real API keys later

**Local Development?**
1. Copy `.env.example` to `.env`
2. Update MongoDB URL if needed
3. Run backend and frontend in separate terminals

**Need Help?**
1. Check troubleshooting in [DEPLOYMENT.md](DEPLOYMENT.md)
2. View API docs at `/api/docs` when backend runs
3. Check browser console for frontend errors

## 📞 Support

For detailed information:
- Production deployment → [DEPLOYMENT.md](DEPLOYMENT.md)
- API documentation → [docs/API.md](docs/API.md)
- Setup guide → [docs/SETUP.md](docs/SETUP.md)
