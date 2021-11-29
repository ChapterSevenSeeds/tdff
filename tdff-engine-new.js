const fs = require('fs');
const crypto = require('crypto');
const humanizeDuration = require("humanize-duration");

const root = process.argv[2];
const folders = [root];

const lengths = {};
const hashes = {};

const start = new Date();

while (folders.length) {
    const current = folders.shift();

    for (const thing of fs.readdirSync(current, { withFileTypes: true })) {
        const thingFull = `${current}\\${thing.name}`
        if (thing.isDirectory()) {
            folders.push(thingFull);
        } else {
            const stats = fs.statSync(thingFull);
            if (!(stats.size in lengths)) {
                lengths[stats.size] = [];
            }

            lengths[stats.size].push(thingFull);
        }
    }
}

for (const length in lengths) {
    if (lengths[length].length > 1) {
        for (const file of lengths[length]) {
            const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('base64');

            if (!(hash in hashes)) {
                hashes[hash] = [];
            }

            hashes[hash].push(file);
        }
    }
}

for (const hash in hashes) {
    if (hashes[hash].length <= 1) {
        delete hashes[hash];
    }
}

console.log(humanizeDuration(new Date() - start));