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

const fs = require('fs')
const path = require('path')

function addCommand(currPath) {
    const command = require(currPath)

    if ('data' in command && 'execute' in command) {
        return command
    } else {
        console.log(
            `[WARNING] The command at ${currPath} is missing a required "data" or "execute" property.`
        )
    }
    return {}
}

function exploreCommandsFolder(currPath, fileName = '', res = []) {
    if (fs.lstatSync(currPath).isFile() && fileName.endsWith('.js')) {
        res.push(addCommand(currPath))
    } else {
        const folder = fs.readdirSync(currPath)

        for (const content of folder) {
            const commandPath = path.join(currPath, content)
            exploreCommandsFolder(commandPath, content, res)
        }
    }
}

module.exports = { exploreCommandsFolder }
