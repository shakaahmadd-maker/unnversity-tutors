# Stage 1: Build application and bundle backend server
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies using clean reproducible npm ci
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production Node.js 22 Runtime
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV UPLOADS_DIR=/app/uploads

# IMPORTANT:
# DATABASE_URL, SESSION_SECRET, and sensitive credentials are read strictly at runtime
# from process.env / Dokploy environment variable settings.
# No sensitive credentials or secrets are placed in ARG or ENV instructions.

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled backend server and static frontend assets
COPY --from=builder /app/dist ./dist

# Create persistent upload folders structure (volume mount point: /app/uploads)
RUN mkdir -p /app/uploads/avatars /app/uploads/blogs /app/uploads/documents /app/uploads/general

EXPOSE 3000

# Backend start command
CMD ["node", "dist/server.cjs"]
