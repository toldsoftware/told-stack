"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
function generateEntry(rootDirName) {
    // Dynamic Entries
    const searchPaths = [
        `${rootDirName}/config/_functions/`
    ];
    const entryPathNames = [];
    searchPaths.forEach(p => {
        if (!fs.existsSync(p)) {
            console.error('!!! Webpack generateEntry searchPath does\'t exist', { p });
            return;
        }
        entryPathNames.push(...fs.readdirSync(p).map(x => ({ path: p + x, name: path.parse(x).name })));
    });
    console.log('Webpack', { entryPathNames });
    const entry = {};
    entryPathNames.forEach(x => entry[`./_deploy/${x.name}/bundle.js`] = x.path);
    return entry;
}
exports.generateEntry = generateEntry;
//# sourceMappingURL=generate-entry.webpack.config.js.map