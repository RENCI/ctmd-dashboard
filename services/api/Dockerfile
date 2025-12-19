FROM node:24.11.1-bookworm-slim

ARG BUILD_DATE
ARG BUILD_REF
# This can be used for sanity checking images
# during development
ENV BUILD_DATE=${BUILD_DATE}

RUN apt-get update && apt-get install -y --no-install-recommends \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Path to local installs
ENV PATH=/usr/src/app/node_modules/.bin:$PATH
# Path to global installs
ENV PATH=/usr/local/node_modules/.bin:$PATH

# ENV NODE_ENV=development
ENV TZ=America/New_York

# RUN npm install nodemon
COPY ./package*.json ./
RUN npm install

COPY ./ ./

CMD ["npm", "start"]

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.title="ctmd-api" \
      org.opencontainers.image.authors="RENCI" \
      org.opencontainers.image.source="https://github.com/renci/ctmd-dashboard" \
      org.opencontainers.image.revision="${BUILD_REF}" \
      org.opencontainers.image.vendor="RENCI - Renaissance Computing Institute"