/* eslint no-console:false */
'use strict';

const __doc__ = `\
Process nyt_16_year_clues.txt by building into frozen, encoded DAWG.

Usage:

  $ node processNyt16Year.js <path/to/nyt_16_year_clues.txt> <path/to/output/dir> <baseOutputName>
`;


// Imports
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mkdirp = require('mkdirp');
const Trie = require('tiny-trie').Trie;


/**
 * Shift the next line (delimited by '\r') from the string. Pass the string in
 * a box (single-element array) to track the mutation.
 * @param  {String[]} contentBox - One-element array containing string.
 * @param  {String} [delimeter='\n'] - Line delimeter
 * @return {String}
 */
function getNextLine(contentBox, delimeter) {
    delimeter = delimeter || '\n';
    const content = contentBox[0];
    const len = content.length;
    let line = '';
    let ptr = 0;
    while (ptr < len) {
        let char = content[ptr++];
        if (char === '\r') {
            break;
        }
        line += char;
    }
    contentBox[0] = content.slice(ptr);
    return line;
}


/**
 * Process input word list, write encoded DAWG to output file.
 * @param  {String} inputFile - path to input word list
 * @param  {String} outputDir - path to output directory
 * @param  {String} name - base name for wordlist
 */
function processFiles(inputFile, outputDir, name) {
    const tries = {};
    const counts = {};

    console.log('Reading ' + inputFile + ' ...');
    const contents = fs.readFileSync(inputFile, 'utf8');
    const boxedContents = [contents];

    console.log('Building trie ...');
    let line;
    while (line = getNextLine(boxedContents, '\r')) {
        let parts = line.split('\t');
        let word = parts[1];

        // Don't care about non-words.
        if (!word) {
            continue;
        }

        let len = word.length;
        // Create new tries for newly encountered lengths. All tries contain
        // words of identical length.
        let trie = tries[len] || (tries[len] = new Trie());
        trie.insert(word);

        // Update counts for reporting stats.
        if (counts.hasOwnProperty(len)) {
            counts[len]++;
        } else {
            counts[len] = 1;
        }
    }
    console.log('Word distributions:');
    let sum = 0;
    for (let key in counts) {
        if (counts.hasOwnProperty(key)) {
            let count = counts[key];
            console.log('  ' + key + ': ' + count);
            sum += count;
        }
    }
    console.log('  Total: ' + sum);

    console.log('Freezing tries ...');
    for (let key in tries) {
        if (tries.hasOwnProperty(key)) {
            console.log('  - Length ' + key);
            tries[key].freeze();
        }
    }

    const paths = {};
    console.log('Encoding ...');
    for (let key in tries) {
        if (tries.hasOwnProperty(key)) {
            console.log('  - Length ' + key);
            let encoded = tries[key].encode();
            let hash = crypto.createHash('sha1').update(encoded).digest('hex');
            let outFileName = [key, hash, 'dawg'].join('.');
            let outFilePath = path.join(outputDir, outFileName);
            fs.writeFileSync(outFilePath, encoded, 'utf8');
            paths[key] = outFileName;
        }
    }

    console.log('Writing manifest ...');
    const now = new Date();
    const date = now.toISOString();
    const manifestFn = ['manifest', date, 'js'].join('.');
    const imports = Object
        .keys(paths)
        .sort((a, b) => +a < +b ? -1 : 1)
        .map(key => `${key}: import('./${paths[key]}')`);
    const INDENT = '    ';
    const manifestContent = `\
// Auto-generated manifest. Do not edit.

export const chunks = {
${INDENT}${imports.join(`,\n${INDENT}`)}
};

export const ts = ${+now};
`;
    fs.writeFileSync(path.join(outputDir, manifestFn), manifestContent, 'utf8');

    console.log('Linking manifest ...');
    const manifestPath = `./${manifestFn.slice(0, manifestFn.length - 3)}`;
    const indexContent = `\
// Auto-generated module loader. Do not edit.

import { chunks } from '${manifestPath}';

/**
 * Timestamp (ms) when wordlist was last updated.
 * @type number
 */
export { ts } from '${manifestPath}';

/**
 * ID of wordlist.
 * @type {string}
 */
export const id = '${name.replace(/'/g, '\\\'')}';

/**
 * Get a promise resolving with packed wordlist DAWG, binned by word length.
 * @returns Promise<{[key: number]: string}>
 */
export const load = () => Promise.all(
        Object.keys(chunks).map(key => chunks[key].then(mod => [key, mod.default]))
    )
    .then(pairs => pairs.reduce((agg, [key, dawg]) => {
        agg[key] = dawg;
        return agg;
    }, {}));
`;
    fs.writeFileSync(path.join(outputDir, 'index.js'), indexContent, 'utf8');

    console.log('Generating typings ...');
    const typingContent = `\
// Auto-generated type declaration. Do not edit.
import {IDawgs} from '../../common';

interface INytChunks {
${Object.keys(paths).map(k => `${INDENT}readonly ${k}: Promise<{ default: string }>;`).join('\n')}
}

interface INytDawgs extends IDawgs {
${Object.keys(paths).map(k => `${INDENT}readonly ${k}: string;`).join('\n')}
}

export declare const ts: number;
export declare const id: string;
export declare const chunks: INytChunks;
export declare function load(): Promise<INytDawgs>;
`;
    fs.writeFileSync(path.join(outputDir, 'index.d.ts'), typingContent, 'utf8');

    console.log('Done.');
}


/**
 * Execute program.
 */
(function main() {
    const args = process.argv.slice(2);
    if (args.length !== 3 || args.indexOf('-h') >= 0 || args.indexOf('--help') >= 0) {
        console.error('Need to supply both input and output paths.');
        console.error(__doc__);
        process.exit(-1);
    }

    const input = args[0];
    const outputBaseDir = path.join(args[1], args[2]);

    // Ensure intput file exists.
    if (!fs.existsSync(input)) {
        console.error('Input path does not exist.');
        process.exit(-1);
    }

    // Make directories recursively up to output path.
    mkdirp.sync(outputBaseDir);

    processFiles(input, outputBaseDir, args[2]);
}());
