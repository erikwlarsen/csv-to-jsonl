const { Transform } = require('stream');
const {
  COMMA_REPLACEMENT_VALUE_IN_QUOTES,
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES,
  ERROR_TYPES,
} = require('./constants');
const {
  convertToNumber,
  convertToBooleanOrNull,
  getObjectValue,
  isUndefinedOrNull,
  assignPropertyToObject,
} = require('./utils');

class CsvToJsonlines extends Transform {
  constructor({ validation, validateFunc, doNotThrow } = {}) {
    super();
    this._validation = validation;
    this._userValidateRow = validateFunc;
    this._doNotThrow = doNotThrow;
    this._initialized = false;
    this._lineNumber = 0;
    this._invalidRows = [];
  }

  _transform(chunk, _encoding, done) {
    const lineData = chunk.toString().split(',');

    if (!this._initialized) {
      this._init(lineData);
      return done();
    }

    this._lineNumber += 1;
    const jsObj = this._headers.reduce((obj, header, idx) => {
      const value = convertToBooleanOrNull(convertToNumber(
        lineData[idx]
        && lineData[idx]
          .replace(new RegExp(COMMA_REPLACEMENT_VALUE_IN_QUOTES, 'g'), ',')
          .replace(new RegExp(NEWLINE_REPLACEMENT_VALUE_IN_QUOTES, 'g'), '\n')
          .replace(new RegExp(/"/, 'g'), ''),
      ));
      assignPropertyToObject(obj, header, value);
      return obj;
    }, {});
    this._validateRow(jsObj);
    if (this._userValidateRow) {
      this._userValidateRow(jsObj);
    }
    try {
      const jsonl = JSON.stringify(jsObj);
      this.push(jsonl.concat('\n'));
      return done();
    } catch (e) {
      console.error(`Error stringifying object: line ${this._lineNumber}`);
      throw e;
    }
  }

  _init(lineData) {
    this._validateValidation();
    this._headers = lineData;
    this._validateHeaders();
    this._initialized = true;
  }

  _flush(done) {
    this._logValidationErrors();
    return done();
  }

  _validateValidation() {
    if (this._validation) {
      Object.entries(this._validation).forEach(([prop, descriptors]) => {
        if (typeof descriptors !== 'object') {
          throw new Error(`Invalid validation configuration for field ${prop} with descriptors ${descriptors}`);
        }
        const typeSet = new Set(['string', 'number', 'boolean']);
        if (descriptors.type && !typeSet.has(descriptors.type)) {
          throw new Error(`Invalid validation type for field ${prop} with type ${descriptors.type}`);
        }
      });
    }
    if (this._userValidateRow && typeof this._userValidateRow !== 'function') {
      throw new Error('Invalid argument supplied for validateFunc. Must be a function');
    }
  }

  _validateHeaders() {
    if (!this._validation) return;
    const headersSet = new Set(this._headers);
    Object.entries(this._validation).forEach(([prop, descriptors]) => {
      if (descriptors.required && !headersSet.has(prop)) {
        this.createValidationError({
          errorType: ERROR_TYPES.missingRequiredHeader,
          property: prop,
        });
      }
    });
  }

  _validateRow(obj) {
    if (!this._validation) return;
    Object.entries(this._validation).forEach(([prop, descriptors]) => {
      const value = getObjectValue(prop, obj);
      if (descriptors.required && isUndefinedOrNull(value)) {
        this.createValidationError({
          errorType: ERROR_TYPES.missingRequiredRowValue,
          property: prop,
        });
        return;
      }
      if (descriptors.type && typeof value !== descriptors.type) {
        this.createValidationError({
          errorType: ERROR_TYPES.missingRequiredRowValue,
          property: prop,
        });
      }
    });
  }

  _logValidationErrors() {
    if (this._invalidRows.length) {
      this._invalidRows.forEach(({ line, errorType, field }) => {
        console.error(`Error in ${typeof line === 'number' ? 'line ' : ''}${line}.
    Error type: ${errorType}
    Field: ${field}`);
      });
      if (!this._doNotThrow) {
        throw new Error('CSV-to-JSONL validation errors found. See above log output for row errors');
      }
    }
  }

  createValidationError({ errorType, field }) {
    this._invalidRows.push({ line: this._lineNumber || 'headers', errorType, field });
  }
}

module.exports = { CsvToJsonlines };
