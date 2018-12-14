FROM node:latest

RUN apt-get update && apt-get install nano tree -y

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Path to local installs
ENV PATH /usr/src/app/node_modules/.bin:$PATH
# Path to global installs
ENV PATH /usr/local/node_modules/.bin:$PATH

ENV NODE_ENV development

RUN npm install -g nodemon
COPY ./package*.json ./
RUN npm install -g

COPY ./ ./

EXPOSE 3030

CMD ["npm", "start"]