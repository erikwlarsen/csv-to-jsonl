module.exports = {
  convertToNumberIfNeeded(value) {
    return (
      Number.isNaN(Number(value))
      || Number.isNaN(parseInt(value, 10)) ? value : Number(value)
    );
  },
};
