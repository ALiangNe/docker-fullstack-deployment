FROM node:22

MAINTAINER yqb

WORKDIR /app

RUN npm install -g forever

COPY ./package.json /app/

RUN npm install

COPY . /app/

EXPOSE 3001

CMD forever bin/www 
