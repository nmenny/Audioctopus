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

const { createAudioResource, demuxProbe } = require('@discordjs/voice');
const ytdl = require("ytdl-core");

async function probeAndCreateResource(readableStream) {
    const { stream, type } = await demuxProbe(readableStream);

    return createAudioResource(stream, { inputType: type });
}

class Resource {
    constructor(title) {
        this.title = title;
    }
    async load() { return undefined; }

    toString() { return this.title; }
}

class FileResource extends Resource {
    constructor(title, fileContent) {
        super(title);
        this.content = fileContent;
    }

    async load() {
        const resource = createAudioResource(this.content);

        if(!resource.metadata) resource.metadata = {};
        if(!resource.metadata.title) resource.metadata.title = this.title;

        return resource;
    }

    toString() { return `File **${super.toString()}**`; }
}

class LinkResource extends Resource {
    constructor(title, link) {
        super(title);
        this.link = link;
    }

    async load() {
        const data = ytdl(this.link, { format:"webm", filter:"audioonly", quality: "lowestaudio" });
        data.on("info", info => { this.title = `${info.videoDetails.title}`; });   
        
        const resource = await probeAndCreateResource(data);

        if(!resource.metadata) resource.metadata = {};
        if(!resource.metadata.title) resource.metadata.title = this.title;
        
        return resource
    }

    toString() { return `Youtube video **${super.toString()}**`; }
}

module.exports = { FileResource, LinkResource }