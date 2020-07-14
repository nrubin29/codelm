FROM alpine:latest

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories
RUN apk update
RUN apk upgrade musl
RUN apk add --no-cache nodejs-current python3 openjdk11 gcc g++ --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN python3 -m ensurepip
RUN pip3 install pyflakes
RUN ln -s /usr/lib/jvm/java-11-openjdk/bin/javac /bin/javac

WORKDIR /coderunner

COPY ./dist/coderunner.js /coderunner

CMD ["node", "coderunner.js"]
