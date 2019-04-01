const { RemoveNewLinesAndCommas } = require('./src/RemoveNewLinesAndCommas');
const { LineSplitter } = require('./src/LineSplitter');
const { CsvToJsonlines } = require('./src/CsvToJsonLines');
const { duckTypeReadable, duckTypeWritable } = require('./src/utils');

module.exports = (inputStream, outputStream) => {
  if (!duckTypeReadable(inputStream)) {
    throw new Error('Input is not readable stream or is missing required readable stream methods');
  }
  if (!duckTypeWritable(outputStream)) {
    throw new Error('Output is not readable stream or is missing required readable stream methods');
  }
  inputStream
    .pipe(new RemoveNewLinesAndCommas())
    .pipe(new LineSplitter())
    .pipe(new CsvToJsonlines())
    .pipe(outputStream);
};
