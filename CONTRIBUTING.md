# Contributing to GT48

Thank you for your interest in contributing to GT48! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 18.17.0 or higher
- npm 6.0.0 or higher
- Git

### Getting Started

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/gt48.git
   cd gt48
   ```

2. **Run tests to ensure everything works**
   ```bash
   npm test
   ```

4. **Run benchmarks to establish baseline**
   ```bash
   node benchmark/benchmark.js
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards below
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run all tests
   npm test
   
   # Run specific test file
   npm test -- --grep "your test pattern"
   
   # Run benchmarks
   node benchmark/benchmark.js
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: add microsecond precision support
fix: handle timestamp overflow correctly
docs: update API documentation
perf: optimize Base64URL encoding
```

## Coding Standards

### JavaScript Style

- Use ES2020+ features
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`
- Use template literals for string interpolation

### Performance Guidelines

1. **Zero-allocation principle**: Avoid creating unnecessary objects
2. **Bitwise operations**: Use bitwise ops for mathematical calculations
3. **Lookup tables**: Pre-compute values when possible
4. **Minimal branching**: Reduce conditional statements in hot paths
5. **Benchmark everything**: Measure performance impact of changes

### Code Examples

**Good:**
```javascript
// Fast bitwise operation
const result = (value >>> 12) & 0xFFF;

// Pre-computed lookup table
const LOOKUP_TABLE = new Array(64);
for (let i = 0; i < 64; i++) {
  LOOKUP_TABLE[i] = BASE64URL_CHARS[i];
}
```

**Avoid:**
```javascript
// Slow mathematical operation
const result = Math.floor(value / 4096) % 4096;

// Runtime string operations
const char = BASE64URL_CHARS.charAt(index);
```

## Testing Guidelines

### Test Structure

- Use descriptive test names
- Group related tests with `describe` blocks
- Test both success and error cases
- Include performance tests for critical paths

### Test Categories

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test component interactions
3. **Performance Tests**: Verify speed requirements
4. **Edge Case Tests**: Test boundary conditions

### Writing Tests

```javascript
describe('generateTimestamp48', () => {
  it('should generate unique timestamps', () => {
    const timestamps = new Set();
    for (let i = 0; i < 1000; i++) {
      timestamps.add(generateTimestamp48());
    }
    expect(timestamps.size).toBe(1000);
  });
  
  it('should maintain monotonicity', () => {
    const timestamps = [];
    for (let i = 0; i < 100; i++) {
      timestamps.push(generateTimestamp48());
    }
    
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
    }
  });
});
```

### Performance Testing

```javascript
it('should generate timestamps efficiently', () => {
  const start = process.hrtime.bigint();
  
  for (let i = 0; i < 10000; i++) {
    generateTimestamp48();
  }
  
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1000000; // Convert to ms
  
  // Should generate 10k timestamps in under 100ms
  expect(duration).toBeLessThan(100);
});
```

## Documentation

### API Documentation

- Use JSDoc for all public functions
- Include parameter types and descriptions
- Provide usage examples
- Document error conditions

```javascript
/**
 * Generates a 48-bit timestamp with optional configuration.
 * 
 * @param {Object} [options] - Configuration options
 * @param {string} [options.precision='microsecond'] - Timestamp precision
 * @param {boolean} [options.monotonic=true] - Ensure monotonic ordering
 * @param {string} [options.format='number'] - Output format
 * @returns {number|string} Generated timestamp
 * @throws {TimestampOverflowError} When 48-bit limit is exceeded
 * 
 * @example
 * // Generate basic timestamp
 * const ts = generateTimestamp48();
 * 
 * @example
 * // Generate with custom options
 * const ts = generateTimestamp48({
 *   precision: 'millisecond',
 *   format: 'base64url'
 * });
 */
function generateTimestamp48(options = {}) {
  // Implementation
}
```

### README Updates

- Update examples when adding new features
- Keep performance metrics current
- Add new API methods to reference section
- Update compatibility information

## Performance Requirements

### Benchmarks

All changes must maintain or improve these benchmarks:

- **Throughput**: ≥250,000 operations/second
- **Uniqueness**: 100% under rapid generation
- **Monotonicity**: 100% ordering guarantee
- **Memory**: <200 bytes per generator instance

### Measuring Performance

```bash
# Run full benchmark suite
node benchmark/benchmark.js

# Quick performance check
node -e "
const { generateTimestamp48 } = require('./src/timestamp.js');
const start = process.hrtime.bigint();
for (let i = 0; i < 100000; i++) generateTimestamp48();
const end = process.hrtime.bigint();
console.log('Ops/sec:', Math.round(100000 / (Number(end - start) / 1e9)));
"
```

## Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking API changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

1. **Update version in package.json**
2. **Update CHANGELOG.md**
3. **Run full test suite**
4. **Run benchmarks and verify performance**
5. **Update documentation**
6. **Create release tag**
7. **Publish to npm**

## Issue Reporting

### Bug Reports

Include:
- Node.js version
- Operating system
- Minimal reproduction case
- Expected vs actual behavior
- Performance impact (if applicable)

### Feature Requests

Include:
- Use case description
- Proposed API design
- Performance considerations
- Backward compatibility impact

## Code Review

### Review Criteria

1. **Functionality**: Does it work as intended?
2. **Performance**: Does it meet performance requirements?
3. **Tests**: Are there adequate tests?
4. **Documentation**: Is it properly documented?
5. **Style**: Does it follow coding standards?
6. **Compatibility**: Does it maintain backward compatibility?

### Review Process

1. **Automated checks**: CI must pass
2. **Manual review**: At least one maintainer approval
3. **Performance validation**: Benchmark results reviewed
4. **Documentation review**: Ensure docs are updated

## Getting Help

- **Issues**: Create GitHub issue for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact maintainers for security issues

## License

By contributing to GT48, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GT48! 🚀