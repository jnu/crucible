Roadmap
===

Past, present, and future work on Crucible.

Items may jump around and work may not be completed exactly in the planned order.

## 0.0
 - ~~Basic interactive grid implementation~~
 - ~~Load / save grid templates~~
 - ~~Basic frequency counts~~
 - ~~Clue highlighting~~

## 0.1
 - ~~Clue builder~~
 - ~~Auto-join clues when grid changes~~
 - ~~Symmetrical grid building~~

## 0.2
 - ~~Save grid with clues/answers~~
    ? Unique ID
    - ~~Date created~~
    - ~~Last edited~~
    - ~~Title~~
    - ~~Author~~
    - ~~Copyright~~
    - ~~Description~~
    ? Checksum
 - ~~Load grid with clues/answers~~
 - ~~Autosave puzzles in progress~~
 * Lock the grid while editing puzzles
    - This should allow blocks to be skipped during nav

## 0.3
 - ~~Fix small grid layout solution~~
 - ~~Find a large grid layout solution~~
 * Tuned navigation
    - ~~Double click to change direction~~
    - Tab controls from clue builder
    - ~~Backspace more quickly~~
 - ~~Improve cell highlight styles~~
 * Improve clue builder styles

## 0.4
 - ~~Enhanced meta data (word / letter count)~~
 * Word lists:
    - ~~Default, embedded~~
     - ~~bundle splitting~~
     - ~~minified format~~
     * Non-blocking with wordbank in webworker
    * Metadata (cruciverb? rex parker? other?)
 * Answer suggestions:
    * Search through word lists
    * Rank by metadata (?)

## 0.5
 * Word lists:
    * Load custom
    * Select, deselect
    * Context aware (crossings)
 * Grid validation (options)

## 0.6
 * Print view
 * Extreme case solutions (> 21x21)
 * Ensure clues containers resize properly
 * Puzzle difficulty grade (this depends on clues as well as answers / grid though)

## 1.0
 * Server-side persistence
 * Unit testing
 * Deployment bundling
 * PUZ format support
    - Import
    - Export
 * Performance fixes for WordBank (see benchmarks)
    - Improve tail / low information over naive RegEx search

## 2.0
 * "Play" mode - for solving
 * Accounts / auth / whatever
 * Sharing, commenting, collaborating (?)



## Misc
 - Port wildcard trie matching to `tiny-trie`
    - Refactor bit manip as necessary
