FROM node:18-alpine

EXPOSE 8080
ARG NODE_ENV

ENV PORT=8080
ENV NODE_ENV="${NODE_ENV}"

# create app directory
WORKDIR /usr/src/app

# install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

CMD [ "npm", "run", "start" ]
