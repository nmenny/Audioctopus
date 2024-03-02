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

const { SlashCommandBuilder } = require("discord.js");
const { AudioPlayerStatus, getVoiceConnection, createAudioResource, createAudioPlayer, NoSubscriberBehavior, StreamType, demuxProbe } = require('@discordjs/voice');
const ytdl = require("ytdl-core");

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
    )

async function probeAndCreateResource(readableStream) {
    const { stream, type } = await demuxProbe(readableStream);

    return createAudioResource(stream, { inputType: type });
}

function createPlayer() {
    const player = createAudioPlayer({behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
                    
    player.on('error', error => {
        console.error('Error:', error.message, 'with track', error.resource.metadata.title);
    });

    player.on(AudioPlayerStatus.Buffering, () => {
        console.log('Loading...');
    });

    player.on(AudioPlayerStatus.Idle, () => {
        console.log('IDLE...');
    });

    player.on(AudioPlayerStatus.Playing, () => {
        console.log('The audio player has started playing!');
    });

    return player;
}

async function execute(interact) {
    let msg = "";
    let cnt = undefined;
    let resource = undefined;

    cnt = getVoiceConnection(interact.guildId);
    if(!cnt) {
        await interact.reply(await interact.reply({ content: `Not connected to any channel.`, ephemeral: true }));
        return;
    }

    await interact.deferReply();

    const prevPlayer = interact.client.musicPlayers.get(interact.guildId);
    if(prevPlayer) {
        prevPlayer[0].stop();
        prevPlayer[1].unsubscribe();
    }

    switch(interact.options.getSubcommand()) {
        case "from-file":
            const file = interact.options.getAttachment("file")
            msg = `file **${file.name}**`;
            resource = createAudioResource(file.attachment);
            break;
        case "from-youtube":
            const videoLink = interact.options.getString("link");
            const data = ytdl(videoLink, { format:"webm", filter:"audioonly", quality: "lowestaudio" });
            data.on("info", info => { msg = `Youtube video **${info.videoDetails.title}**`; });            
            resource = await probeAndCreateResource(data);
            break;
        default:
            await interact.editReply({ content: `Not a valid command.`, ephemeral: true });
            return;
    }

    if(!resource.metadata) resource.metadata = {};
    if(!resource.metadata.title) resource.metadata.title = msg;

    const player = createPlayer();
    player.play(resource);
    const subscription = cnt.subscribe(player);

    interact.client.musicPlayers.set(interact.guildId, [player, subscription]);

    await interact.editReply(`Playing ${msg}...`);
}

module.exports = {
    data: command,
    execute,
}