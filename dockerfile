# ============================================
# Stage 1: Build React Application
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 2: Production with Nginx
# ============================================
FROM nginx:alpine

# Build argument to select nginx config (default: nginx.prod.conf)
ARG NGINX_CONFIG=nginx.prod.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy selected nginx configuration
COPY ${NGINX_CONFIG} /etc/nginx/conf.d/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]