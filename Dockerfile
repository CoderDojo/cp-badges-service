FROM node:0.10
MAINTAINER nearForm <info@nearform.com>

# Reuse module cache to speed up build
VOLUME /root/.npm

RUN mkdir -p /usr/src/app
ADD . /usr/src/app
WORKDIR /usr/src/app

RUN npm install
