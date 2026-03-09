# Gym Management System - Deployment Guide

## Architecture Overview
- **Frontend**: React + Vite → Deployed on Vercel
- **Backend**: ASP.NET Core 8.0 → Deployed on Render (Free Tier)
- **Database**: PostgreSQL → Hosted on Supabase (Free Tier)

---

## � Local Development Setup

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (recommended for easiest setup)

### Option 1: Docker Setup (Recommended)

**1. Start all services with Docker:**
```bash
cd "C:\Users\a522\OneDrive - Autodesk\Desktop\Gym Management"
docker-compose up -d
```

This starts:
- PostgreSQL database on port `5432` 
- pgAdmin (database viewer) on port `8081`
- Backend API on port `8080`

**2. Start the frontend:**
```bash
cd frontend
npm install
npm run dev
```

**3. Access your application:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Database Admin (pgAdmin): `http://localhost:8081`

**4. Default login credentials:**
- Username: `admin`
- Password: `Admin@123`

### Option 2: Manual Setup

**1. Start a local PostgreSQL database** (or use the production Supabase database)

**2. Install backend dependencies & run:**
```bash
cd backend
dotnet restore
dotnet ef database update  # Apply database migrations
dotnet run
```
Backend will run on `http://localhost:5056`

**3. Install frontend dependencies & run:**
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:3000`

**4. Update frontend config for manual setup:**
If using local backend on port 5056, update `frontend/src/config.js`:
```javascript
API_BASE_URL: "http://localhost:5056"
```

### Database Viewing Options

**1. pgAdmin (Docker setup):**
- URL: `http://localhost:8081`
- Login: `admin@gym.com` / `admin123`
- Add server: Host=`postgres`, Port=`5432`, Database=`gym_management`, Username=`gym_user`, Password=`gym_password123`

