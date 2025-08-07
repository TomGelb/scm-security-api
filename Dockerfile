# --- Frontend build stage ---
FROM node:20 AS frontend-build
WORKDIR /app/frontend
# Copy frontend's package.json and install dependencies
COPY frontend/package.json ./
RUN npm install
# Copy frontend source and build
COPY frontend/ .
RUN npm run build

# --- Backend build stage ---
FROM node:20 AS backend-build
WORKDIR /app
# Copy backend's package.json and install dependencies
COPY package.json ./
RUN npm install
# Copy backend source code
COPY . .
# Build the backend application using TypeScript compiler directly
RUN npx tsc
# Verify the build output exists
RUN ls -la dist/ && ls -la dist/src/ && test -f dist/src/main.js

# --- Production image ---
FROM node:20-slim AS production
WORKDIR /app

# Install git and other necessary packages
RUN apt-get update && apt-get install -y \
    git \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install gitleaks
RUN wget -O /tmp/gitleaks.tar.gz https://github.com/gitleaks/gitleaks/releases/download/v8.28.0/gitleaks_8.28.0_linux_x64.tar.gz \
    && tar -xzf /tmp/gitleaks.tar.gz -C /usr/local/bin gitleaks \
    && chmod +x /usr/local/bin/gitleaks \
    && rm /tmp/gitleaks.tar.gz

# Copy package.json for production dependencies
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy backend build output
COPY --from=backend-build /app/dist ./dist

# Try to copy repos directory, create it if it doesn't exist
RUN if [ -d "/app/repos" ]; then \
        echo "Copying existing repos directory"; \
        cp -r /app/repos ./repos; \
    else \
        echo "Creating repos directory"; \
        mkdir -p ./repos; \
    fi

# Copy frontend build output if the backend serves it
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Verify the main.js file exists in the final image
RUN ls -la dist/ && ls -la dist/src/ && test -f dist/src/main.js

EXPOSE 3000
CMD ["node", "dist/src/main.js"]