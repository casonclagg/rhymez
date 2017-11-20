import Rhymez from '../src/rhymez'
import _ from 'lodash'
import { assert } from 'chai'
import present from 'present'

let r = new Rhymez()

suite('Rhymez')

before(async () => {})

test('"the" only has 2 pronunciations', () => {
	let pronunciations = r.getPronunciations('the')
	assert.equal(pronunciations.length, 2, 'Should only be two pronunciations')
})

test('getPronunciations can handle single words', () => {
	let pronunciations = r.getPronunciations('scrilla')
	assert.isAtLeast(pronunciations.length, 1, 'Should have pronunciations')
})

// test('getPronunciations can handle multiple words', () => {
// 	let pronunciations = r.getPronunciations('pay day')
// 	assert.isAtLeast(pronunciations.length, 1, 'Should have pronunciations')
// })

// 100 in 55ms
test('Rhymes is fast?', () => {
	let words = ['scrilla', 'dough', 'day', 'test', 'air', 'flow', 'key', 'kilo', 'floor', 'desk', 'ramp', 'screen', 'transformer', 'computer', 'banana']
	var t0 = present()
	for (var i = 0; i < 100; i++) {
		let rhymes = r.rhyme(_.sample(words))
	}
	var t1 = present()

	assert.isBelow(t1 - t0, 120, 'under 1ms per search fail')
})

// 100 in 200ms
test('Alliteration is fast?', () => {
	let words = ['scrilla', 'dough', 'day', 'test', 'air', 'flow', 'kilo', 'floor', 'idiot', 'ramp', 'screen', 'transformer', 'computer', 'banana']
	var t0 = present()
	for (var i = 0; i < 100; i++) {
		let rhymes = r.alliteration(words[i % words.length])
	}
	var t1 = present()

	assert.isBelow(t1 - t0, 330, 'under 3ms per search fail')
})

// 100 in 100ms
test('Assonance is fast?', () => {
	let words = ['scrilla', 'dough', 'day', 'test', 'air', 'flow', 'kilo', 'floor', 'idiot', 'ramp', 'screen', 'transformer', 'computer', 'banana']
	var t0 = present()
	for (var i = 0; i < 100; i++) {
		let rhymes = r.assonance(words[i % words.length])
	}
	var t1 = present()

	assert.isBelow(t1 - t0, 330, 'under 3ms per search fail')
})

// 100 in 300ms
test('End Rhymes is fast?', () => {
	let words = ['scrilla', 'dough', 'day', 'test', 'air', 'flow', 'kilo', 'floor', 'idiot', 'ramp', 'screen', 'transformer', 'computer', 'banana']
	var t0 = present()
	for (var i = 0; i < 100; i++) {
		let rhymes = r.endRhyme(words[i % words.length])
	}
	var t1 = present()

	assert.isBelow(t1 - t0, 430, 'under 3ms per search fail')
})

test('Rhymes probably work', () => {
	let rhymes = r.rhyme('scrilla')
	assert.isTrue(_.includes(rhymes, 'killa'))

	rhymes = r.rhyme('window')
	assert.isTrue(_.includes(rhymes, 'indo'))
	// assert.isFalse(_.includes(rhymes, 'window'))
	rhymes = r.rhyme('cheetah')
	assert.isTrue(_.includes(rhymes, 'rita'))
})

test('Rhymes with er -> ah work', () => {
	let rhymes = r.rhyme('bigger')
	assert.isTrue(_.includes(rhymes, 'bigga'))
})

test('Rhymes with ing -> in work', () => {
	let rhymes = r.rhyme('running')
	console.log(rhymes)
	assert.isTrue(_.includes(rhymes, "runnin'"))
	assert.isTrue(_.includes(rhymes, 'gunning'))
	assert.isTrue(_.includes(rhymes, 'running'))
})

test('Assonance likely works', () => {
	let rhymes = r.assonance('hype')
	assert.isTrue(_.includes(rhymes, 'night'))
	rhymes = r.assonance('Cat')
	assert.isTrue(_.includes(rhymes, 'ran'))
	assert.isFalse(_.includes(rhymes, 'bake'))
})

