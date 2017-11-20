import path from 'path'
import fs from 'fs-extra'
import _ from 'lodash'
import lineReader from 'line-reader'
import utteranceUtil from './utterance-util'

let dictFile = path.join(__dirname, 'data/rap.phonemes')
let ogDictFile = path.join(__dirname, 'data/cmudict.dict')

// TODO: collapse stars for assonance?  Make it an options maybe...
// TODO: Loosen up rhymes (AH/IY -> &&)

export default class Rhymez {
	constructor(options) {
		this.options = options || {}
		this.dict = new Map()
		this.assonanceMap = new Map()
		this.rhymeMap = new Map()
		this.endRhymeMap = new Map()
		this.alliterationMap = new Map()
		let ogContents = fs.readFileSync(ogDictFile, 'utf8')
		this.load(ogContents, true)
		let contents = fs.readFileSync(this.options.file || dictFile, 'utf8')
		this.load(contents)

		this.loadRhymes()
		this.loadEndRhymes()
		this.loadAssonance()
		this.loadAlliterations()
	}

	load(fileContents, append = false) {
		let lines = fileContents.split(/\r?\n/)
		lines.forEach(line => {
			if (line.match(/^[A-Z]/i)) {
				var words = line.split(/\s+/)
				var word = words[0].replace(/\(\d+\)$/, '').toUpperCase()
				let sounds = words.slice(1)
				sounds = sounds.map(x => {
					return x.replace(/[0-9]+/g, '')
				})
				if (!this.dict.has(word)) {
					this.dict.set(word, [])
					this.dict.get(word).push(sounds)
				} else if (append) {
					this.dict.get(word).push(sounds)
				}
			}
		})
	}

	// =_(
	permutations(arrayOfArraysOfArrays) {
		if (arrayOfArraysOfArrays.length === 0) return []
		if (arrayOfArraysOfArrays.length === 1) return arrayOfArraysOfArrays[0]
		var result = []
		var allCasesOfRest = this.permutations(arrayOfArraysOfArrays.slice(1))
		for (var c in allCasesOfRest) {
			for (var i = 0; i < arrayOfArraysOfArrays[0].length; i++) {
				let thing = arrayOfArraysOfArrays[0][i].join(' ') + ' ' + allCasesOfRest[c].join(' ')
				result.push(thing)
			}
		}
		return result.map(x => x.split(' '))
	}

	getPronunciations(word) {
		let words = word.split(' ')
		let wordsPronunciations = words.map(w => this.dict.get(w.toUpperCase()))
		let pronunciations = this.permutations(wordsPronunciations)
		return pronunciations
	}

	alliteration(word) {
		if (!word) return null
		try {
			let pronunciations = this.getPronunciations(word)
			let matches = []
			for (let pronunciation of pronunciations) {
				let activeUtterances = utteranceUtil.alliterationUtterances(pronunciation)
				let rhymes = this.alliterationMap.get(activeUtterances)
				if (rhymes) matches = matches.concat(rhymes)
			}
			matches = matches.filter(x => {
				return !this.hasSameUtterances(x, word)
			})
			return matches
		} catch (ex) {
			return null
		}
	}

	rhyme(word) {
		if (!word) return null
		try {
			let pronunciations = this.getPronunciations(word)
			let matches = []
			for (let pronunciation of pronunciations) {
				let activeUtterances = utteranceUtil.perfectRhymeUtterances(pronunciation)
				let rhymes = this.rhymeMap.get(activeUtterances)
				if (rhymes) matches = matches.concat(rhymes)
			}
			matches = matches.filter(x => {
				return !this.hasSameUtterances(x, word)
			})
			return matches
		} catch (ex) {
			return null
		}
	}

	endRhyme(word) {
		if (!word) return null
		try {
			let pronunciations = this.getPronunciations(word)
			let matches = []
			for (let pronunciation of pronunciations) {
				let activeUtterances = utteranceUtil.endRhymeUtterances(pronunciation)
				let rhymes = this.endRhymeMap.get(activeUtterances)
				if (rhymes) matches = matches.concat(rhymes)
			}
			matches = matches.filter(x => {
				return !this.hasSameUtterances(x, word)
			})
			return matches
		} catch (ex) {
			return null
		}
	}

	endRhyme2(word, count) {
		if (!word) return null
		try {
			let pronunciations = this.getPronunciations(word)
			let matches = []
			for (let pronunciation of pronunciations) {
				let activeUtterances = utteranceUtil.endRhyme2Utterances(pronunciation, count)
				console.log(activeUtterances)
				let rhymes = this.endRhymeMap.get(activeUtterances)
				if (rhymes) matches = matches.concat(rhymes)
			}
			matches = matches.filter(x => {
				return !this.hasSameUtterances(x, word)
			})
			return matches
		} catch (ex) {
			console.log(ex)
			return null
		}
	}

	assonance(word) {
		if (!word) return null
		try {
			let pronunciations = this.getPronunciations(word)
			let matches = []
			for (let pronunciation of pronunciations) {
				let activeUtterances = utteranceUtil.assonantUtterances(pronunciation)
				let rhymes = this.assonanceMap.get(activeUtterances)
				if (rhymes) matches = matches.concat(rhymes)
			}
			matches = matches.filter(x => {
				return !this.hasSameUtterances(x, word)
			})
			return matches
		} catch (ex) {
			return null
		}
	}

	hasSameUtterances(word1, word2) {
		let pronunciations1 = this.getPronunciations(word1)
		let pronunciations2 = this.getPronunciations(word2)
		for (let pronunciation1 of pronunciations1) {
			for (let pronunciation2 of pronunciations2) {
				if (pronunciation1.join(' ') == pronunciation2.join(' ')) {
					return true
				}
			}
		}
		return false
	}

	loadAssonance() {
		for (var [key, value] of this.dict) {
			for (var pronunciation of value) {
				let activeUtterances = utteranceUtil.assonantUtterances(pronunciation)
				let pool = this.assonanceMap.get(activeUtterances)
				if (pool) {
					pool.push(key)
				} else {
					pool = [key]
				}
				this.assonanceMap.set(activeUtterances, pool)
			}
		}
	}

	loadAlliterations() {
		for (var [key, value] of this.dict) {
			for (var pronunciation of value) {
				let activeUtterances = utteranceUtil.alliterationUtterances(pronunciation)
				let pool = this.alliterationMap.get(activeUtterances)
				if (pool) {
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
			for (var pronunciation of value) {
				let activeUtterances = utteranceUtil.perfectRhymeUtterances(pronunciation)
				let pool = this.rhymeMap.get(activeUtterances)
				if (pool) {
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
			for (var pronunciation of value) {
				let activeUtterances = utteranceUtil.endRhymeUtterances(pronunciation)
				let pool = this.endRhymeMap.get(activeUtterances)
				if (pool) {
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
