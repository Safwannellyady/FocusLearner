# =============================================================================
# FocusLearner Pro - Frontend Dockerfile
# Build: Node 20 + React (Create React App)
# Served by: Nginx 1.27-alpine (static file server + reverse proxy)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Builder -- compile the React production bundle
# ---------------------------------------------------------------------------
FROM node:20-alpine3.20 AS builder

LABEL stage="builder"

WORKDIR /app

# Copy dependency manifests first to exploit Docker layer caching.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# FIX 2: Use a relative path /api instead of hardcoding http://localhost:5000.
# The user's browser will send API requests to the same origin it loaded from,
# and Nginx will reverse-proxy /api/ to the backend container. This means the
# image works correctly whether deployed locally, on a VM, or on a cloud host.
ENV NODE_ENV=production \
    REACT_APP_API_URL=/api

RUN npm run build


# ---------------------------------------------------------------------------
# Stage 2: Runtime -- serve the static bundle with Nginx
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine3.20 AS runtime

LABEL maintainer="FocusLearner Pro Team" \
      app.version="1.0.0" \
      app.name="focuslearner-frontend"

# Remove the default placeholder config
RUN rm /etc/nginx/conf.d/default.conf

# FIX 3: Actually copy the custom Nginx config into the image.
# Previously this was missing — Nginx would start with no server blocks
# and immediately exit with a configuration error.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the production bundle from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx Alpine already drops worker privileges; no extra user creation needed.

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
