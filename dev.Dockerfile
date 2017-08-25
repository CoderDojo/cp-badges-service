FROM mhart/alpine-node:0.10.48
MAINTAINER butlerx <butlerx@notthe.cloud>
WORKDIR /usr/src/app
ENV NODE_ENV development
RUN apk add --update git build-base python && \
    mkdir -p /usr/src/app
COPY docker-entrypoint.sh /usr/src
EXPOSE 10305
VOLUME /usr/src/app
CMD ["/usr/src/docker-entrypoint.sh"]
