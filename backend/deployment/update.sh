#!/usr/bin/env bash
cd ./dist/coderunner
docker build -t coderunner .
cd ../..
pm2 restart ecosystem.config.js
