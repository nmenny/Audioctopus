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

function checkFileFormat(fileFormat) {
    return fileFormat === "audio/mpeg" || fileFormat === "audio/ogg" || fileFormat === "audio/webm";
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
        
        return resource;
    }

    toString() { return `Youtube video **${super.toString()}**`; }
}

class ResourceSet {
    constructor(selectRnd = false) {
        this.set = [];
        this.lastingSetIdx = [];
        this.selectRnd = selectRnd;
        this.currIdx = 0;
    }

    addResource(resource) {
        this.set.push(resource);
        this.lastingSetIdx.push(this.set.length);
    }

    getCurrentResource() {
        if(this.currIdx <= 0 || this.currIdx > this.set.length) return undefined;

        return this.set[this.currIdx-1];
    }

    goto(idx) {
        if(idx <= 0 || idx > this.set.length) return false;

        this.reset();
        this.lastingSetIdx = this.lastingSetIdx.slice(idx-1);
        
        return this.next();;
    }

    next() {
        if(!this.hasMoreResource()) return false;

        if(this.selectRnd) {
            const selectIdx = Math.round(Math.random() * (this.lastingSetIdx.length - 1));
            this.currIdx = this.lastingSetIdx[selectIdx];
            this.lastingSetIdx = this.lastingSetIdx.slice(0, selectIdx).concat(this.lastingSetIdx.slice(selectIdx+1));
        } else {
            this.currIdx = this.lastingSetIdx.shift();
        }

        return true;
    }

    hasMoreResource() {
        return this.lastingSetIdx.length !== 0;
    }

    numberOfResourcesLeft() {
        return this.lastingSetIdx.length;
    }

    reset() {
        this.currIdx = 0;
        this.lastingSetIdx = [];
        for(let idx in this.set) {
            this.lastingSetIdx.push(parseInt(idx)+1);
        }
    }

    async load() {
        const rsc = this.getCurrentResource();
        if(rsc) {
            return await rsc.load();
        }

        return undefined;
    }

    toString() { 
        const rsc = this.getCurrentResource();
        if(rsc) {
            return rsc.toString();
        }

        return "";
    }
}

module.exports = { FileResource, LinkResource, ResourceSet, checkFileFormat };