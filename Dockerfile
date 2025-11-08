# Frontend Production Dockerfile for Google Cloud Run
# Multi-stage build for optimized image size

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Production image with nginx
FROM nginx:alpine

# Install curl for health checks (required by GCP)
RUN apk add --no-cache curl

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration optimized for Cloud Run
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx user if not exists and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Cloud Run expects the app to listen on PORT environment variable
ENV PORT=8080
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Run nginx in foreground
CMD sed -i "s/listen 80;/listen ${PORT};/" /etc/nginx/nginx.conf && \
    nginx -g "daemon off;"