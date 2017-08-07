import path from 'path'
import fs from 'fs-extra'
import _ from 'lodash'
import lineReader from 'line-reader'

let dictFile = path.join(__dirname, 'data/cmudict.dict')
const IS_CONSONANT = /^[^AEIOU]/i
const IS_VOWEL = /^[AEIOU]/i

// TODO: Speed it up - Pare down search space for subsequent calls, break out of loops early if possible etc...
// TODO: collapse stars for assonance?  Make it an options maybe...

export default class Rhymez {
    constructor(options) {
        this.options = options || {}
        this.dict = new Map()
        this.cache = {}
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

                    if (last)
                        return resolve(this.dict)
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
        if (_.some(words, x => !this.dict.has(x)))
		{
            return [] // Doesn't exist in the dictionary
		}
		let mapped = words.map(this.pronunciation, this)
        mapped[0] = mapped[0].map(this.active) // Remove up to first vowel of first word only
        mapped = mapped.map(x => x.map(this.join)) // WTF, sorry.
        let permuted = this._permutations(mapped)

		//console.log(permuted)
        let rhymes = this._getMatches(permuted.map(x => x.split(" ")), options, words)

        return rhymes
    }

    // This is terrible, I'm sorry.
    _optsToString(options) {
        let entries = _.entries(options)
        entries = entries.filter(x => x[1] == true)
        let x = entries.map(x => x[0]).join("-")
        return x
    }

    // =(
    _getMatches(soundsToMatch, options, words) {
        if (this.cache[soundsToMatch.join(" ") + this._optsToString(options)]) {
            return this.cache[soundsToMatch.join(" ") + this._optsToString(options)]
        }

        let rhymes = []
        if (soundsToMatch[0].length == 0) return []

        if (options.assonance) {
            soundsToMatch = soundsToMatch.map(x => x.map(this._starConsonants, this), this)
        }
        if (options.isLoose) {
            soundsToMatch = soundsToMatch.map(x => x.map(this._removeNumbers, this), this)
        }

        for (let [word, wordPronounciations] of this.dict.entries()) {
            if (_.includes(words, word.toUpperCase())) continue
            let doesRhyme = false
            if (options.assonance) wordPronounciations = wordPronounciations.map(x => x.map(this._starConsonants, this), this)
            if (options.isLoose) wordPronounciations = wordPronounciations.map(x => x.map(this._removeNumbers, this), this)
			if(options.alliteration) {
                if (this.activeAlliteration(wordPronounciations[0]).length == soundsToMatch[0].length) {
                    doesRhyme = _.some(wordPronounciations.map(this.activeAlliteration, this), wp => this.rhymeCheck(soundsToMatch, wp))
                    if (doesRhyme) rhymes.push(word)
                }
            } else {
                if (this.active(wordPronounciations[0]).length == soundsToMatch[0].length) {
                    doesRhyme = _.some(wordPronounciations.map(this.active, this), wp => this.rhymeCheck(soundsToMatch, wp))
                    if (doesRhyme) rhymes.push(word)
                } else if (options.multiword) {
                    // Partial rhymes, use whole pronunciation, not just this.active(pronunciation)
                    doesRhyme = _.some(wordPronounciations, wp => this.rhymeCheck(soundsToMatch, wp))
                    if (doesRhyme) {
                        let remainderToMatch = soundsToMatch.map(x => {
                            return x.slice(0, soundsToMatch.length - wordPronounciations[0].length - 1)
                        })

                        let addons = this._getMatches(remainderToMatch, options)

                        addons = addons.map(a => a + " " + word)
                        rhymes = rhymes.concat(addons)
                    }
                }
            }
        }
        this.cache[soundsToMatch.join(" ") + this._optsToString(options)] = rhymes
        return rhymes
    }

    // This works now...
    rhymeCheck(permuted, activePart) {
        if (!activePart || activePart.length === 0)
            return false

        for (let x of permuted) {
            if (activePart.length > x.length)
                continue
            for (let y = x.length - 1; y >= 0; y--) {
                let activePartIndex = activePart.length - ((x.length - 1) - y) - 1
                if (x[y] != activePart[activePartIndex]) {
                    break
                }
                if (activePartIndex == 0)
                    return true
            }
        }
        return false
    }

    alliteration(phrase, options) {
        options = options || {}
        options.multiword = false
        options.isLoose = false
        options.alliteration = true
        phrase = phrase.toUpperCase()

        let words = phrase.split(" ")
        if (_.some(words, x => !this.dict.has(x))) return [] // Doesn't exist in the dictionary

        let mapped = words.map(this.pronunciation, this)
        mapped[0] = mapped[0].map(this.activeAlliteration) // Remove up to first vowel of first word only
        mapped = mapped.map(x => x.map(this.join)) // WTF, sorry.
        let permuted = this._permutations(mapped)

        let alliterations = this._getMatches(permuted.map(x => x.split(" ")), options, words)

        return alliterations
    }

    assonance(phrase, options) {
        options = options || {}
        options.assonance = true
        return this.rhyme(phrase, options)
    }

    // Used to loosen up rhymes (may find poor rhymes...)
    _removeNumbers(x) {
		x = x.replace(/[0-9]/ig, "")
		x = x.replace("AH","&&")
		x = x.replace("IY","&&")
		return x
    }

    // Used for assonance
    _starConsonants(x) {
        return x.replace(/(\s|^)([BCDFGHJKLMNPQRSTVWXYZ](\s|$))/ig, (all, a, b, c) => {
            return `${a}*${c}`
        })
    }

    join(ws) {
        return ws.join(' ')
    }

    activeAlliteration(ws) {
        // active rhyming region: slice off the trailing consonants
        let arr = ws.slice(0)
        for (var i = arr.length - 1; i > 0; i--) {
            if (!arr[i].match(IS_CONSONANT)) {
                break
            }
        }

        arr.splice(i + 1)

        return arr
    }

    active(ws) {
        let firstNonConsonant = _.findIndex(ws, w => {
            return !w.match(IS_CONSONANT)
        })

        return ws.slice(firstNonConsonant)
    }

    _permutations(arrayOfArraysOfArrays) {
        if (arrayOfArraysOfArrays.length === 0)
            return []
        if (arrayOfArraysOfArrays.length === 1)
            return arrayOfArraysOfArrays[0]
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
