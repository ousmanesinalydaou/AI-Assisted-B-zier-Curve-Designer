# Google Cloud Deployment Guide

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud CLI**: Install from [cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install from [docker.com](https://www.docker.com/products/docker-desktop)
4. **Enable Required APIs**:
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## Initial Setup

### 1. Configure Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID (replace with your actual project ID)
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Set default region
gcloud config set run/region us-central1
```

### 2. Create Secret Manager Secrets

```bash
# Create MongoDB URL secret
echo -n "your-mongodb-connection-string" | gcloud secrets create mongodb-url --data-file=-

# Create API secret key
echo -n "your-secret-key-here" | gcloud secrets create api-secret-key --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding mongodb-url \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding api-secret-key \
  --member="serviceAccount:$PROJECT_ID@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Deployment Methods

### Method 1: Automated Deployment with Cloud Build (Recommended)

This method automatically builds and deploys both services when you push to GitHub.

```bash
# Connect your GitHub repository to Cloud Build
# Visit: https://console.cloud.google.com/cloud-build/triggers

# Create a trigger that uses cloudbuild.yaml
# Or use the CLI:
gcloud builds submit --config=cloudbuild.yaml .
```

### Method 2: Manual Deployment

#### Deploy Frontend

```bash
# Build and push frontend image
cd "c:\MY FILE\Studies\Hungary\MSc Computer Science\3rd Sem\Geometric Modeling\project\app v1"

docker build -t gcr.io/$PROJECT_ID/bezier-designer-frontend:latest .
docker push gcr.io/$PROJECT_ID/bezier-designer-frontend:latest

# Deploy to Cloud Run
gcloud run deploy bezier-designer-frontend \
  --image gcr.io/$PROJECT_ID/bezier-designer-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

#### Deploy Backend

```bash
# Build and push backend image
cd backend

docker build -t gcr.io/$PROJECT_ID/bezier-designer-backend:latest .
docker push gcr.io/$PROJECT_ID/bezier-designer-backend:latest

# Deploy to Cloud Run
gcloud run deploy bezier-designer-backend \
  --image gcr.io/$PROJECT_ID/bezier-designer-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars ENVIRONMENT=production \
  --set-secrets MONGODB_URL=mongodb-url:latest,SECRET_KEY=api-secret-key:latest
```

### Method 3: Local Testing with Docker Compose

```bash
# Test locally before deploying
docker-compose up --build

# Frontend will be available at: http://localhost:8080
# Backend will be available at: http://localhost:8000
```

## Post-Deployment Configuration

### 1. Update Frontend Environment Variables

Get the backend URL and update frontend configuration:

```bash
# Get backend URL
gcloud run services describe bezier-designer-backend \
  --region us-central1 \
  --format 'value(status.url)'

# Update frontend to point to backend
gcloud run services update bezier-designer-frontend \
  --region us-central1 \
  --set-env-vars VITE_API_URL=https://your-backend-url.run.app
```

### 2. Configure Custom Domain (Optional)

```bash
# Map custom domain to frontend
gcloud run domain-mappings create \
  --service bezier-designer-frontend \
  --domain your-domain.com \
  --region us-central1

# Map custom domain to backend API
gcloud run domain-mappings create \
  --service bezier-designer-backend \
  --domain api.your-domain.com \
  --region us-central1
```

### 3. Set Up CORS (Backend)

Update backend environment variables to allow frontend domain:

```bash
gcloud run services update bezier-designer-backend \
  --region us-central1 \
  --set-env-vars BACKEND_CORS_ORIGINS=https://your-frontend-url.run.app,https://your-domain.com
```

## Monitoring and Logs

### View Logs

```bash
# Frontend logs
gcloud run logs read bezier-designer-frontend \
  --region us-central1 \
  --limit 50

# Backend logs
gcloud run logs read bezier-designer-backend \
  --region us-central1 \
  --limit 50
```

### Monitor Services

```bash
# Get service details
gcloud run services describe bezier-designer-frontend --region us-central1
gcloud run services describe bezier-designer-backend --region us-central1

# View metrics in Google Cloud Console
# Visit: https://console.cloud.google.com/run
```

## Cost Optimization

### Free Tier Limits
- 2 million requests per month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds of compute time

### Optimization Tips

1. **Set minimum instances to 0** (default) to avoid charges when idle
2. **Implement request concurrency**:
   ```bash
   gcloud run services update bezier-designer-frontend \
     --concurrency 80 \
     --region us-central1
   ```

3. **Enable CPU throttling**:
   ```bash
   gcloud run services update bezier-designer-backend \
     --cpu-throttling \
     --region us-central1
   ```

4. **Set up request timeout**:
   ```bash
   gcloud run services update bezier-designer-backend \
     --timeout 60 \
     --region us-central1
   ```

## Continuous Deployment

### GitHub Actions Integration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Google Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Build and Deploy
        run: gcloud builds submit --config=cloudbuild.yaml .
```

## Troubleshooting

### Common Issues

1. **Build Timeout**: Increase timeout in `cloudbuild.yaml`
2. **Memory Issues**: Increase memory allocation in deployment command
3. **Cold Start Delays**: Consider keeping minimum instances > 0 for critical services
4. **CORS Errors**: Verify BACKEND_CORS_ORIGINS includes frontend domain

### Health Checks

```bash
# Check frontend health
curl https://your-frontend-url.run.app/health

# Check backend health
curl https://your-backend-url.run.app/health
```

## Security Best Practices

1. **Use Secret Manager** for sensitive data (already configured)
2. **Enable VPC Connector** for private database access
3. **Implement Authentication** using Cloud IAM
4. **Regular Updates**: Keep dependencies updated
5. **Monitor Logs**: Set up log-based alerts

## Support

For issues or questions:
- Google Cloud Documentation: [cloud.google.com/run/docs](https://cloud.google.com/run/docs)
- Project Repository: Check README.md
- Google Cloud Support: [cloud.google.com/support](https://cloud.google.com/support)

## Quick Reference

| Service | Purpose | Port | Memory | CPU |
|---------|---------|------|--------|-----|
| Frontend | Web Application | 8080 | 512Mi | 1 |
| Backend | API Server | 8080 | 2Gi | 2 |

### URLs After Deployment
- Frontend: `https://bezier-designer-frontend-[hash]-uc.a.run.app`
- Backend: `https://bezier-designer-backend-[hash]-uc.a.run.app`
