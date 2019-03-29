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
};
