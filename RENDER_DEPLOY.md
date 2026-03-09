# Quick Render Deployment Guide

## 🚀 Fast Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Deploy to Render"
git remote add origin https://github.com/YOUR_USERNAME/gym-management.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Render

1. Go to **[Render Dashboard](https://dashboard.render.com/)**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:
   - **Name**: `gym-management-api`
   - **Region**: Singapore (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: `Free`

### 3. Set Environment Variables

Add these in Render dashboard:

```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=User Id=postgres.hbykqocudjcwebobpftu;Password=9599454679Rr!;Server=aws-1-ap-southeast-2.pooler.supabase.com;Port=5432;Database=postgres;SSL Mode=Require;Trust Server Certificate=true
Jwt__Key=YourSecretKeyHere_MustBe32CharsOrMore_ChangeThis!
Jwt__Issuer=GymManagementApp
Jwt__Audience=GymManagementAppUsers
Jwt__ExpiryInMinutes=60
```

### 4. Update Frontend

Edit `frontend/src/config.js`:
```javascript
API_BASE_URL: 'https://gym-management-8kth.onrender.com'
```

Push changes and Vercel will auto-deploy.

✅ **Your backend is live at:** https://gym-management-8kth.onrender.com

---

## ⚡ Key Points

- **Free Tier**: 750 hours/month
- **Cold Starts**: ~30 seconds after 15 min inactivity
- **Auto-Deploy**: Pushes to GitHub automatically redeploy
- **Logs**: View in Render Dashboard → Your Service → Logs

---

## 🔗 Useful Links

- [Render Dashboard](https://dashboard.render.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## ⚠️ Security Reminder

**Before going live:**
1. Generate a new JWT secret key (32+ characters)
2. Change default admin password from `Admin@123`
3. Consider database connection limits on Supabase free tier
