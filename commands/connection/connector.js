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

const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { joinVoiceChannel } = require('@discordjs/voice');

const command = new SlashCommandBuilder()
    .setName("connect")
    .setDescription("Connects to a new audio channel.")
    .addChannelOption(opt => 
        opt.setName("channel")
            .setDescription("The channel to connect to.")
            .addChannelTypes(ChannelType.GuildVoice)
            .setRequired(true)
    );

async function execute(interact) {
    const chnl = interact.options.getChannel("channel");

    try {
        joinVoiceChannel({
            channelId: chnl.id,
            guildId: chnl.guild.id,
            adapterCreator: chnl.guild.voiceAdapterCreator,
        });

        await interact.reply({ content: `Successfully connected to the channel **${chnl.name}**.`, ephemeral: true });
    } catch(err) {
        await interact.reply({ content: `[ERR] ${err.message}.`, ephemeral: true });
    }
}

module.exports = {
    data: command,
    execute,
}