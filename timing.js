let _ = require('lodash')
let Rhymez = require('./lib/rhymez').default
let utt = require('./lib/utterance-util').default

let r = new Rhymez()

console.log(r.getPronunciations('nigger'))
console.log(r.getPronunciations('nigga'))

console.log(r.getPronunciations('killing'))
console.log(r.getPronunciations('killin'))
// let dictionary = new Map()

// for (var i = 0; i < 1000; i++) {
// 	utt.endRhymeUtterances(['D', 'IH', 'K', 'HH', 'OW', 'L'])
// }

// console.log(dictionary['asdf7'])

// console.time('1000')
// for (var i = 0; i < 1000; i++) {
// 	let groups = dictionary['asdf7']
// 	// let rhymes = dictionary
// }
// console.timeEnd('1000')
