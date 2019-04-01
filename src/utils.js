const boolNullMap = {
  true: true,
  false: false,
  TRUE: true,
  FALSE: false,
  True: true,
  False: false,
  null: null,
  NULL: null,
  Null: null,
};

const duckTypeStream = stream => typeof stream.on === 'function';

module.exports = {
  convertToNumber(value) {
    return (
      Number.isNaN(Number(value))
      || Number.isNaN(parseInt(value, 10)) ? value : Number(value)
    );
  },
  convertToBooleanOrNull(value) {
    return value in boolNullMap ? boolNullMap[value] : value;
  },
  duckTypeReadable(readable) {
    return duckTypeStream(readable) && typeof readable.read === 'function' && typeof readable.pipe === 'function';
  },
  duckTypeWritable(writable) {
    return duckTypeStream(writable) && typeof writable.write === 'function';
  },
  promiseWrap(outputStream) {
    return new Promise((resolve) => {
      outputStream.on('finish', () => {
        resolve();
      });
    });
  },
};
