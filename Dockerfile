FROM node:20.11

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY *.js /app/
COPY package*.json /app/
COPY commands/ /app/commands/
COPY utils/ /app/utils/

RUN npm ci

CMD node deploy-commands.js ; node .
