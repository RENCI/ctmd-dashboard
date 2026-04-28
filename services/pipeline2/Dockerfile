FROM python:3.12-slim

ARG BUILD_DATE
ARG BUILD_REF
ENV BUILD_DATE=${BUILD_DATE}

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.title="ctmd-pipeline2" \
      org.opencontainers.image.authors="RENCI" \
      org.opencontainers.image.source="https://github.com/renci/ctmd-dashboard" \
      org.opencontainers.image.revision="${BUILD_REF}" \
      org.opencontainers.image.vendor="RENCI - Renaissance Computing Institute"

CMD ["python", "main.py"]
