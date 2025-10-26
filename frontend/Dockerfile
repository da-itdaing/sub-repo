# Multi-stage build for Vite React app

# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first (better caching)
COPY package.json ./
# If you later add a lockfile, prefer: COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# 2) Runtime stage (static serving with Nginx)
FROM nginx:alpine AS runtime
# Replace default site with SPA-friendly config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
