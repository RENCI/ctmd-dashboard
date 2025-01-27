FROM node:18-bullseye

RUN apt update

RUN apt install tzdata

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Path to local installs
ENV PATH /usr/src/app/node_modules/.bin:$PATH
# Path to global installs
ENV PATH /usr/local/node_modules/.bin:$PATH

ENV NODE_ENV development
ENV TZ America/New_York
ENV API_PORT 3030
ENV GRAPHICS_API_PORT 4040
ENV REACT_APP_API_ROOT http://localhost/api/
ENV REACT_APP_DATA_API_ROOT http://localhost/data/
ENV REACT_APP_AUTH_API_KEY supersecretlongstring
ENV API_SESSION_SECRET something-secret
ENV AUTH_API_KEY SECRET


# RUN npm install nodemon
COPY ./package*.json ./
RUN npm install

COPY ./ ./

CMD ["npm", "start"]