# =============================================================================
# FocusLearner Pro - Backend Dockerfile
# Runtime: Python 3.11 (Flask API)
# Served by: Gunicorn (production WSGI server)
# Optimized for: Railway / Cloud / Containerized Deployments
# =============================================================================

# ---------------------------------------------------------------------------
# Stage 1: Builder -- compile native extensions and cache ML/NLTK assets
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential libpq-dev git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements.txt .

ENV HF_HOME=/content/cache

RUN pip install --upgrade pip --no-cache-dir \
    && pip install --prefix=/install --no-cache-dir -r requirements.txt \
    && python -m nltk.downloader -d /usr/local/share/nltk_data punkt stopwords punkt_tab \
    && python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# ---------------------------------------------------------------------------
# Stage 2: Final runtime image -- no compiler toolchain, non-root user
# ---------------------------------------------------------------------------
FROM python:3.11-slim-bookworm AS runtime

LABEL maintainer="FocusLearner Pro Team" \
      app.version="1.0.0" \
      app.name="focuslearner-backend"

# Runtime-only OS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Non-root system user for security
RUN groupadd --system appgroup \
    && useradd --system --gid appgroup --no-create-home appuser

# Copy compiled site-packages from builder
COPY --from=builder /install /usr/local

# Copy pre-baked model cache and NLTK corpora
COPY --from=builder /content/cache /usr/local/share/model_cache
COPY --from=builder /usr/local/share/nltk_data /usr/local/share/nltk_data

WORKDIR /app
COPY --chown=appuser:appgroup . .
RUN mkdir -p logs uploads \
    && chown -R appuser:appgroup /app

# Configure runtime environment
ENV FLASK_ENV=production \
    FLASK_DEBUG=False \
    HOST=0.0.0.0 \
    PORT=5000 \
    LOG_LEVEL=WARNING \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HF_HOME=/usr/local/share/model_cache \
    NLTK_DATA=/usr/local/share/nltk_data

USER appuser
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

CMD ["gunicorn", \
     "--workers", "2", \
     "--threads", "2", \
     "--timeout", "120", \
     "--bind", "0.0.0.0:5000", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--log-level", "warning", \
     "app:app"]
