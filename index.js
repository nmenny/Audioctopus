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

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')
const dotenv = require('dotenv')

const { exploreCommandsFolder } = require(
    path.join(__dirname, 'utils', 'commandUtils')
)

// --------------
// Get the configurations
dotenv.config()

// --------------
// Setup Discord Bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
})

client.commands = new Collection()
client.musicPlayers = new Collection()

// --------------
// Gets the commands
const commandFolderPath = path.join(__dirname, 'commands')
const myCommands = []

exploreCommandsFolder(commandFolderPath, '', myCommands)

for (const cmd of myCommands) {
    if ('data' in cmd) client.commands.set(cmd.data.name, cmd)
}

// --------------
// Interaction

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return

    const cmd = interaction.client.commands.get(interaction.commandName)

    if (!cmd) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        )
        return
    }

    try {
        await cmd.execute(interaction)
    } catch (err) {
        console.error(err)
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            })
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true,
            })
        }
    }
})

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.login(process.env.TOKEN)
