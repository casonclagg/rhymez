# Rhymez

Find perfect rhymes, alliterations, and end rhymes.  Uses a much larger phoneme list than the standard cmudict that was built using g2p-seq2seq and the CMU Sphinx neural net.  The words it was trained on were pulled from every rap lyric ever.

#### Usage

```shell
npm install -S rhymez
```

```javascript

import Rhymez from 'rhymez'
let rhymez = new Rhymez()

let rhymes = rhymez.rhyme('test')
console.log(rhymes)  // ['BEST', 'REST' ...]

let rhymes = rhymez.alliteration('test')
console.log(rhymes)  // ['TABLET', 'TENT' ...]

let rhymes = rhymez.endRhyme('Breakfast')
console.log(rhymes)  // ['MAST', 'BELFAST' ...]

```

# TODO

0. Remove misspellings etc if possible...
1. Add assonants
2. Expand dictionary with words outside of the rap corpus
3. Get alternate pronunciations somehow (CMU Sphinx just gives one, a good example of when that sucks is with the word `the`.  Say, `thee` and `thuh`.)
4. Allow for looser rhymes
5. Enable some common rhyme tactics, like `bigger -> bigga` and `coding -> codin` and `thriller -> thrilla` 
