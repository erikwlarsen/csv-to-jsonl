const { expect } = require('chai');
const { Readable, Writable } = require('stream');
const {
  convertToNumber,
  convertToBooleanOrNull,
  duckTypeReadable,
  duckTypeWritable,
  promiseWrap,
  getObjectValue,
  isUndefinedOrNull,
  assignPropertyToObject,
} = require('../src/utils');

function noop() {}

describe('utils', () => {
  describe('convertToNumber', () => {
    it('should return a number for numbers', () => {
      expect(convertToNumber(7)).to.equal(7);
    });
    it('should return a number for valid strings', () => {
      expect(convertToNumber('5')).to.equal(5);
      expect(convertToNumber('3.145868')).to.equal(3.145868);
    });
    it('should return the original value for non-numbers', () => {
      const obj = {};
      expect(convertToNumber(obj)).to.equal(obj);
      expect(convertToNumber('twenty')).to.equal('twenty');
      expect(convertToNumber(null)).to.equal(null);
    });
  });

  describe('convertToBooleanOrNull', () => {
    it('should convert string null values to null', () => {
      expect(convertToBooleanOrNull('null')).to.equal(null);
      expect(convertToBooleanOrNull('Null')).to.equal(null);
      expect(convertToBooleanOrNull('NULL')).to.equal(null);
    });
    it('should convert string values to booleans', () => {
      expect(convertToBooleanOrNull('true')).to.equal(true);
      expect(convertToBooleanOrNull('True')).to.equal(true);
      expect(convertToBooleanOrNull('TRUE')).to.equal(true);
      expect(convertToBooleanOrNull('false')).to.equal(false);
      expect(convertToBooleanOrNull('False')).to.equal(false);
      expect(convertToBooleanOrNull('FALSE')).to.equal(false);
    });
    it('should leave other values as is', () => {
      expect(convertToBooleanOrNull('blob')).to.equal('blob');
      expect(convertToBooleanOrNull(0)).to.equal(0);
      expect(convertToBooleanOrNull(undefined)).to.equal(undefined);
    });
  });

  describe('duckTypeReadable', () => {
    it('should identify builtin Readable streams', () => {
      expect(duckTypeReadable(new Readable())).to.equal(true);
    });
    it('should return false for non-streams', () => {
      expect(duckTypeReadable({})).to.equal(false);
    });
    it('should return true for objects with on, read, and pipe methods', () => {
      expect(duckTypeReadable({
        on: noop, read: noop, pipe: noop,
      })).to.equal(true);
    });
  });

  describe('duckTypeWritable', () => {
    it('should identify builtin Readable streams', () => {
      expect(duckTypeWritable(new Writable())).to.equal(true);
    });
    it('should return false for non-streams', () => {
      expect(duckTypeWritable({})).to.equal(false);
    });
    it('should return true for objects with on, and write methods', () => {
      expect(duckTypeWritable({
        on: noop, write: noop,
      })).to.equal(true);
    });
  });

  describe('promiseWrap', () => {
    it('should return a promise', () => {
      const result = promiseWrap(new Writable());
      expect(result instanceof Promise).to.equal(true);
    });
    it('should reject on stream errors', () => {
      const errorText = 'reject me';
      const writable = new Writable();
      const promise = promiseWrap(writable);
      promise.catch(err => expect(err.message).to.equal(errorText));
      writable.emit('error', new Error(errorText));
    });
    it('should resolve with no arguments on stream completion', () => {
      const writable = new Writable();
      const promise = promiseWrap(writable);
      promise.then(param => expect(param).to.equal(undefined));
      writable.emit('finish');
    });
  });

  describe('getObjectValue', () => {
    const obj = {
      a: 1,
      b: {
        c: {
          d: 2,
        },
      },
    };
    it('should get value for root level property', () => {
      expect(getObjectValue('a', obj)).to.equal(1);
    });
    it('should get value for nested property', () => {
      expect(getObjectValue('b.c.d', obj)).to.equal(2);
    });
  });

  describe('isUndefinedOrNull', () => {
    it('should return true for undefined', () => {
      expect(isUndefinedOrNull(undefined)).to.equal(true);
    });
    it('should return true for null', () => {
      expect(isUndefinedOrNull(null)).to.equal(true);
    });
    it('should return false for other values', () => {
      expect(isUndefinedOrNull(0)).to.equal(false);
      expect(isUndefinedOrNull('')).to.equal(false);
      expect(isUndefinedOrNull({})).to.equal(false);
    });
  });

  describe('assignPropertyToObject', () => {
    it('should assign root level property', () => {
      const obj = {};
      assignPropertyToObject(obj, 'a', 1);
      expect(obj).to.haveOwnProperty('a', 1);
    });
    it('should assign nested property', () => {
      const obj = {};
      assignPropertyToObject(obj, 'a.b.c.d', 0);
      expect(obj.a.b.c).to.haveOwnProperty('d', 0);
    });
    it('should throw error for conflicting properties', () => {
      const obj = { a: 1 };
      expect(() => assignPropertyToObject(obj, 'a.b', 1)).to.throw(
        Error,
        'Error parsing header property paths. You may be trying to nest properties on a non-object value',
      );
    });
  });
});
