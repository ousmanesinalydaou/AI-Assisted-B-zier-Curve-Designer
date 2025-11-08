# PowerShell Deployment Script for Google Cloud Run
# This script builds and deploys both frontend and backend to Google Cloud

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Bézier Curve Designer - Cloud Deployment     ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Check if PROJECT_ID is set
if (-not $env:PROJECT_ID) {
    $env:PROJECT_ID = Read-Host "Please enter your Google Cloud Project ID"
}

Write-Host "Using Project ID: $env:PROJECT_ID" -ForegroundColor Green
Write-Host ""

# Region configuration
if (-not $env:REGION) {
    $env:REGION = "us-central1"
}
Write-Host "Using Region: $env:REGION" -ForegroundColor Green
Write-Host ""

# Service names
$FRONTEND_SERVICE = "bezier-designer-frontend"
$BACKEND_SERVICE = "bezier-designer-backend"

# Ask what to deploy
Write-Host "What would you like to deploy?" -ForegroundColor Yellow
Write-Host "1) Both Frontend and Backend"
Write-Host "2) Frontend only"
Write-Host "3) Backend only"
$choice = Read-Host "Enter choice [1-3]"

function Deploy-Frontend {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "Building Frontend..." -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    
    docker build -t "gcr.io/$env:PROJECT_ID/$FRONTEND_SERVICE`:latest" -f Dockerfile .
    
    Write-Host "`nPushing Frontend image..." -ForegroundColor Green
    docker push "gcr.io/$env:PROJECT_ID/$FRONTEND_SERVICE`:latest"
    
    Write-Host "`nDeploying Frontend to Cloud Run..." -ForegroundColor Green
    gcloud run deploy $FRONTEND_SERVICE `
        --image "gcr.io/$env:PROJECT_ID/$FRONTEND_SERVICE`:latest" `
        --platform managed `
        --region $env:REGION `
        --allow-unauthenticated `
        --port 8080 `
        --memory 512Mi `
        --cpu 1 `
        --max-instances 10 `
        --set-env-vars NODE_ENV=production
    
    $script:FRONTEND_URL = gcloud run services describe $FRONTEND_SERVICE `
        --region $env:REGION `
        --format 'value(status.url)'
    
    Write-Host "`n✓ Frontend deployed successfully!" -ForegroundColor Green
    Write-Host "URL: $script:FRONTEND_URL" -ForegroundColor Green
}

function Deploy-Backend {
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "Building Backend..." -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    
    docker build -t "gcr.io/$env:PROJECT_ID/$BACKEND_SERVICE`:latest" -f backend/Dockerfile ./backend
    
    Write-Host "`nPushing Backend image..." -ForegroundColor Green
    docker push "gcr.io/$env:PROJECT_ID/$BACKEND_SERVICE`:latest"
    
    Write-Host "`nDeploying Backend to Cloud Run..." -ForegroundColor Green
    gcloud run deploy $BACKEND_SERVICE `
        --image "gcr.io/$env:PROJECT_ID/$BACKEND_SERVICE`:latest" `
        --platform managed `
        --region $env:REGION `
        --allow-unauthenticated `
        --port 8080 `
        --memory 2Gi `
        --cpu 2 `
        --max-instances 10 `
        --timeout 300 `
        --set-env-vars ENVIRONMENT=production `
        --set-secrets "MONGODB_URL=mongodb-url:latest,SECRET_KEY=api-secret-key:latest"
    
    $script:BACKEND_URL = gcloud run services describe $BACKEND_SERVICE `
        --region $env:REGION `
        --format 'value(status.url)'
    
    Write-Host "`n✓ Backend deployed successfully!" -ForegroundColor Green
    Write-Host "URL: $script:BACKEND_URL" -ForegroundColor Green
}

# Execute based on choice
switch ($choice) {
    "1" {
        Deploy-Backend
        Deploy-Frontend
        
        # Update frontend with backend URL
        Write-Host "`nUpdating Frontend with Backend URL..." -ForegroundColor Green
        $BACKEND_URL = gcloud run services describe $BACKEND_SERVICE `
            --region $env:REGION `
            --format 'value(status.url)'
        
        gcloud run services update $FRONTEND_SERVICE `
            --region $env:REGION `
            --set-env-vars "VITE_API_URL=$BACKEND_URL"
        
        Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host "✓ Deployment Complete!" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host "Frontend: $script:FRONTEND_URL" -ForegroundColor Green
        Write-Host "Backend:  $script:BACKEND_URL" -ForegroundColor Green
    }
    "2" {
        Deploy-Frontend
    }
    "3" {
        Deploy-Backend
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Deployment finished successfully! 🎉         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
