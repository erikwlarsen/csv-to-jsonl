#!/usr/bin/env node

const { createReadStream, createWriteStream, existsSync } = require('fs');
const { resolve } = require('path');
const { RemoveExtraQuotes } = require('../src/RemoveExtraQuotes');
const { RemoveNewLinesAndCommas } = require('../src/RemoveNewLinesAndCommas');
const { LineSplitter } = require('../src/LineSplitter');
const { CsvToJsonlines } = require('../src/CsvToJsonLines');

const [,, inputPath, outputPath] = process.argv;
if (!inputPath) {
  throw new Error('No input file path supplied');
}

const absInputPath = resolve(process.argv[2]);
if (!absInputPath || !/\.csv$/.test(absInputPath) || !existsSync(absInputPath)) {
  throw new Error('Invalid csv file path argument');
}

const absOutputPath = outputPath
  ? resolve(outputPath)
  : absInputPath.slice(0, absInputPath.length - 3).concat('jsonl');

createReadStream(absInputPath)
  .pipe(new RemoveExtraQuotes())
  .pipe(new RemoveNewLinesAndCommas())
  .pipe(new LineSplitter())
  .pipe(new CsvToJsonlines())
  .pipe(createWriteStream(absOutputPath));
