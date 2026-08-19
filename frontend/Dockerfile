# ==========================================
# Stage 1: Build React static bundle
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Optimize layer caching for dependencies
COPY package*.json ./

RUN npm install

# Copy source code and build production assets
COPY . .

RUN npm run build

# ==========================================
# Stage 2: Serve static files with Nginx
# ==========================================
FROM nginx:alpine AS runner

WORKDIR /usr/share/nginx/html

# Remove default Nginx website
RUN rm -rf ./*

# Copy built static bundle from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose internal web server port
EXPOSE 80

# Health check for Nginx container
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:80/ > /dev/null || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
