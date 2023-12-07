FROM node:18-alpine

EXPOSE 8080
ARG APP_GITCOMMIT
ARG NODE_ENV
ARG SESSION_SECRET
ARG AUTH_SECRET

ENV PORT=8080
ENV NODE_ENV="${NODE_ENV}"
ENV SESSION_SECRET="${SESSION_SECRET}"
ENV AUTH_SECRET="${AUTH_SECRET}"

# create app directory
WORKDIR /usr/src/app

# install app dependencies
COPY package*.json ./
RUN npm install
RUN echo "APP_GITCOMMIT=${APP_GITCOMMIT}" > .env

# Bundle app source
COPY . .

CMD [ "npm", "run", "start" ]
