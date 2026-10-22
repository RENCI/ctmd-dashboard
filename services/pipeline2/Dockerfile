FROM python:3.12-slim

ARG BUILD_DATE
ARG BUILD_REF
ENV BUILD_DATE=${BUILD_DATE}

WORKDIR /app

# Install postgresql-client and force the latest ca-certificates so the
# distrusted eMudhra/emSign roots are removed from the system trust store
# (CVE-2026-111943, Debian DSA-6572-1).
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Python's requests/urllib3 trust certifi's own bundle, not the system store,
# so pin a certifi that has dropped the compromised eMudhra roots (>=2026.10.19).
RUN pip install --no-cache-dir --upgrade "certifi>=2026.10.19"

COPY . .

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.title="ctmd-pipeline2" \
      org.opencontainers.image.authors="RENCI" \
      org.opencontainers.image.source="https://github.com/renci/ctmd-dashboard" \
      org.opencontainers.image.revision="${BUILD_REF}" \
      org.opencontainers.image.vendor="RENCI - Renaissance Computing Institute"

CMD ["python", "main.py"]
