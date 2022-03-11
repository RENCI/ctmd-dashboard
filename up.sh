#!/bin/bash
USER=$(id -u):$(id -g) docker-compose up --build -V -d
