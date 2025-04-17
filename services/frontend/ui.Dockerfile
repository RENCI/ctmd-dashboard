# Build environment
###################
FROM node:10.24.1-alpine3.10 AS builder

# Create and set working directory
RUN mkdir /src
WORKDIR /src

# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH=/src/node_modules/.bin:$PATH

# Install and cache app dependencies
RUN apk add git
COPY package*.json /src/
RUN npm install
# Copy in source files
COPY . /src

# Build app
RUN npm run build

# Production environment
########################
FROM nginx:latest
ARG BUILD_DATE
ARG BUILD_REF
# This can be used for sanity checking images
# during development
ENV BUILD_DATE=${BUILD_DATE}

RUN apt-get update && apt-get install nano tree -y
EXPOSE 3000
COPY --from=builder /src/build /usr/share/nginx/html/

CMD ["nginx", "-g", "daemon off;"]

LABEL org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.title="ctmd-frontend" \
      org.opencontainers.image.authors="RENCI" \
      org.opencontainers.image.source="https://github.com/renci/ctmd-dashboard" \
      org.opencontainers.image.revision="${BUILD_REF}" \
      org.opencontainers.image.vendor="RENCI - Renaissance Computing Institute"