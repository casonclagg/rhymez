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

    rhyme(phrase, options) {
        options = options || {}
        phrase = phrase.toUpperCase()
        let words = phrase.split(" ")

        if (_.some(words, x => !this.dict.has(x))) return [] // Doesn't exist in the dictionary

        let mapped = words.map(this.pronunciation, this)
        mapped[0] = mapped[0].map(this.active) // Remove up to first vowel of first word only
        mapped = mapped.map(x => x.map(this.join)) // WTF, sorry.
        let permuted = this._permutations(mapped)

        var rhymes = []
        for (let [w, pronounciations] of this.dict.entries()) {
            if (_.includes(words, w)) continue
            if(w == "DAY") console.log(w, pronounciations, permuted)
            let check = this._checkEntry(w, pronounciations, permuted, [], options)
            if (check && check.length > 0) {
                rhymes.push(check.map(w=> w.word).join(" "))
            }
        }

        return rhymes
    }

    // if word matches but is too short, run this again on all "entries" and return found
    _checkEntry(w, pronounciations, permuted, found, options) {
        if (pronounciations[0].length == 0) return found

        let matches = pronounciations.some(p => {
            let activePart = this.join(this.active(p))
            if (options.isLoose) {
                permuted = permuted.map(this._removeNumbers, this)
                activePart = this._removeNumbers(activePart)
            }
            if (options.assonance) {
                permuted = permuted.map(this._starConsonants, this)
                activePart = this._starConsonants(activePart)
            }
            // check for partial end too...
            if(w == "DAY") console.log("permuted, activePart", permuted, activePart, options)
            return this.rhymeCheck(permuted, activePart)
        })

        if (matches) {
            found.unshift({
                word: w,
                count: pronounciations.map(this.active)[0].length
            })
            if(pronounciations.map(this.active)[0].length == permuted[0].split(" ").length) return found
            console.log(w, pronounciations.map(this.active)[0].length, permuted[0].split(" ").length, _.sumBy(found, "count"), found)
            if (pronounciations[0].length < _.sumBy(found, "count")) {
                for (let [w2, pronounciations2] of this.dict.entries()) {
                    let check = this._checkEntry(w2, pronounciations2, permuted.map(x=> x.split(" ").splice(0, permuted[0].length - pronounciations[0].length)), found, options)
                    if (check && check.length > 0) {
                        console.log("check",check)
                        return found.concat(check)
                    }
                }
            }
        }
        return null
    }

    // This works now...
    rhymeCheck(permuted, activePart) {
        if (!activePart || activePart.length === 0) return false

        for (let x of permuted) {
            if (activePart.length > x.length) continue
            for (let y = x.length - 1; y >= 0; y--) {
                let activePartIndex = activePart.length - ((x.length - 1) - y) - 1
                if (x[y] != activePart[activePartIndex]) {
                    break
                }
                if (activePartIndex == 0) return true
            }
        }
        return false
    }



    assonance(phrase, options) {
        options = options || {}
        options.assonance = true
        return this.rhyme(phrase, options)
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

    join(ws) {
        return ws.join(' ')
    }

    active(ws) {
        let firstNonConsonant = _.findIndex(ws, w => {
            return !w.match(IS_CONSONANT)
        })

        return ws.slice(firstNonConsonant)
    }

    _permutations(arrayOfArraysOfArrays) {
        if (arrayOfArraysOfArrays.length === 0) return []
        if (arrayOfArraysOfArrays.length === 1) return arrayOfArraysOfArrays[0]
        var result = [];
        var allCasesOfRest = this._permutations(arrayOfArraysOfArrays.slice(1))
        for (var c in allCasesOfRest) {
            for (var i = 0; i < arrayOfArraysOfArrays[0].length; i++) {
                let thing = arrayOfArraysOfArrays[0][i] + " " + (allCasesOfRest[c])
                result.push(thing)
            }
        }
        return result
    }
}
