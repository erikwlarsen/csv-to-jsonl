/* eslint-disable no-underscore-dangle */
const { expect } = require('chai');
const { CsvToJsonlines, removeReplacementValues } = require('../src/CsvToJsonlines');
const {
  COMMA_REPLACEMENT_VALUE_IN_QUOTES: CQ,
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES: NQ,
  QUOTE_REPLACEMENT_VALUE: Q,
} = require('../src/constants');

describe('CsvToJsonlines', () => {
  describe('removeReplacementValues', () => {
    it('should replace COMMA_REPLACEMENT_VALUE_IN_QUOTES with comma', () => {
      expect(removeReplacementValues(`${CQ}stuff${CQ}`)).to.equal(',stuff,');
    });
    it('should replace NEWLINE_REPLACEMENT_VALUE_IN_QUOTES with newline', () => {
      expect(removeReplacementValues(`${NQ}stuff${NQ}`)).to.equal('\nstuff\n');
    });
    it('should replace quotes with nothing', () => {
      expect(removeReplacementValues('"stuff"')).to.equal('stuff');
    });
    it('should replace QUOTE_REPLACEMENT_VALUE with quotes', () => {
      expect(removeReplacementValues(`${Q}stuff${Q}`)).to.equal('"stuff"');
    });
    it('should replace all of the above values', () => {
      expect(removeReplacementValues(`${Q}${NQ}${CQ}"stuff"${NQ}${CQ}${Q}`)).to.equal('"\n,stuff\n,"');
    });
  });

  describe('CsvToJsonlines.prototype.createValidationError', () => {
    it('should push errors to this._invalidRows', () => {
      const csvToJsonlines = new CsvToJsonlines();
      const lineNumber = 7;
      csvToJsonlines._lineNumber = lineNumber;
      csvToJsonlines.createValidationError({ errorType: 'oops', field: 'city' });
      csvToJsonlines.createValidationError({ errorType: 'whoops', field: 'country' });
      expect(csvToJsonlines._invalidRows).to.deep.equal([
        { line: lineNumber, errorType: 'oops', field: 'city' },
        { line: lineNumber, errorType: 'whoops', field: 'country' },
      ]);
    });
    it('should use \'headers\' for line if this._lineNumber is 0', () => {
      const csvToJsonlines = new CsvToJsonlines();
      csvToJsonlines.createValidationError({ errorType: 'oops', field: 'city' });
      expect(csvToJsonlines._invalidRows).to.deep.equal([{
        line: 'headers', errorType: 'oops', field: 'city',
      }]);
    });
  });
});
