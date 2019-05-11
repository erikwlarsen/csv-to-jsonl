const { expect } = require('chai');
const { Writable } = require('stream');
const { RemoveExtraQuotes } = require('../src/RemoveExtraQuotes');
const { QUOTE_REPLACEMENT_VALUE: Q } = require('../src/constants');

const getStreamOutput = (...inputs) => new Promise((resolve) => {
  const removeExtraQuotes = new RemoveExtraQuotes();
  let output = '';
  const writable = new Writable({
    write(chunk, _encoding, done) {
      output = output.concat(chunk.toString());
      return done();
    },
  });
  writable.on('finish', () => {
    resolve(output);
  });
  removeExtraQuotes.pipe(writable);
  inputs.forEach(input => removeExtraQuotes.write(input));
  removeExtraQuotes.end();
});

describe('RemoveExtraQuotes', () => {
  describe('entire class', () => {
    it('should turn quotes into one quote followed by replacement value', async () => {
      expect(await getStreamOutput('""')).to.equal(`"${Q}`);
    });
    it('should handle more than two quotes in a row', async () => {
      const input = '""cool""beans""cool"""bean""s""""';
      const output = await getStreamOutput(input);
      expect(output).to.equal(`"${Q}cool"${Q}beans"${Q}cool"${Q}"bean"${Q}s"${Q}"${Q}`);
    });
    it('should handle two quotes split into different chunks', async () => {
      const [input1, input2] = ['"bar"', '"car"'];
      const output = await getStreamOutput(input1, input2);
      expect(output).to.equal(`"bar"${Q}car"`);
    });
  });
});
