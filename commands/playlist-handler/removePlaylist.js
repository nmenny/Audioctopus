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

const { removePlaylist, checkPlaylistUser, loadPlaylist } = require(
    path.join(__dirname, '..', '..', 'utils', 'playlistUtils.js')
)

const ADMIN_PERM = PermissionsBitField.Flags.Administrator

const command = new SlashCommandBuilder()
    .setName('remove-playlist')
    .setDescription('Removes a playlist.')
    .addStringOption((opt) =>
        opt
            .setName('playlist-name')
            .setDescription('The name of the playlist.')
            .setMaxLength(30)
            .setRequired(true)
    )

async function execute(interact) {
    const fileName = interact.options.getString('playlist-name')

    const playlist = loadPlaylist(interact.guildId, fileName)
    if (!playlist) {
        await interact.reply({
            content: `Playlist "${fileName}" does not exist.`,
            ephemeral: true,
        })
        return
    }

    if (
        !checkPlaylistUser(playlist.owner, interact.member.user.id) &&
        !interact.memberPermissions.has(ADMIN_PERM)
    ) {
        await interact.reply({
            content: `Cannot remove this playlist. You are not the owner nor an Administrator.`,
            ephemeral: true,
        })
        return
    }

    if (removePlaylist(interact.guildId, fileName)) {
        await interact.reply({
            content: `Playlist "${fileName}" successfully removed.`,
            ephemeral: false,
        })
    } else {
        await interact.reply({
            content: `Playlist "${fileName}" could not be removed.`,
            ephemeral: true,
        })
    }
}

module.exports = {
    data: command,
    execute,
}
