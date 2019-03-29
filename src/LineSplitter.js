const { Transform } = require('stream');

class LineSplitter extends Transform {
  _transform(chunk, _encoding, done) {
    let chunkStr = chunk.toString();
    if (this._leftover) {
      chunkStr = this._leftover.concat(chunkStr);
    }
    const lines = chunkStr.split('\n');
    [this._leftover] = lines.splice(lines.length - 1, 1);
    lines.forEach(this.push.bind(this));
    return done();
  }

  _flush(done) {
    if (this._leftover) {
      this.push(this._leftover);
    }
    return done();
  }
}

module.exports = { LineSplitter };
