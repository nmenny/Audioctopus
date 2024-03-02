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
const { getVoiceConnection } = require('@discordjs/voice');

const command = new SlashCommandBuilder()
    .setName("next")
    .setDescription("Goes to the next music in the playlist or stops if no more available.");

async function execute(interact) {
    const cnt = getVoiceConnection(interact.guildId);
    if(!cnt) {
        await interact.reply({ content: `Not connected to any channel.`, ephemeral: true });
        return;
    }

    const currPlayer = interact.client.musicPlayers.get(interact.guildId);
    if(!currPlayer) {
        await interact.reply({ content: `No audio playing.`, ephemeral: true });
        return;
    }

    await interact.deferReply();

    const res = currPlayer.resource.next();

    if(res) {
        const resource = await currPlayer.resource.load();

        currPlayer.player.play(resource);

        await interact.editReply(`Next is ${currPlayer.resource.toString()}`);
    } else {
        await interact.editReply({ content: `No more music in the playlist.`, ephemeral: true });
    }

}

module.exports = {
    data: command,
    execute,
}