/* eslint-disable no-underscore-dangle */
const { expect } = require('chai');
const { createReadStream } = require('fs');
const { resolve } = require('path');
const {
  RemoveNewLinesAndCommas,
  augmentQuoteIndicesMapper,
  inQuotesReducer,
  putUnquotedCommasAndNewlinesBack,
} = require('../src/RemoveNewLinesAndCommas');
const {
  REPLACEMENT_VALUE_LENGTH: L,
  COMMA_REPLACEMENT_VALUE: C,
  NEWLINE_REPLACEMENT_VALUE: N,
  COMMA_REPLACEMENT_VALUE_IN_QUOTES: CQ,
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES: NQ,
} = require('../src/constants');
const { csvOutput } = require('./RemoveNewLinesAndCommas.fixture');

describe('RemoveNewLinesAndCommas', () => {
  describe('augmentQuoteIndicesMapper', () => {
    it('adds the replacement value length - 1 times the match length - to every index bigger than the offset', () => {
      const indexArr = [1, 2, 3, 4, 5, 6];
      const matchOffset = 4;
      const matchLength = 2;
      expect(indexArr.map(augmentQuoteIndicesMapper(matchOffset, matchLength)))
        .to.deep.equal([1, 2, 3, 4, 5 + (matchLength * (L - 1)), 6 + (matchLength * (L - 1))]);
    });
  });

  describe('inQuotesReducer', () => {
    const quoteIndices = [5, 10, 15, 20];
    it('should return true for index after odd number of quotes if inQuotes is false', () => {
      expect(quoteIndices.reduce(inQuotesReducer(16, false), undefined)).to.equal(true);
    });
    it('should return false for index after odd number of quotes if inQuotes is true', () => {
      expect(quoteIndices.reduce(inQuotesReducer(7, true), undefined)).to.equal(false);
    });
    it('should return true for index after even number of quotes if inQuotes is true', () => {
      expect(quoteIndices.reduce(inQuotesReducer(13, true), undefined)).to.equal(true);
    });
    it('should return false for index after even number of quotes if inQuotes is false', () => {
      expect(quoteIndices.reduce(inQuotesReducer(12, false), undefined)).to.equal(false);
    });
    it('should handle index after all quotes', () => {
      expect(quoteIndices.reduce(inQuotesReducer(30, false), undefined)).to.equal(false);
      expect(quoteIndices.reduce(inQuotesReducer(30, true), undefined)).to.equal(true);
      const oddQuoteIndices = quoteIndices.concat(25);
      expect(oddQuoteIndices.reduce(inQuotesReducer(30, false), undefined)).to.equal(true);
      expect(oddQuoteIndices.reduce(inQuotesReducer(30, true), undefined)).to.equal(false);
    });
  });

  describe('putUnquotedCommasAndNewlinesBack', () => {
    it('should replace the comma replacement value with commas', () => {
      const str = `${C}cool${C}${C}${C}`;
      expect(putUnquotedCommasAndNewlinesBack(str)).to.equal(',cool,,,');
    });
    it('should replace the newline replacement value with newlines', () => {
      const str = `${N}cool${N}${N}${N}`;
      expect(putUnquotedCommasAndNewlinesBack(str)).to.equal('\ncool\n\n\n');
    });
    it('should not replace quoted comma or newline replacement values', () => {
      const str = `${CQ}cool${NQ}`;
      expect(putUnquotedCommasAndNewlinesBack(str)).to.equal(str);
    });
  });

  describe('RemoveNewLinesAndCommas.prototype._replaceCommasAndNewLines', () => {
    let removeNewLinesAndCommas;
    beforeEach(() => {
      removeNewLinesAndCommas = new RemoveNewLinesAndCommas();
      removeNewLinesAndCommas._quoteIndices = [5, 10, 15, 20];
      removeNewLinesAndCommas._inQuotes = true;
    });
    it('should return COMMA_REPLACEMENT_VALUE_IN_QUOTES if match is comma in quotes', () => {
      expect(removeNewLinesAndCommas._replaceCommasAndNewlines(',', 3)).to.equal(CQ);
    });
    it('should return NEWLINE_REPLACEMENT_VALUE_IN_QUOTES if match is newline in quotes', () => {
      expect(removeNewLinesAndCommas._replaceCommasAndNewlines('\n', 3)).to.equal(NQ);
    });
    it('should return NEWLINE_REPLACEMENT_VALUE_IN_QUOTES if match is carriage return in quotes', () => {
      expect(removeNewLinesAndCommas._replaceCommasAndNewlines('\r', 3)).to.equal(NQ);
    });
    it('should return NEWLINE_REPLACEMENT_VALUE_IN_QUOTES x2 if match is carriage + return in quotes', () => {
      expect(removeNewLinesAndCommas._replaceCommasAndNewlines('\r\n', 3)).to.equal(`${NQ}${NQ}`);
    });
    it('should return COMMA_REPLACEMENT_VALUE if match is comma not in quotes', () => {
      expect(removeNewLinesAndCommas._replaceCommasAndNewlines(',', 7)).to.equal(C);
    });
    it('should return NEWLINE_REPLACEMENT_VALUE if match is newline not in quotes', () => {
      expect(removeNewLinesAndCommas._replaceCommasAndNewlines('\n', 7)).to.equal(N);
    });
    it('should return NEWLINE_REPLACEMENT_VALUE if match is carriage return not in quotes', () => {
      expect(removeNewLinesAndCommas._replaceCommasAndNewlines('\r', 7)).to.equal(N);
    });
    it('should return NEWLINE_REPLACEMENT_VALUE x2 if match is carriage + return not in quotes', () => {
      expect(removeNewLinesAndCommas._replaceCommasAndNewlines('\r\n', 7)).to.equal(`${N}${N}`);
    });
    it('should update the this._quoteIndices array', () => {
      expect(removeNewLinesAndCommas._quoteIndices).to.deep.equal([5, 10, 15, 20]);
      removeNewLinesAndCommas._replaceCommasAndNewlines('\r\n', 12);
      expect(removeNewLinesAndCommas._quoteIndices)
        .to.deep.equal([5, 10, 15 + (L - 1) * 2, 20 + (L - 1) * 2]);
    });
  });

  describe('RemoveNewLinesAndCommas.prototype._transform', () => {
    it('should replace new lines and commas that are within quotes', (done) => {
      const chunk = Buffer.from('Z,X,"Z,X,"Z,X\n"Z\nX\n"\r\n"\r\n"Z\rX"Z\rX"');
      const expected = `Z,X,"Z${CQ}X${CQ}"Z,X\n"Z${NQ}X${NQ}"\n\n"${NQ}${NQ}"Z\nX"Z${NQ}X"`;
      let output;
      const removeNewLinesAndCommas = new RemoveNewLinesAndCommas();
      removeNewLinesAndCommas.push = (str) => { output = str; };
      removeNewLinesAndCommas._transform(chunk, null, () => {
        expect(output).to.equal(expected);
        return done();
      });
    });
  });

  describe('entire class', () => {
    // eslint-disable-next-line
    it('should replace quoted new lines and commas', function (done) {
      this.timeout(30000);
      const input = createReadStream(resolve(__dirname, 'csv/commas_and_quotes.csv'));
      let output = '';
      const removeNewLinesAndCommas = new RemoveNewLinesAndCommas();
      removeNewLinesAndCommas.on('data', (chunk) => {
        output = output.concat(chunk.toString());
      });
      removeNewLinesAndCommas.on('end', () => {
        expect(output).to.equal(csvOutput);
        return done();
      });
      input.pipe(removeNewLinesAndCommas);
    });
  });
});
