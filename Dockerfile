# ==============================================================================
# Development Dockerfile for KewaFlow Frontend
# Keeps all dependencies and build artifacts completely isolated inside Docker.
# ==============================================================================
FROM node:20-alpine

# Install libc6-compat if needed by Next.js / native bindings
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Expose Next.js development server port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy package manifests first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies strictly inside container
RUN npm install

# Copy application source code
COPY . .

# Start Next.js development server binding to 0.0.0.0 for external access
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]
