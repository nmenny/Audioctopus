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

const fs = require("fs");
const path = require("path");

const { SlashCommandBuilder } = require("discord.js");

const { createFolderName } = require(path.join(__dirname, "..", "..", "utils", "playlistUtils.js"));

const command = new SlashCommandBuilder()
    .setName("list-all-playlists")
    .setDescription("Displays all the playlist on the server.")
    .addIntegerOption(opt =>
        opt.setName("from")
            .setDescription("The index to start the listing in the playlist list. (starts at 1)")
    )

async function execute(interact) {
    const folderName = createFolderName(interact.guildId);

    if(!fs.existsSync(folderName)) {
        await interact.reply({ content: `No playlist in the server.`, ephemeral: true });
        return;
    }

    const playlists = fs.readdirSync(folderName);

    if(playlists.length === 0) {
        await interact.reply({ content: `No playlist in the server.`, ephemeral: true });
        return;
    }

    await interact.deferReply();

    let listing = "";
    let playlistIdx = interact.options.getInteger("from") ?? 1;
    if(playlistIdx <= 0 || playlistIdx > playlists.length) playlistIdx = 1;
    
    for(; playlistIdx <= playlists.length; playlistIdx++) {
        const playlist = playlists[playlistIdx-1];

        listing += `\n${playlistIdx}) _${playlist.slice(0, playlist.lastIndexOf("."))}_`;
    }

    await interact.editReply({ content: `The playlists: ${listing}`, ephemeral: true });
}

module.exports = {
    data: command,
    execute,
}