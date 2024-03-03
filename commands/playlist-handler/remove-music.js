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

const { SlashCommandBuilder, PermissionsBitField } = require('discord.js')

const { checkPlaylistUser, loadPlaylist, savePlaylist } = require(
    path.join(__dirname, '..', '..', 'utils', 'playlistUtils.js')
)

const ADMIN_PERM = PermissionsBitField.Flags.Administrator

const command = new SlashCommandBuilder()
    .setName('remove-music-from-playlist')
    .setDescription('Removes a music from a playlist.')
    .addStringOption((opt) =>
        opt
            .setName('playlist-name')
            .setDescription('The name of the playlist.')
            .setMaxLength(30)
            .setRequired(true)
    )
    .addIntegerOption((opt) =>
        opt
            .setName('music-id')
            .setDescription('The id of the music to remove. (starts at 1)')
            .setMinValue(1)
            .setRequired(true)
    )

async function execute(interact) {
    const fileName = interact.options.getString('playlist-name')
    const musicId = interact.options.getInteger('music-id')

    const playlist = loadPlaylist(interact.guildId, fileName)
    if (!playlist) {
        await interact.reply({
            content: `Playlist "${fileName}" does not exist.`,
            ephemeral: true,
        })
        return
    }

    if (!checkPlaylistUser(playlist.owner, interact.member.user.id) && !interact.memberPermissions.has(ADMIN_PERM)) {
        await interact.reply({
            content: `Cannot remove a music from this playlist. You are not the owner nor an Administrator.`,
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

    if (musicId <= 0 || musicId > playlistInArray.length) {
        await interact.editReply({
            content: `Wrong music id. Should be between 1 and ${playlistInArray.length}`,
            ephemeral: true,
        })
        return
    }

    playlist['list'] = playlistInArray
        .slice(0, musicId - 1)
        .concat(playlistInArray.slice(musicId))

    if (savePlaylist(interact.guildId, fileName, playlist)) {
        await interact.editReply({
            content: `Music ${musicId} successfully removed.`,
            ephemeral: true,
        })
    } else {
        await interact.editReply({
            content: `Music ${musicId} could not be removed.`,
            ephemeral: true,
        })
    }
}

module.exports = {
    data: command,
    execute,
}
