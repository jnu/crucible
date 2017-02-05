var __doc__ = [
'Process nyt_16_year_clues.txt by building into frozen, encoded DAWG.',
'',
'Usage:',
'',
'$ node processNyt16Year.js <path/to/nyt_16_year_clues.txt> <path/to/output/dir> <baseOutputName>'
].join('\n');


// Imports
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var Trie = require('tiny-trie/dist/tiny-trie').Trie;


/**
 * Shift the next line (delimited by '\r') from the string. Pass the string in
 * a box (single-element array) to track the mutation.
 * @param  {String[]} contentBox - One-element array containing string.
 * @param  {String} [delimeter='\n'] - Line delimeter
 * @return {String}
 */
function getNextLine(contentBox, delimeter) {
    delimeter = delimeter || '\n';
    var content = contentBox[0];
    var line = '';
    var len = content.length;
    var ptr = 0;
    while (ptr < len) {
        var char = content[ptr++];
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
 */
function processFiles(inputFile, outputDir) {
    var tries = {};
    var counts = {};

    console.log('Reading ' + inputFile + ' ...');
    var contents = fs.readFileSync(inputFile, 'utf8');
    var boxedContents = [contents];

    console.log('Building trie ...');
    var line;
    while (line = getNextLine(boxedContents, '\r')) {
        var parts = line.split('\t');
        var word = parts[1];

        // Don't care about non-words.
        if (!word) {
            continue;
        }

        var len = word.length;
        // Create new tries for newly encountered lengths. All tries contain
        // words of identical length.
        var trie = tries[len] || (tries[len] = new Trie());
        trie.insert(word);

        // Update counts for reporting stats.
        if (counts.hasOwnProperty(len)) {
            counts[len]++;
        } else {
            counts[len] = 1;
        }
    }
    console.log('Word distributions:');
    var key;
    var count;
    var sum = 0;
    for (key in counts) {
        if (counts.hasOwnProperty(key)) {
            count = counts[key];
            console.log('  ' + key + ': ' + count);
            sum += count;
        }
    }
    console.log('  Total: ' + sum);

    console.log('Freezing tries ...');
    for (key in tries) {
        if (tries.hasOwnProperty(key)) {
            console.log('  - Length ' + key);
            tries[key].freeze();
        }
    }

    var paths = {};
    console.log('Encoding ...');
    for (key in tries) {
        if (tries.hasOwnProperty(key)) {
            console.log('  - Length ' + key);
            var encoded = tries[key].encode();
            var hash = crypto.createHash('sha1').update(encoded).digest('hex');
            var outFileName = [key, hash, 'dawg'].join('.');
            var outFilePath = path.join(outputDir, outFileName);
            fs.writeFileSync(outFilePath, encoded, 'utf8');
            paths[key] = outFileName;
        }
    }

    console.log('Writing manifest ...');
    var date = (new Date()).toISOString();
    var manifestFn = ['manifest', date, 'js'].join('.');
    // Fugly hack to convert file names to inline require statements.
    var requireHash = JSON.stringify(paths, null, 2)
        .replace(/"\s*:\s*"([^"]+?)"/g, '": require("./$1")');
    var manifestContent = 'module.exports = ' + requireHash + ';';
    fs.writeFileSync(path.join(outputDir, manifestFn), manifestContent, 'utf8');

    console.log('Linking manifest ...');
    var indexContent = 'module.exports = require(\'./' + manifestFn.slice(0, manifestFn.length - 3) + '\');';
    fs.writeFileSync(path.join(outputDir, 'index.js'), indexContent, 'utf8');

    console.log('Done.');
}


/**
 * Execute program.
 */
(function main() {
    var args = process.argv.slice(2);
    if (args.length !== 3 || args.indexOf('-h') >= 0 || args.indexOf('--help') >= 0) {
        console.error('Need to supply both input and output paths.');
        console.error(__doc__);
        process.exit(-1);
    }

    var input = args[0];
    var outputBaseDir = path.join(args[1], args[2]);

    // Ensure intput file exists.
    if (!fs.existsSync(input)) {
        console.error('Input path does not exist.');
        process.exit(-1);
    }

    // Make directories recursively up to output path.
    mkdirp.sync(outputBaseDir);

    processFiles(input, outputBaseDir);
}());
