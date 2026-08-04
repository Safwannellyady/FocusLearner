# =============================================================================
# FocusLearner Pro - Backend Dockerfile
# Runtime: Python 3.11 (Flask API)
# Served by: Gunicorn (production WSGI server)
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Builder -- compile native extensions and cache the ML model
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements.txt .

# FIX 1: Set an explicit, predictable HuggingFace cache dir in the builder
# so the downloaded model lands exactly where we expect it.
ENV HF_HOME=/content/cache

RUN pip install --upgrade pip --no-cache-dir \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt \
    # Pre-bake the sentence-transformers model into HF_HOME=/content/cache
    && python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# ---------------------------------------------------------------------------
# Stage 2: Final runtime image -- no compiler toolchain, non-root user
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS runtime

LABEL maintainer="FocusLearner Pro Team" \
      app.version="1.0.0" \
      app.name="focuslearner-backend"

# Runtime-only OS deps (no compiler toolchain)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root system user for security
RUN groupadd --system appgroup \
    && useradd --system --gid appgroup --no-create-home appuser

# Copy compiled site-packages from the builder stage
COPY --from=builder /install /usr/local

# FIX 1 (cont.): Copy the pre-baked model from its explicit builder path
# into a shared, world-readable location inside the runtime image.
COPY --from=builder /content/cache /usr/local/share/model_cache

WORKDIR /app
COPY --chown=appuser:appgroup . .
RUN mkdir -p logs uploads \
    && chown -R appuser:appgroup /app

# FIX 1 (cont.): Tell sentence-transformers (and all HuggingFace libs) at
# runtime to look in /usr/local/share/model_cache — matching the copy above.
# This ensures zero outbound network calls are needed at container start-up.
ENV FLASK_ENV=production \
    FLASK_DEBUG=False \
    HOST=0.0.0.0 \
    PORT=5000 \
    LOG_LEVEL=WARNING \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/usr/local/share/model_cache

USER appuser
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["gunicorn", \
     "--workers", "4", \
     "--threads", "2", \
     "--timeout", "120", \
     "--bind", "0.0.0.0:5000", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "warning", \
     "app:app"]
