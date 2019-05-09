const { Transform } = require('stream');
const {
  COMMA_REPLACEMENT_VALUE,
  NEWLINE_REPLACEMENT_VALUE,
  COMMA_REPLACEMENT_VALUE_IN_QUOTES,
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES,
  REPLACEMENT_VALUE_LENGTH,
} = require('./constants');
const { isLastIndex } = require('./utils');

const augmentQuoteIndicesMapper = (matchOffset, matchLength) => index => (
  index <= matchOffset ? index : index + ((REPLACEMENT_VALUE_LENGTH - 1) * matchLength)
);

const inQuotesReducer = (matchOffset, inQuotes) => (acc, val, idx, arr) => {
  if (typeof acc !== 'undefined') {
    return acc;
  }
  if (matchOffset < val) {
    return idx % 2 ? !inQuotes : inQuotes;
  }
  if (isLastIndex(arr, idx)) {
    return arr.length % 2 ? !inQuotes : inQuotes;
  }
  return undefined;
};

const putUnquotedCommasAndNewlinesBack = str => str
  .replace(new RegExp(COMMA_REPLACEMENT_VALUE, 'g'), ',')
  .replace(new RegExp(NEWLINE_REPLACEMENT_VALUE, 'g'), '\n');

class RemoveNewLinesAndCommas extends Transform {
  constructor() {
    super();
    this._inQuotes = false;
  }

  _transform(chunk, _encoding, done) {
    let string = chunk.toString();
    this._quoteIndices = Array.from(string).reduce((arr, val, idx) => {
      if (val === '"') {
        arr.push(idx);
      }
      return arr;
    }, []);
    let oldString = '';
    while (oldString !== string) {
      oldString = string;
      string = string.replace(/\n|\r\n|\r|,/, this._replaceCommasAndNewlines.bind(this));
    }
    string = putUnquotedCommasAndNewlinesBack(string);
    this.push(string);
    if (this._quoteIndices.length % 2) {
      this._inQuotes = !this._inQuotes;
    }
    return done();
  }

  _replaceCommasAndNewlines(match, offset) {
    const inQuotes = this._quoteIndices.reduce(inQuotesReducer(offset, this._inQuotes), undefined);
    this._quoteIndices = this._quoteIndices.map(augmentQuoteIndicesMapper(offset, match.length));
    if (inQuotes) {
      return match === ','
        ? COMMA_REPLACEMENT_VALUE_IN_QUOTES
        : NEWLINE_REPLACEMENT_VALUE_IN_QUOTES.repeat(match.length);
    }
    return match === ','
      ? COMMA_REPLACEMENT_VALUE
      : NEWLINE_REPLACEMENT_VALUE.repeat(match.length);
  }
}

module.exports = {
  RemoveNewLinesAndCommas,
  augmentQuoteIndicesMapper,
  inQuotesReducer,
  putUnquotedCommasAndNewlinesBack,
};
