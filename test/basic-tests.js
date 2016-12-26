import Rhymez from '../src/rhymez';
import _ from 'lodash'
import {assert} from 'chai'

suite('Rhymez:', () => {

	test('rhymez loads', async () => {
		let rhymes = new Rhymez()
        let dict = await rhymes.load()
		assert.isOk(dict)
	})

    test('rhymez is reasonably fast', async () => {
        let COUNT = 100
        let thingsToRhyme = "this is great, guys.".split(" ")
		let r = new Rhymez()
        await r.load()
        let start = Date.now()
        for(var i = 0; i < COUNT; i++) {
            let rhymes = r.rhyme(_.sample(thingsToRhyme))
        }
        let end = Date.now()
        console.log((end - start) / COUNT, "ms each call")
        assert.isBelow(end - start, COUNT * 100)
	})

    test('rhymez rhymes', async () => {
        let r = new Rhymez()
        await r.load()
        let rhymes = r.rhyme("test")
        assert.isTrue(_.includes(rhymes, "BEST"))
    })
})
