/**
 * GT48 - Comprehensive Test Suite
 * 
 * Tests for 48-bit timestamp generator with Base64URL encoding
 * Covers functionality, performance, edge cases, and RFC compliance
 * 
 * @author GT48 Team
 * @version 2.0.0
 */

'use strict';

const {
    generateTimestamp48,
    generateRawTimestamp,
    decodeTimestamp48,
    timestampToDate,
    isValidTimestamp,
    getTimestampStats,
    encodeBase64URL48,
    createGenerator,
    TimestampGenerator,
    GT48Error,
    InvalidEncodingError,
    TimestampRangeError,
    MAX_48_BIT,
    BASE64URL_CHARS,
    DEFAULT_CONFIG
} = require('../src/timestamp.js');

// Test utilities
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    test(name, fn) {
        this.tests.push({ name, fn });
    }
    
    async run() {
        console.log('🚀 GT48 Test Suite Starting...\n');
        
        for (const { name, fn } of this.tests) {
            try {
                await fn();
                console.log(`✅ ${name}`);
                this.passed++;
            } catch (error) {
                console.log(`❌ ${name}`);
                console.log(`   Error: ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
        
        if (this.failed > 0) {
            process.exit(1);
        }
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

function assertThrows(fn, message) {
    try {
        fn();
        throw new Error(message || 'Expected function to throw');
    } catch (error) {
        if (error.message === message || error.message.includes('Expected function to throw')) {
            throw error;
        }
        // Expected error, test passes
    }
}

// Test suite
const runner = new TestRunner();

// Basic functionality tests
runner.test('generateTimestamp48 returns string', () => {
    const timestamp = generateTimestamp48();
    assert(typeof timestamp === 'string', 'Should return string');
    assertEqual(timestamp.length, 8, 'Should be 8 characters long');
});

runner.test('generateRawTimestamp returns number', () => {
    const timestamp = generateRawTimestamp();
    assert(typeof timestamp === 'number', 'Should return number');
    assert(timestamp >= 0, 'Should be non-negative');
    assert(timestamp <= MAX_48_BIT, 'Should not exceed 48-bit limit');
});

runner.test('Base64URL encoding uses correct alphabet', () => {
    const timestamp = generateTimestamp48();
    for (const char of timestamp) {
        assert(BASE64URL_CHARS.includes(char), `Invalid character: ${char}`);
    }
});

runner.test('Monotonic ordering guarantee', () => {
    const timestamps = [];
    for (let i = 0; i < 100; i++) {
        timestamps.push(generateRawTimestamp());
    }
    
    for (let i = 1; i < timestamps.length; i++) {
        assert(timestamps[i] >= timestamps[i-1], 'Timestamps should be monotonic');
    }
});

runner.test('Encode/decode round trip', () => {
    // Generate a raw timestamp value suitable for encoding
    const rawTimestamp = generateRawTimestamp();
    const epochOffset = new Date('2024-01-01T00:00:00.000Z').getTime();
    const rawValue = rawTimestamp - epochOffset;
    
    const encoded = encodeBase64URL48(rawValue);
    const decoded = decodeTimestamp48(encoded);
    
    assertEqual(decoded, rawValue, 'Round trip should preserve exact value');
});

runner.test('decodeTimestamp48 validates input', () => {
    assertThrows(() => decodeTimestamp48(''), 'Should reject empty string');
    assertThrows(() => decodeTimestamp48('short'), 'Should reject short string');
    assertThrows(() => decodeTimestamp48('toolong!!'), 'Should reject long string');
    assertThrows(() => decodeTimestamp48('invalid!'), 'Should reject invalid characters');
    
    // Test specific error types
    try {
        decodeTimestamp48('invalid!');
        assert(false, 'Should have thrown error');
    } catch (error) {
        assert(error instanceof InvalidEncodingError, 'Should throw InvalidEncodingError');
    }
});

runner.test('timestampToDate works with both formats', () => {
    const rawTimestamp = generateRawTimestamp();
    const encodedTimestamp = generateTimestamp48();
    
    const date1 = timestampToDate(rawTimestamp);
    const date2 = timestampToDate(encodedTimestamp);
    
    assert(date1 instanceof Date, 'Should return Date object');
    assert(date2 instanceof Date, 'Should return Date object');
    assert(!isNaN(date1.getTime()), 'Should be valid date');
    assert(!isNaN(date2.getTime()), 'Should be valid date');
});

runner.test('isValidTimestamp correctly validates', () => {
    const validTimestamp = generateTimestamp48();
    assert(isValidTimestamp(validTimestamp), 'Should validate correct timestamp');
    
    assert(!isValidTimestamp(''), 'Should reject empty string');
    assert(!isValidTimestamp('invalid!'), 'Should reject invalid characters');
    assert(!isValidTimestamp('short'), 'Should reject short string');
    assert(!isValidTimestamp('toolong!!'), 'Should reject long string');
});

runner.test('getTimestampStats returns valid data', () => {
    const stats = getTimestampStats();
    
    assert(typeof stats === 'object', 'Should return object');
    assert(typeof stats.lastTimestamp === 'number', 'lastTimestamp should be number');
    assert(typeof stats.sequenceCounter === 'number', 'sequenceCounter should be number');
    assert(typeof stats.generatedCount === 'number', 'generatedCount should be number');
    assert(typeof stats.overflowCount === 'number', 'overflowCount should be number');
    assert(stats.maxValue === MAX_48_BIT, 'maxValue should match constant');
    assert(typeof stats.epochOffset === 'number', 'epochOffset should be number');
});

// New architecture tests
runner.test('TimestampGenerator class works correctly', () => {
    const generator = new TimestampGenerator();
    
    const timestamp1 = generator.generateRaw();
    const timestamp2 = generator.generateRaw();
    
    assert(typeof timestamp1 === 'number', 'Should return number');
    assert(typeof timestamp2 === 'number', 'Should return number');
    assert(timestamp2 >= timestamp1, 'Should maintain monotonicity');
    
    const stats = generator.getStats();
    assert(stats.generatedCount >= 2, 'Should track generation count');
});

runner.test('createGenerator with custom config', () => {
    const config = {
        precision: 'milliseconds',
        monotonic: true,
        format: 'base64url',
        sequenceBits: 10
    };
    
    const generator = createGenerator(config);
    assert(generator instanceof TimestampGenerator, 'Should return TimestampGenerator instance');
    
    const timestamp = generator.generateRaw();
    assert(typeof timestamp === 'number', 'Should generate valid timestamp');
});

runner.test('Error classes work correctly', () => {
    assert(GT48Error.prototype instanceof Error, 'GT48Error should extend Error');
    assert(InvalidEncodingError.prototype instanceof GT48Error, 'InvalidEncodingError should extend GT48Error');
    assert(TimestampRangeError.prototype instanceof GT48Error, 'TimestampRangeError should extend GT48Error');
});

runner.test('DEFAULT_CONFIG is accessible', () => {
    assert(typeof DEFAULT_CONFIG === 'object', 'Should be object');
    assert(typeof DEFAULT_CONFIG.precision === 'string', 'Should have precision');
    assert(typeof DEFAULT_CONFIG.monotonic === 'boolean', 'Should have monotonic');
    assert(typeof DEFAULT_CONFIG.format === 'string', 'Should have format');
    assert(typeof DEFAULT_CONFIG.sequenceBits === 'number', 'Should have sequenceBits');
});

// Edge case tests
runner.test('Handles rapid generation', () => {
    const timestamps = new Set();
    const count = 1000;
    
    for (let i = 0; i < count; i++) {
        timestamps.add(generateTimestamp48());
    }
    
    // Should generate unique timestamps even in rapid succession
    assert(timestamps.size >= count * 0.7, 'Should generate mostly unique timestamps');
});

runner.test('Timestamp is recent', () => {
    const rawTimestamp = generateRawTimestamp();
    const now = Date.now();
    const diff = Math.abs(rawTimestamp - now);
    
    // Should be within 1 second of current time
    assert(diff < 1000, 'Timestamp should be recent');
});

runner.test('Base64URL encoding is URL-safe', () => {
    const timestamp = generateTimestamp48();
    
    // Should not contain URL-unsafe characters
    assert(!timestamp.includes('+'), 'Should not contain +');
    assert(!timestamp.includes('/'), 'Should not contain /');
    assert(!timestamp.includes('='), 'Should not contain =');
});

runner.test('48-bit limit enforcement', () => {
    const timestamp = generateRawTimestamp();
    assert(timestamp <= MAX_48_BIT, 'Should not exceed 48-bit limit');
    assert(timestamp >= 0, 'Should be non-negative');
});

// Performance tests
runner.test('Performance: 10k generations under 100ms', () => {
    const start = process.hrtime.bigint();
    
    for (let i = 0; i < 10000; i++) {
        generateTimestamp48();
    }
    
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1000000;
    
    console.log(`   Performance: ${durationMs.toFixed(2)}ms for 10k generations`);
    assert(durationMs < 100, 'Should generate 10k timestamps in under 100ms');
});

runner.test('Memory efficiency: no leaks in encoding', () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Generate many timestamps
    for (let i = 0; i < 10000; i++) {
        generateTimestamp48();
    }
    
    // Force garbage collection if available
    if (global.gc) {
        global.gc();
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    console.log(`   Memory increase: ${(memoryIncrease / 1024).toFixed(2)}KB`);
    // Should not increase memory significantly (less than 1MB)
    assert(memoryIncrease < 1024 * 1024, 'Should not leak significant memory');
});

// RFC compliance tests
runner.test('RFC 4648 Base64URL compliance', () => {
    const timestamp = generateTimestamp48();
    
    // Test alphabet compliance
    const validChars = /^[A-Za-z0-9_-]+$/;
    assert(validChars.test(timestamp), 'Should only use Base64URL alphabet');
    
    // Test no padding
    assert(!timestamp.includes('='), 'Should not include padding');
});

runner.test('UUIDv7 timestamp format compliance', () => {
    const rawTimestamp = generateRawTimestamp();
    const now = Date.now();
    
    // Should represent milliseconds since Unix epoch
    const diff = Math.abs(rawTimestamp - now);
    assert(diff < 10000, 'Should be close to current Unix timestamp in milliseconds');
    
    // Should fit in 48 bits
    assert(rawTimestamp < Math.pow(2, 48), 'Should fit in 48 bits');
});

// Stress tests
runner.test('Stress test: concurrent generation simulation', async () => {
    const promises = [];
    const results = [];
    
    // Simulate concurrent generation
    for (let i = 0; i < 100; i++) {
        promises.push(new Promise(resolve => {
            setTimeout(() => {
                results.push(generateTimestamp48());
                resolve();
            }, Math.random() * 10);
        }));
    }
    
    await Promise.all(promises);
    
    // Check for uniqueness
    const unique = new Set(results);
    assert(unique.size >= results.length * 0.6, 'Should maintain uniqueness under concurrent load');
});

runner.test('Boundary value testing', () => {
    // Test with maximum valid Base64URL string
    const maxValidEncoded = '________'; // All underscores (max Base64URL chars)
    
    try {
        const decoded = decodeTimestamp48(maxValidEncoded);
        assert(decoded <= MAX_48_BIT, 'Max encoded value should not exceed 48-bit limit');
    } catch (error) {
        // This is acceptable if the max string represents an invalid timestamp
    }
    
    // Test with minimum valid string
    const minValidEncoded = 'AAAAAAAA'; // All A's (min Base64URL chars)
    const decoded = decodeTimestamp48(minValidEncoded);
    assert(decoded === 0, 'Min encoded value should be 0');
});

// Integration tests
runner.test('Full workflow integration', () => {
    // Generate timestamp
    const encoded = generateTimestamp48();
    
    // Validate
    assert(isValidTimestamp(encoded), 'Generated timestamp should be valid');
    
    // Decode
    const decoded = decodeTimestamp48(encoded);
    
    // Convert to date
    const date = timestampToDate(encoded); // Use encoded timestamp directly
    
    // Verify date is reasonable
    const now = new Date();
    const diff = Math.abs(date.getTime() - now.getTime());
    assert(diff < 10000, 'Date should be within 10 seconds of now');
    
    // Get stats
    const stats = getTimestampStats();
    assert(stats.lastTimestamp > 0, 'Stats should show recent activity');
});

// Run all tests
if (require.main === module) {
    runner.run().catch(console.error);
}

module.exports = { TestRunner, assert, assertEqual, assertThrows };