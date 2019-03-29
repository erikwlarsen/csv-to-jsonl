const { Transform } = require('stream');
const {
  COMMA_REPLACEMENT_VALUE_IN_QUOTES,
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES,
} = require('./constants');
const { convertToNumberIfNeeded } = require('./utils');

// Add some flags: convertBooleans, convertToNull

class CsvToJsonlines extends Transform {
  constructor() {
    super();
    this._initialized = false;
    this._lineNumber = 0;
  }

  _transform(chunk, _encoding, done) {
    const lineData = chunk.toString().split(',');
    if (!this._initialized) {
      this._headers = lineData;
      this._initialized = true;
      return done();
    }
    this._lineNumber += 1;
    const jsObj = this._headers.reduce((obj, field, idx) => {
      const value = convertToNumberIfNeeded(
        lineData[idx]
        && lineData[idx]
          .replace(new RegExp(COMMA_REPLACEMENT_VALUE_IN_QUOTES, 'g'), ',')
          .replace(new RegExp(NEWLINE_REPLACEMENT_VALUE_IN_QUOTES, 'g'), '\n')
          .replace(new RegExp(/"/, 'g'), ''),
      );

      const nested = field.includes('.');
      if (nested) {
        const properties = field.split('.');
        let pointer = obj;
        properties.forEach((prop, i) => {
          // if this is the last property, store the value at that property
          if (i === properties.length - 1) {
            pointer[prop] = value;
          } else {
            pointer[prop] = pointer[prop] || {};
            pointer = pointer[prop];
          }
        });
      } else {
        Object.assign(obj, { [field]: value });
      }
      return obj;
    }, {});
    try {
      const jsonl = JSON.stringify(jsObj);
      this.push(jsonl.concat('\n'));
      return done();
    } catch (e) {
      console.error(`Error stringifying object: line ${this._lineNumber}`);
      throw e;
    }
  }
}

module.exports = { CsvToJsonlines };
