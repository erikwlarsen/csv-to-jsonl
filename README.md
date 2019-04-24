# csv-to-jsonl
small csv to json-lines parser with no dependencies

## CSV format
CSV files should follow the [RFC 4180 CSV spec](https://tools.ietf.org/html/rfc4180#section-2). Make sure the first line of your CSV file is your headers. Any header fields that will be nested should include the full object path delimited by periods. For example, this CSV:
```csv
prop1,nest1.nest2.prop2,nest1.prop3
value1,value2,value3
```
will beget:
```json
{
  "prop1": "value1",
  "nest1": {
    "nest2": {
      "prop2": "value2"
    },
    "prop3": "value3"
  }
}
```

## Run as a shell script
install globally:
```
npm install -g csv-2-jsonl
```
run script with input file and optional output file path:
```
csv2jsonl path/to/csv [output/filepath]
```

## Use in your Node application
install locally:
```
npm install -s csv-2-jsonl
```
require into your Node file:
```javascript
const csvToJsonl = require('csv-2-jsonl');
const { createReadStream, createWriteStream } = require('fs');

const readable = createReadStream('/Users/gabriel/macondo_residents.csv');
const writable = createWriteStream('/Users/gabriel/macondo_residents.jsonl');
csvToJsonl({ inputStream: readable, outputStream: writable });
```
The exported function also returns a readable stream, so you do not need to supply your own output stream and can instead pipe directly from the returned value:
```javascript
const readable = createReadStream('/Users/toni/macon_dead_holdings.csv');
csvToJsonl({ inputStream: readable })
  .pipe(someOtherTransformStream)
  .pipe(someOtherWritableStream);
```
Alternatively, the exported function can return a promise if the `returnPromise` flag is enabled. Note that this flag has no effect if no `outputStream` argument is supplied.
```javascript
csvToJsonl({
  inputStream: readable,
  outputStream: writable,
  returnPromise: true,
})
  .then(() => console.log('done converting!'));
```

### Validation
You may optionally pass in field validation using the `validation` property. This property should consist of an object with header names as keys (make sure they match the headers in your CSV file) and an object with `required` and `type` properties as values. Set `required` as `true` to indicate that the field is required, and restrict the value to a certain JavaScript type with the `type` property. Currently the only supported type values are `'string', 'number', 'boolean'`.

Validation errors are accumulated as the CSV-to-JSONL stream is processed. If any validation errors are found, they will all be logged once the stream is concluded, and then an error will be thrown. If you want to see validation error logs but do not want to stop the stream, pass in a `doNotThrow` property.

Example validation:
```javascript
const validation = {
  prop1: {
    required: true,
    type: 'string'
  },
  prop2: {
    type: 'number'
  }
}
csvToJsonl({
  inputStream: readable,
  outputStream: writable,
  validation,
  doNotThrow: true,
});
```

You can also pass in your own validation function with the `validateFunc` property. This function is called after parsing and will be passed each line in JavaScript object form. (This object will be nested if your CSV headers include any nested fields.) It has access to the `CsvToJsonLines.prototype.createValidationError` method, which can be used to record errors that will be logged with the rest of the validation error output at the end of the stream. This method accepts `errorType` and `field` parameters.
```javascript
csvToJsonl({
  inputStream: readable,
  outputStream: writable,
  validation,
  validateFunc(rowObj) {
    const allowedColors = new Set(['red', 'green', 'blue']);
    const { color } = rowObj;
    if (!allowedColors.has(color)) {
      this.createValidationError({
        errorType: `Non-enumerated value ${color}`,
        field: 'color'
      });
    }
  },
});
```

Happy parsing!
