# Rhymez

The only rhyming package for node that can rhyme from multiple words and find mutli-word rhymes.

Also includes **assonance**!

Note: Its significantly slower when searching multiple word rhymes.

#### Usage

```shell
npm install -S rhymez
```

```javascript

import Rhymez from 'rhymez'
let rhymez = new Rhymez()
await rhymez.load()


// Defaults
let options = {
  isLoose: false, // Ignore vowel sound differences (EH1 and EH2 are considered identical)
  assonance: false, // Ignore consonants
  multiword: false  
}

let rhymes = rhymez.rhyme('test', options)
console.log(rhymes)  // ['BEST', 'REST' ...]

let pronunciation = rhymez.pronunciation('test')
console.log(pronunciation)  // ['T', 'EH1', 'S', 'T']
```
