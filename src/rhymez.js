import path from 'path'
import fs from 'fs-extra'
import _ from 'lodash'
import lineReader from 'line-reader'

let dictFile = path.join(__dirname, 'data/cmudict.dict')
const IS_CONSONANT = /^[^AEIOU]/i
const IS_VOWEL = /^[AEIOU]/i

export default class Rhymez {
    constructor(options) {
        this.options = options || {}
        this.dict = new Map()
    }

    load(file) {
        return new Promise((resolve, reject) => {
            lineReader.eachLine(file || dictFile, (line, last) => {
                if (line.match(/^[A-Z]/i)) {
                    var words = line.split(/\s+/)
                    var word = words[0].replace(/\(\d+\)$/, '').toUpperCase()

                    if (!this.dict.has(word)) {
                        this.dict.set(word, [])
                    }

                    this.dict.get(word).push(words.slice(1))

                    if(last) return resolve(this.dict)
                }
            })
        })
    }

    pronunciation(word) {
        return this.dict.get(word.toUpperCase())
    }

    active(ws) {
        let firstNonConsonant = _.findIndex(ws, w => {
            return !w.match(IS_CONSONANT)
        })

        return ws.slice(firstNonConsonant).join(' ')
    }

    rhyme(word) {
        word = word.toUpperCase()

        if (!this.dict.has(word)) return []

        var mapped = this.dict.get(word).map(this.active)
        var rhymes = []
        for (let [w, pronounciations] of this.dict.entries()) {
            if (w === word) continue

            let some = pronounciations.some(p => {
                return mapped.indexOf(this.active(p)) !== -1
            })

            if (some) rhymes.push(w)
        }

        return rhymes
    }
}
