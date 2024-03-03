/**
 * AudiOctopus
 * Copyright (C) 2024  Nathan Menny
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const path = require("path");

const { SlashCommandBuilder } = require("discord.js");
const { AudioPlayerStatus, getVoiceConnection, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');

const { loadPlaylist } = require(path.join(__dirname, "..", "..", "utils", "playlistUtils.js"));
const { PlayerInfo } = require(path.join(__dirname, "..", "..", "utils", "types.js"));
const { FileResource, LinkResource, ResourceSet, checkFileFormat } = require(path.join(__dirname, "..", "..", "utils", "resourceHandler.js"));

const command = new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays music in an audio channel.")
    .addSubcommand(scmd => 
        scmd.setName("from-file")
            .setDescription("Plays audio from a file.")
            .addAttachmentOption(opt => 
                opt.setName("file")
                    .setDescription("The music file to play.")
                    .setRequired(true)
            )
            .addBooleanOption(opt => 
                opt.setName("loop")
                    .setDescription("Plays music in a loop.")    
            )
    )   
    .addSubcommand(scmd => 
        scmd.setName("from-youtube")
            .setDescription("Plays audio from Youtube.")
            .addStringOption(opt =>
                opt.setName("link")
                    .setDescription("The Youtube link to the music to play.")
                    .setMaxLength(300)
                    .setRequired(true)
            )
            .addBooleanOption(opt => 
                opt.setName("loop")
                    .setDescription("Plays music in a loop.")    
            )
    )
    .addSubcommand(scmd => 
        scmd.setName("from-playlist")
            .setDescription("Plays audio from a playlist.")
            .addStringOption(opt =>
                opt.setName("playlist-name")
                    .setDescription("The name of the playlist to play.")
                    .setMaxLength(30)
                    .setRequired(true)
            )
            .addIntegerOption(opt =>
                opt.setName("music-id")
                    .setDescription("The id of the music to play (starts at 1)")
                    .setMinValue(1)
            )
            .addBooleanOption(opt => 
                opt.setName("loop")
                    .setDescription("Plays music in a loop.")    
            )
            .addBooleanOption(opt => 
                opt.setName("random")
                    .setDescription("Chooses randomly the next music.")    
            )
    )

function createPlayer(cli, gid) {
    const player = createAudioPlayer({behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
                    
    player.on('error', error => {
        console.error('Error:', error.message, 'with track', error.resource.metadata.title);
    });

    player.on(AudioPlayerStatus.Idle, async () => {
        const playerI = cli.musicPlayers.get(gid);

        // Loopback
        if(playerI && playerI.inLoop) {
            resource = await playerI.resource.load();
            playerI.player.play(resource);
        
        } 
        // The next music in the playlist
        else if(playerI && !playerI.inLoop && playerI.resource.next()) {
            resource = await playerI.resource.load();
            playerI.player.play(resource);
        }
    });

    return player;
}

async function execute(interact) {
    let currRessourceData = new ResourceSet();
    let cnt = undefined;
    let resource = undefined;

    cnt = getVoiceConnection(interact.guildId);
    if(!cnt) {
        await interact.reply(await interact.reply({ content: `Not connected to any channel.`, ephemeral: true }));
        return;
    }

    await interact.deferReply({ ephemeral: true });

    switch(interact.options.getSubcommand()) {
        case "from-file":
            const file = interact.options.getAttachment("file");

            if(!checkFileFormat(file.contentType)) {
                await interact.editReply({ content: `Incorrect file format. (not one of .mp3, .ogg or .webm).`, ephemeral: true });
                return;
            }

            // Loads the given resource
            currRessourceData.addResource(new FileResource(file.name, file.attachment));
            currRessourceData.next();
            resource = await currRessourceData.load();
            break;
        case "from-youtube":
            const videoLink = interact.options.getString("link");

            // Loads the given resource
            currRessourceData.addResource(new LinkResource("", videoLink));
            currRessourceData.next();
            resource = await currRessourceData.load();
            break;
        case "from-playlist":
            currRessourceData.selectRnd = interact.options.getBoolean("random") ?? false;
            const playlist = loadPlaylist(interact.guildId, interact.options.getString("playlist-name"));
            
            if(!playlist || playlist["list"].length === 0) {
                await interact.editReply({ content: `Playlist "${interact.options.getString('playlist-name')}" does not exist or is empty.`, ephemeral: true });
                return;
            }
            
            // Searches for all the resources in the playlist
            for(let music of playlist["list"]) {
                currRessourceData.addResource(new LinkResource(music.title, music.link));
            }

            // Checks the id of the music
            const musicId = interact.options.getInteger("music-id") ?? 1;
            if(musicId <= 0 || musicId > playlist["list"].length) musicId = 1;

            // Loads the given resource
            currRessourceData.goto(musicId);
            resource = await currRessourceData.load();
            break;
        default:
            await interact.editReply({ content: `Not a valid command.`, ephemeral: true });
            return;
    }

    // If a music is already playing, stops it cleanly
    const prevPlayer = interact.client.musicPlayers.get(interact.guildId);
    if(prevPlayer) {
        prevPlayer.player.stop();
        prevPlayer.subscription.unsubscribe();
    }

    // Creates and adds a new audio player to the connection
    const player = createPlayer(interact.client, interact.guildId);
    player.play(resource);
    const subscription = cnt.subscribe(player);

    // Stores the information about the currently playing music
    const newInfo = new PlayerInfo(subscription, currRessourceData, interact.options.getBoolean("loop"));
    interact.client.musicPlayers.set(interact.guildId, newInfo);

    await interact.editReply({ content: `Playing ${currRessourceData.toString()} ${newInfo.inLoop ? "(loop)" : ""} ${currRessourceData.selectRnd ? "(random)" : ""}`, ephemeral: true });
}

module.exports = {
    data: command,
    execute,
}