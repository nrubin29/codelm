FROM mhart/alpine-node:latest

RUN apk update
RUN apk add --no-cache nodejs-current python3 openjdk11 gcc g++
RUN python3 -m ensurepip
RUN pip3 install pyflakes
RUN ln -s /usr/lib/jvm/java-11-openjdk/bin/javac /bin/javac

WORKDIR /coderunner

COPY ./dist/coderunner.js /coderunner

CMD ["node", "coderunner.js"]
