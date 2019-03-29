const { createReadStream, createWriteStream, existsSync } = require('fs');
const { resolve } = require('path');
const { RemoveNewLinesAndCommas } = require('./src/RemoveNewLinesAndCommas');
const { LineSplitter } = require('./src/LineSplitter');
const { CsvToJsonlines } = require('./src/CsvToJsonLines');

const inputPath = resolve(__dirname, process.argv[2]);
if (!inputPath || !/\.csv$/.test(inputPath) || !existsSync(inputPath)) {
  throw new Error('invalid csv file path argument');
}
const outputPath = inputPath.slice(0, inputPath.length - 3).concat('jsonl');

createReadStream(inputPath)
  .pipe(new RemoveNewLinesAndCommas())
  .pipe(new LineSplitter())
  .pipe(new CsvToJsonlines())
  .pipe(createWriteStream(outputPath));
