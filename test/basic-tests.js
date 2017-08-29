import Rhymez from '../src/rhymez';
import _ from 'lodash'
import {
    assert
} from 'chai'

suite('Rhymez:', () => {
	test('new rhyme matching shit', async() => {
		let r = new Rhymez()
		await r.load()
		console.log('loaded')
		r.loadRhymes()
		console.log('loaded rhymes')
		let a = Array.from(r.rhymes)
		a = _.sortBy(a, [x => {
			return x[1].length
		}])
		a.reverse()
		for(var i = 0; i < 100; i++) {
			console.log(a[i][1][0], a[i][1].length)
		}
		//a.forEach(x => {
			//console.log(x[1][0], x[1].length)
		//})
		//console.log('size', r.rhymes.size)
		//console.log(r.get('poop'))
	})

	// TODO - Required and Admired.. Rhymezone owns rhymez at this...
	//Directory Broke Multirhymes
	//test('rhyme with required, gets admired (BUG)', async() => {
		//let r = new Rhymez()
		//await r.load()
		//console.log(r.alliterationStart('tracked'))

		//let rhymes= r.rhyme("required", {isLoose: true})
		//console.log('rhymes',rhymes)
		//console.log(r.pronunciation('acquired'))
		//console.log(r.pronunciation('required'))
		//assert.isTrue(_.includes(rhymes, "ACQUIRED"))
	//})

	//test('alliteration works', async() => {
		//let r = new Rhymez()
		//await r.load()
		
		//let alliterations = r.alliteration("track", {})
		//alliterations.forEach(x => console.log(x))
		//console.log(alliterations.length)
		//assert.isTrue(_.includes(alliterations, "TRY"), `track didnt get try`)
		//assert.isTrue(_.includes(alliterations, "TRICK"), `track didnt get trick`)
		
		//alliterations = r.alliteration("orange", {
			//alliteration: true,
			//isLoose: true,
			//multiword: true
		//})
		
		//assert.isTrue(_.includes(alliterations, "ORAL"))
	//})

	//test('impure function bug is fixed for alliteration activation function', async() => {
		//let r = new Rhymez()
		//await r.load()

		//let key = "ACE"
		//let rhymes = r.rhyme(key)
		//rhymes = r.alliteration(key)
		//rhymes = r.assonance(key)

		//key = "TEST"
		//rhymes = r.rhyme(key).length
		//r.alliteration(key)
		//let assonances = r.assonance(key).length

		//assert.isBelow(rhymes, assonances)
	//})

	//test('Multi-word loose assonance', async() => {
		//let r = new Rhymez()
		//await r.load()

		//let rhymes = r.rhyme("orange", {
			//assonance: true,
			//isLoose: true,
			//multiword: true
		//})

		//// rhymes.forEach(x => console.log(x))

		//assert.isTrue(_.includes(rhymes, "FLOOR LUNGE"))

		//// TODO - its more than just super loose assonance, the G from guns comes into play with the g from orange...
		//// assert.isTrue(_.includes(rhymes, "MORE GUNS"))
	//})

	//test('cache doesnt interfere with varied options', async() => {
		//let r = new Rhymez()
		//await r.load()

		//let rhymes = r.rhyme("best", {
			//assonance: false,
			//isLoose: false,
			//multiword: false
		//})

		//let assonants = r.rhyme("best", {
			//assonance: true,
			//isLoose: false,
			//multiword: false
		//})
		//assert.notEqual(assonants.length, rhymes.length)
	//})

	//test('rhymeCheck works', async() => {
		//let r = new Rhymez()
		//await r.load()
		//let x = r.rhymeCheck([
			//["a", "b", "c", "d", "e"],
			//["a", "b", "c", "D", "e"]
		//], ["c", "d", "e"])
		//assert.isTrue(x)
		//x = r.rhymeCheck([
			//["a", "b", "c", "d", "e"],
			//["a", "b", "c", "D", "e"]
		//], ["c", "D", "e"])
		//assert.isTrue(x)
		//x = r.rhymeCheck([
			//["a", "b", "c", "d", "e"],
			//["a", "b", "c", "D", "e"]
		//], ["a", "b", "c"])
		//assert.isFalse(x)
		//x = r.rhymeCheck([
			//["a", "b", "c", "d", "e"],
			//["a", "b", "c", "D", "e"]
		//], ["e"])
		//assert.isTrue(x)
		//x = r.rhymeCheck([
			//["a", "b", "c", "d", "e"],
			//["a", "b", "c", "D", "e"]
		//], ["a", "b", "c", "d", "e"])
		//assert.isTrue(x)
		//x = r.rhymeCheck([
			//["a", "b", "c", "d", "e"],
			//["a", "b", "c", "D", "e"]
		//], [])
		//assert.isFalse(x)
		//x = r.rhymeCheck([
			//["a", "b", "c", "d", "e"],
			//["a", "b", "c", "D", "e"]
		//], null)
		//assert.isFalse(x)
	//})

	//test('one to many rhymes', async() => {
		//let r = new Rhymez()
		//await r.load()
		//let rhymes = r.rhyme("Payday", {
			//isLoose: true,
			//multiword: true
		//})

		//assert.isTrue(_.includes(rhymes, "SLAY DAY"))
	//})

	//test('one to many rhymes ignored when multiword is false', async() => {
		//let r = new Rhymez()
		//await r.load()
		//let rhymes = r.rhyme("Payday", {
			//isLoose: true,
			//multiword: false
		//})

		//assert.isFalse(_.includes(rhymes, "SLAY DAY"))
	//})

	//test('assonance works', async() => {
		//let r = new Rhymez()
		//await r.load()
		//let assonant = r.assonance("cat")

		//assert.isTrue(_.includes(assonant, "BACK"))
		//assert.isTrue(_.includes(assonant, "BAT"))

		//assonant = r.assonance("payday")
		//assert.isTrue(_.includes(assonant, "MELEE"))
	//})

	//test('rhyming works', async() => {
		//let r = new Rhymez()
		//await r.load()
		//let rhymes = r.rhyme("generate")
		//assert.isTrue(_.includes(rhymes, "VENERATE"))

		//rhymes = r.rhyme("rate")
		//assert.isFalse(_.includes(rhymes, "VENERATE"))
		//assert.isTrue(_.includes(rhymes, "BAIT"))

		//// Loosen up...
		//rhymes = r.rhyme("pay day", {
			//isLoose: true
		//})
		//assert.isTrue(_.includes(rhymes, "HEYDAY"))

		//// TODO - remove doubles
		//// rhymes = r.rhyme("venn err rate")
		//// assert.isTrue(_.includes(rhymes, "VENERATE"))
	//})
})


// Orange
// `AO1 R AH0 N JH`

// More GUNS
// `M AO1 R G AH1 N Z`

// Floor Lunge
//`F L AO1 R L AH1 N JH`