**2. Supabase Dashboard (Production):**
- Go to [Supabase Dashboard](https://supabase.com/dashboard)
- Navigate to your project's Table Editor

**3. VS Code Extensions:**
- Install: PostgreSQL by Chris Kolkman
- Install: SQLTools by Matheus Teixeira

### Development Workflow

**Daily startup:**
```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Terminal 2: Start frontend
cd frontend
npm run dev
```

**Making database changes:**
```bash
cd backend
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

**Shutdown:**
```bash
docker-compose down    # Stop Docker services
# Ctrl+C in frontend terminal
```

---

## �🚀 Quick Deployment Steps

### Backend Deployment to Render

#### 1. Prepare Your GitHub Repository

```bash
cd "C:\Users\a522\OneDrive - Autodesk\Desktop\Gym Management"

# Initialize git if not done already
git init
git add .
git commit -m "Initial commit for Render deployment"

# Create a repo on GitHub and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### 2. Create Web Service on Render

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `gym-management-api` (or any name you prefer)
   - **Region**: Choose closest to you (Singapore for Asia-Pacific)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: `Free`

#### 3. Configure Environment Variables

In the Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `ConnectionStrings__DefaultConnection` | `User Id=postgres.hbykqocudjcwebobpftu;Password=9599454679Rr!;Server=aws-1-ap-southeast-2.pooler.supabase.com;Port=5432;Database=postgres;SSL Mode=Require;Trust Server Certificate=true` |
| `Jwt__Key` | `YourSecretKeyHere_MustBe32CharsOrMore_ChangeThis!` |
| `Jwt__Issuer` | `GymManagementApp` |
| `Jwt__Audience` | `GymManagementAppUsers` |
| `Jwt__ExpiryInMinutes` | `60` |

**⚠️ Important:** Generate a new JWT secret key for production!

#### 4. Deploy

- Click **"Create Web Service"**
- Render will automatically detect your Dockerfile and start building
- Wait 5-10 minutes for initial deployment
- Your API will be available at: `https://gym-management-api.onrender.com` (or your chosen name)

### Frontend Deployment to Vercel

1. **Update frontend config** in `frontend/src/config.js`:
   ```javascript
   const config = {
     API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 
                   "https://YOUR-SERVICE-NAME.onrender.com"
   };
   export default config;
   ```

2. **Push to Git** (if connected)
   ```bash
   cd frontend
   git add .
   git commit -m "Update backend URL for Render"
   git push
   ```

3. **Vercel Auto-deploys** your changes automatically if connected via GitHub

---

## ⚙️ Render Configuration Details

**Free Tier Features:**
- ✅ 750 hours/month (enough for 24/7 operation)
- ✅ 512 MB RAM
- ✅ Free SSL certificates
- ✅ Auto-deploy from GitHub on every push
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold start takes ~30 seconds when waking up

**Monitoring & Logs:**
- View real-time logs in Render Dashboard → Your Service → Logs
- Check deployment status and build history
- Health check endpoint: `/` (already configured)

---

## 🔄 Database Migration Workflow

### For Model Changes

1. **Create Migration**
   ```bash
   dotnet ef migrations add DescriptiveName
   ```

2. **Test Locally**
   ```bash
   dotnet ef database update
   dotnet run  # Test the changes
   ```

3. **Deploy Code First**
   - Follow backend deployment steps above

4. **Update Production Database**
   
   **Option A: Auto-migration (Current setup)**
   - App automatically runs migrations on startup
   - No additional steps needed
   
   **Option B: Manual SQL (Safer for production)**
   ```bash
   # Generate SQL script
   dotnet ef migrations script > migration.sql
   # Run SQL in Supabase dashboard manually
   ```

---

## 🌐 URLs & Endpoints

### Production URLs
- **Frontend**: https://gym-management-eight-sooty.vercel.app
- **Backend**: https://gym-management-8kth.onrender.com
- **Database**: Supabase PostgreSQL (managed)

### Key API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/members` - Get all members
- `POST /api/members` - Add new member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `GET /api/visitors` - Get visitors
- `GET /api/ptclients` - Get PT clients

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **CORS Errors**
**Symptoms**: Frontend can't connect to backend
**Solution**: 
- Check CORS config in Program.cs
- Current policy: `AllowAnyOrigin()` (should work for all origins)
- Verify backend URL is correct in frontend config

#### 2. **JWT Errors (500 Internal Server Error)**
**Symptoms**: Login fails with 500 error
**Solution**: 
- Verify JWT environment variables in Render dashboard
- Check that Jwt__Key, Jwt__Issuer, Jwt__Audience are set correctly
- JWT Key must be at least 32 characters

#### 3. **Database Connection Errors**
**Symptoms**: Can't fetch data, database errors
**Solution**: 
- Verify Supabase connection string in Render environment variables
- Check Supabase dashboard for connection limits
- Ensure SSL Mode=Require is set in connection string

#### 4. **Cold Start Delays**
**Symptoms**: First request after inactivity takes 30+ seconds
**Solution**: 
- This is normal for Render free tier (service spins down after 15 min)
- Consider upgrading to paid tier for always-on service
- Use external monitoring service (like UptimeRobot) to ping every 14 minutes

#### 5. **404 on Page Refresh (Vercel)**
**Symptoms**: Refreshing page shows 404
**Solution**: 
- Ensure `vercel.json` contains rewrite rules
- Current rule: `"source": "/(.*)" → "destination": "/index.html"`

### Debug Tools

#### Check Backend Health
```bash
curl https://YOUR-SERVICE-NAME.onrender.com/
```

#### Test Authentication
```bash
curl -X POST https://YOUR-SERVICE-NAME.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

#### View Logs
- Render Dashboard → Your Service → Logs tab
- Real-time log streaming available

---

## 📝 Pre-Deployment Checklist

### Before Deploying Backend to Render
- [ ] Code pushed to GitHub repository
- [ ] Test locally with `dotnet run`
- [ ] Run database migrations if needed
- [ ] Verify Dockerfile builds successfully
- [ ] Prepare environment variables (connection string, JWT settings)
- [ ] Check for compilation warnings

### Before Deploying Frontend to Vercel
- [ ] Update API URL in `src/config.js` with Render backend URL
- [ ] Test build locally with `npm run build`
- [ ] Check console for errors
- [ ] Verify routing works correctly

### After Deployment
- [ ] Test login functionality
- [ ] Test CRUD operations (Create, Read, Update, Delete)
- [ ] Check Render logs for errors
- [ ] Verify database connections work
- [ ] Test page refresh functionality on Vercel
- [ ] Monitor for cold start performance

---

## 🔐 Security Notes

### Important Credentials
- **Database**: Supabase connection string (stored in Azure)
- **JWT**: Secret key for token generation (stored in Azure)
- **Admin**: Default username: `admin`, password: `Admin@123` (change this!)

### Production Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret key (32+ characters)
- [ ] Enable HTTPS only
- [ ] Review CORS policy (currently allows all origins)
- [ ] Monitor access logs
- [ ] Keep dependencies updated

---

## 🚨 Emergency Rollback

If deployment breaks production:

1. **Keep last working deployment.zip as backup**
2. **Redeploy previous version**:
   - Use backup deployment.zip in Azure Kudu
   - Or rollback via Azure Portal → Deployment Center

3. **Database rollback** (if needed):
   ```bash
   # Rollback to previous migration
   dotnet ef database update PreviousMigrationName
   ```

---

## 📞 Support Resources

- **Azure Portal**: https://portal.azure.com
- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Backend Logs**: Azure App Service → Log Stream
- **Database Monitoring**: Supabase → Settings → Database

---

*Last Updated: February 7, 2026*
*Application Version: 1.0*
*Created for: Gym Management System*