# AudiOctopus

A Discord bot to play music in audio channels.

## Installation

### Requirements

The project relies on **node v20**.

### Install

To install the dependencies, run the following command :

```bash
npm ci
```

### Setup

To setup the bot, you must define a `.env` file containing the following variables :

```txt
TOKEN=<token of your Discord bot>
CLIENT_ID=<id of the application>
GUILD_ID=<id of the development guild> (mandatory if ENV is not "deployment")
ENV=<"development" or "deployment"> (default is "deployment")
```

For the `ENV` variable, if its value is "development" the commands are only updated in the Discord Server with the id `GUILD_ID` otherwise the commands are updated in all the Discord Servers where the bot can execute / (SLASH) commands.

The `GUILD_ID` and `ENV` must be defined only if you want to deploy in "development" mode.

### Start

Firstly, the commands must be deployed in the target servers. To do so, execute the script `deploy-commands.js` using the following command :

```bash
node deploy-commands.js
```

And then, the Bot can be started with the following command :

```bash
node .
```

## Available commands

### /connect

Connects to an audio channel.

Usage: `/connect channel`

Details:   
- `channel`: the audio channel to connect to. If the bot is already connected, this connexion replaces the old one.

Result:    

The command returns a message to notice whether the bot has been able to connect or not.

### /disconnect

Disconnects the bot from the current audio channel.

Usage `/disconnect`

Result:

The commands informs the user if the bot has been successfully disconnected or not.