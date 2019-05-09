const { Transform } = require('stream');
const { QUOTE_REPLACEMENT_VALUE } = require('./constants');

class RemoveExtraQuotes extends Transform {
  constructor() {
    super();
    this._lastChunkEndedWithQuote = false;
  }

  _transform(chunk, _encoding, done) {
    let string = chunk.toString();
    // Check if there is a double quote split into separate chunks
    const chunkStartsWithQuote = string.startsWith('"');
    if (this._lastChunkEndedWithQuote && chunkStartsWithQuote) {
      string = QUOTE_REPLACEMENT_VALUE.concat(string.slice(1));
    }
    // Replace all double quotes in the chunk with quote + replacement value
    string = string.replace(new RegExp('""', 'g'), `"${QUOTE_REPLACEMENT_VALUE}`);
    this._lastChunkEndedWithQuote = string.endsWith('"');
    this.push(string);
    return done();
  }
}

module.exports = { RemoveExtraQuotes };
