# ── Frontend Dockerfile ──────────────────────────────────────────
# Runs the React dev server so you see the exact same UI as on your laptop
FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests first (Docker cache-friendly)
COPY package.json package-lock.json ./

# Install dependencies (skip optional native modules)
RUN npm install --legacy-peer-deps

# Copy the rest of the source
COPY . .

# Expose the Vite dev server port
EXPOSE 5173

# Start the dev server
# CHOKIDAR_USEPOLLING is required for file-watch to work inside Docker on Windows
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "run", "dev"]
