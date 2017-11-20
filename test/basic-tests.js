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

test('Rhymes is fast?', () => {
	let words = ['scrilla', 'dough', 'day', 'test', 'air', 'flow', 'key', 'kilo', 'floor', 'desk', 'ramp', 'screen', 'transformer', 'computer', 'banana']
	var t0 = present()
	for (var i = 0; i < 100; i++) {
		let rhymes = r.rhyme(_.sample(words))
	}
	var t1 = present()

	assert.isBelow(t1 - t0, 10, 'under .ms per search fail')
})

test('Alliteration is fast?', () => {
	let words = ['scrilla', 'dough', 'day', 'test', 'air', 'flow', 'kilo', 'floor', 'idiot', 'ramp', 'screen', 'transformer', 'computer', 'banana']
	var t0 = present()
	for (var i = 0; i < 100; i++) {
		let rhymes = r.alliteration(words[i % words.length])
	}
	var t1 = present()

	assert.isBelow(t1 - t0, 10, 'under .1ms per search fail')
})

test('Assonance is fast?', () => {
	let words = ['scrilla', 'dough', 'day', 'test', 'air', 'flow', 'kilo', 'floor', 'idiot', 'ramp', 'screen', 'transformer', 'computer', 'banana']
	var t0 = present()
	for (var i = 0; i < 100; i++) {
		let rhymes = r.assonance(words[i % words.length])
	}
	var t1 = present()

	assert.isBelow(t1 - t0, 10, 'under .1ms per search fail')
})

test('End Rhymes is fast?', () => {
	let words = ['scrilla', 'dough', 'day', 'test', 'air', 'flow', 'kilo', 'floor', 'idiot', 'ramp', 'screen', 'transformer', 'computer', 'banana']
	var t0 = present()
	for (var i = 0; i < 100; i++) {
		let rhymes = r.endRhyme(words[i % words.length])
	}
	var t1 = present()

	assert.isBelow(t1 - t0, 10, 'under .1ms per search fail')
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

test('Shit doesnt rhyme with cheat, but does rhyme with hit', () => {
	let rhymes = r.rhyme('shit')
	assert.isTrue(_.includes(rhymes, 'hit'))
	assert.isFalse(_.includes(rhymes, 'cheat'))
})

test('Rhymes with ing -> in work', () => {
	let rhymes = r.rhyme('running')
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
