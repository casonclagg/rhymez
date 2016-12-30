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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dictFile = _path2.default.join(__dirname, 'data/cmudict.dict');
var IS_CONSONANT = /^[^AEIOU]/i;
var IS_VOWEL = /^[AEIOU]/i;

// TODO: Speed it up - Pare down search space for subsequent calls, break out of loops early if possible etc...
// TODO: collapse stars for assonance?  Make it an options maybe...

var Rhymez = function () {
    function Rhymez(options) {
        _classCallCheck(this, Rhymez);

        this.options = options || {};
        this.dict = new Map();
        this.cache = {};
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

                        if (last) return resolve(_this.dict);
                    }
                });
            });
        }
    }, {
        key: 'pronunciation',
        value: function pronunciation(word) {
            return this.dict.get(word.toUpperCase());
        }
    }, {
        key: 'rhyme',
        value: function rhyme(phrase, options) {
            var _this2 = this;

            options = options || {};
            phrase = phrase.toUpperCase();
            var words = phrase.split(" ");
            if (_lodash2.default.some(words, function (x) {
                return !_this2.dict.has(x);
            })) return []; // Doesn't exist in the dictionary
            var mapped = words.map(this.pronunciation, this);
            mapped[0] = mapped[0].map(this.active); // Remove up to first vowel of first word only
            mapped = mapped.map(function (x) {
                return x.map(_this2.join);
            }); // WTF, sorry.
            var permuted = this._permutations(mapped);

            var rhymes = this._getMatches(permuted.map(function (x) {
                return x.split(" ");
            }), options);

            return rhymes;
        }
    }, {
        key: '_getMatches',
        value: function _getMatches(soundsToMatch, options) {
            var _this3 = this;

            if (this.cache[soundsToMatch.join(" ")]) return this.cache[soundsToMatch.join(" ")];

            var rhymes = [];
            if (soundsToMatch[0].length == 0) return [];

            if (options.assonance) {
                soundsToMatch = soundsToMatch.map(function (x) {
                    return x.map(_this3._starConsonants, _this3);
                }, this);
            }
            if (options.isLoose) {
                soundsToMatch = soundsToMatch.map(function (x) {
                    return x.map(_this3._removeNumbers, _this3);
                }, this);
            }
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                var _loop = function _loop() {
                    var _step$value = _slicedToArray(_step.value, 2),
                        word = _step$value[0],
                        wordPronounciations = _step$value[1];

                    var doesRhyme = false;
                    if (options.assonance) wordPronounciations = wordPronounciations.map(function (x) {
                        return x.map(_this3._starConsonants, _this3);
                    }, _this3);
                    if (options.isLoose) wordPronounciations = wordPronounciations.map(function (x) {
                        return x.map(_this3._removeNumbers, _this3);
                    }, _this3);

                    // if(word == "GUNS") console.log("GUNS", wordPronounciations, soundsToMatch)

                    if (_this3.active(wordPronounciations[0]).length == soundsToMatch[0].length) {
                        doesRhyme = _lodash2.default.some(wordPronounciations.map(_this3.active, _this3), function (wp) {
                            return _this3.rhymeCheck(soundsToMatch, wp);
                        });
                        if (doesRhyme) rhymes.push(word);
                    } else {
                        // Partial rhymes, use whole pronunciation, not just this.active(pronunciation)
                        doesRhyme = _lodash2.default.some(wordPronounciations, function (wp) {
                            return _this3.rhymeCheck(soundsToMatch, wp);
                        });
                        if (doesRhyme) {
                            var remainderToMatch = soundsToMatch.map(function (x) {
                                return x.slice(0, soundsToMatch.length - wordPronounciations[0].length - 1);
                            });
                            var addons = _this3._getMatches(remainderToMatch, options);

                            addons = addons.map(function (a) {
                                return a + " " + word;
                            });
                            rhymes = rhymes.concat(addons);
                        }
                    }
                };

                for (var _iterator = this.dict.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    _loop();
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

            this.cache[soundsToMatch.join(" ")] = rhymes;
            return rhymes;
        }

        // This works now...

    }, {
        key: 'rhymeCheck',
        value: function rhymeCheck(permuted, activePart) {
            if (!activePart || activePart.length === 0) return false;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = permuted[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var x = _step2.value;

                    if (activePart.length > x.length) continue;
                    for (var y = x.length - 1; y >= 0; y--) {
                        var activePartIndex = activePart.length - (x.length - 1 - y) - 1;
                        if (x[y] != activePart[activePartIndex]) {
                            break;
                        }
                        if (activePartIndex == 0) return true;
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
        key: 'assonance',
        value: function assonance(phrase, options) {
            options = options || {};
            options.assonance = true;
            return this.rhyme(phrase, options);
        }

        // Used to loosen up rhymes (may find poor rhymes...)

    }, {
        key: '_removeNumbers',
        value: function _removeNumbers(x) {
            return x.replace(/[0-9]/ig, "");
        }

        // Used for assonance

    }, {
        key: '_starConsonants',
        value: function _starConsonants(x) {
            return x.replace(/(\s|^)([BCDFGHJKLMNPQRSTVWXYZ](\s|$))/ig, function (all, a, b, c) {
                return a + '*' + c;
            });
        }
    }, {
        key: 'join',
        value: function join(ws) {
            return ws.join(' ');
        }
    }, {
        key: 'active',
        value: function active(ws) {
            var firstNonConsonant = _lodash2.default.findIndex(ws, function (w) {
                return !w.match(IS_CONSONANT);
            });

            return ws.slice(firstNonConsonant);
        }
    }, {
        key: '_permutations',
        value: function _permutations(arrayOfArraysOfArrays) {
            if (arrayOfArraysOfArrays.length === 0) return [];
            if (arrayOfArraysOfArrays.length === 1) return arrayOfArraysOfArrays[0];
            var result = [];
            var allCasesOfRest = this._permutations(arrayOfArraysOfArrays.slice(1));
            for (var c in allCasesOfRest) {
                for (var i = 0; i < arrayOfArraysOfArrays[0].length; i++) {
                    var thing = arrayOfArraysOfArrays[0][i] + " " + allCasesOfRest[c];
                    result.push(thing);
                }
            }
            return result;
        }
    }]);

    return Rhymez;
}();

exports.default = Rhymez;