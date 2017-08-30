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

// TODO: collapse stars for assonance?  Make it an options maybe...

var Rhymez = function () {
	function Rhymez(options) {
		_classCallCheck(this, Rhymez);

		this.options = options || {};
		this.dict = new Map();
		this.rhymeMap = new Map();
		this.endRhymeMap = new Map();
		this.alliterationMap = new Map();
	}

	_createClass(Rhymez, [{
		key: 'load',
		value: function load(file) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				_lineReader2.default.eachLine(file || dictFile, function (line, last) {
					if (line.match(/^[A-Z]/i)) {
						var words = line.split(/\s+/);
						var word = words[0].replace(/\(\d+\)$/, '').toUpperCase();

						if (!_this.dict.has(word)) {
							_this.dict.set(word, []);
						}

						_this.dict.get(word).push(words.slice(1));

						if (last) {
							_this.loadRhymes();
							_this.loadEndRhymes();
							_this.loadAlliterations();
							return resolve(_this.dict);
						}
					}
				});
			});
		}
	}, {
		key: 'getPronunciations',
		value: function getPronunciations(word) {
			var pronunciations = this.dict.get(word.toUpperCase());
			return pronunciations;
		}
	}, {
		key: 'alliteration',
		value: function alliteration(word) {
			var pronunciations = this.getPronunciations(word);
			var matches = [];
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = pronunciations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var pronunciation = _step.value;

					var activeUtterances = _utteranceUtil2.default.alliterationUtterances(pronunciation);
					var rhymes = this.alliterationMap.get(activeUtterances);
					if (rhymes) matches = matches.concat(rhymes);
				}
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
		}
	}, {
		key: 'rhyme',
		value: function rhyme(word) {
			var pronunciations = this.getPronunciations(word);
			var matches = [];
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = pronunciations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var pronunciation = _step2.value;

					var activeUtterances = _utteranceUtil2.default.perfectRhymeUtterances(pronunciation);
					var rhymes = this.rhymeMap.get(activeUtterances);
					if (rhymes) matches = matches.concat(rhymes);
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

			return matches;
		}
	}, {
		key: 'loadAlliterations',
		value: function loadAlliterations() {
			var _iteratorNormalCompletion3 = true;
			var _didIteratorError3 = false;
			var _iteratorError3 = undefined;

			try {
				for (var _iterator3 = this.dict[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
					var _step3$value = _slicedToArray(_step3.value, 2),
					    key = _step3$value[0],
					    value = _step3$value[1];

					var _iteratorNormalCompletion4 = true;
					var _didIteratorError4 = false;
					var _iteratorError4 = undefined;

					try {
						for (var _iterator4 = value[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
							var pronunciation = _step4.value;

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
	}, {
		key: 'loadRhymes',
		value: function loadRhymes() {
			var _iteratorNormalCompletion5 = true;
			var _didIteratorError5 = false;
			var _iteratorError5 = undefined;

			try {
				for (var _iterator5 = this.dict[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
					var _step5$value = _slicedToArray(_step5.value, 2),
					    key = _step5$value[0],
					    value = _step5$value[1];

					var _iteratorNormalCompletion6 = true;
					var _didIteratorError6 = false;
					var _iteratorError6 = undefined;

					try {
						for (var _iterator6 = value[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
							var pronunciation = _step6.value;

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
	}, {
		key: 'loadEndRhymes',
		value: function loadEndRhymes() {
			var _iteratorNormalCompletion7 = true;
			var _didIteratorError7 = false;
			var _iteratorError7 = undefined;

			try {
				for (var _iterator7 = this.dict[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
					var _step7$value = _slicedToArray(_step7.value, 2),
					    key = _step7$value[0],
					    value = _step7$value[1];

					var _iteratorNormalCompletion8 = true;
					var _didIteratorError8 = false;
					var _iteratorError8 = undefined;

					try {
						for (var _iterator8 = value[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
							var pronunciation = _step8.value;

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
	}, {
		key: 'pronunciation',
		value: function pronunciation(word) {
			return this.dict.get(word.toUpperCase());
		}
	}]);

	return Rhymez;
}();

exports.default = Rhymez;