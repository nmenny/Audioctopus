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
    .setName("set-random-playback")
    .setDescription("Tells the music player to randomly pick a song in a playlist or not.")
    .addBooleanOption(opt => 
        opt.setName("activate")
            .setDescription("Randomly chooses the next song ?")
            .setRequired(true)
    );

async function execute(interact) {
    const cnt = getVoiceConnection(interact.guildId);
    if(!cnt) {
        await interact.reply({ content: `Not connected to any channel.`, ephemeral: true });
        return;
    }

    const rndActivated = interact.options.getBoolean("activate");

    const currPlayer = interact.client.musicPlayers.get(interact.guildId);
    if(!currPlayer) {
        await interact.reply({ content: `No audio playing.`, ephemeral: true });
        return;
    }

    currPlayer.resource.selectRnd = rndActivated;
    await interact.reply({ content: `Random playback ${rndActivated ? "activated" : "deactivated"}.`, ephemeral: false });
}

module.exports = {
    data: command,
    execute,
}