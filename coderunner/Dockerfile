FROM alpine:latest

RUN apk --no-cache add openjdk11 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN apk update
RUN apk add nodejs-current python3 openjdk11 gcc g++
RUN pip3 install pyflakes
RUN ln -s /usr/lib/jvm/java-11-openjdk/bin/javac /bin/javac

WORKDIR /coderunner

COPY ./dist/coderunner.js /coderunner

CMD ["node", "coderunner.js"]
