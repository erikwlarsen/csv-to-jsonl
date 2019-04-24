const COMMA_REPLACEMENT_VALUE = '\u00b6'; // ¶
const NEWLINE_REPLACEMENT_VALUE = '\u00a7'; // §

module.exports = {
  COMMA_REPLACEMENT_VALUE,
  NEWLINE_REPLACEMENT_VALUE,
  COMMA_REPLACEMENT_VALUE_IN_QUOTES: '\u00b7',
  NEWLINE_REPLACEMENT_VALUE_IN_QUOTES: '\u00b8',
  FORBIDDEN_CHARACTERS: new Set([COMMA_REPLACEMENT_VALUE, NEWLINE_REPLACEMENT_VALUE]),
  ERROR_TYPES: {
    missingRequiredHeader: 'Missing required field in headers',
    missingRequiredRowValue: 'Missing required field in row',
    incorrectValueType: 'Field has incorrect type',
  },
};
