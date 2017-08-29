import _ from 'lodash'

const IS_CONSONANT = /^[^AEIOU]/i
const IS_VOWEL = /^[AEIOU]/i

export default {
	alliterationUtterances,
	//assonantUtterances,
	//endRhymeUtterances,
	perfectRhymeUtterances
}


function perfectRhymeUtterances(ws) {
	let firstNonConsonant = _.findIndex(ws, w => {
		return !w.match(IS_CONSONANT)
	})

	return ws.slice(firstNonConsonant)
}

function alliterationUtterances(ws) {
	let arr = ws.slice(0)
	for (var i = 0; i < arr.length; i++) {
		if (!arr[i].match(IS_CONSONANT) && i > 0) {
			break
		}
	}

	arr.splice(i)
	return arr
}

// Used to loosen up rhymes (may find poor rhymes...)
function removeNumbers(x) {
	x = x.replace(/[0-9]/ig, "")
	x = x.replace("AH","&&")
	x = x.replace("IY","&&")
	return x
}

// Used for assonance
function starConsonants(x) {
	return x.replace(/(\s|^)([BCDFGHJKLMNPQRSTVWXYZ](\s|$))/ig, (all, a, b, c) => {
		return `${a}*${c}`
	})
}

