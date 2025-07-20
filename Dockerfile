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
RUN ls -la dist/ && test -f dist/main.js

# --- Production image ---
FROM node:20-slim AS production
WORKDIR /app

# Copy package.json for production dependencies
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy backend build output
COPY --from=backend-build /app/dist ./dist

# Copy other necessary backend files
COPY --from=backend-build /app/repos ./repos

# Copy frontend build output if the backend serves it
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Verify the main.js file exists in the final image
RUN ls -la dist/ && test -f dist/main.js

EXPOSE 3000
CMD ["node", "dist/main.js"]