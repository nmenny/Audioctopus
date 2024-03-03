FROM node:20.11

WORKDIR /app

COPY *.js /app/
COPY *.json /app/
COPY commands/ /app/commands/
COPY utils/ /app/utils/

RUN npm ci

CMD node deploy-commands.js ; node .