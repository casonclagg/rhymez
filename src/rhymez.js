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
				var word = words[0].replace(/\(\d+\)$/, '').toLowerCase() // Kills the #s... might make rhymes too loose?
				let sounds = words.slice(1)
				sounds = sounds.map(x => {
					return x.replace(/[0-9]+/g, '')
				})

				if (!this.dict.has(word)) {
					this.dict.set(word, [])
					this.dict.get(word).push(sounds)
				} else if (append) {
					let words = this.dict.get(word).map(x => x.join(' '))
					let wordSounds = sounds.join(' ')
					if (!_.includes(words, wordSounds)) this.dict.get(word).push(sounds)
				}
				try {
					let lastSound = _.last(sounds)
					if (lastSound == 'ER') {
						let newPronunciation = _.clone(sounds)
						newPronunciation[newPronunciation.length - 1] = 'AH'

						let words = this.dict.get(word).map(x => x.join(' '))
						let wordSounds = newPronunciation.join(' ')
						if (!_.includes(words, wordSounds)) this.dict.get(word).push(newPronunciation)
					}
					if (lastSound == 'NG') {
						if (sounds[sounds.length - 2] == 'IH') {
							let newPronunciation = _.clone(sounds)
							newPronunciation[newPronunciation.length - 1] = 'N'

							let words = this.dict.get(word).map(x => x.join(' '))
							let wordSounds = newPronunciation.join(' ')
							if (!_.includes(words, wordSounds)) this.dict.get(word).push(newPronunciation)
						}
					}
				} catch (ex) {
					console.log(ex)
				}
			}
		})
	}

	getPronunciations(word) {
		return this.dict.get(word.toLowerCase())
	}

	getThing(word, utteranceFunction, dictionary) {
		if (!word) return null
		try {
			let pronunciations = this.getPronunciations(word)
			let matches = []
			for (let pronunciation of pronunciations) {
				let activeUtterances = utteranceFunction(pronunciation)
				let rhymes = dictionary.get(activeUtterances)
				if (rhymes) matches = matches.concat(rhymes)
			}

			// _.remove(matches, x => this.hasSameUtterances(x, word))
			// matches = matches.filter(x => {
			// 	return x => !this.hasSameUtterances(x, word)
			// })
			return matches
		} catch (ex) {
			return null
		}
	}

	isThing(word, otherWord, utteranceFunction) {
		let pronunciations = this.getPronunciations(word)
		let otherPronunciations = this.getPronunciations(otherWord)
		for (let pronunciation of pronunciations) {
			for (let otherPron of otherPronunciations) {
				let a = utteranceFunction(pronunciation)
				let b = utteranceFunction(otherPron)
				if (a == b) return true
			}
		}
		return false
	}

	alliteration(word) {
		return this.getThing(word, utteranceUtil.alliterationUtterances, this.alliterationMap)
	}

	isAlliteration(word, otherWord) {
		return this.isThing(word, otherWord, utteranceUtil.alliterationUtterances)
	}

	rhyme(word) {
		return this.getThing(word, utteranceUtil.perfectRhymeUtterances, this.rhymeMap)
	}

	isRhyme(word, otherWord) {
		return this.isThing(word, otherWord, utteranceUtil.perfectRhymeUtterances)
	}

	endRhyme(word) {
		return this.getThing(word, utteranceUtil.endRhymeUtterances, this.endRhymeMap)
	}

	isEndRhyme(word, otherWord) {
		return this.isThing(word, otherWord, utteranceUtil.endRhymeUtterances)
	}

	assonance(word) {
		return this.getThing(word, utteranceUtil.assonantUtterances, this.assonanceMap)
	}

	isAssonance(word, otherWord) {
		return this.isThing(word, otherWord, utteranceUtil.assonantUtterances)
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
		return this.dict.get(word.toLowerCase())
	}
}
