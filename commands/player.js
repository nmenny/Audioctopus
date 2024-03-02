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
const { AudioPlayerStatus, getVoiceConnection, createAudioResource, createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');

const { PlayerInfo } = require(path.join("..", "utils", "types.js"));
const { FileResource, LinkResource } = require(path.join("..", "utils", "resourceHandler.js"));

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

function createPlayer(cli, gid) {
    const player = createAudioPlayer({behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
                    
    player.on('error', error => {
        console.error('Error:', error.message, 'with track', error.resource.metadata.title);
    });

    player.on(AudioPlayerStatus.Buffering, () => {
        console.log('Loading...');
    });

    player.on(AudioPlayerStatus.Idle, async () => {
        console.log('IDLE...');

        const playerI = cli.musicPlayers.get(gid);
        if(playerI && playerI.inLoop) {
            console.log("looping...");
            resource = await playerI.resource.load();
            playerI.player.play(resource);
        }
    });

    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
    });

    return player;
}

async function execute(interact) {
    let currRessourceData = undefined;
    let cnt = undefined;
    let resource = undefined;

    cnt = getVoiceConnection(interact.guildId);
    if(!cnt) {
        await interact.reply(await interact.reply({ content: `Not connected to any channel.`, ephemeral: true }));
        return;
    }

    await interact.deferReply();

    switch(interact.options.getSubcommand()) {
        case "from-file":
            const file = interact.options.getAttachment("file")
            
            currRessourceData = new FileResource(file.name, file.attachment);
            resource = await currRessourceData.load();
            break;
        case "from-youtube":
            const videoLink = interact.options.getString("link");
            currRessourceData = new LinkResource("", videoLink);
            resource = await currRessourceData.load();
            break;
        default:
            await interact.editReply({ content: `Not a valid command.`, ephemeral: true });
            return;
    }

    const prevPlayer = interact.client.musicPlayers.get(interact.guildId);
    if(prevPlayer) {
        prevPlayer.player.stop();
        prevPlayer.subscription.unsubscribe();
    }

    const player = createPlayer(interact.client, interact.guildId);
    player.play(resource);
    const subscription = cnt.subscribe(player);

    const newInfo = new PlayerInfo(subscription, currRessourceData, interact.options.getBoolean("loop"));
    interact.client.musicPlayers.set(interact.guildId, newInfo);

    await interact.editReply(`Playing ${currRessourceData.toString()} ${newInfo.inLoop ? "(loop)" : ""}`);
}

module.exports = {
    data: command,
    execute,
}