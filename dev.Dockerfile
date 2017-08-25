FROM node:carbon-alpine
LABEL maintainer="butlerx <cian@coderdojo.org>"
WORKDIR /usr/src/app
ENV NODE_ENV development
RUN apk add --update ssh git build-base python && \
    mkdir -p /usr/src/app
COPY docker-entrypoint.sh /usr/src
EXPOSE 10305
VOLUME /usr/src/app
CMD ["/usr/src/docker-entrypoint.sh"]
