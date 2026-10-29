# Frontend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Expose port
EXPOSE 5173

# Start server (using a simple static server for production)
CMD ["npx", "vite", "preview", "--port", "5173", "--host"]