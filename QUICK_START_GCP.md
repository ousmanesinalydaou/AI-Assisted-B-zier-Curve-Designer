# Google Cloud Deployment - Quick Start

This guide will help you deploy the Bézier Curve Designer application to Google Cloud Run in minutes.

## 📋 Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud CLI** installed: https://cloud.google.com/sdk/docs/install
3. **Docker** installed: https://www.docker.com/products/docker-desktop
4. **Git** for version control

## 🚀 Quick Deployment (5 minutes)

### Step 1: Google Cloud Setup

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
export PROJECT_ID="bezier-designer-$(date +%s)"
gcloud projects create $PROJECT_ID
gcloud config set project $PROJECT_ID

# Enable billing (required for Cloud Run)
# Visit: https://console.cloud.google.com/billing

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Step 2: Create Secrets

```bash
# Create MongoDB connection string secret
echo -n "mongodb+srv://username:password@cluster.mongodb.net/bezier_designer" | \
  gcloud secrets create mongodb-url --data-file=-

# Create API secret key
openssl rand -hex 32 | gcloud secrets create api-secret-key --data-file=-

# Grant Cloud Run access to secrets
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding mongodb-url \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding api-secret-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 3: Deploy with Script

**For Linux/Mac:**
```bash
chmod +x deploy.sh
export PROJECT_ID="your-project-id"
./deploy.sh
# Select option 1 for both services
```

**For Windows PowerShell:**
```powershell
$env:PROJECT_ID = "your-project-id"
.\deploy.ps1
# Select option 1 for both services
```

### Step 4: Access Your Application

After deployment completes, you'll see:
- Frontend URL: `https://bezier-designer-frontend-xxxxx-uc.a.run.app`
- Backend URL: `https://bezier-designer-backend-xxxxx-uc.a.run.app`

Visit the Frontend URL in your browser! 🎉

## 🔄 Automated Deployment (GitHub Actions)

### Step 1: Create Service Account

```bash
# Create service account for GitHub Actions
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deployer"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com
```

### Step 2: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add these secrets:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `GCP_SA_KEY`: Contents of `github-actions-key.json` file

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Add Google Cloud deployment configuration"
git push origin main
```

GitHub Actions will automatically deploy on every push to `main`! ✨

## 🐳 Local Testing with Docker

```bash
# Test locally before deploying
docker-compose up --build

# Access locally:
# Frontend: http://localhost:8080
# Backend: http://localhost:8000
```

## 📊 Monitoring & Logs

### View Logs
```bash
# Frontend logs
gcloud run logs read bezier-designer-frontend --region us-central1 --limit 50

# Backend logs
gcloud run logs read bezier-designer-backend --region us-central1 --limit 50
```

### Monitor in Console
Visit: https://console.cloud.google.com/run

## 💰 Cost Estimate

With default settings:
- **Free tier**: 2M requests/month, 360K GB-seconds memory, 180K vCPU-seconds
- **Light usage**: ~$5-10/month
- **Moderate usage**: ~$20-50/month

Optimize costs by:
- Setting min instances to 0 (default)
- Using CPU throttling when idle
- Implementing request caching

## 🔧 Common Issues

### Issue: Build Timeout
**Solution**: Increase timeout in `cloudbuild.yaml` or `deploy.sh`

### Issue: Memory Errors
**Solution**: Increase memory in deployment command:
```bash
--memory 1Gi  # or higher
```

### Issue: Cold Start Delays
**Solution**: Set minimum instances:
```bash
gcloud run services update bezier-designer-frontend \
  --min-instances 1 \
  --region us-central1
```

### Issue: CORS Errors
**Solution**: Update backend CORS origins:
```bash
gcloud run services update bezier-designer-backend \
  --set-env-vars BACKEND_CORS_ORIGINS=https://your-frontend-url.run.app \
  --region us-central1
```

## 📚 Additional Resources

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Google Cloud Run Docs**: https://cloud.google.com/run/docs
- **Cloud Build Docs**: https://cloud.google.com/build/docs
- **Pricing Calculator**: https://cloud.google.com/products/calculator

## 🎯 Next Steps

1. **Custom Domain**: Map your own domain name
2. **SSL Certificate**: Automatically provisioned by Google
3. **CI/CD Pipeline**: Already configured with GitHub Actions
4. **Monitoring**: Set up Cloud Monitoring alerts
5. **Backup**: Configure automated database backups

## 🆘 Support

- GitHub Issues: Create an issue in the repository
- Google Cloud Support: https://cloud.google.com/support
- Documentation: Check `DEPLOYMENT.md` for detailed instructions

---

**Congratulations!** 🎉 Your application is now deployed to Google Cloud Run!
