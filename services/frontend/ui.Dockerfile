# Base image
FROM node:10.12.0-alpine

ARG BUILD_DATE
ARG BUILD_REF 
# Create and set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV REACT_APP_IS_HEAL_SERVER $REACT_APP_IS_HEAL_SERVER

# Environment variables

# Install and cache app dependencies
RUN apk add git
COPY package*.json ./
RUN npm install

expose 3000

# start app
CMD ["npm", "start"]

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.title="ctmd-frontend" \
      org.opencontainers.image.authors="RENCI" \
      org.opencontainers.image.source="https://github.com/renci/ctmd-dashboard" \
      org.opencontainers.image.revision="${BUILD_REF}" \
      org.opencontainers.image.vendor="RENCI - Renaissance Computing Institute"