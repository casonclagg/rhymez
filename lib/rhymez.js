'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _lineReader = require('line-reader');

var _lineReader2 = _interopRequireDefault(_lineReader);

var _utteranceUtil = require('./utterance-util');

var _utteranceUtil2 = _interopRequireDefault(_utteranceUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dictFile = _path2.default.join(__dirname, 'data/rap.phonemes');
var ogDictFile = _path2.default.join(__dirname, 'data/cmudict.dict');

// TODO: collapse stars for assonance?  Make it an options maybe...
// TODO: Loosen up rhymes (AH/IY -> &&)

var Rhymez = function () {
	function Rhymez(options) {
		_classCallCheck(this, Rhymez);

		this.options = options || {};
		this.dict = new Map();
		this.assonanceMap = new Map();
		this.rhymeMap = new Map();
		this.endRhymeMap = new Map();
		this.alliterationMap = new Map();
		var ogContents = _fsExtra2.default.readFileSync(ogDictFile, 'utf8');
		this.load(ogContents, true);
		var contents = _fsExtra2.default.readFileSync(this.options.file || dictFile, 'utf8');
		this.load(contents);

		this.loadRhymes();
		this.loadEndRhymes();
		this.loadAssonance();
		this.loadAlliterations();
	}

	_createClass(Rhymez, [{
		key: 'load',
		value: function load(fileContents) {
			var _this = this;

			var append = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

			var lines = fileContents.split(/\r?\n/);
			lines.forEach(function (line) {
				if (line.match(/^[A-Z]/i)) {
					var words = line.split(/\s+/);
					var word = words[0].replace(/\(\d+\)$/, '').toLowerCase(); // Kills the #s... might make rhymes too loose?
					var sounds = words.slice(1);
					sounds = sounds.map(function (x) {
						return x.replace(/[0-9]+/g, '');
					});

					if (!_this.dict.has(word)) {
						_this.dict.set(word, []);
						_this.dict.get(word).push(sounds);
					} else if (append) {
						var _words = _this.dict.get(word).map(function (x) {
							return x.join(' ');
						});
						var wordSounds = sounds.join(' ');
						if (!_lodash2.default.includes(_words, wordSounds)) _this.dict.get(word).push(sounds);
					}
					try {
						var lastSound = _lodash2.default.last(sounds);
						if (lastSound == 'ER') {
							var newPronunciation = _lodash2.default.clone(sounds);
							newPronunciation[newPronunciation.length - 1] = 'AH';

							var _words2 = _this.dict.get(word).map(function (x) {
								return x.join(' ');
							});
							var _wordSounds = newPronunciation.join(' ');
							if (!_lodash2.default.includes(_words2, _wordSounds)) _this.dict.get(word).push(newPronunciation);
						}
						if (lastSound == 'NG') {
							if (sounds[sounds.length - 2] == 'IH') {
								var _newPronunciation = _lodash2.default.clone(sounds);
								_newPronunciation[_newPronunciation.length - 1] = 'N';

								var _words3 = _this.dict.get(word).map(function (x) {
									return x.join(' ');
								});
								var _wordSounds2 = _newPronunciation.join(' ');
								if (!_lodash2.default.includes(_words3, _wordSounds2)) _this.dict.get(word).push(_newPronunciation);
							}
						}
					} catch (ex) {
						console.log(ex);
					}
				}
			});
		}
	}, {
		key: 'getPronunciations',
		value: function getPronunciations(word) {
			return this.dict.get(word.toLowerCase());
		}
	}, {
		key: 'getThing',
		value: function getThing(word, utteranceFunction, dictionary) {
			if (!word) return null;
			try {
				var pronunciations = this.getPronunciations(word);
				var matches = [];
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = pronunciations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var pronunciation = _step.value;

						var activeUtterances = utteranceFunction(pronunciation);
						var rhymes = dictionary.get(activeUtterances);
						if (rhymes) matches = matches.concat(rhymes);
					}

					// _.remove(matches, x => this.hasSameUtterances(x, word))
					// matches = matches.filter(x => {
					// 	return x => !this.hasSameUtterances(x, word)
					// })
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				return matches;
			} catch (ex) {
				return null;
			}
		}
	}, {
		key: 'isThing',
		value: function isThing(word, otherWord, utteranceFunction) {
			var pronunciations = this.getPronunciations(word);
			var otherPronunciations = this.getPronunciations(otherWord);
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = pronunciations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var pronunciation = _step2.value;
					var _iteratorNormalCompletion3 = true;
					var _didIteratorError3 = false;
					var _iteratorError3 = undefined;

					try {
						for (var _iterator3 = otherPronunciations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
							var otherPron = _step3.value;

							var a = utteranceFunction(pronunciation);
							var b = utteranceFunction(otherPron);
							if (a == b) return true;
						}
					} catch (err) {
						_didIteratorError3 = true;
						_iteratorError3 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion3 && _iterator3.return) {
								_iterator3.return();
							}
						} finally {
							if (_didIteratorError3) {
								throw _iteratorError3;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError2 = true;
				_iteratorError2 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion2 && _iterator2.return) {
						_iterator2.return();
					}
				} finally {
					if (_didIteratorError2) {
						throw _iteratorError2;
					}
				}
			}

			return false;
		}
	}, {
		key: 'alliteration',
		value: function alliteration(word) {
			return this.getThing(word, _utteranceUtil2.default.alliterationUtterances, this.alliterationMap);
		}
	}, {
		key: 'isAlliteration',
		value: function isAlliteration(word, otherWord) {
			return this.isThing(word, otherWord, _utteranceUtil2.default.alliterationUtterances);
		}
	}, {
		key: 'rhyme',
		value: function rhyme(word) {
			return this.getThing(word, _utteranceUtil2.default.perfectRhymeUtterances, this.rhymeMap);
		}
	}, {
		key: 'isRhyme',
		value: function isRhyme(word, otherWord) {
			return this.isThing(word, otherWord, _utteranceUtil2.default.perfectRhymeUtterances);
		}
	}, {
		key: 'endRhyme',
		value: function endRhyme(word) {
			return this.getThing(word, _utteranceUtil2.default.endRhymeUtterances, this.endRhymeMap);
		}
	}, {
		key: 'isEndRhyme',
		value: function isEndRhyme(word, otherWord) {
			return this.isThing(word, otherWord, _utteranceUtil2.default.endRhymeUtterances);
		}
	}, {
		key: 'assonance',
		value: function assonance(word) {
			return this.getThing(word, _utteranceUtil2.default.assonantUtterances, this.assonanceMap);
		}
	}, {
		key: 'isAssonance',
		value: function isAssonance(word, otherWord) {
			return this.isThing(word, otherWord, _utteranceUtil2.default.assonantUtterances);
		}
	}, {
		key: 'hasSameUtterances',
		value: function hasSameUtterances(word1, word2) {
			var pronunciations1 = this.getPronunciations(word1);
			var pronunciations2 = this.getPronunciations(word2);
			var _iteratorNormalCompletion4 = true;
			var _didIteratorError4 = false;
			var _iteratorError4 = undefined;

			try {
				for (var _iterator4 = pronunciations1[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
					var pronunciation1 = _step4.value;
					var _iteratorNormalCompletion5 = true;
					var _didIteratorError5 = false;
					var _iteratorError5 = undefined;

					try {
						for (var _iterator5 = pronunciations2[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
							var pronunciation2 = _step5.value;

							if (pronunciation1.join(' ') == pronunciation2.join(' ')) {
								return true;
							}
						}
					} catch (err) {
						_didIteratorError5 = true;
						_iteratorError5 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion5 && _iterator5.return) {
								_iterator5.return();
							}
						} finally {
							if (_didIteratorError5) {
								throw _iteratorError5;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError4 = true;
				_iteratorError4 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion4 && _iterator4.return) {
						_iterator4.return();
					}
				} finally {
					if (_didIteratorError4) {
						throw _iteratorError4;
					}
				}
			}

			return false;
		}
	}, {
		key: 'loadAssonance',
		value: function loadAssonance() {
			var _iteratorNormalCompletion6 = true;
			var _didIteratorError6 = false;
			var _iteratorError6 = undefined;

			try {
				for (var _iterator6 = this.dict[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
					var _step6$value = _slicedToArray(_step6.value, 2),
					    key = _step6$value[0],
					    value = _step6$value[1];

					var _iteratorNormalCompletion7 = true;
					var _didIteratorError7 = false;
					var _iteratorError7 = undefined;

					try {
						for (var _iterator7 = value[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
							var pronunciation = _step7.value;

							var activeUtterances = _utteranceUtil2.default.assonantUtterances(pronunciation);
							var pool = this.assonanceMap.get(activeUtterances);
							if (pool) {
								pool.push(key);
							} else {
								pool = [key];
							}
							this.assonanceMap.set(activeUtterances, pool);
						}
					} catch (err) {
						_didIteratorError7 = true;
						_iteratorError7 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion7 && _iterator7.return) {
								_iterator7.return();
							}
						} finally {
							if (_didIteratorError7) {
								throw _iteratorError7;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError6 = true;
				_iteratorError6 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion6 && _iterator6.return) {
						_iterator6.return();
					}
				} finally {
					if (_didIteratorError6) {
						throw _iteratorError6;
					}
				}
			}
		}
	}, {
		key: 'loadAlliterations',
		value: function loadAlliterations() {
			var _iteratorNormalCompletion8 = true;
			var _didIteratorError8 = false;
			var _iteratorError8 = undefined;

			try {
				for (var _iterator8 = this.dict[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
					var _step8$value = _slicedToArray(_step8.value, 2),
					    key = _step8$value[0],
					    value = _step8$value[1];

					var _iteratorNormalCompletion9 = true;
					var _didIteratorError9 = false;
					var _iteratorError9 = undefined;

					try {
						for (var _iterator9 = value[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
							var pronunciation = _step9.value;

							var activeUtterances = _utteranceUtil2.default.alliterationUtterances(pronunciation);
							var pool = this.alliterationMap.get(activeUtterances);
							if (pool) {
								pool.push(key);
							} else {
								pool = [key];
							}
							this.alliterationMap.set(activeUtterances, pool);
						}
					} catch (err) {
						_didIteratorError9 = true;
						_iteratorError9 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion9 && _iterator9.return) {
								_iterator9.return();
							}
						} finally {
							if (_didIteratorError9) {
								throw _iteratorError9;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError8 = true;
				_iteratorError8 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion8 && _iterator8.return) {
						_iterator8.return();
					}
				} finally {
					if (_didIteratorError8) {
						throw _iteratorError8;
					}
				}
			}
		}
	}, {
		key: 'loadRhymes',
		value: function loadRhymes() {
			var _iteratorNormalCompletion10 = true;
			var _didIteratorError10 = false;
			var _iteratorError10 = undefined;

			try {
				for (var _iterator10 = this.dict[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
					var _step10$value = _slicedToArray(_step10.value, 2),
					    key = _step10$value[0],
					    value = _step10$value[1];

					var _iteratorNormalCompletion11 = true;
					var _didIteratorError11 = false;
					var _iteratorError11 = undefined;

					try {
						for (var _iterator11 = value[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
							var pronunciation = _step11.value;

							var activeUtterances = _utteranceUtil2.default.perfectRhymeUtterances(pronunciation);
							var pool = this.rhymeMap.get(activeUtterances);
							if (pool) {
								pool.push(key);
							} else {
								pool = [key];
							}
							this.rhymeMap.set(activeUtterances, pool);
						}
					} catch (err) {
						_didIteratorError11 = true;
						_iteratorError11 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion11 && _iterator11.return) {
								_iterator11.return();
							}
						} finally {
							if (_didIteratorError11) {
								throw _iteratorError11;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError10 = true;
				_iteratorError10 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion10 && _iterator10.return) {
						_iterator10.return();
					}
				} finally {
					if (_didIteratorError10) {
						throw _iteratorError10;
					}
				}
			}
		}
	}, {
		key: 'loadEndRhymes',
		value: function loadEndRhymes() {
			var _iteratorNormalCompletion12 = true;
			var _didIteratorError12 = false;
			var _iteratorError12 = undefined;

			try {
				for (var _iterator12 = this.dict[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
					var _step12$value = _slicedToArray(_step12.value, 2),
					    key = _step12$value[0],
					    value = _step12$value[1];

					var _iteratorNormalCompletion13 = true;
					var _didIteratorError13 = false;
					var _iteratorError13 = undefined;

					try {
						for (var _iterator13 = value[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
							var pronunciation = _step13.value;

							var activeUtterances = _utteranceUtil2.default.endRhymeUtterances(pronunciation);
							var pool = this.endRhymeMap.get(activeUtterances);
							if (pool) {
								pool.push(key);
							} else {
								pool = [key];
							}
							this.endRhymeMap.set(activeUtterances, pool);
						}
					} catch (err) {
						_didIteratorError13 = true;
						_iteratorError13 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion13 && _iterator13.return) {
								_iterator13.return();
							}
						} finally {
							if (_didIteratorError13) {
								throw _iteratorError13;
							}
						}
					}
				}
			} catch (err) {
				_didIteratorError12 = true;
				_iteratorError12 = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion12 && _iterator12.return) {
						_iterator12.return();
					}
				} finally {
					if (_didIteratorError12) {
						throw _iteratorError12;
					}
				}
			}
		}
	}, {
		key: 'pronunciation',
		value: function pronunciation(word) {
			return this.dict.get(word.toLowerCase());
		}
	}]);

	return Rhymez;
}();

exports.default = Rhymez;