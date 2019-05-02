const { Transform } = require('stream');
const {
  COMMA_REPLACEMENT_VALUE,
  NEWLINE_REPLACEMENT_VALUE,
  COMMA_REPLACEMENT_VALUE_IN_QUOTES,
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES,
  REPLACEMENT_VALUE_LENGTH,
} = require('./constants');

const augmentQuoteIndicesMapper = (matchOffset, matchLength) => index => (
  index < matchOffset ? index : index + (REPLACEMENT_VALUE_LENGTH * matchLength)
);

const inQuotesReducer = matchOffset => (acc, val, idx) => {
  if (typeof acc !== 'undefined') {
    return acc;
  }
  if (matchOffset < val) {
    return idx % 2 ? !this._inQuotes : this._inQuotes;
  }
  return undefined;
};

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
      string = string.replace(/\n|\r\n|\r|,/, this._replaceCommasAndNewlines);
    }
    this.push(string
      .replace(new RegExp(COMMA_REPLACEMENT_VALUE, 'g'), ',')
      .replace(new RegExp(NEWLINE_REPLACEMENT_VALUE, 'g'), '\n'));
    if (this._quoteIndices.length % 2) {
      this._inQuotes = !this._inQuotes;
    }
    return done();
  }

  _replaceCommasAndNewlines(match, offset) {
    const inQuotes = this._quoteIndices.reduce(inQuotesReducer(offset), undefined);
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

module.exports = { RemoveNewLinesAndCommas };
