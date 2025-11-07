# Deployment Guide

## Table of Contents
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Google Cloud Deployment](#google-cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Logging](#monitoring--logging)

---

## Local Development

### Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/yourusername/bezier-curve-designer.git
cd bezier-curve-designer

# Start all services
docker-compose up --build

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
# MongoDB: localhost:27017
```

### Native Development (Without Docker)

**Prerequisites**:
- Node.js 18+
- Python 3.11+
- MongoDB 7.0+

**Frontend**:
```bash
npm install
npm run dev  # Starts Vite dev server on port 5173
```

**Backend**:
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python main.py  # Starts FastAPI server on port 8000
```

**MongoDB**:
```bash
# macOS/Linux
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

---

## Production Deployment

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Domain name (optional)
- SSL certificate (recommended)

### Deployment Steps

#### 1. Clone and Configure

```bash
git clone https://github.com/yourusername/bezier-curve-designer.git
cd bezier-curve-designer

# Copy and edit environment files
cp backend/.env.example backend/.env
nano backend/.env  # Edit production settings
```

#### 2. Update Environment Variables

**Backend (.env)**:
```bash
DEBUG=false
HOST=0.0.0.0
PORT=8000
MONGODB_URL=mongodb://mongodb:27017
SECRET_KEY=<generate-strong-random-key>
BACKEND_CORS_ORIGINS=https://yourdomain.com
```

**Frontend**:
Update `vite.config.ts` or use environment variables:
```typescript
define: {
  'import.meta.env.VITE_API_URL': JSON.stringify('https://api.yourdomain.com')
}
```

#### 3. Build and Start

```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Or use the standard compose file with production overrides
docker-compose up -d
```

#### 4. Verify Deployment

```bash
# Check service health
curl http://localhost:8000/health

# View logs
docker-compose logs -f

# Check running containers
docker-compose ps
```

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    restart: always
    volumes:
      - mongodb_prod_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    networks:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    environment:
      - DEBUG=false
      - MONGODB_URL=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017
    depends_on:
      - mongodb
    networks:
      - backend
      - frontend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    depends_on:
      - backend
    networks:
      - frontend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"

  reverse-proxy:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - frontend

volumes:
  mongodb_prod_data:

networks:
  backend:
  frontend:
```

---

## Google Cloud Deployment

### Using Google Cloud Run

#### 1. Install Google Cloud SDK

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

#### 2. Build and Push Container Images

```bash
# Set project ID
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1

# Build backend
cd backend
gcloud builds submit --tag gcr.io/${PROJECT_ID}/bezier-backend

# Build frontend
cd ..
gcloud builds submit --tag gcr.io/${PROJECT_ID}/bezier-frontend
```

#### 3. Deploy MongoDB on GKE or Cloud SQL

**Option A: MongoDB Atlas** (Recommended)
```bash
# Use MongoDB Atlas (managed service)
# Update MONGODB_URL to Atlas connection string
```

**Option B: Google Cloud SQL**
```bash
# Create PostgreSQL instance (alternative to MongoDB)
gcloud sql instances create bezier-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=${REGION}
```

#### 4. Deploy Backend to Cloud Run

```bash
gcloud run deploy bezier-backend \
  --image gcr.io/${PROJECT_ID}/bezier-backend \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URL=${MONGODB_URL} \
  --memory 512Mi \
  --cpu 1
```

#### 5. Deploy Frontend to Cloud Run

```bash
gcloud run deploy bezier-frontend \
  --image gcr.io/${PROJECT_ID}/bezier-frontend \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars VITE_API_URL=https://bezier-backend-xxx.run.app \
  --memory 256Mi
```

#### 6. Configure Custom Domain

```bash
# Map custom domain
gcloud run domain-mappings create \
  --service bezier-frontend \
  --domain yourdomain.com \
  --region ${REGION}

# Map API subdomain
gcloud run domain-mappings create \
  --service bezier-backend \
  --domain api.yourdomain.com \
  --region ${REGION}
```

### Using Google Kubernetes Engine (GKE)

#### 1. Create GKE Cluster

```bash
gcloud container clusters create bezier-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-2 \
  --region=${REGION}
```

#### 2. Deploy using Kubernetes

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bezier-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bezier-backend
  template:
    metadata:
      labels:
        app: bezier-backend
    spec:
      containers:
      - name: backend
        image: gcr.io/PROJECT_ID/bezier-backend
        ports:
        - containerPort: 8000
        env:
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: url
---
apiVersion: v1
kind: Service
metadata:
  name: bezier-backend
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
  selector:
    app: bezier-backend
```

```bash
kubectl apply -f k8s/
```

---

## Environment Configuration

### Required Environment Variables

**Backend**:
```bash
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Database
MONGODB_URL=mongodb://username:password@host:port/database
MONGODB_DB_NAME=bezier_designer

# Security
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# ML Model
ML_MODEL_ENABLED=true
ML_MODEL_PATH=./models/control_point_predictor.pth
```

**Frontend**:
```bash
VITE_API_URL=https://api.yourdomain.com
```

### Generating Secrets

```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate MongoDB password
openssl rand -base64 32
```

---

## Monitoring & Logging

### Application Logs

```bash
# Docker Compose logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### Health Checks

**Backend Health**:
```bash
curl https://api.yourdomain.com/health
```

**Response**:
```json
{
  "status": "healthy",
  "service": "AI-Assisted Bézier Curve Designer API",
  "version": "1.0.0"
}
```

### Performance Monitoring

**Google Cloud Monitoring**:
```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create uptime check
gcloud monitoring uptime-checks create https://api.yourdomain.com/health
```

### Error Tracking

Integrate with Sentry:

**Backend**:
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FastApiIntegration()],
    environment="production",
)
```

---

## Backup & Recovery

### MongoDB Backup

```bash
# Backup
docker exec mongodb mongodump --out /backup

# Restore
docker exec mongodb mongorestore /backup
```

### Automated Backups (Cloud)

```bash
# GCP Cloud SQL automated backups
gcloud sql backups create --instance=bezier-db

# Or use MongoDB Atlas with point-in-time recovery
```

---

## Scaling

### Horizontal Scaling

**Docker Compose**:
```bash
docker-compose up --scale backend=3
```

**Cloud Run** (auto-scaling):
```bash
gcloud run services update bezier-backend \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=100
```

### Load Balancing

Use Traefik or nginx for load balancing multiple backend instances.

---

## SSL/TLS Configuration

### Using Let's Encrypt with Traefik

Traefik automatically handles SSL certificates with Let's Encrypt.

### Using nginx

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    
    location / {
        proxy_pass http://frontend:80;
    }
    
    location /api {
        proxy_pass http://backend:8000;
    }
}
```

---

## Troubleshooting

### Common Issues

**MongoDB Connection Refused**:
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check connection string
echo $MONGODB_URL
```

**CORS Errors**:
```bash
# Verify CORS origins in backend/.env
BACKEND_CORS_ORIGINS=https://yourdomain.com
```

**Performance Issues**:
- Enable database indexing
- Use CDN for static assets
- Enable HTTP/2
- Implement caching (Redis)

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Implement rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Enable firewall rules
- [ ] Implement backup strategy

---

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- Review documentation: `docs/`
- Open issue: https://github.com/yourusername/bezier-curve-designer/issues
