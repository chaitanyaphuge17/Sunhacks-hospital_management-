# 🚀 Deployment Guide - Vercel Backend + Cloudflare Frontend

Complete guide for deploying MediGraph AI Hospital System with:
- **Backend**: FastAPI on Vercel (serverless)
- **Frontend**: React + Vite on Cloudflare Pages (static)

---

## 📋 Table of Contents

1. [Quick Start (Local Development)](#quick-start-local-development)
2. [Backend Deployment (Vercel)](#backend-deployment-vercel)
3. [Frontend Deployment (Cloudflare)](#frontend-deployment-cloudflare)
4. [Post-Deployment Configuration](#post-deployment-configuration)
5. [Troubleshooting](#troubleshooting)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Quick Start (Local Development)

### 1. Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your credentials
cp .env.example .env
# Edit .env with MongoDB, Neo4j, and Groq API keys

# Run backend
python -m uvicorn backend.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Update API URL in .env if needed
# VITE_API_URL=http://localhost:8000

# Run development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3. Test Credentials

```
Email: admin@hospital.com
Password: Admin@123
```

---

## 🔧 Backend Deployment (Vercel)

### Prerequisites

1. **GitHub Account** - Repository hosting
2. **Vercel Account** - https://vercel.com (free tier)
3. **MongoDB Atlas** - Hosted MongoDB (free tier available)
4. **Neo4j Cloud** - Hosted Neo4j (free tier available)
5. **Groq API Key** - Free tier available at https://console.groq.com

### Step 1: Prepare Backend for Vercel

#### 1.1 Create `vercel.json` in project root:

```json
{
  "buildCommand": "pip install -r requirements.txt",
  "functions": {
    "backend/main.py": {
      "memory": 3008,
      "maxDuration": 30
    }
  },
  "env": {
    "PYTHONUNBUFFERED": "1"
  }
}
```

#### 1.2 Create `api/index.py` as Vercel entry point:

```python
# api/index.py
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Import FastAPI app
from backend.main import app

# Export for Vercel
handler = app
```

#### 1.3 Update `requirements.txt`:

Ensure it includes:
```
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.0
pymongo==4.6.0
neo4j==5.14.0
groq==0.4.2
python-json-logger==2.0.7
python-dotenv==1.0.0
```

#### 1.4 Update `.gitignore`:

```
# Vercel
.vercel/
.vercel_build_output/

# Python
__pycache__/
*.py[cod]
*$py.class
venv/
env/

# Environment
.env
.env.local
.env.*.local
```

### Step 2: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/hospital.git

# Push to main branch
git push -u origin main
```

### Step 3: Deploy to Vercel

#### 3.1 Connect GitHub to Vercel:

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select your **hospital** repository
4. Click **"Import"**

#### 3.2 Configure Project Settings:

1. **Framework Preset**: Select `Other`
2. **Root Directory**: Leave as `.` (root)
3. **Build Command**: `pip install -r requirements.txt`
4. **Output Directory**: Leave empty
5. **Install Command**: Leave default

#### 3.3 Set Environment Variables:

Click **"Environment Variables"** and add:

```
MONGODB_URI = mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE = hospital_db
NEO4J_URI = neo4j+s://your-instance.neo4jdb.io:7687
NEO4J_USERNAME = neo4j
NEO4J_PASSWORD = your-password
GROQ_API_KEY = your-groq-api-key
SERVER_PORT = 8000
LOG_LEVEL = INFO
CORS_ORIGINS = ["https://your-frontend-domain.com", "https://www.your-frontend-domain.com"]
```

#### 3.4 Deploy:

1. Click **"Deploy"**
2. Wait for build to complete (takes 2-3 minutes)
3. Get your API URL: `https://your-project-name.vercel.app`

### Step 4: Verify Backend Deployment

```bash
# Test API endpoint
curl https://your-project-name.vercel.app/docs

# Should return Swagger UI HTML
# Full API docs available at: https://your-project-name.vercel.app/docs
```

### Troubleshooting Vercel Deployment

#### Build fails with "Module not found"

```bash
# Ensure all imports are correct
python -c "from backend.main import app"

# Recreate requirements.txt
pip freeze > requirements.txt
```

#### Database connection timeout

```bash
# Check MongoDB URI is correct
# Verify IP whitelist in MongoDB Atlas allows Vercel IPs

# In MongoDB Atlas:
# Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
```

#### Function timeout (>30 seconds)

```bash
# Vercel free tier has 30s limit per function
# Consider upgrading to Pro for 60s limit
# Or optimize database queries
```

---

## 📱 Frontend Deployment (Cloudflare Pages)

### Prerequisites

1. **GitHub Account** - With hospital repository
2. **Cloudflare Account** - Free tier at https://dash.cloudflare.com
3. **Custom Domain** (optional) - Use Cloudflare's free domain or yours

### Step 1: Prepare Frontend for Cloudflare

#### 1.1 Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-domain.vercel.app
```

#### 1.2 Update `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

#### 1.3 Create `frontend/wrangler.toml` (Cloudflare config):

```toml
name = "hospital-frontend"
type = "javascript"
account_id = ""  # Leave empty, Cloudflare fills this
workers_dev = true
route = ""       # Will be set by Cloudflare Pages
zone_id = ""     # Will be set by Cloudflare Pages

env.production = { name = "hospital-frontend-prod" }

[env.production.env]
VITE_API_URL = "https://your-backend-domain.vercel.app"

[[build.upload.rules]]
type = "CompiledContentType"
globs = ["**/*.wasm"]
fallthrough = false
```

#### 1.4 Create `frontend/_redirects`:

```
/* /index.html 200
/api/* https://your-backend-domain.vercel.app/:splat 200
```

#### 1.5 Create `frontend/_headers`:

```
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

### Step 2: Push Updated Code to GitHub

```bash
cd frontend

# Commit changes
git add .
git commit -m "Configure for Cloudflare Pages deployment"
git push origin main
```

### Step 3: Deploy to Cloudflare Pages

#### 3.1 Connect GitHub to Cloudflare:

1. Go to **https://dash.cloudflare.com**
2. Sign in or create account
3. Navigate to **"Pages"** on the left menu
4. Click **"Create a project"** → **"Connect to Git"**

#### 3.2 Select Repository:

1. Authorize Cloudflare to access GitHub
2. Select your **hospital** repository
3. Click **"Begin setup"**

#### 3.3 Configure Build Settings:

| Setting | Value |
|---------|-------|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js version** | 18.x |
| **Root directory** | `frontend` |

#### 3.4 Set Environment Variables:

Click **"Edit variables"** and add:

```
VITE_API_URL = https://your-backend-domain.vercel.app
NODE_ENV = production
```

#### 3.5 Deploy:

1. Click **"Save and deploy"**
2. Wait for build to complete (takes 1-2 minutes)
3. Get your site URL: `https://hospital-frontend.pages.dev`

### Step 4: Configure Custom Domain (Optional)

#### 4.1 Add Custom Domain:

1. Go to **Pages → hospital-frontend → Custom domains**
2. Click **"Set up a custom domain"**
3. Enter your domain: `hospital.yourdomain.com`
4. Cloudflare will guide you through DNS setup (if using Cloudflare DNS)

#### 4.2 Update Backend CORS:

Go to **Vercel Dashboard** → **hospital-backend** → **Settings** → **Environment Variables**

Update `CORS_ORIGINS`:

```json
["https://hospital.yourdomain.com", "https://hospital-frontend.pages.dev"]
```

### Step 5: Verify Frontend Deployment

1. Open **https://hospital-frontend.pages.dev** in browser
2. Should see login page with MediGraph AI logo
3. Test login with credentials:
   - Email: `admin@hospital.com`
   - Password: `Admin@123`
4. Navigate to Dashboard
5. Verify backend API calls work (check Network tab in browser DevTools)

### Troubleshooting Cloudflare Deployment

#### Build fails "Module not found"

```bash
cd frontend
npm install
npm run build  # Test locally first
```

#### CORS errors in browser console

```
# Update CORS_ORIGINS in Vercel backend environment variables
CORS_ORIGINS = ["https://hospital-frontend.pages.dev"]

# Then redeploy Vercel backend
```

#### API requests returning 404

```bash
# Verify VITE_API_URL in Cloudflare environment variables
# Should be: https://your-backend-domain.vercel.app
# NOT: https://your-backend-domain.vercel.app/

# Check _redirects file exists in frontend root
```

---

## Post-Deployment Configuration

### 1. Database Setup

#### MongoDB Atlas Setup:

1. **Create Cluster:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up or log in
   - Create new cluster (M0 free tier)
   - Wait 7-10 minutes for setup

2. **Get Connection String:**
   - Click "Connect"
   - Select "Drivers"
   - Copy connection string
   - Replace `<password>` with your password
   - Use as `MONGODB_URI` in Vercel

3. **Allow Vercel/Cloudflare IPs:**
   - Go to **Network Access**
   - Click **Add IP Address**
   - Enter `0.0.0.0/0` (Allow from Anywhere)
   - Confirm

#### Neo4j Cloud Setup:

1. **Create Instance:**
   - Go to https://neo4j.com/cloud/aura
   - Create new instance (free tier: 1GB)
   - Wait for provisioning

2. **Get Credentials:**
   - Copy connection string
   - Save username and password securely
   - Use for `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`

### 2. Groq API Key

1. **Get Free API Key:**
   - Go to https://console.groq.com
   - Sign up
   - Create API key
   - Copy to `GROQ_API_KEY` in both Vercel environments

### 3. Environment Variables Summary

**Vercel Backend Environment Variables:**

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=hospital_db
NEO4J_URI=neo4j+s://your-instance.neo4jdb.io:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-neo4j-password
GROQ_API_KEY=your-groq-api-key
SERVER_PORT=8000
LOG_LEVEL=INFO
CORS_ORIGINS=["https://hospital-frontend.pages.dev"]
JWT_SECRET=your-secret-key-change-this
```

**Cloudflare Pages Environment Variables:**

```
VITE_API_URL=https://your-backend-domain.vercel.app
```

---

## 🔍 Verification Checklist

After deployment, verify everything works:

### Backend Verification

- [ ] **API is accessible**
  ```bash
  curl https://your-backend-domain.vercel.app/docs
  # Should return Swagger UI HTML
  ```

- [ ] **Database connections work**
  ```bash
  curl https://your-backend-domain.vercel.app/patients
  # Should return patient list (might be empty)
  ```

- [ ] **AI agents initialize**
  - Check Vercel logs: no import errors
  - Groq API key is valid

- [ ] **CORS is configured**
  - Test from Cloudflare frontend
  - No "CORS error" in browser console

### Frontend Verification

- [ ] **Site loads**
  - Open https://hospital-frontend.pages.dev
  - Should see Login page with MediGraph logo

- [ ] **Login works**
  - Use admin@hospital.com / Admin@123
  - Should redirect to Dashboard

- [ ] **API calls work**
  - Open DevTools → Network tab
  - Login and navigate
  - No 404 or CORS errors
  - API responses visible in Network tab

- [ ] **Features functional**
  - [ ] Dashboard loads KPIs
  - [ ] Can add patient
  - [ ] Can run analysis
  - [ ] Can view history
  - [ ] Can control AI agents

### Database Verification

```bash
# Test MongoDB connection (optional, for manual testing)
python
>>> from pymongo import MongoClient
>>> client = MongoClient("your-mongodb-uri")
>>> db = client["hospital_db"]
>>> print(db.list_collection_names())

# Test Neo4j connection (optional)
from neo4j import GraphDatabase
driver = GraphDatabase.driver("neo4j-uri", auth=("neo4j", "password"))
session = driver.session()
result = session.run("RETURN 'Neo4j working'")
print(result.single())
```

---

## 🔄 Continuous Deployment

### Automatic Deploys on Git Push

Both Vercel and Cloudflare are configured to auto-deploy on push:

```bash
# Make changes locally
git add .
git commit -m "Fix: update feature"

# Push to GitHub
git push origin main

# Vercel Backend: Auto-deploys in ~2 minutes
# Cloudflare Frontend: Auto-deploys in ~1 minute
```

### Redeploy if Needed

**Vercel Backend:**
1. Dashboard → hospital-backend
2. Click "Deployments" tab
3. Find deployment → Click "..." → "Redeploy"

**Cloudflare Frontend:**
1. Pages → hospital-frontend
2. Click "Deployments" tab
3. Find deployment → Click "Retry deployment"

---

## 🛡️ Security Best Practices

### 1. Protect Sensitive Data

```bash
# NEVER commit .env to GitHub
# .env should be in .gitignore
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### 2. Rotate API Keys Regularly

```bash
# Every 3 months:
# 1. Generate new Groq API key
# 2. Update in Vercel environment variables
# 3. Delete old key from Groq console
```

### 3. Monitor API Usage

**Groq Free Tier Limits:**
- 30 requests per minute
- Monitor at https://console.groq.com

**MongoDB Atlas:**
- Free tier: 512MB storage
- Monitor usage in Atlas dashboard

**Neo4j Cloud:**
- Free tier: 1GB storage  
- Monitor in Neo4j Aura dashboard

### 4. Enable HTTPS

- ✅ Vercel: Auto HTTPS (included)
- ✅ Cloudflare Pages: Auto HTTPS (included)
- ✅ Use custom domains with HTTPS

### 5. API Rate Limiting

Consider adding rate limiting to backend:

```python
# Install
pip install slowapi

# In backend/main.py before FastAPI initialization
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

---

## 📊 Monitoring & Maintenance

### View Logs

**Vercel Backend Logs:**

1. Dashboard → hospital-backend → "Deployments"
2. Click on deployment
3. View "Build Logs" and "Runtime Logs"
4. Or use Vercel CLI:
   ```bash
   vercel logs
   ```

**Cloudflare Frontend Logs:**

1. Pages → hospital-frontend → "Deployments"
2. Click on deployment
3. View "Build logs"
4. Check "Analytics" for traffic

### Performance Monitoring

**Vercel Analytics:**
- Web Vitals - Core Web Vitals metrics
- Available in Pro plan (free plan has limited analytics)

**Cloudflare Analytics:**
- Free plan includes:
  - Request count
  - Bandwidth usage
  - Cache hit ratio
  - Top pages, countries, etc.

### Uptime Monitoring (Free Tools)

```bash
# Use UptimeRobot or similar
# Monitor: https://your-backend-domain.vercel.app/docs
# If down, will alert you

# Or use cron job for periodic testing:
0 */6 * * * curl https://your-backend-domain.vercel.app/docs
```

### Regular Maintenance Tasks

| Task | Frequency | Steps |
|------|-----------|-------|
| **Update Dependencies** | Monthly | `pip freeze > requirements.txt`, redeploy |
| **Rotate API Keys** | Quarterly | Generate new, update env vars, delete old |
| **Check Storage Usage** | Monthly | MongoDB Atlas & Neo4j dashboards |
| **Review Logs** | Weekly | Check for errors in Vercel logs |
| **Test Critical Flows** | Weekly | Login, add patient, run analysis |
| **Backup Data** | Monthly | Export MongoDB collections (Atlas automatic) |

---

## 🐛 Troubleshooting

### Backend Issues

#### "Module not found" error

```bash
# Check requirements.txt has all packages
pip freeze | grep -E "fastapi|uvicorn|pymongo|neo4j|groq"

# Regenerate if missing
pip freeze > requirements.txt
git push origin main  # Auto-redeploy
```

#### "Connection timeout" error

```bash
# MongoDB IP Whitelist:
# Atlas → Network Access → Add IP → 0.0.0.0/0

# Neo4j Firewall:
# Aura → Settings → Check firewall rules

# Test manually:
python -c "from pymongo import MongoClient; MongoClient('your-uri')"
```

#### "Groq API Key invalid"

```bash
# Verify key in Vercel environment:
# Dashboard → Settings → Environment Variables
# Check GROQ_API_KEY value
# Regen at https://console.groq.com if needed
```

### Frontend Issues

#### "CORS error" in console

```bash
# Backend CORS_ORIGINS needs frontend URL:
# Vercel → hospital-backend → Settings → Environment Variables
CORS_ORIGINS = ["https://hospital-frontend.pages.dev"]
# Then redeploy backend
```

#### "API not responding"

```bash
# Check VITE_API_URL in Cloudflare:
# Pages → hospital-frontend → Settings → Environment Variables
# Should be: https://your-backend-domain.vercel.app
# NOT: https://your-backend-domain.vercel.app/ (no trailing slash)
```

#### "Login page loading slowly"

```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check Cloudflare cache:
# Pages → hospital-frontend → Analytics → Cache
```

### Deployment Issues

#### "Build fails on Vercel"

```bash
# Test locally first
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -c "from backend.main import app; print('OK')"

# Check Vercel logs for specific error
# Dashboard → Deployments → Click failed build → View logs
```

#### "Build fails on Cloudflare"

```bash
# Test frontend build locally
cd frontend
npm install
npm run build

# Check Cloudflare build logs
# Pages → hospital-frontend → Deployments → View build logs
```

---

## 📞 Support Resources

### Important Links

- **Vercel Docs**: https://vercel.com/docs
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Neo4j Docs**: https://neo4j.com/docs/
- **Groq Docs**: https://console.groq.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/

### Common Commands

```bash
# Deploy latest changes
git push origin main  # Auto-deploys to both services

# View Vercel logs
vercel logs

# View Cloudflare logs
wrangler logs  # Requires Wrangler CLI

# Test API locally before pushing
curl http://localhost:8000/docs
curl http://localhost:5173  # Frontend

# Full system test
python test_api.py  # Run test suite
```

---

## ✅ Deployment Checklist

Before going live, ensure:

- [ ] GitHub repository is private/secure
- [ ] .env file is in .gitignore (never committed)
- [ ] Vercel backend deployed and API accessible
- [ ] Cloudflare frontend deployed and loads
- [ ] MongoDB Atlas cluster created and whitelist configured
- [ ] Neo4j Cloud instance created with credentials saved
- [ ] Groq API key generated and stored
- [ ] CORS_ORIGINS configured in Vercel
- [ ] VITE_API_URL configured in Cloudflare
- [ ] All 6 AI agents initialize without error
- [ ] Login functionality works end-to-end
- [ ] Dashboard loads with real data
- [ ] Analysis can be run successfully
- [ ] History is saved to database
- [ ] Custom domain configured (optional)
- [ ] HTTPS is enabled (automatic)
- [ ] Monitoring tools set up (optional)
- [ ] Team notified of live URLs

---

## 📈 Scaling for Production

### As Usage Grows

**Backend (Vercel):**
- Upgrade to Pro plan for 60s timeout (vs 30s free)
- Use Vercel Postgres for caching Layer
- Monitor costs at https://vercel.com/pricing

**Frontend (Cloudflare):**
- Already on global CDN (free plan included)
- Upgrade to Pro for higher limits
- Supports unlimited requests

**Databases:**
- MongoDB: Upgrade from free tier ($57/month minimum)
- Neo4j: Upgrade from free tier ($92/month minimum)
- Both have autoscaling options

**Costs Estimate (Monthly):**

| Service | Free | Paid |
|---------|------|------|
| Vercel | $0 | $20+ |
| Cloudflare | $0 | $20+ |
| MongoDB | $0 (512MB) | $57+ |
| Neo4j | $0 (1GB) | $92+ |
| Groq API | $0 | $0.00005/token |
| **Total** | **$0** | **$169+** |

---

**Last Updated**: April 2026  
**Status**: Production Ready ✅

For additional help, see main [README.md](README.md)

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d yourdomain.com

# Certbot will automatically renew
```

### Nginx Configuration with SSL

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring

### Backend Logs
```bash
# View logs in real-time
tail -f /var/log/hospital-backend.log

# Search for errors
grep ERROR /var/log/hospital-backend.log
```

### Health Check
```bash
# Check if backend is running
curl https://your-api.com/health

# Check API docs
https://your-api.com/docs
```

### Database Connection
```bash
# Test MongoDB
python -c "from pymongo import MongoClient; print(MongoClient('$MONGODB_URL'))"

# Test Neo4j
cypher "match (n) return count(n)" -a neo4j -u neo4j -p $NEO4J_PASSWORD -uri $NEO4J_URI
```

---

## Troubleshooting

### Backend won't start
```bash
# Check Python version (needs 3.10+)
python --version

# Check dependencies
pip list | grep -E "fastapi|pymongo|neo4j|groq"

# Test imports
python -c "from backend.main import app"
```

### Frontend build fails
```bash
# Clear node_modules
rm -rf node_modules
npm install

# Check Node version (needs 18+)
node --version

# Rebuild
npm run build
```

### Database connection fails
- Check connection string format
- Verify IP whitelisting (cloud databases)
- Test with MongoDB Compass / Neo4j Browser
- Check firewall rules

### CORS errors
- Verify `CORS_ORIGINS` includes your frontend URL
- Check headers with: `curl -H "Origin: your-url" -v http://api-url`

---

## Database Setup

### MongoDB Atlas (Cloud)

1. **Create account:** https://www.mongodb.com/cloud/atlas
2. **Create cluster** (free tier available)
3. **Create database user** with strong password
4. **Whitelist IP** or use 0.0.0.0 for testing
5. **Copy connection string** and add to `.env`

### Neo4j Cloud

1. **Create account:** https://neo4j.com/cloud
2. **Create instance** (free tier available)
3. **Copy URI, username, password**
4. **Add to `.env`**

### Self-Hosted

You can also run MongoDB and Neo4j on your own servers using apt-get or docker (if you want to use containers just for databases).

---

## Performance Tips

1. **Enable gzip compression** in Nginx
2. **Use CDN** for static frontend files
3. **Database indexes** - ensure proper indexes on frequently queried fields
4. **Connection pooling** - configured in app, increase if needed
5. **Caching** - implement Redis for frequently accessed data

---

## Backups

### MongoDB
```bash
# Dump database
mongodump --uri "$MONGODB_URL" --out ./backup

# Restore database
mongorestore --uri "$MONGODB_URL" ./backup
```

### Upload to cloud storage
```bash
# AWS S3
aws s3 cp backup s3://bucket-name/backup-$(date +%Y-%m-%d).tar.gz

# Google Cloud Storage
gsutil cp backup gs://bucket-name/backup-$(date +%Y-%m-%d).tar.gz
```

---

**Need help?** Check the main README.md or review the test files (test_api.py, test_mongo.py) for examples.
