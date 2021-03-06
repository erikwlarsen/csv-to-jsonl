const { RemoveExtraQuotes } = require('./src/RemoveExtraQuotes');
const { RemoveNewLinesAndCommas } = require('./src/RemoveNewLinesAndCommas');
const { LineSplitter } = require('./src/LineSplitter');
const { CsvToJsonlines } = require('./src/CsvToJsonlines');
const { duckTypeReadable, duckTypeWritable, promiseWrap } = require('./src/utils');

module.exports = ({
  inputStream, outputStream, returnPromise, validation, validateFunc, doNotThrow,
} = {}) => {
  if (!inputStream) {
    throw new Error('inputStream argument is required');
  }
  if (!duckTypeReadable(inputStream)) {
    throw new Error('inputStream is not a readable stream or is missing required readable stream methods');
  }
  const csvToJsonlines = new CsvToJsonlines({ validation, validateFunc, doNotThrow });
  if (!outputStream) {
    inputStream
      .pipe(new RemoveExtraQuotes())
      .pipe(new RemoveNewLinesAndCommas())
      .pipe(new LineSplitter())
      .pipe(csvToJsonlines);
    return csvToJsonlines;
  }
  if (!duckTypeWritable(outputStream)) {
    throw new Error('outputStream is not a writable stream or is missing required writable stream methods');
  }
  inputStream
    .pipe(new RemoveExtraQuotes())
    .pipe(new RemoveNewLinesAndCommas())
    .pipe(new LineSplitter())
    .pipe(new CsvToJsonlines())
    .pipe(outputStream);
  return returnPromise ? promiseWrap(outputStream) : csvToJsonlines;
};
