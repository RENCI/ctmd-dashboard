# Base image
FROM node:10.12.0-alpine

# Create and set working directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Environment variables
# Add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH
ENV REACT_APP_IS_HEAL_SERVER $REACT_APP_IS_HEAL_SERVER
ENV REACT_APP_GA4_TRACKING_ID $REACT_APP_GA4_TRACKING_ID

# Install and cache app dependencies
RUN apk add git
COPY package*.json ./
RUN npm install

expose 3000

# start app
CMD ["npm", "start"]