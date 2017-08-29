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

var dictFile = _path2.default.join(__dirname, 'data/rap.phonemes');
var IS_CONSONANT = /^[^AEIOU]/i;
var IS_VOWEL = /^[AEIOU]/i;

// TODO: Speed it up - Pare down search space for subsequent calls, break out of loops early if possible etc...
// TODO: collapse stars for assonance?  Make it an options maybe...

//Read in all the shit
//Make grouping dict for perfect rhymes
//ending rhymes
//alliteration
//assonant
//good assonants

var Rhymez = function () {
    function Rhymez(options) {
        _classCallCheck(this, Rhymez);

        this.options = options || {};
        this.dict = new Map();
        this.rhymes = new Map();
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
        key: 'get',
        value: function get(word) {
            var pronunciations = this.dict.get(word.toUpperCase());
            var matches = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = pronunciations[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var pronunciation = _step.value;

                    var activeUtterances = this.active(pronunciation);
                    var stringUtterances = activeUtterances.join(' ');
                    var rhymes = this.rhymes.get(stringUtterances);
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
        key: 'loadRhymes',
        value: function loadRhymes() {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.dict[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _step2$value = _slicedToArray(_step2.value, 2),
                        key = _step2$value[0],
                        value = _step2$value[1];

                    var _iteratorNormalCompletion3 = true;
                    var _didIteratorError3 = false;
                    var _iteratorError3 = undefined;

                    try {
                        for (var _iterator3 = value[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            var pronunciation = _step3.value;

                            var activeUtterances = this.active(pronunciation);
                            var stringUtterances = activeUtterances.join(' ');
                            var pool = this.rhymes.get(stringUtterances);
                            if (pool) {
                                pool.push(key);
                            } else {
                                pool = [key];
                            }
                            this.rhymes.set(stringUtterances, pool);
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
            })) {
                return []; // Doesn't exist in the dictionary
            }
            var mapped = words.map(this.pronunciation, this);
            mapped[0] = mapped[0].map(this.active); // Remove up to first vowel of first word only
            mapped = mapped.map(function (x) {
                return x.map(_this2.join);
            }); // WTF, sorry.
            var permuted = this._permutations(mapped);

            //console.log(permuted)
            var rhymes = this._getMatches(permuted.map(function (x) {
                return x.split(" ");
            }), options, words);

            return rhymes;
        }

        // This is terrible, I'm sorry.

    }, {
        key: '_optsToString',
        value: function _optsToString(options) {
            var entries = _lodash2.default.entries(options);
            entries = entries.filter(function (x) {
                return x[1] == true;
            });
            var x = entries.map(function (x) {
                return x[0];
            }).join("-");
            return x;
        }

        // =(

    }, {
        key: '_getMatches',
        value: function _getMatches(soundsToMatch, options, words) {
            var _this3 = this;

            if (this.cache[soundsToMatch.join(" ") + this._optsToString(options)]) {
                return this.cache[soundsToMatch.join(" ") + this._optsToString(options)];
            }

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

            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                var _loop = function _loop() {
                    var _step4$value = _slicedToArray(_step4.value, 2),
                        word = _step4$value[0],
                        wordPronounciations = _step4$value[1];

                    if (_lodash2.default.includes(words, word.toUpperCase())) return 'continue';
                    var doesRhyme = false;
                    if (options.assonance) wordPronounciations = wordPronounciations.map(function (x) {
                        return x.map(_this3._starConsonants, _this3);
                    }, _this3);
                    if (options.isLoose) wordPronounciations = wordPronounciations.map(function (x) {
                        return x.map(_this3._removeNumbers, _this3);
                    }, _this3);
                    if (options.alliteration) {
                        if (_this3.activeAlliteration(wordPronounciations[0]).length == soundsToMatch[0].length) {
                            doesRhyme = _lodash2.default.some(wordPronounciations.map(_this3.activeAlliteration, _this3), function (wp) {
                                return _this3.rhymeCheck(soundsToMatch, wp);
                            });
                            if (doesRhyme) rhymes.push(word);
                        }
                    } else {
                        if (_this3.active(wordPronounciations[0]).length == soundsToMatch[0].length) {
                            doesRhyme = _lodash2.default.some(wordPronounciations.map(_this3.active, _this3), function (wp) {
                                return _this3.rhymeCheck(soundsToMatch, wp);
                            });
                            if (doesRhyme) rhymes.push(word);
                        } else if (options.multiword) {
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
                    }
                };

                for (var _iterator4 = this.dict.entries()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var _ret = _loop();

                    if (_ret === 'continue') continue;
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

            this.cache[soundsToMatch.join(" ") + this._optsToString(options)] = rhymes;
            return rhymes;
        }

        // This works now...

    }, {
        key: 'rhymeCheck',
        value: function rhymeCheck(permuted, activePart) {
            if (!activePart || activePart.length === 0) return false;

            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = permuted[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var x = _step5.value;

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

            return false;
        }
    }, {
        key: 'alliterationStart',
        value: function alliterationStart(phrase, options) {
            var _this4 = this;

            options = options || {};
            options.multiword = false;
            options.isLoose = false;
            options.alliteration = true;
            phrase = phrase.toUpperCase();

            var words = phrase.split(" ");
            if (_lodash2.default.some(words, function (x) {
                return !_this4.dict.has(x);
            })) return []; // Doesn't exist in the dictionary

            var mapped = words.map(this.pronunciation, this);
            mapped[0] = mapped[0].map(this.activeAlliteration); // Remove up to first vowel of first word only
            return mapped[0][0].join(' ');
        }
    }, {
        key: 'alliteration',
        value: function alliteration(phrase, options) {
            var _this5 = this;

            options = options || {};
            options.multiword = false;
            options.isLoose = false;
            options.alliteration = true;
            phrase = phrase.toUpperCase();

            var words = phrase.split(" ");
            if (_lodash2.default.some(words, function (x) {
                return !_this5.dict.has(x);
            })) return []; // Doesn't exist in the dictionary

            var mapped = words.map(this.pronunciation, this);
            mapped[0] = mapped[0].map(this.activeAlliteration); // Remove up to first vowel of first word only
            mapped = mapped.map(function (x) {
                return x.map(_this5.join);
            }); // WTF, sorry.
            var permuted = this._permutations(mapped);

            var alliterations = this._getMatches(permuted.map(function (x) {
                return x.split(" ");
            }), options, words);

            return alliterations;
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
            x = x.replace(/[0-9]/ig, "");
            x = x.replace("AH", "&&");
            x = x.replace("IY", "&&");
            return x;
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
        key: 'activeAlliteration',
        value: function activeAlliteration(ws) {
            // active rhyming region: slice off the trailing consonants
            try {
                var arr = ws.slice(0);
                for (var i = 0; i < arr.length; i++) {
                    if (!arr[i].match(IS_CONSONANT) && i > 0) {
                        break;
                    }
                }

                arr.splice(i);
                //console.log(ws, arr)
                return arr;
            } catch (ex) {
                console.log(ws, ex);
            }
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