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

const command = new SlashCommandBuilder()
    .setName("create-playlist")
    .setDescription("Creates a new playlist.")
    .addStringOption(opt =>
        opt.setName("playlistName")
            .setDescription("The name of the playlist.")
            .setMaxLength(30)
            .setRequired(true)
    )

function createFolderName(gid) {
    return path.join(__dirname, "..", "..", "playlist", gid);
}

async function execute(interact) {
    const folderName = createFolderName(interact.guildId);
    const fileName = interact.options.getString("playlistName");
    const completePath = path.join(folderName, fileName + ".json");

    if(fs.existsSync(completePath)) {
        await interact.reply(`Playlist '${fileName}' already exists.`);
        return;
    }

    fs.mkdirSync(folderName, { recursive: true });

    try {
        fs.writeFileSync(completePath, JSON.stringify({}), 'utf8');
        await interact.reply(`Playlist '${fileName}' successfully created.`);
    } catch (error) {
        await interact.reply({ content: `Playlist '${fileName}' could not be created.`, ephemeral: true });
    }
}

module.exports = {
    data: command,
    execute,
}