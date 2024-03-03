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

const path = require('path')

const { SlashCommandBuilder } = require('discord.js')

const { loadPlaylist, savePlaylist } = require(
    path.join(__dirname, '..', '..', 'utils', 'playlistUtils.js')
)

const command = new SlashCommandBuilder()
    .setName('order-playlist')
    .setDescription('Swaps the position of two songs in the playlist.')
    .addStringOption((opt) =>
        opt
            .setName('playlist-name')
            .setDescription('The name of the playlist.')
            .setMaxLength(30)
            .setRequired(true)
    )
    .addIntegerOption((opt) =>
        opt
            .setName('music-id-1')
            .setDescription('The id of the first music to swap. (starts at 1)')
            .setMinValue(1)
            .setRequired(true)
    )
    .addIntegerOption((opt) =>
        opt
            .setName('music-id-2')
            .setDescription('The id of the second music to swap. (starts at 1)')
            .setMinValue(1)
            .setRequired(true)
    )

async function execute(interact) {
    const fileName = interact.options.getString('playlist-name')
    const musicId1 = interact.options.getInteger('music-id-1')
    const musicId2 = interact.options.getInteger('music-id-2')

    const playlist = loadPlaylist(interact.guildId, fileName)
    if (!playlist) {
        await interact.reply({
            content: `Playlist "${fileName}" does not exist.`,
            ephemeral: true,
        })
        return
    }

    const playlistInArray = playlist['list']

    if (playlistInArray.length === 0) {
        await interact.reply({
            content: `Playlist "${fileName}" is empty.`,
            ephemeral: true,
        })
        return
    }

    await interact.deferReply({ ephemeral: true })

    if (
        musicId1 <= 0 ||
        musicId1 > playlistInArray.length ||
        musicId2 <= 0 ||
        musicId2 > playlistInArray.length
    ) {
        await interact.editreply({
            content: `Wrong music ids. Should be between 1 and ${playlistInArray.length}`,
            ephemeral: true,
        })
        return
    }

    if (musicId1 === musicId2) {
        await interact.editreply({
            content: `Ids are similar. Does not need to change the order.`,
            ephemeral: true,
        })
        return
    }

    const tmp = playlistInArray[musicId1 - 1]
    playlistInArray[musicId1 - 1] = playlistInArray[musicId2 - 1]
    playlistInArray[musicId2 - 1] = tmp

    if (savePlaylist(interact.guildId, fileName, playlist)) {
        await interact.editReply({
            content: `Music ${musicId1} and ${musicId2} swapped.`,
            ephemeral: true,
        })
    } else {
        await interact.editReply({
            content: `Music ${musicId1} and ${musicId2} could not be swapped.`,
            ephemeral: true,
        })
    }
}

module.exports = {
    data: command,
    execute,
}
