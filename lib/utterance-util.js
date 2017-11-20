'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var IS_CONSONANT = /^[^AEIOU]/i;
var IS_VOWEL = /^[AEIOU]/i;

exports.default = {
	alliterationUtterances: alliterationUtterances,
	assonantUtterances: assonantUtterances,
	endRhymeUtterances: endRhymeUtterances,
	perfectRhymeUtterances: perfectRhymeUtterances
};


function perfectRhymeUtterances(ws) {
	var firstNonConsonant = _lodash2.default.findIndex(ws, function (w) {
		return !w.match(IS_CONSONANT);
	});

	return ws.slice(firstNonConsonant).join(' ');
}

function assonantUtterances(ws) {
	var firstNonConsonant = _lodash2.default.findIndex(ws, function (w) {
		return !w.match(IS_CONSONANT);
	});
	return starConsonants(ws.slice(firstNonConsonant).join(' '));
}

function endRhymeUtterances(ws) {
	var lastIndex = 0;
	if (_lodash2.default.last(ws).match(IS_CONSONANT)) {
		lastIndex = _lodash2.default.findLastIndex(ws, function (w) {
			return !w.match(IS_CONSONANT);
		});
	} else {
		lastIndex = _lodash2.default.findLastIndex(ws, function (w) {
			return w.match(IS_CONSONANT);
		});
	}

	return ws.slice(lastIndex).join(' ');
}

function alliterationUtterances(ws) {
	var arr = ws.slice(0);

	for (var i = 0; i < arr.length; i++) {
		if (!arr[i].match(IS_CONSONANT) && i > 0) {
			break;
		}
	}

	arr.splice(i + 1);
	return arr.join(' ');
}

// Used to loosen up rhymes (may find poor rhymes...)
function removeNumbers(x) {
	x = x.replace(/[0-9]/gi, '');
	x = x.replace('AH', '&&');
	x = x.replace('IY', '&&');
	return x;
}

// Used for assonance
function starConsonants(x) {
	return x.replace(/(\s|^)([BCDFGHJKLMNPQRSTVWXYZ](\s|$))/gi, function (all, a, b, c) {
		return a + '*' + c;
	});
}