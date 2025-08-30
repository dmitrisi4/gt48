# GT48 Quick Start Guide

Get up and running with GT48 in under 5 minutes!

## Basic Usage

### 1. Simple Timestamp Generation

```javascript
const { generateTimestamp48 } = require('gt48');

// Generate a timestamp
const timestamp = generateTimestamp48();
console.log(timestamp); // 281474976710656
```

### 2. Different Output Formats

```javascript
const { generateTimestamp48 } = require('gt48');

// Number format (default)
const numTs = generateTimestamp48();
console.log(numTs); // 281474976710656

// Base64URL format
const b64Ts = generateTimestamp48({ format: 'base64url' });
console.log(b64Ts); // "AQAAAAAAAAAA"

// Hexadecimal format
const hexTs = generateTimestamp48({ format: 'hex' });
console.log(hexTs); // "1000000000000"
```

### 3. High-Performance Generation

```javascript
const { TimestampGenerator } = require('gt48');

// Create a generator for high-frequency use
const generator = new TimestampGenerator({
  precision: 'microsecond',
  monotonic: true,
  format: 'number'
});

// Generate multiple timestamps rapidly
for (let i = 0; i < 1000; i++) {
  const timestamp = generator.generate();
  console.log(timestamp);
}
```

### 4. Working with Dates

```javascript
const { generateTimestamp48, timestampToDate } = require('gt48');

// Generate timestamp and convert to Date
const timestamp = generateTimestamp48();
const date = timestampToDate(timestamp);

console.log('Timestamp:', timestamp);
console.log('Date:', date.toISOString());
console.log('Unix time:', date.getTime());
```

### 5. Validation

```javascript
const { validateTimestamp48 } = require('gt48');

// Validate timestamps
const valid = validateTimestamp48(281474976710656);
console.log(valid); // true

const invalid = validateTimestamp48(-1);
console.log(invalid); // false
```

## Common Use Cases

### Database Primary Keys

```javascript
const { generateTimestamp48 } = require('gt48');

// Generate sortable, unique primary keys
const userId = generateTimestamp48();
const user = {
  id: userId,
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date()
};
```

### Distributed System IDs

```javascript
const { TimestampGenerator } = require('gt48');

// Create generator for each service instance
const generator = new TimestampGenerator({
  format: 'base64url'
});

// Generate unique request IDs
const requestId = generator.generate();
const logEntry = {
  id: requestId,
  service: 'api-server',
  message: 'Request processed',
  timestamp: new Date().toISOString()
};
```

### Event Ordering

```javascript
const { generateTimestamp48 } = require('gt48');

// Generate chronologically ordered event IDs
const events = [];
for (let i = 0; i < 10; i++) {
  events.push({
    id: generateTimestamp48(),
    type: 'UserAction',
    data: { action: `action_${i}` }
  });
}

// Events are automatically ordered by ID
events.sort((a, b) => a.id - b.id);
```

## Testing Your Setup

### 1. Run Basic Test

```javascript
// test-gt48.js
const { generateTimestamp48, TimestampGenerator } = require('gt48');

console.log('Testing GT48...');

// Test basic generation
const ts1 = generateTimestamp48();
const ts2 = generateTimestamp48();
console.log('Generated timestamps:', ts1, ts2);
console.log('Monotonic:', ts2 > ts1);

// Test uniqueness
const timestamps = new Set();
for (let i = 0; i < 1000; i++) {
  timestamps.add(generateTimestamp48());
}
console.log('Uniqueness test:', timestamps.size === 1000 ? 'PASS' : 'FAIL');

// Test performance
const start = Date.now();
for (let i = 0; i < 10000; i++) {
  generateTimestamp48();
}
const duration = Date.now() - start;
console.log(`Performance: ${Math.round(10000 / duration * 1000)} ops/sec`);

console.log('GT48 is working correctly!');
```

```bash
node test-gt48.js
```

### 2. Run Official Tests

```bash
# Run the full test suite
npm test

# Run performance benchmarks
npm run benchmark
```

## Configuration Options

### Precision

```javascript
// Microsecond precision (default)
const microTs = generateTimestamp48({ precision: 'microsecond' });

// Millisecond precision
const milliTs = generateTimestamp48({ precision: 'millisecond' });
```

### Monotonic Ordering

```javascript
// Monotonic enabled (default)
const monotonic = generateTimestamp48({ monotonic: true });

// Monotonic disabled (faster, but no ordering guarantee)
const nonMonotonic = generateTimestamp48({ monotonic: false });
```

### Output Formats

```javascript
// Available formats
const formats = ['number', 'base64url', 'hex'];

formats.forEach(format => {
  const ts = generateTimestamp48({ format });
  console.log(`${format}:`, ts);
});
```

## Performance Tips

### 1. Use TimestampGenerator for High Frequency

```javascript
// Good for high-frequency generation
const generator = new TimestampGenerator();
for (let i = 0; i < 100000; i++) {
  generator.generate();
}
```

### 2. Choose Appropriate Precision

```javascript
// Use millisecond precision if microsecond isn't needed
const fastTs = generateTimestamp48({ precision: 'millisecond' });
```

### 3. Disable Monotonic for Maximum Speed

```javascript
// Only if ordering isn't critical
const fastestTs = generateTimestamp48({ monotonic: false });
```

## Troubleshooting

### Common Issues

1. **"Invalid timestamp" errors**
   - Check that you're passing valid numbers to validation functions
   - Ensure timestamps are within the 48-bit range

2. **Performance slower than expected**
   - Use `TimestampGenerator` class for repeated generation
   - Consider disabling monotonic ordering if not needed
   - Use millisecond precision if microsecond isn't required

3. **Timestamps not unique**
   - Ensure monotonic ordering is enabled
   - Check system clock stability
   - Verify you're not hitting the sequence counter limit

### Getting Help

- Check the [full documentation](README.md)
- Review [examples and use cases](README.md#usage-examples)
- Report issues on [GitHub](https://github.com/gt48/gt48/issues)

## Next Steps

- Read the [complete API documentation](README.md#api-reference)
- Explore [advanced usage examples](README.md#usage-examples)
- Check out [performance benchmarks](README.md#performance)
- Learn about [contributing](CONTRIBUTING.md)

---

**You're ready to use GT48!** 🚀

For more detailed information, see the [full README](README.md).