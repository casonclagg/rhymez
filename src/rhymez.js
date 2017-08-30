import path from 'path'
import fs from 'fs-extra'
import _ from 'lodash'
import lineReader from 'line-reader'
import utteranceUtil from './utterance-util'

let dictFile = path.join(__dirname, 'data/rap.phonemes')


// TODO: collapse stars for assonance?  Make it an options maybe...

export default class Rhymez {

    constructor(options) {
        this.options = options || {}
        this.dict = new Map()
		this.rhymeMap = new Map()
		this.endRhymeMap = new Map()
		this.alliterationMap = new Map()
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

					if (last) {
						this.loadRhymes()
						this.loadEndRhymes()
						this.loadAlliterations()
                        return resolve(this.dict)
					}
				}
            })
        })
    }

	getPronunciations(word) {
		let pronunciations = this.dict.get(word.toUpperCase())
		return pronunciations
	}

	alliteration(word) {
		let pronunciations = this.getPronunciations(word)
		let matches = []
		for(let pronunciation of pronunciations) {
			let activeUtterances = utteranceUtil.alliterationUtterances(pronunciation)
			let rhymes = this.alliterationMap.get(activeUtterances)
			if(rhymes) matches = matches.concat(rhymes)
		}
		return matches
	}

	rhyme(word) {
		let pronunciations = this.getPronunciations(word)
		let matches = []
		for(let pronunciation of pronunciations) {
			let activeUtterances = utteranceUtil.perfectRhymeUtterances(pronunciation)
			let rhymes = this.rhymeMap.get(activeUtterances)
			if(rhymes) matches = matches.concat(rhymes)
		}
		matches = matches.filter(x => {
			return !this.hasSameUtterances(x, word)
		})
		return matches
	}

	hasSameUtterances(word1, word2) {
		let pronunciations1 = this.getPronunciations(word1)
		let pronunciations2 = this.getPronunciations(word2)
		for(let pronunciation1 of pronunciations1) {
			for(let pronunciation2 of pronunciations2) {
				if(pronunciation1.join(' ') == pronunciation2.join(' ')) {
					return true
				}
			}	
		}
		return false
	}

	loadAlliterations() {
		for (var [key, value] of this.dict) {
			for(var pronunciation of value) {
				let activeUtterances = utteranceUtil.alliterationUtterances(pronunciation)
				let pool = this.alliterationMap.get(activeUtterances)	
				if(pool) {
					pool.push(key)
				} else {
					pool = [key]
				}
				this.alliterationMap.set(activeUtterances, pool)
			}
		}
	}

	loadRhymes() {
		for (var [key, value] of this.dict) {
			for(var pronunciation of value) {
				let activeUtterances = utteranceUtil.perfectRhymeUtterances(pronunciation)
				let pool = this.rhymeMap.get(activeUtterances)	
				if(pool) {
					pool.push(key)
				} else {
					pool = [key]
				}
				this.rhymeMap.set(activeUtterances, pool)
			}
		}
	}
	
	loadEndRhymes() {
		for (var [key, value] of this.dict) {
			for(var pronunciation of value) {
				let activeUtterances = utteranceUtil.endRhymeUtterances(pronunciation)
				let pool = this.endRhymeMap.get(activeUtterances)	
				if(pool) {
					pool.push(key)
				} else {
					pool = [key]
				}
				this.endRhymeMap.set(activeUtterances, pool)
			}
		}
	}

    pronunciation(word) {
        return this.dict.get(word.toUpperCase())
    }
}
