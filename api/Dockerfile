FROM node:13.14.0

RUN apt-get update && apt-get install nano tree -y

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Path to local installs
ENV PATH /usr/src/app/node_modules/.bin:$PATH
# Path to global installs
ENV PATH /usr/local/node_modules/.bin:$PATH

ENV NODE_ENV development

# RUN npm install nodemon
COPY ./package*.json ./
RUN npm install

COPY ./ ./

CMD ["npm", "start"]