import _ from 'lodash'

const IS_CONSONANT = /^[^AEIOU]/i
const IS_VOWEL = /^[AEIOU]/i

export default {
	alliterationUtterances,
	assonantUtterances,
	endRhymeUtterances,
	perfectRhymeUtterances,
}

function perfectRhymeUtterances(ws) {
	let firstNonConsonant = _.findIndex(ws, w => {
		return !w.match(IS_CONSONANT)
	})

	return ws.slice(firstNonConsonant).join(' ')
}

function assonantUtterances(ws) {
	let firstNonConsonant = _.findIndex(ws, w => {
		return !w.match(IS_CONSONANT)
	})
	return starConsonants(ws.slice(firstNonConsonant).join(' '))
}

function endRhymeUtterances(ws) {
	let lastIndex = 0
	if (_.last(ws).match(IS_CONSONANT)) {
		lastIndex = _.findLastIndex(ws, w => {
			return !w.match(IS_CONSONANT)
		})
	} else {
		lastIndex = _.findLastIndex(ws, w => {
			return !w.match(IS_CONSONANT)
		})
	}

	return ws.slice(lastIndex).join(' ')
}

function alliterationUtterances(ws) {
	let arr = ws.slice(0)

	for (var i = 0; i < arr.length; i++) {
		if (!arr[i].match(IS_CONSONANT) && i > 0) {
			break
		}
	}

	arr.splice(i + 1)
	return arr.join(' ')
}

// Used to loosen up rhymes (may find poor rhymes...)
function removeNumbers(x) {
	x = x.replace(/[0-9]/gi, '')
	x = x.replace('AH', '&&')
	x = x.replace('IY', '&&')
	return x
}

// Used for assonance
function starConsonants(x) {
	return x.replace(/(\s|^)([BCDFGHJKLMNPQRSTVWXYZ](\s|$))/gi, (all, a, b, c) => {
		return `${a}*${c}`
	})
}
