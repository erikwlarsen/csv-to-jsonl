const { RemoveNewLinesAndCommas } = require('./src/RemoveNewLinesAndCommas');
const { LineSplitter } = require('./src/LineSplitter');
const { CsvToJsonlines } = require('./src/CsvToJsonLines');
const { duckTypeReadable, duckTypeWritable, promiseWrap } = require('./src/utils');

module.exports = ({ inputStream, outputStream, returnPromise } = {}) => {
  if (!inputStream) {
    throw new Error('inputStream argument is required');
  }
  if (!duckTypeReadable(inputStream)) {
    throw new Error('inputStream is not a readable stream or is missing required readable stream methods');
  }
  const csvToJsonlines = new CsvToJsonlines();
  if (!outputStream) {
    inputStream
      .pipe(new RemoveNewLinesAndCommas())
      .pipe(new LineSplitter())
      .pipe(csvToJsonlines);
    return csvToJsonlines;
  }
  if (!duckTypeWritable(outputStream)) {
    throw new Error('outputStream is not a writable stream or is missing required writable stream methods');
  }
  inputStream
    .pipe(new RemoveNewLinesAndCommas())
    .pipe(new LineSplitter())
    .pipe(new CsvToJsonlines())
    .pipe(outputStream);
  return returnPromise ? promiseWrap(outputStream) : csvToJsonlines;
};
