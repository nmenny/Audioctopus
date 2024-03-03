# AudiOctopus

A Discord bot to play music in audio channels.

## Installation

### Requirements

The project relies on **node v20** and need **ffmpeg** to handle audio.

### Setup

To setup the bot, you must define a `.env` file containing the following variables :

```txt
TOKEN=<token of your Discord bot>
CLIENT_ID=<id of the application>
GUILD_ID=<id of the development guild> (mandatory if ENV is not deployment)
ENV=<development or deployment> (default is deployment)
```

For the `ENV` variable, if its value is development the commands are only updated in the Discord Server with the id `GUILD_ID` otherwise the commands are updated in all the Discord Servers where the bot can execute / (SLASH) commands.

The `GUILD_ID` and `ENV` must be defined only if you want to deploy in development mode.

### With Docker

You can use Docker to build the app. For that, run the following command to create the docker container :

```
docker build .
```

Then, once you have the .env setup and the container built, you can start it with the command :

```
docker-compose up -d
```

### Without Docker

#### Install

To install the dependencies, run the following command :

```bash
npm ci
```

#### Start

Firstly, the commands must be deployed in the target servers. To do so, execute the script `deploy-commands.js` using the following command :

```bash
node deploy-commands.js
```

And then, the Bot can be started with the following command :

```bash
node .
```

## Discord Commands

For audio:

- [/connect](#connect)
- [/disconnect](#disconnect)
- [/play from-file](#play-from-file)
- [/play from-youtube](#play-from-youtube)
- [/play from-playlist](#play-from-playlist)
- [/set-loopback](#set-loopback)
- [/set-random-playback](#set-random-playback)
- [/pause](#pause)
- [/continue](#continue)
- [/stop](#stop)
- [/next](#next)
- [/status](#status)

For playlists:

- [/create-playlist](#create-playlist)
- [/remove-playlist](#remove-playlist)
- [/add-to-playlist](#add-to-playlist)
- [/list-all-playlists](#list-all-playlists)
- [/playlist-info](#playlist-info)
- [/order-playlist](#order-playlist)
- [/remove-playlist-music](#remove-playlist-music)

## Available commands for audio

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

### /play from-file

Plays an audio file in a discord channel.

Usage: `/play from-file file [loop]`

Details:

- `file`: a file to play. Must be one of .mp3, .webm or .ogg
- `loop`: (**optional**) if <tt>true</tt> plays the audio in a loop.

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The commands tells the name of the playing file.

### /play from-youtube

Plays a Youtube music in a discord channel.

Usage: `/play from-youtube link [loop]`

Details:

- `link`: a link to a youtube video.
- `loop`: (**optional**) if <tt>true</tt> plays the audio in a loop.

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The commands tells the name of the playing video.

### /play from-playlist

Plays musics from a playlist. (see [here](#available-commands-for-playlists) for more details about playlists).

Usage: `/play from-playlist playlist-name [music-id] [loop] [random]`

Details:

- `playlist-name`: a name of playlist to play.
- `music-id`: (**optional**) the id of the music to play. The id is the number that corresponds to the one given when typing the command `playlist-info playlist-name`.
- `loop`: (**optional**) if <tt>true</tt> plays the audio in a loop.
- `random`: (**optional**) if <tt>true</tt> plays the musics in a random order.

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The commands tells the name of the playing video.

### /set-loopback

Activates/Deactivates the loopback function for the music.

Usage: `/set-loopback activate`

Details:

- `activate`: if <tt>true</tt>, the loopback is activated

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The commands tells the new state of the loopback function.

### /set-random-playback

Activates/Deactivates the random playback for the playlists.

Usage: `/set-random-playback activate`

Details:

- `activate`: if <tt>true</tt>, the random playback is activated

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The commands tells the new state of the random playback.

### /pause

Pauses the currently playing music.

Usage: `/pause`

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The commands tells if it has successfully paused the music.

### /continue

Continues to play the current music.

Usage: `/continue`

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The commands tells if it has successfully unpaused the music.

### /stop

Stops to play the current music.

Usage: `/stop`

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The commands tells if it has successfully stopped the music.

### /next

Plays the next unplayed music in the playlist.

Usage: `/next`

Result:

Writes which music will be played next and switches to it immediately. If there's no more music to be played, it does nothing.

### /status

Display information about the current music.

Usage: `/status`

Warnings: The bot must be connected to a channel in order for it to work.

Result:

The name and the status of the loopback function is indicated (on or off).  
If a playlist is being played, it also shows the number of music left if there is any.

## Available commands for playlists

### /create-playlist

Creates a new playlist to store musics.

Usage: `/create-playlist playlist-name`

Details:

- `playlist-name`: the name of the playlist to create.

Result:

The commands tells if the playlist has been successfully created or if it already exists.

### /remove-playlist

Removes a playlist.

Usage: `/remove-playlist playlist-name`

Details:

- `playlist-name`: the name of the playlist to remove.

Warnings: The user requesting the removal must be either the owner of the playlist (i.e. the one who created it) or an Administrator.

Result:

The commands tells if the playlist has been successfully removed or if it does not exist.

### /add-to-playlist

Adds a new Youtube music into a playlist.

Usage: `/add-to-playlist playlist-name link`

Details:

- `playlist-name`: the name of the playlist to populate.
- `link`: the link of the Youtube video to add to the playlist.

Result:

The commands tells if the music has successfully been added to the playlist or not.

### /list-all-playlists

Lists all the playlists created on the server.

Usage: `/list-all-playlists [from]`

Details:

- `from`: (**optional**) the index from which the listing starts (the numbering starts at 1).

Result:

The commands returns a list of all the playlists with their corresponding number index.  
For example,  
/list-all-playlists

> The playlists:
>
> 1. playlist1
> 2. playlist2

### /playlist-info

Lists all the musics registered in the given playlist.

Usage: `/playlist-info playlist-name [from]`

Details:

- `playlist-name`: the name of the playlist to list.
- `from`: (**optional**) the index from which the listing starts (the numbering starts at 1).

Result:

The commands returns a list of all musics in the playlist with their index.  
For example,  
/playlist-info `playlist-name` playlist1

> Playlist "playlist1" contains:
>
> 1. Music1
> 2. Music2
> 3. Music3

### /order-playlist

Swaps two musics in the playlist.

Usage: `/order-playlist playlist-name music-id-1 music-id-2`

Details:

- `playlist-name`: the name of the playlist containing the music to swap.
- `music-id-1`: (**optional**) the id of the first music to swap (the numbering starts at 1).
- `music-id-2`: (**optional**) the id of the second music to swap (the numbering starts at 1).

Result:

The commands tells if the music have been swapped successfully or not.

### /remove-music-from-playlist

Removes a music from a playlist.

Usage: `/remove-music-from-playlist playlist-name music-id`

Details:

- `playlist-name`: the name of the playlist containing the music to remove.
- `music-id`: (**optional**) the id of the music to remove (the numbering starts at 1).

Warnings: The user requesting the removal must be either the owner of the playlist (i.e. the one who created it) or an Administrator.

Result:

The commands tells if the music have been removed successfully or not.