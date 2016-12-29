import Rhymez from '../src/rhymez';
import _ from 'lodash'
import {assert} from 'chai'

suite('Rhymez:', () => {

    // test('playing around', async () => {
    //     let r = new Rhymez()
    //     await r.load()
    //     let rhymes = r.assonance("cat")
    //     console.log(rhymes)
    // })

    test('assonance works', async () => {
        let r = new Rhymez()
        await r.load()

        let assonant = r.assonance("cat")

        assert.isTrue(_.includes(assonant, "BACK"))
        assert.isTrue(_.includes(assonant, "BAT"))

        assonant = r.assonance("payday")
        assert.isTrue(_.includes(assonant, "MELEE"))
    })

    test('rhyming works', async () => {
        let r = new Rhymez()
        await r.load()

        let rhymes = r.rhyme("generate")
        assert.isTrue(_.includes(rhymes, "VENERATE"))

        rhymes = r.rhyme("rate")
        assert.isFalse(_.includes(rhymes, "VENERATE"))
		assert.isTrue(_.includes(rhymes, "BAIT"))

        // Loosen up...
        rhymes = r.rhyme("pay day", {isLoose:true})
		assert.isTrue(_.includes(rhymes, "HEYDAY"))

        // TODO - remove doubles
        // rhymes = r.rhyme("venn err rate")
		// assert.isTrue(_.includes(rhymes, "VENERATE"))
    })
})
