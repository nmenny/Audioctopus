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
const ytdl = require('ytdl-core')

const { loadPlaylist, savePlaylist } = require(
    path.join(__dirname, '..', '..', 'utils', 'playlistUtils.js')
)

const NB_MAX_MUSIC_IN_PLAYLIST = 200

const command = new SlashCommandBuilder()
    .setName('add-to-playlist')
    .setDescription('Adds a new music to the playlist.')
    .addStringOption((opt) =>
        opt
            .setName('playlist-name')
            .setDescription('The name of the playlist.')
            .setMaxLength(30)
            .setRequired(true)
    )
    .addStringOption((opt) =>
        opt
            .setName('link')
            .setDescription('The Youtube link to the music to add.')
            .setMaxLength(300)
            .setRequired(true)
    )

async function execute(interact) {
    const fileName = interact.options.getString('playlist-name')
    const videoLink = interact.options.getString('link')

    const playlist = loadPlaylist(interact.guildId, fileName)
    if (!playlist) {
        await interact.reply({
            content: `Playlist "${fileName}" does not exist.`,
            ephemeral: true,
        })
        return
    }

    await interact.deferReply({ ephemeral: true })

    // Checks if the music is not already in the playlist
    for (const music of playlist['list']) {
        if (music.link === videoLink) {
            await interact.editReply({
                content: `This music is already in the playlist "${fileName}".`,
                ephemeral: true,
            })
            return
        }
    }

    if (playlist['list'].length >= NB_MAX_MUSIC_IN_PLAYLIST) {
        await interact.editReply({
            content: `Limits of ${NB_MAX_MUSIC_IN_PLAYLIST} musics reached in playlist "${fileName}".`,
            ephemeral: true,
        })
        return
    }

    const info = await ytdl.getInfo(videoLink)
    playlist['list'].push({ title: info.videoDetails.title, link: videoLink })

    if (savePlaylist(interact.guildId, fileName, playlist)) {
        await interact.editReply({
            content: `Music **'${info.videoDetails.title}'** successfully added to playlist "${fileName}".`,
            ephemeral: true,
        })
    } else {
        await interact.editReply({
            content: `Music **'${info.videoDetails.title}'** could not be added to playlist "${fileName}".`,
            ephemeral: true,
        })
    }
}

module.exports = {
    data: command,
    execute,
}
