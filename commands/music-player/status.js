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

const { SlashCommandBuilder } = require('discord.js')
const { getVoiceConnection } = require('@discordjs/voice')

const command = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Get information about the currently playing music.')

async function execute(interact) {
    const cnt = getVoiceConnection(interact.guildId)
    if (!cnt) {
        await interact.reply({
            content: `Not connected to any channel.`,
            ephemeral: true,
        })
        return
    }

    const currPlayer = interact.client.musicPlayers.get(interact.guildId)
    if (!currPlayer) {
        await interact.reply({ content: `No audio playing.`, ephemeral: true })
        return
    }

    let res = `${currPlayer.resource.toString()} (loopback: ${currPlayer.inLoop ? '_on_' : '_off_'}) (random playback: ${currPlayer.resource.selectRnd ? '_on_' : '_off_'})`
    if (currPlayer.resource.hasMoreResource())
        res += `\nStill ${currPlayer.resource.numberOfResourcesLeft()} music(s) to play.`

    await interact.reply({ content: res, ephemeral: true })
}

module.exports = {
    data: command,
    execute,
}
