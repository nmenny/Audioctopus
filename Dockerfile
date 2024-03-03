FROM node:20.11

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg

COPY *.js /app/
COPY *.json /app/
COPY commands/ /app/commands/
COPY utils/ /app/utils/

RUN npm ci
RUN node deploy-commands.js

ENTRYPOINT [ "node" ]

CMD [ "." ]