import Rhymez from '../src/rhymez';
import _ from 'lodash'
import {
    assert
} from 'chai'

suite('Rhymez:', () => {

    test('Multi-word loose assonance', async() => {
        let r = new Rhymez()
        await r.load()

        let rhymes = r.rhyme("orange", {
            assonance: true,
            isLoose: true
        })

        // rhymes.forEach(x => console.log(x))

        assert.isTrue(_.includes(rhymes, "FLOOR LUNGE"))
            // assert.isTrue(_.includes(rhymes, "MORE GUNS")) // TODO - its more than just super loose assonance, the G from guns comes into play with the g from orange...
    })


    test('rhymeCheck works', async() => {
        let r = new Rhymez()
        await r.load()
        let x = r.rhymeCheck([
            ["a", "b", "c", "d", "e"],
            ["a", "b", "c", "D", "e"]
        ], ["c", "d", "e"])
        assert.isTrue(x)
        x = r.rhymeCheck([
            ["a", "b", "c", "d", "e"],
            ["a", "b", "c", "D", "e"]
        ], ["c", "D", "e"])
        assert.isTrue(x)
        x = r.rhymeCheck([
            ["a", "b", "c", "d", "e"],
            ["a", "b", "c", "D", "e"]
        ], ["a", "b", "c"])
        assert.isFalse(x)
        x = r.rhymeCheck([
            ["a", "b", "c", "d", "e"],
            ["a", "b", "c", "D", "e"]
        ], ["e"])
        assert.isTrue(x)
        x = r.rhymeCheck([
            ["a", "b", "c", "d", "e"],
            ["a", "b", "c", "D", "e"]
        ], ["a", "b", "c", "d", "e"])
        assert.isTrue(x)
        x = r.rhymeCheck([
            ["a", "b", "c", "d", "e"],
            ["a", "b", "c", "D", "e"]
        ], [])
        assert.isFalse(x)
        x = r.rhymeCheck([
            ["a", "b", "c", "d", "e"],
            ["a", "b", "c", "D", "e"]
        ], null)
        assert.isFalse(x)
    })

    test('one to many rhymes', async() => {
        let r = new Rhymez()
        await r.load()
        let rhymes = r.rhyme("Payday", {
            isLoose: true
        })

        assert.isTrue(_.includes(rhymes, "SLAY DAY"))
    })

    test('assonance works', async() => {
        let r = new Rhymez()
        await r.load()
        let assonant = r.assonance("cat")

        assert.isTrue(_.includes(assonant, "BACK"))
        assert.isTrue(_.includes(assonant, "BAT"))

        assonant = r.assonance("payday")
        assert.isTrue(_.includes(assonant, "MELEE"))
    })

    test('rhyming works', async() => {
        let r = new Rhymez()
        await r.load()
        let rhymes = r.rhyme("generate")
        assert.isTrue(_.includes(rhymes, "VENERATE"))

        rhymes = r.rhyme("rate")
        assert.isFalse(_.includes(rhymes, "VENERATE"))
        assert.isTrue(_.includes(rhymes, "BAIT"))

        // Loosen up...
        rhymes = r.rhyme("pay day", {
            isLoose: true
        })
        assert.isTrue(_.includes(rhymes, "HEYDAY"))

        // TODO - remove doubles
        // rhymes = r.rhyme("venn err rate")
        // assert.isTrue(_.includes(rhymes, "VENERATE"))
    })
})


// Orange
// `AO1 R AH0 N JH`

// More GUNS
// `M AO1 R G AH1 N Z`

// Floor Lunge
//`F L AO1 R L AH1 N JH`
