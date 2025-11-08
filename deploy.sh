#!/bin/bash

# Quick Deployment Script for Google Cloud Run
# This script builds and deploys both frontend and backend to Google Cloud

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Bézier Curve Designer - Cloud Deployment     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}PROJECT_ID not set. Please enter your Google Cloud Project ID:${NC}"
    read PROJECT_ID
    export PROJECT_ID
fi

echo -e "${GREEN}Using Project ID: ${PROJECT_ID}${NC}"
echo ""

# Region configuration
REGION=${REGION:-"us-central1"}
echo -e "${GREEN}Using Region: ${REGION}${NC}"
echo ""

# Service names
FRONTEND_SERVICE="bezier-designer-frontend"
BACKEND_SERVICE="bezier-designer-backend"

# Ask what to deploy
echo -e "${YELLOW}What would you like to deploy?${NC}"
echo "1) Both Frontend and Backend"
echo "2) Frontend only"
echo "3) Backend only"
read -p "Enter choice [1-3]: " choice

deploy_frontend() {
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Building Frontend...${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    docker build -t gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest -f Dockerfile .
    
    echo -e "\n${GREEN}Pushing Frontend image...${NC}"
    docker push gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest
    
    echo -e "\n${GREEN}Deploying Frontend to Cloud Run...${NC}"
    gcloud run deploy $FRONTEND_SERVICE \
        --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 8080 \
        --memory 512Mi \
        --cpu 1 \
        --max-instances 10 \
        --set-env-vars NODE_ENV=production
    
    FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE \
        --region $REGION \
        --format 'value(status.url)')
    
    echo -e "\n${GREEN}✓ Frontend deployed successfully!${NC}"
    echo -e "${GREEN}URL: ${FRONTEND_URL}${NC}"
}

deploy_backend() {
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Building Backend...${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    docker build -t gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest -f backend/Dockerfile ./backend
    
    echo -e "\n${GREEN}Pushing Backend image...${NC}"
    docker push gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest
    
    echo -e "\n${GREEN}Deploying Backend to Cloud Run...${NC}"
    gcloud run deploy $BACKEND_SERVICE \
        --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 8080 \
        --memory 2Gi \
        --cpu 2 \
        --max-instances 10 \
        --timeout 300 \
        --set-env-vars ENVIRONMENT=production \
        --set-secrets MONGODB_URL=mongodb-url:latest,SECRET_KEY=api-secret-key:latest
    
    BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
        --region $REGION \
        --format 'value(status.url)')
    
    echo -e "\n${GREEN}✓ Backend deployed successfully!${NC}"
    echo -e "${GREEN}URL: ${BACKEND_URL}${NC}"
}

# Execute based on choice
case $choice in
    1)
        deploy_backend
        deploy_frontend
        
        # Update frontend with backend URL
        echo -e "\n${GREEN}Updating Frontend with Backend URL...${NC}"
        BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE \
            --region $REGION \
            --format 'value(status.url)')
        
        gcloud run services update $FRONTEND_SERVICE \
            --region $REGION \
            --set-env-vars VITE_API_URL=$BACKEND_URL
        
        echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✓ Deployment Complete!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}Frontend: ${FRONTEND_URL}${NC}"
        echo -e "${GREEN}Backend:  ${BACKEND_URL}${NC}"
        ;;
    2)
        deploy_frontend
        ;;
    3)
        deploy_backend
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Deployment finished successfully! 🎉         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
