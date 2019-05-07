const { expect } = require('chai');
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

describe('RemoveNewLinesAndCommas', () => {
  describe('augmentQuoteIndicesMapper', () => {
    it('adds the replacement value length times the match length to every index bigger than the offset', () => {
      const indexArr = [1, 2, 3, 4, 5, 6];
      const matchOffset = 4;
      const matchLength = 2;
      expect(indexArr.map(augmentQuoteIndicesMapper(matchOffset, matchLength)))
        .to.deep.equal([1, 2, 3, 4, 5 + (matchLength * L), 6 + (matchLength * L)]);
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
});
