FROM node:8-alpine
MAINTAINER butlerx <butlerx@notthe.cloud>
ARG DEP_VERSION=latest
RUN apk add --update git make gcc g++ python && \
    mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install --production && \
    npm install cp-translations@"$DEP_VERSION" && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp
EXPOSE 10305
CMD ["npm", "start"]
