# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Optimize Docker layer caching by copying dependency manifests first
COPY package*.json ./

# Install dependencies cleanly
RUN npm install

# Copy remaining application source code
COPY . .

# ==========================================
# Stage 2: Final Lightweight Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Environmental defaults
ENV NODE_ENV=production \
    PORT=8080

# Copy application files and node_modules from builder
COPY --from=builder /app ./

# Security Best Practice: Run as non-root user 'node'
USER node

# Expose internal backend port
EXPOSE 8080

# Container Healthcheck (Section 10 Requirement)
HEALTHCHECK --interval=5s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "require('http').get('http://127.0.0.1:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Launch REST API server
CMD ["node", "src/server.js"]
