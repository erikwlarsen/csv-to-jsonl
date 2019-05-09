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

const isLastIndex = (arr, idx) => idx === arr.length - 1;

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
    return new Promise((resolve, reject) => {
      outputStream.on('finish', () => {
        resolve();
      });
      outputStream.on('error', (error) => {
        reject(error);
      });
    });
  },
  getObjectValue(prop, obj) {
    const objPath = prop.split('.');
    return objPath.reduce((pointer, key) => (pointer ? pointer[key] : null), obj);
  },
  isUndefinedOrNull(value) {
    return typeof value === 'undefined' || value === null;
  },
  assignPropertyToObject(obj, prop, value) {
    const objPath = prop.split('.');
    let pointer = obj;
    objPath.forEach((key, idx) => {
      if (isLastIndex(objPath, idx)) {
        pointer[key] = value;
      } else {
        if (Object.hasOwnProperty.call(pointer, key) && typeof pointer[key] !== 'object') {
          throw new Error('Error parsing header property paths. You may be trying to nest properties on a non-object value');
        }
        pointer[key] = pointer[key] || {};
        pointer = pointer[key];
      }
    });
  },
  isLastIndex,
};
