#!/usr/bin/env zsh
mongod --bind_ip 127.0.0.1 --dbpath "$1"
