FROM mhart/alpine-node:0.10.48
MAINTAINER butlerx <butlerx@notthe.cloud>
RUN apk add --update git build-base python && \
    npm install -g nodemon && \
    mkdir -p /usr/src/app
ADD  docker-entrypoint.sh /usr/src
EXPOSE 10305
VOLUME /usr/src/app
CMD ["/usr/src/docker-entrypoint.sh"]
