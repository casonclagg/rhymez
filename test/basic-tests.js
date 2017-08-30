import Rhymez from '../src/rhymez';
import _ from 'lodash'
import {
	assert
} from 'chai'
let r = new Rhymez()

suite('Rhymez')

before(async () => {
	await r.load()
})

test('Rhymes probably works', () => {
	let rhymes = r.rhyme('scrilla')
	assert.isTrue(_.includes(rhymes, 'KILLA'))
	rhymes = r.rhyme('window')
	assert.isTrue(_.includes(rhymes, 'INDOE'))
	assert.isFalse(_.includes(rhymes, 'WINDOW'))
	rhymes = r.rhyme('cheetah')
	assert.isTrue(_.includes(rhymes, 'RITA'))
})

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
