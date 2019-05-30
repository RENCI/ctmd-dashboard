# Base image
FROM node:10.12.0-alpine
RUN npm install --global gatsby-cli

# Create and set working directory
RUN mkdir -p /usr/src/app

# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Work within the new directory
WORKDIR /usr/src/app

# Environment variables

# Install and cache app dependencies
COPY package*.json ./
RUN npm install

expose 3000

# start app
CMD ["gatsby", "develop", "-H", "0.0.0.0"]