const { randomBytes } = require('crypto');

const RANDOM_BYTES = 12;
const generateRandomValue = () => randomBytes(RANDOM_BYTES).toString('hex');

module.exports = {
  COMMA_REPLACEMENT_VALUE: generateRandomValue(),
  NEWLINE_REPLACEMENT_VALUE: generateRandomValue(),
  QUOTE_REPLACEMENT_VALUE: generateRandomValue(),
  COMMA_REPLACEMENT_VALUE_IN_QUOTES: generateRandomValue(),
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES: generateRandomValue(),
  REPLACEMENT_VALUE_LENGTH: RANDOM_BYTES * 2,
  ERROR_TYPES: {
    missingRequiredHeader: 'Missing required field in headers',
    missingRequiredRowValue: 'Missing required field in row',
    incorrectValueType: 'Field has incorrect type',
  },
};
