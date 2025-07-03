# 🚀 PANDO - Quick Setup Guide for Google Cloud SQL

## ⚡ Quick Start (5 Minutes)

### 1. Prerequisites
```bash
# Install Google Cloud CLI
# Windows: https://cloud.google.com/sdk/docs/install-sdk
# Or use: choco install gcloudsdk

# Login to Google Cloud
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. One-Command Setup
```bash
# Install dependencies and setup everything
npm install && npm run setup-gcp
```

### 3. Configure Your Project

#### Update `app.yaml` with your real values:
```yaml
env_variables:
  GOOGLE_CLOUD_PROJECT: "your-actual-project-id"
  CLOUD_SQL_CONNECTION_NAME: "your-project:us-central1:pando-mysql"
  DB_PASSWORD: "your-secure-password"
  GMAIL_USER: "your-email@gmail.com"
  GMAIL_PASS: "your-gmail-app-password"

beta_settings:
  cloud_sql_instances: "your-project:us-central1:pando-mysql"
```

### 4. Deploy
```bash
npm run deploy
```

## 🔧 Manual Setup (If Needed)

### Create Cloud SQL Instance
```bash
# Create MySQL instance
npm run cloud-sql:create

# Create database and set password
gcloud sql databases create pando_db --instance=pando-mysql
gcloud sql users set-password root --host=% --instance=pando-mysql --password=YOUR_SECURE_PASSWORD
```

### Test Everything
```bash
# Test email configuration
npm run test-email

# Test database connection
npm run test-db

# Setup database tables
npm run setup-gcp
```

## 📋 Required Files for Deployment

Make sure these files are properly configured:

### ✅ Essential Files
- `app.yaml` - App Engine configuration
- `package.json` - Dependencies and scripts
- `server.js` - Main application (already updated)
- `config/gcp-database.js` - Database configuration (new)

### ✅ Configuration Files
- `config/email.js` - Email settings
- `config.env.example` - Environment variables template

### ✅ Setup Scripts
- `setup-gcp-database.js` - Database initialization (new)
- `deploy-gcp.sh` - Automated deployment (new)

### ✅ Build Configuration
- `cloudbuild.yaml` - Cloud Build automation (updated)

## 🔑 Key Values to Replace

Before deployment, replace these placeholders:

1. **In `app.yaml`:**
   - `tu-proyecto-id` → Your Google Cloud Project ID
   - `tu-proyecto:us-central1:pando-mysql` → Your Cloud SQL connection name
   - `tu-contraseña-mysql` → Your MySQL password
   - Email credentials

2. **Get your connection name:**
   ```bash
   gcloud sql instances describe pando-mysql --format="value(connectionName)"
   ```

## 🚨 Common Issues & Quick Fixes

### Issue: "Instance not found"
```bash
# Create the instance first
npm run cloud-sql:create
```

### Issue: "Access denied"
```bash
# Reset password
gcloud sql users set-password root --host=% --instance=pando-mysql --password=NEW_PASSWORD
```

### Issue: "Email not working"
```bash
# Test email configuration
npm run test-email
# Check Gmail app password: https://myaccount.google.com/apppasswords
```

### Issue: "Database connection failed"
```bash
# Test database
npm run test-db
# Check Cloud SQL is running
gcloud sql instances describe pando-mysql
```

## 📱 Post-Deployment

### Access Your App
- **Main site**: `https://YOUR_PROJECT_ID.uc.r.appspot.com`
- **Admin panel**: `https://YOUR_PROJECT_ID.uc.r.appspot.com/admin.html`

### Monitor Your App
```bash
# View logs
npm run logs

# Open in browser
npm run open

# Connect to database
npm run cloud-sql:connect
```

## 💰 Cost Estimation

- **App Engine**: $5-20/month (based on traffic)
- **Cloud SQL**: $10-15/month (db-f1-micro)
- **Total**: ~$15-35/month

## 🆘 Need Help?

1. **Check the full guide**: `README-GOOGLE-CLOUD.md`
2. **Google Cloud Docs**: https://cloud.google.com/docs
3. **App Engine Docs**: https://cloud.google.com/appengine/docs
4. **Cloud SQL Docs**: https://cloud.google.com/sql/docs

---

**Your PANDO application is now ready for Google Cloud! 🎉**
