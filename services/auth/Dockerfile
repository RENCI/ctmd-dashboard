# Multi-stage build for smaller, more secure image
FROM python:3.12-alpine AS builder

# Install build dependencies
RUN apk --no-cache add gcc musl-dev libffi-dev openssl-dev make

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies with updated versions
# Connexion 3.x requires the 'flask' extra to be installed
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    flask==3.0.3 \
    flask-cors==4.0.1 \
    greenlet==3.1.1 \
    gevent==24.2.1 \
    gunicorn==23.0.0 \
    "connexion[flask,swagger-ui]==3.1.0" \
    requests==2.32.3 \
    python-dateutil==2.9.0

# Production stage
FROM python:3.12-alpine

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser && \
    mkdir -p /usr/src/app && \
    chown -R appuser:appuser /usr/src/app

WORKDIR /usr/src/app

# Copy application code
COPY --chown=appuser:appuser api /usr/src/app/api

# Switch to non-root user
USER appuser

# Use virtual environment
ENV PATH="/opt/venv/bin:$PATH"

EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/v1/authorize?apikey=health || exit 1

ENTRYPOINT ["gunicorn"]

CMD ["-w", "4", "-b", "0.0.0.0:8080", "--worker-class", "gevent", "--timeout", "30", "api.server:create_app()"]
