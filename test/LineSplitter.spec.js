const { expect } = require('chai');
const { Writable } = require('stream');
const { resolve } = require('path');
const { createReadStream } = require('fs');
const { LineSplitter } = require('../src/LineSplitter');

describe('LineSplitter', () => {
  describe('entire class', () => {
    it('should split stream into correct number of lines', (done) => {
      let count = 0;
      const outputArr = [];
      const input = createReadStream(resolve(__dirname, './csv/5000_lines.csv'));
      const output = new Writable({
        write(_chunk, _encoding, cb) {
          count += 1;
          outputArr.push(_chunk.toString());
          return cb();
        },
      });
      output.on('finish', () => {
        expect(count).to.equal(5000);
        expect(outputArr[outputArr.length - 1]).to.equal('LAST_LINE,LAST_LINE,LAST_LINE');
        return done();
      });
      input.pipe(new LineSplitter()).pipe(output);
    });
  });
  describe('LineSplitter.prototype._transform', () => {
    it('should split a buffer into lines in string format, omitting last line', () => {
      const strings = [];
      const input = 'lineOne\nlineTwo\nlineThree';
      const lineSplitter = new LineSplitter();
      lineSplitter.push = (chunk) => {
        strings.push(chunk);
      };
      // eslint-disable-next-line
      lineSplitter._transform(Buffer.from(input), null, () => {
        expect(strings).to.deep.equal(['lineOne', 'lineTwo']);
      });
    });
  });
  describe('LineSplitter.prototype._flush', () => {
    it('should push lineSplitter._leftover to the output', () => {
      const strings = [];
      const lineSplitter = new LineSplitter();
      lineSplitter.push = (chunk) => {
        strings.push(chunk);
      };
      const leftover = 'last_line';
      // eslint-disable-next-line
      lineSplitter._leftover = leftover;
      // eslint-disable-next-line
      lineSplitter._flush(() => {
        expect(strings).to.deep.equal([leftover]);
      });
    });
  });
});