// test('Multiword Rhyming works', () => {
// 	let rhymes = r.rhyme('pay day')
// 	assert.isTrue(_.includes(rhymes, 'heyday'))
// 	assert.isTrue(_.includes(rhymes, 'mayday'))
// })

// test('Alliteration doesnt return itself', () => {
// 	let alliterations = r.alliteration('scrilla')
// 	assert.isFalse(_.includes(alliterations, 'scrilla'))
// 	alliterations = r.alliteration('window')
// 	assert.isFalse(_.includes(alliterations, 'window'))
// })

test('Alliteration probably works', () => {
	let alliterations = r.alliteration('scrilla')
	assert.isTrue(_.includes(alliterations, 'scribble'))
	alliterations = r.alliteration('window')
	assert.isTrue(_.includes(alliterations, 'willow'))
	assert.isFalse(_.includes(alliterations, 'whore'))
	alliterations = r.alliteration('cheetah')
	assert.isTrue(_.includes(alliterations, 'cheap'))
})

test('End Rhymes probably work', () => {
	let rhymes = r.endRhyme('scrilla')
	assert.isTrue(_.includes(rhymes, 'hella'))
	rhymes = r.endRhyme('common')
	assert.isTrue(_.includes(rhymes, 'button'))
	assert.isTrue(_.includes(rhymes, 'lemon'))
	// assert.isFalse(_.includes(rhymes, 'common'))
	rhymes = r.endRhyme('HellCat')
	assert.isTrue(_.includes(rhymes, 'aristocrat'))
	assert.isTrue(_.includes(rhymes, 'slat'))
	assert.isTrue(_.includes(rhymes, 'pussycat'))
})

// test('End Rhymes', () => {
// 	let rhymes = r.endRhyme('scrilla')
// 	assert.isTrue(_.includes(rhymes, 'HELLA'))
// 	rhymes = r.endRhyme('common')
// 	assert.isTrue(_.includes(rhymes, 'BUTTON'))
// 	assert.isTrue(_.includes(rhymes, 'LEMON'))
// 	assert.isFalse(_.includes(rhymes, 'COMMON'))
// 	rhymes = r.endRhyme('HellCat')
// 	assert.isTrue(_.includes(rhymes, 'ARISTOCRAT'))
// 	assert.isTrue(_.includes(rhymes, 'SLAT'))
// 	assert.isTrue(_.includes(rhymes, 'PUSSYCAT'))
// 	rhymes = r.endRhyme2('toro', 0)
// 	console.log(rhymes)
// 	assert.isFalse(_.includes(rhymes, 'BOBO'))
// 	assert.isFalse(_.includes(rhymes, 'SOLO'))
// 	assert.isTrue(_.includes(rhymes, 'GORO'))
// 	rhymes = r.endRhyme2('ARISTOCRAT', 0)
// 	console.log(rhymes)
// 	rhymes = r.endRhyme2('ARISTOCRAT', 1)
// 	console.log(rhymes)
// 	rhymes = r.endRhyme2('ARISTOCRAT', 2)
// 	console.log(rhymes)
// })

// TODO - Required and Admired.. Rhymezone owns rhymez at this...
//Directory Broke Multirhymes
//console.log(r.pronunciation('acquired'))
//console.log(r.pronunciation('required'))
//assert.isTrue(_.includes(rhymes, "ACQUIRED"))
//// TODO - its more than just super loose assonance, the G from guns comes into play with the g from orange...
//// assert.isTrue(_.includes(rhymes, "MORE GUNS"))
//let rhymes = r.rhyme("Payday", {
//assert.isFalse(_.includes(rhymes, "SLAY DAY"))
//assonant = r.assonance("payday")
//assert.isTrue(_.includes(assonant, "MELEE"))
//let rhymes = r.rhyme("generate")
//assert.isTrue(_.includes(rhymes, "VENERATE"))
//rhymes = r.rhyme("rate")
//assert.isFalse(_.includes(rhymes, "VENERATE"))
//assert.isTrue(_.includes(rhymes, "BAIT"))
// Orange
// `AO1 R AH0 N JH`

// More GUNS
// `M AO1 R G AH1 N Z`

// Floor Lunge
//`F L AO1 R L AH1 N JH`
