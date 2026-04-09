# Multi-stage build untuk React + Vite + TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build aplikasi
RUN npm run build

# =======================
# Stage Production - Nginx
# =======================
FROM nginx:alpine

# Copy hasil build ke Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Buat direktori yang diperlukan dan set permission
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run /tmp && \
    chown -R 100:101 /var/cache/nginx /var/log/nginx /var/run /usr/share/nginx/html /tmp && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /var/run

# Custom nginx.conf dengan PID di /tmp
RUN printf 'pid /tmp/nginx.pid;\n\
events {}\n\
http {\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    sendfile on;\n\
    keepalive_timeout 65;\n\
    server {\n\
        listen 80;\n\
        server_name _;\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        location / {\n\
            try_files $uri $uri/ /index.html;\n\
        }\n\
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\n\
            expires 1y;\n\
            add_header Cache-Control "public, immutable";\n\
        }\n\
        location /health {\n\
            access_log off;\n\
            return 200 "healthy\\n";\n\
            add_header Content-Type text/plain;\n\
        }\n\
    }\n\
}\n' > /etc/nginx/nginx.conf

# Jalankan sebagai non-root user nginx (UID 100, GID 101)
USER 100:101

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Run Nginx
CMD ["nginx", "-g", "daemon off;"]