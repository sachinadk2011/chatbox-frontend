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

# Expose the CRA dev server port
EXPOSE 3000

# Start the dev server
# CHOKIDAR_USEPOLLING is required for file-watch to work inside Docker on Windows
ENV CHOKIDAR_USEPOLLING=true
ENV WDS_SOCKET_PORT=0

CMD ["npm", "start"]
