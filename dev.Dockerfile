FROM node:carbon-alpine
LABEL maintainer="CoderDojo Foundation <webteam@coderdojo.org>"
WORKDIR /usr/src/app
ENV NODE_ENV development
RUN apk add --update git make gcc g++ python && \
    mkdir -p /usr/src/app
COPY docker-entrypoint.sh /usr/src
EXPOSE 10305
VOLUME /usr/src/app
CMD ["/usr/src/docker-entrypoint.sh"]
