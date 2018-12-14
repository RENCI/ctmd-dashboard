# Base image
FROM node:10.12.0-alpine

# Create and set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Environment variables

# Install and cache app dependencies
COPY package*.json /usr/src/app/
RUN npm install

expose 3000

# start app
CMD ["npm", "start"]