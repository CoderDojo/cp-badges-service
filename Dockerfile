FROM mhart/alpine-node:0.10
MAINTAINER nearForm <info@nearform.com>

#RUN apk-install git make gcc g++ python
RUN apk-install git

RUN mkdir -p /usr/src/app /usr/src/lib /usr/src/config
WORKDIR /usr/src/app
  
COPY package.json /usr/src/app/
COPY lib /usr/src/app/lib/
COPY config /usr/src/app/config/
COPY *.js /usr/src/app/
RUN npm install --production && rm -rf /root/.npm  

