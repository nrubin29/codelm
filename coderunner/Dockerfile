FROM alpine:latest

RUN apk update
RUN apk add nodejs-current python3 openjdk8 gcc g++
RUN ln -s /usr/lib/jvm/java-1.8-openjdk/bin/javac /bin/javac

WORKDIR /coderunner

COPY ./dist/code.js /coderunner

CMD ["node", "code.js"]
