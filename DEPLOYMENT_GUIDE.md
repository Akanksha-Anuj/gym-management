# Gym Management System - Deployment Guide

## Architecture Overview
- **Frontend**: React + Vite → Deployed on Vercel
- **Backend**: ASP.NET Core 8.0 → Deployed on Azure App Service (Linux)
- **Database**: PostgreSQL → Hosted on Supabase

---

## 🚀 Quick Deployment Steps

### Backend Deployment to Azure

1. **Build & Package**
   ```bash
   cd "C:\Users\a522\OneDrive - Autodesk\Desktop\Gym Management\backend"
   dotnet publish -c Release -o ./publish
   cd publish
   Compress-Archive -Path * -DestinationPath "..\deployment.zip" -Force
   ```

2. **Deploy to Azure**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to App Service: `calm-water-db8d0e2cfc5c4067b7ef2d0eb82b0d18`
   - Development Tools → Advanced Tools → Go (opens Kudu)
   - Navigate to `/site/wwwroot/`
   - Upload & extract `deployment.zip`

### Frontend Deployment to Vercel

1. **Push to Git** (if connected)
   ```bash
   cd "C:\Users\a522\OneDrive - Autodesk\Desktop\Gym Management\frontend"
   git add .
   git commit -m "Update frontend"
   git push
   ```

2. **Manual Upload**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Drag & drop frontend folder or use Vercel CLI

---

## ⚙️ Azure App Service Configuration

### Required App Settings
```
JWT__Key = YourSecretKeyHere_MustBe32CharsOrMore_ChangeThis!
JWT__Issuer = GymManagementApp
JWT__Audience = GymManagementAppUsers
JWT__ExpiryInMinutes = 60
ASPNETCORE_ENVIRONMENT = Production
```

### Required Connection Strings
```
Name: DefaultConnection
Type: PostgreSQL
Value: User Id=postgres.hbykqocudjcwebobpftu;Password=9599454679Rr!;Server=aws-1-ap-southeast-2.pooler.supabase.com;Port=5432;Database=postgres;SSL Mode=Require;Trust Server Certificate=true
```

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
- **Backend**: https://calm-water-db8d0e2cfc5c4067b7ef2d0eb82b0d18.azurewebsites.net
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
- Check Azure App Service CORS settings
- Verify frontend URL is allowed in CORS policy
- Current policy: `AllowAnyOrigin()` (should work)

#### 2. **JWT Errors (500 Internal Server Error)**
**Symptoms**: Login fails with 500 error
**Solution**: 
- Verify JWT settings in Azure App Service
- Check that JWT__Key, JWT__Issuer, JWT__Audience are set
- JWT__Key must be at least 32 characters

#### 3. **Database Connection Errors**
**Symptoms**: Can't fetch data, database errors
**Solution**: 
- Verify Supabase connection string in Azure
- Check Supabase dashboard for connection limits
- Ensure SSL Mode=Require is set

#### 4. **404 on Page Refresh (Vercel)**
**Symptoms**: Refreshing page shows 404
**Solution**: 
- Ensure `vercel.json` contains rewrite rules
- Current rule: `"source": "/(.*)" → "destination": "/index.html"`

### Debug Tools

#### Check Backend Health
```bash
curl https://calm-water-db8d0e2cfc5c4067b7ef2d0eb82b0d18.azurewebsites.net/
```

#### Test Authentication
```bash
curl -X POST https://calm-water-db8d0e2cfc5c4067b7ef2d0eb82b0d18.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

#### Azure Logs
- Azure Portal → App Service → Monitoring → Log stream

---

## 📝 Pre-Deployment Checklist

### Before Deploying Backend
- [ ] Test locally with `dotnet run`
- [ ] Run database migrations if needed
- [ ] Update appsettings.json if needed
- [ ] Check for compilation warnings
- [ ] Verify CORS settings for production

### Before Deploying Frontend
- [ ] Update API URLs in `src/config.js`
- [ ] Test build locally with `npm run build`
- [ ] Check console for errors
- [ ] Verify routing works correctly

### After Deployment
- [ ] Test login functionality
- [ ] Test CRUD operations (Create, Read, Update, Delete)
- [ ] Check Azure logs for errors
- [ ] Verify database connections
- [ ] Test page refresh functionality on Vercel

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