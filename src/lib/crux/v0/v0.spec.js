/* global chai,require */
/* eslint-env mocha */
import { BinaryStringReader } from '../../BinaryString';
import { write, read, headerSchema } from './';
import { parseHeaderWithSchema } from '../read';
const grid5x5_empty = require('test-data/grid/5x5_empty.json');
const grid5x5_partialNoClues = require('test-data/grid/5x5_partial_noClues.json');
const grid5x5_partialNoCluesWithMeta = require('test-data/grid/5x5_partial_noClues_withMeta.json');
const grid5x5_partialCluesWithMeta = require('test-data/grid/5x5_partial_cluesWithMeta.json');
const grid15x15_full = require('test-data/grid/15x15_full.json');


/**
 * Create a mock Crux puzzle object from JSON test-data.
 */
const createPuzzle = puzzle => ({...puzzle});

/**
 * Get the BinaryStringReader and header from binary data.
 */
const getHeaderAndBinStr = str => {
    const binStr = new BinaryStringReader(str);
    return {
        binStr,
        header: parseHeaderWithSchema(binStr, headerSchema)
    };
};


describe('Crux: v0 read/write', () => {

    describe('empty grids', () => {
        it('writes empty content into binary string', () => {
            const puzzle = createPuzzle(grid5x5_empty);
            const str = write(puzzle);
            chai.expect(str).to.equal('ABQpAAAAAAAAAAAAAAAAABv7+xX/eMZV/3jOg');
        });
        it('reads binary data as empty content', () => {
            const { binStr, header } = getHeaderAndBinStr('ABQpAAAAAAAAAAAAAAAAABv7+xX/eMZV/3jOg');
            const puzzle = read(binStr, header);

            chai.expect(puzzle.toJS()).to.eql({
                content: [
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null }
                ],
                clues: [],
                annotations: null,
                author: '',
                title: '',
                description: '',
                copyright: '',
                dateCreated: 1476256537000,
                lastModified: 1476256570000,
                width: 5,
                height: 5
            });
        });
    });

    describe('partial grid; no clues', () => {
        it('writes partial grids without clues', () => {
            const puzzle = createPuzzle(grid5x5_partialNoClues);
            const str = write(puzzle);
            chai.expect(str).to.equal('ABQtAAAAAAAAAAAAAAAAAAACGAIQhCQIChCY6EgUsAFf94xlX/eM6');
        });
        it('reads partial grids without clues', () => {
            const { binStr, header } = getHeaderAndBinStr('ABQtAAAAAAAAAAAAAAAAAAACGAIQhCQIChCY6EgUsAFf94xlX/eM6');
            const puzzle = read(binStr, header);

            chai.expect(puzzle.toJS()).to.eql({
                clues: [],
                annotations: null,
                content: [
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null }
                ],
                author: '',
                title: '',
                description: '',
                copyright: '',
                dateCreated: 1476256537000,
                lastModified: 1476256570000,
                width: 5,
                height: 5
            });
        });
    });

    describe('partial grid; no clues; with meta info', () => {
        it('writes partial grids without clues but with unicode meta data', () => {
            const puzzle = createPuzzle(grid5x5_partialNoCluesWithMeta);
            const str = write(puzzle);
            chai.expect(str).to.equal('ABQtAAAAAAAAACYA+AOgC4ACGAIQhCQIChCY6EgUsAMOGIGfDvHRlciBww7zFvMWCxJnCoeKAoEjDr8OfIHB1xbrFumxlIGnFoSB3xK/FgmQhQ29weXJpZ2h0IMKpIDIwMTYsIEpvZSBOdWRlbGzQmNC+0YHQuNGEINCd0YPQtNC10LvRjFf94xlX/eM6');
        });
        it('reads partial grids without clues but with unicode meta data', () => {
            const { binStr, header } = getHeaderAndBinStr('ABQtAAAAAAAAACYA+AOgC4ACGAIQhCQIChCY6EgUsAMOGIGfDvHRlciBww7zFvMWCxJnCoeKAoEjDr8OfIHB1xbrFumxlIGnFoSB3xK/FgmQhQ29weXJpZ2h0IMKpIDIwMTYsIEpvZSBOdWRlbGzQmNC+0YHQuNGEINCd0YPQtNC10LvRjFf94xlX/eM6');
            const puzzle = read(binStr, header);

            chai.expect(puzzle.toJS()).to.eql({
                clues: [],
                annotations: null,
                content: [
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null }
                ],
                author: 'Иосиф Нудель',
                title: "Æ güter püżłę",
                description: '¡†Hïß puźźle iš wįłd!',
                copyright: 'Copyright © 2016, Joe Nudell',
                dateCreated: 1476256537000,
                lastModified: 1476256570000,
                width: 5,
                height: 5
            });
        });
    });

    describe('partial grid; partial clues; with meta', () => {
        it('writes partial grids with partial clues', () => {
            const puzzle = createPuzzle(grid5x5_partialCluesWithMeta);
            const str = write(puzzle);
            chai.expect(str).to.equal('ABQtAAFnAAAAACoAAAOACoABDQsH2qZym6aarjKfQAAAAAABAAAGAAAUAAAwBqQ3trK5E7mQNDCxNLoAcBZQdXJ2ZXlvciBvZiBjb2xkIG1lYXRzASAQhMLIQObSztwCgEkRpY2tpbnNvbiwgZm9yIG9uZQGAAAOAA0JrRgNCw0YLQutC+0LUg0LjQvNGPQ29weXJpZ2h0IMKpIFB1xb16TMKjIETDumTEk3DDu8W+esWCw6vCtWXDr8WbdMSZclgBx/pYAcpp');
        });
        it('reads partial grids with partial clues', () => {
            const { binStr, header } = getHeaderAndBinStr('ABQtAAFnAAAAACoAAAOACoABDQsH2qZym6aarjKfQAAAAAABAAAGAAAUAAAwBqQ3trK5E7mQNDCxNLoAcBZQdXJ2ZXlvciBvZiBjb2xkIG1lYXRzASAQhMLIQObSztwCgEkRpY2tpbnNvbiwgZm9yIG9uZQGAAAOAA0JrRgNCw0YLQutC+0LUg0LjQvNGPQ29weXJpZ2h0IMKpIFB1xb16TMKjIETDumTEk3DDu8W+esWCw6vCtWXDr8WbdMSZclgBx/pYAcpp');
            const puzzle = read(binStr, header);

            chai.expect(puzzle.toJS()).to.eql({
                "annotations": null,
                "width": 5,
                "height": 5,
                "copyright": "Copyright © PuŽzL£ Dúdē",
                "author": "pûžzłëµeïśtęr",
                "title": "Краткое имя",
                "content": [
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "" },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "CONTENT", "value": "O" },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "CONTENT", "value": "U" },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "CONTENT", "value": "Y" },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null  }
                ],
                "clues": [
                    { "across": "", "down": "" },
                    { "across": null, "down": "" },
                    { "across": null, "down": "" },
                    { "across": "Homer's habit", "down": "Purveyor of cold meats" },
                    { "across": null, "down": "Bad sign" },
                    { "across": "Dickinson, for one", "down": null },
                    { "across": "", "down": null },
                    { "across": "", "down": null }
                ],
                "dateCreated": 1476511738000,
                "description": "",
                "lastModified": 1476512361000
            });
        });
    });

    describe('full grid; all letters; full clues; full meta', () => {
        it('writes partial grids with complete clues', () => {
            const puzzle = createPuzzle(grid15x15_full);
            const str = write(puzzle);

            chai.expect(str).to.equal('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');
        });
        it('reads partial grids with complete clues', () => {
            const { binStr, header } = getHeaderAndBinStr('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');
            const puzzle = read(binStr, header);

            chai.expect(puzzle.toJS()).to.eql({
                "annotations": null,
                "width": 15,
                "height": 15,
                "copyright": "Çœpÿrīgh† © 2016",
                "author": "Иосиф Нудел",
                "title": "ƒûłł †ešt πûzżłë",
                "content": [
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "CONTENT", "value": "K" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "CONTENT", "value": "O" },
                    { "type": "CONTENT", "value": "P" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "Q" },
                    { "type": "CONTENT", "value": "R" },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "CONTENT", "value": "U" },
                    { "type": "CONTENT", "value": "V" },
                    { "type": "CONTENT", "value": "W" },
                    { "type": "CONTENT", "value": "X" },
                    { "type": "CONTENT", "value": "Y" },
                    { "type": "CONTENT", "value": "Z" },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "CONTENT", "value": "K" },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "O" },
                    { "type": "CONTENT", "value": "P" },
                    { "type": "CONTENT", "value": "Q" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "R" },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "U" },
                    { "type": "CONTENT", "value": "V" },
                    { "type": "CONTENT", "value": "W" },
                    { "type": "CONTENT", "value": "X" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "Y" },
                    { "type": "CONTENT", "value": "Z" },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "CONTENT", "value": "K" },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "CONTENT", "value": "O" },
                    { "type": "CONTENT", "value": "P" },
                    { "type": "CONTENT", "value": "Q" },
                    { "type": "CONTENT", "value": "R" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "CONTENT", "value": "U" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "V" },
                    { "type": "CONTENT", "value": "W" },
                    { "type": "CONTENT", "value": "X" },
                    { "type": "CONTENT", "value": "Y" },
                    { "type": "CONTENT", "value": "Z" },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "CONTENT", "value": "K" },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "CONTENT", "value": "O" },
                    { "type": "CONTENT", "value": "P" },
                    { "type": "CONTENT", "value": "Q" },
                    { "type": "CONTENT", "value": "R" },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "CONTENT", "value": "U" },
                    { "type": "CONTENT", "value": "V" },
                    { "type": "CONTENT", "value": "W" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "X" },
                    { "type": "CONTENT", "value": "Y" },
                    { "type": "CONTENT", "value": "Z" },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "CONTENT", "value": "K" },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "CONTENT", "value": "O" },
                    { "type": "CONTENT", "value": "P" },
                    { "type": "CONTENT", "value": "Q" },
                    { "type": "CONTENT", "value": "R" },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "CONTENT", "value": "U" },
                    { "type": "CONTENT", "value": "V" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "W" },
                    { "type": "CONTENT", "value": "X" },
                    { "type": "CONTENT", "value": "Y" },
                    { "type": "CONTENT", "value": "Z" },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "CONTENT", "value": "K" },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "CONTENT", "value": "O" },
                    { "type": "CONTENT", "value": "P" },
                    { "type": "CONTENT", "value": "Q" },
                    { "type": "CONTENT", "value": "R" },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "CONTENT", "value": "U" },
                    { "type": "CONTENT", "value": "V" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "W" },
                    { "type": "CONTENT", "value": "X" },
                    { "type": "CONTENT", "value": "Y" },
                    { "type": "CONTENT", "value": "Z" },
                    { "type": "CONTENT", "value": "A" },
                    { "type": "CONTENT", "value": "B" },
                    { "type": "CONTENT", "value": "C" },
                    { "type": "CONTENT", "value": "D" },
                    { "type": "CONTENT", "value": "E" },
                    { "type": "CONTENT", "value": "F" },
                    { "type": "CONTENT", "value": "G" },
                    { "type": "CONTENT", "value": "H" },
                    { "type": "CONTENT", "value": "I" },
                    { "type": "CONTENT", "value": "J" },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "K" },
                    { "type": "CONTENT", "value": "L" },
                    { "type": "CONTENT", "value": "M" },
                    { "type": "CONTENT", "value": "N" },
                    { "type": "CONTENT", "value": "O" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "P" },
                    { "type": "CONTENT", "value": "Q" },
                    { "type": "CONTENT", "value": "R" },
                    { "type": "CONTENT", "value": "S" },
                    { "type": "CONTENT", "value": "T" },
                    { "type": "CONTENT", "value": "U" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null },
                    { "type": "CONTENT", "value": "V" },
                    { "type": "CONTENT", "value": "W" },
                    { "type": "CONTENT", "value": "X" },
                    { "type": "CONTENT", "value": "Y" },
                    { "type": "CONTENT", "value": "Z" },
                    { "type": "BLOCK", "value": null },
                    { "type": "BLOCK", "value": null }
                ],
                "clues": [
                    { "across": "First five, round 1", "down": "Starting on the downs" },
                    { "across": null, "down": "Also have 50 of these, or so." },
                    { "across": null, "down": "SOOOO MANY CLUES!!!!" },
                    { "across": null, "down": "You can write anything here" },
                    { "across": null, "down": "Даже по русски можно писать" },
                    { "across": "Six more!!!", "down": "Надеюсь что и читать по русски возможно" },
                    { "across": null, "down": "Blah, yep." },
                    { "across": null, "down": "Ta ta ta tat ta." },
                    { "across": null, "down": "Clue fo' sho'." },
                    { "across": null, "down": "I wonder how large this file will be" },
                    { "across": null, "down": "Make for a good test" },
                    { "across": "L through P", "down": null },
                    { "across": "Q through W", "down": "This is a really long answer!" },
                    { "across": "End of the first alphabet, start of the second", "down": "Alaska" },
                    { "across": null, "down": "Tee, hee." },
                    { "across": "Азбука по русски", "down": null },
                    { "across": "Как сказать \"crossword\"", "down": null },
                    { "across": "What is this madness", "down": null },
                    { "across": "Moar ûñíçœdē!¡", "down": null },
                    { "across": "Blah blah blah", "down": null },
                    { "across": null, "down": "Almost half way done!" },
                    { "across": "This is tedious", "down": null },
                    { "across": null, "down": "Really, three-fourths done." },
                    { "across": "More alphabet", "down": "Because I already did the acrosses" },
                    { "across": null, "down": "This is a time-consuming hobby!" },
                    { "across": null, "down": "More so than just solving." },
                    { "across": "These clues can be arbitrarily long.", "down": null },
                    { "across": null, "down": "I wonder how this compares to the other software" },
                    { "across": "Or very short.", "down": null },
                    { "across": "I wonder about formatting", "down": null },
                    { "across": "Autofill would be nice", "down": "The license is only $50." },
                    { "across": "I thought clue writing would be the easy part!", "down": null },
                    { "across": "Crosswords are fun", "down": null },
                    { "across": null, "down": "That's not much, given the time it takes to develop a program :D" },
                    { "across": null, "down": "But this way is way more fun!" },
                    { "across": "La-La-La", "down": "Круто" },
                    { "across": "This is a great test", "down": null },
                    { "across": null, "down": "To do: Unicode in the grid" },
                    { "across": "Not bad for a Saturday", "down": null },
                    { "across": "Garbage clue", "down": "For our international friends" },
                    { "across": null, "down": "Международные друзья" },
                    { "across": null, "down": "So close to being finished" },
                    { "across": "You'll never guess this one!", "down": null },
                    { "across": "You couldn't if you tried", "down": null },
                    { "across": "Don't take it so hard", "down": null },
                    { "across": "another short answer", "down": null },
                    { "across": "I wish I could hit tab to move to the next clue", "down": null },
                    { "across": null, "down": "This is great" },
                    { "across": "That would speed this process up", "down": null },
                    { "across": "I think I'll do that, soon.", "down": "Moâr ÜŃÏĆÓDÉ!!!!!!" },
                    { "across": null, "down": "Four more" },
                    { "across": null, "down": "Three more" },
                    { "across": null, "down": "Penultimate" },
                    { "across": "Almost finished with the across section!", "down": null },
                    { "across": null, "down": "This is the last clue in the test." },
                    { "across": "I also need to do auto-scrolling to clues.", "down": null },
                    { "across": "Yea, like the NYT.", "down": null },
                    { "across": "Last row!", "down": null },
                    { "across": "Last clue in the acrosses!", "down": null }
                ],
                "dateCreated": 1476557788000,
                "description": "Крутая загадка - Just a little test púžžłë!",
                "lastModified": 1476558823000
            });
        });
    });

});
