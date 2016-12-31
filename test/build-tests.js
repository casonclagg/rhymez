import Rhymez from '../lib/rhymez';
import _ from 'lodash'
import {assert} from 'chai'

suite('build:', () => {
    test('lib can rhyme', () => {
        let r = new Rhymez()
        r.load().then(() => {
            let rhymes = r.rhyme("dog", {isLoose: false})

            assert.isTrue(_.includes(rhymes, "LOG"))
        })
    })

    // test('rhymez is reasonably fast', async () => {
    //     let COUNT = 100
    //     let thingsToRhyme = "this is great, guys.".split(" ")
    // 	let r = new Rhymez()
    //     await r.load()
    //     let start = Date.now()
    //     for(var i = 0; i < COUNT; i++) {
    //         let rhymes = r.rhyme(_.sample(thingsToRhyme))
    //     }
    //     let end = Date.now()
    //     console.log((end - start) / COUNT, "ms each call")
    //     assert.isBelow(end - start, COUNT * 100)
    // })

})
