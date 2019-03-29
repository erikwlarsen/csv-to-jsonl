const { Transform } = require('stream');
const {
  COMMA_REPLACEMENT_VALUE,
  NEWLINE_REPLACEMENT_VALUE,
  COMMA_REPLACEMENT_VALUE_IN_QUOTES,
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES,
} = require('./constants');

class RemoveNewLinesAndCommas extends Transform {
  constructor() {
    super();
    this._inQuotes = false;
  }

  _transform(chunk, _encoding, done) {
    let string = chunk.toString();
    const quoteIndexes = Array.from(string).reduce((arr, val, idx) => {
      if (val === '"') {
        arr.push(idx);
      }
      return arr;
    }, []);
    let oldString = '';
    while (oldString !== string) {
      oldString = string;
      string = string.replace(/\n|\r\n|\r|,/, (match, offset) => {
        const inQuotes = quoteIndexes.reduce((acc, val, idx) => {
          if (typeof acc !== 'undefined') {
            return acc;
          }
          if (offset < val) {
            return idx % 2 ? !this._inQuotes : this._inQuotes;
          }
          return undefined;
        }, undefined);
        if (inQuotes) {
          return match === ','
            ? COMMA_REPLACEMENT_VALUE_IN_QUOTES
            : NEWLINE_REPLACEMENT_VALUE_IN_QUOTES.repeat(match.length);
        }
        return match === ','
          ? COMMA_REPLACEMENT_VALUE
          : NEWLINE_REPLACEMENT_VALUE.repeat(match.length);
      });
    }
    this.push(string
      .replace(new RegExp(COMMA_REPLACEMENT_VALUE, 'g'), ',')
      .replace(new RegExp(NEWLINE_REPLACEMENT_VALUE, 'g'), '\n'));
    if (quoteIndexes.length % 2) {
      this._inQuotes = !this._inQuotes;
    }
    return done();
  }
}

module.exports = { RemoveNewLinesAndCommas };
