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

                    if (last) return resolve(this.dict)
                }
            })
        })
    }

    pronunciation(word) {
        return this.dict.get(word.toUpperCase())
    }

    all(ws) {
        return ws.join(' ')
    }

    active(ws) {
        let firstNonConsonant = _.findIndex(ws, w => {
            return !w.match(IS_CONSONANT)
        })

        return ws.slice(firstNonConsonant).join(' ')
            // .replace(/[0-9]/ig, "")
    }

    _permutations(arrayOfArraysOfArrays, ignoreNumbers) {
        if (arrayOfArraysOfArrays.length === 0) return []
        if (arrayOfArraysOfArrays.length === 1) return arrayOfArraysOfArrays[0]
        var result = [];
        var allCasesOfRest = this._permutations(arrayOfArraysOfArrays.slice(1), ignoreNumbers)
        for (var c in allCasesOfRest) {
            for (var i = 0; i < arrayOfArraysOfArrays[0].length; i++) {
                let thing = arrayOfArraysOfArrays[0][i] + " " + (allCasesOfRest[c])
                // if(ignoreNumbers) {
                //     thing = thing.replace(/[0-9]/ig, "")
                // }
                result.push(thing)
            }
        }
        return result
    }

    // TODO - Option to ignore vowel #s for loose rhymes

    rhyme(phrase, isLoose) {
        let words = phrase.split(" ").map(s => s.toUpperCase())
        let bigmapped = []
        let word = words[0]
        word = word.toUpperCase()
        if (!this.dict.has(word)) return []
        let mapped = this.dict.get(word).map(this.active)
        bigmapped.push(mapped)

        for (var i = 1; i < words.length; i++) {
            word = words[i]
            word = word.toUpperCase()
            if (!this.dict.has(word)) return []
            mapped = this.dict.get(word).map(this.all)
            bigmapped.push(mapped)
        }
        if (bigmapped.length == 0) return []
        let permuted = this._permutations(bigmapped, true)

        var rhymes = []
        for (let [w, pronounciations] of this.dict.entries()) {
            if (_.includes(words, w)) continue

            let some = pronounciations.some(p => {
                let activePart = this.active(p)
                if(isLoose) {
                    permuted = permuted.map(this._removeNumbers)
                    activePart = this._removeNumbers(activePart)
                }
                return permuted.indexOf(activePart) !== -1
            })

            if (some) rhymes.push(w)
        }

        return rhymes
    }

    // Used to loosen up rhymes (may find poor rhymes...)
    _removeNumbers(x) {
        return x.replace(/[0-9]/ig, "")
    }

    // Used for assonance
    _starConsonants(x) {
        return x.replace(/(\s|^)([^AEIOU])(\s|$)/ig, (all, a, b, c) => {
            return `${a}*${c}`
        })
    }

    assonant(phrase) {
        let words = phrase.split(" ").map(s => s.toUpperCase())
        let bigmapped = []
        let word = words[0]
        word = word.toUpperCase()
        if (!this.dict.has(word)) return []
        let mapped = this.dict.get(word).map(this.active)
        bigmapped.push(mapped)

        for (var i = 1; i < words.length; i++) {
            word = words[i]
            word = word.toUpperCase()
            if (!this.dict.has(word)) return []
            mapped = this.dict.get(word).map(this.all)
            bigmapped.push(mapped)
        }
        if (bigmapped.length == 0) return []
        let permuted = this._permutations(bigmapped, true)

        permuted = permuted.map(this._starConsonants)

        var rhymes = []
        for (let [w, pronounciations] of this.dict.entries()) {
            if (_.includes(words, w)) continue

            let some = pronounciations.some(p => {
                let thing = this.active(p)
                thing = this._starConsonants(thing)
                return permuted.indexOf(thing) !== -1
            })

            if (some) rhymes.push(w)
        }

        return rhymes
    }
}
