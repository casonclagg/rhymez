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

var Rhymez = function () {
    function Rhymez(options) {
        _classCallCheck(this, Rhymez);

        this.options = options || {};
        this.dict = new Map();
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

            var rhymes = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.dict.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2),
                        w = _step$value[0],
                        pronounciations = _step$value[1];

                    if (_lodash2.default.includes(words, w)) continue;
                    if (w == "DAY") console.log(w, pronounciations, permuted);
                    var check = this._checkEntry(w, pronounciations, permuted, [], options);
                    if (check && check.length > 0) {
                        rhymes.push(check.map(function (w) {
                            return w.word;
                        }).join(" "));
                    }
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

            return rhymes;
        }

        // if word matches but is too short, run this again on all "entries" and return found

    }, {
        key: '_checkEntry',
        value: function _checkEntry(w, pronounciations, permuted, found, options) {
            var _this3 = this;

            if (found.length > 0) console.log("w, pronounciations, permuted, found, options", w, pronounciations, permuted, found, options);
            if (pronounciations[0].length == 0) return found;

            var matches = pronounciations.some(function (p) {
                var activePart = _this3.join(_this3.active(p));
                if (options.isLoose) {
                    permuted = permuted.map(_this3._removeNumbers, _this3);
                    activePart = _this3._removeNumbers(activePart);
                }
                if (options.assonance) {
                    permuted = permuted.map(_this3._starConsonants, _this3);
                    activePart = _this3._starConsonants(activePart);
                }
                // check for partial end too...
                if (w == "DAY") console.log("permuted, activePart", permuted, activePart, options);
                return _this3.rhymeCheck(permuted, activePart);
            });

            if (matches) {
                found.unshift({
                    word: w,
                    count: pronounciations.map(this.active)[0].length
                });
                if (pronounciations.map(this.active)[0].length == permuted[0].split(" ").length) return found;
                console.log(w, pronounciations.map(this.active)[0].length, permuted[0].split(" ").length, _lodash2.default.sumBy(found, "count"), found);
                if (permuted[0].split(" ").length > _lodash2.default.sumBy(found, "count")) {
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = this.dict.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var _step2$value = _slicedToArray(_step2.value, 2),
                                w2 = _step2$value[0],
                                pronounciations2 = _step2$value[1];

                            console.log("permutedpermuted111", permuted);
                            permuted = permuted.map(function (x) {
                                return x.split(" ").splice(0, permuted[0].length - pronounciations[0].length).join(" ");
                            });
                            console.log("permutedpermuted222", permuted);
                            var check = this._checkEntry(w2, pronounciations2, permuted, found, options);
                            if (check && check.length > 0) {
                                console.log("check", check);
                                return found.concat(check);
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
                } else {
                    return found;
                }
            }
            return null;
        }

        // This works now...

    }, {
        key: 'rhymeCheck',
        value: function rhymeCheck(permuted, activePart) {
            if (!activePart || activePart.length === 0) return false;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = permuted[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var x = _step3.value;

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
            return x.replace(/(\s|^)([^AEIOU])(\s|$)/ig, function (all, a, b, c) {
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