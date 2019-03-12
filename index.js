const { Transform } = require('stream');
const { createReadStream, createWriteStream, existsSync } = require('fs');
const { resolve } = require('path');

const inputPath = resolve(__dirname, process.argv[2]);
if (!inputPath || !/\.csv$/.test(inputPath) || !existsSync(inputPath)) {
  throw new Error('invalid csv file path argument');
}
const outputPath = inputPath.slice(0, inputPath.length - 3).concat('jsonl');
const COMMA_REPLACEMENT_VALUE = '\u00b6'; // ¶
const NEWLINE_REPLACEMENT_VALUE = '\u00a7'; // §
const COMMA_REPLACEMENT_VALUE_IN_QUOTES = '\u00b7';
const NEWLINE_REPLACEMENT_VALUE_IN_QUOTES = '\u00b8';
const FORBIDDEN_CHARACTERS = new Set([COMMA_REPLACEMENT_VALUE, NEWLINE_REPLACEMENT_VALUE]);

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
        lineData[idx] &&
        lineData[idx]
          .replace(new RegExp(COMMA_REPLACEMENT_VALUE_IN_QUOTES, 'g'), ',')
          .replace(new RegExp(NEWLINE_REPLACEMENT_VALUE_IN_QUOTES, 'g'), '\n')
          .replace(new RegExp(/"/, 'g'), '')
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
            pointer = pointer[prop] = pointer[prop] || {};
          }
        });
      } else {
        obj[field] = value;
      }
      return obj;
    }, {});
    try {
      const jsonl = JSON.stringify(jsObj);
      this.push(jsonl.concat('\n'));
      return done();
    } catch(e) {
      console.error(`Error stringifying object: line ${this._lineNumber}`)
      throw e;
    }
  }
}

class MakeLines extends Transform {
  _transform(chunk, _encoding, done) {
    chunk = chunk.toString();
    if (this._leftover) {
      chunk = this._leftover.concat(chunk);
    }
    const lines = chunk.split('\n');
    [this._leftover] = lines.splice(lines.length - 1, 1);
    lines.forEach(this.push.bind(this));
    return done();
  }

  _flush(done) {
    if (this._leftover) {
      this.push(this._leftover);
    }
    return done();
  }
}

const convertToNumberIfNeeded = value => {
  return Number.isNaN(Number(value)) || Number.isNaN(parseInt(value, 10)) ? value : Number(value);
}

class RemoveNewLinesAndCommas extends Transform {
  constructor() {
    super();
    this._inQuotes = false;
  }

  _transform(chunk, _encoding, done) {
    let string = chunk.toString();
    let quoteIndexes = Array.from(string).reduce((arr, val, idx) => {
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
          } else if (offset < val) {
            return idx % 2 ? !this._inQuotes : this._inQuotes;
          }
          return undefined;
        }, undefined);
        if (inQuotes) {
          return match === ','
            ? COMMA_REPLACEMENT_VALUE_IN_QUOTES : NEWLINE_REPLACEMENT_VALUE_IN_QUOTES.repeat(match.length);
        }
        return match === ',' ? COMMA_REPLACEMENT_VALUE :  NEWLINE_REPLACEMENT_VALUE.repeat(match.length);
      });
    }
    this.push(string
      .replace(new RegExp(COMMA_REPLACEMENT_VALUE, 'g'), ',')
      .replace(new RegExp(NEWLINE_REPLACEMENT_VALUE, 'g'), '\n')
    );
    if (quoteIndexes.length % 2) {
      this._inQuotes = !this._inQuotes;
    }
    return done();
  }
}

createReadStream(inputPath)
  .pipe(new RemoveNewLinesAndCommas())
  .pipe(new MakeLines())
  .pipe(new CsvToJsonlines())
  .pipe(createWriteStream(outputPath));
