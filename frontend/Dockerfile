# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --prefer-offline

COPY frontend/ .

# Build with API pointing to /api (Nginx will proxy)
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Nginx
FROM nginx:1.27-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config for SPA + API proxy
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
