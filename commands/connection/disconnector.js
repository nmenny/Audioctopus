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
    .setName("disconnect")
    .setDescription("Disconnects from an audio channel.");

async function execute(interact) {
    try {
        const cnt = getVoiceConnection(interact.guildId);

        if(cnt) {
            cnt.destroy();
            await interact.reply({ content: `Successfully disconnected.`, ephemeral: false });
        } else {
            await interact.reply({ content: `Not disconnected since not connected to any channel.`, ephemeral: true });
        }
    } catch(err) {
        await interact.reply({ content: `[ERR] ${err.message}.`, ephemeral: true });
    }
}

module.exports = {
    data: command,
    execute,
}