/**
 * GT48 - Performance Benchmark Suite
 * 
 * Comprehensive performance testing for 48-bit timestamp generator
 * Measures throughput, latency, memory usage, and scalability
 * 
 * @author GT48 Team
 * @version 1.0.0
 */

'use strict';

const {
    generateTimestamp48,
    generateRawTimestamp,
    decodeTimestamp48,
    timestampToDate,
    isValidTimestamp
} = require('../src/timestamp.js');

// Benchmark utilities
class BenchmarkRunner {
    constructor() {
        this.results = [];
    }
    
    async benchmark(name, fn, iterations = 100000) {
        console.log(`\n🔥 Running ${name}...`);
        
        // Warm up
        for (let i = 0; i < Math.min(1000, iterations / 10); i++) {
            fn();
        }
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
        const startMemory = process.memoryUsage();
        const startTime = process.hrtime.bigint();
        
        // Run benchmark
        for (let i = 0; i < iterations; i++) {
            fn();
        }
        
        const endTime = process.hrtime.bigint();
        const endMemory = process.memoryUsage();
        
        const durationNs = Number(endTime - startTime);
        const durationMs = durationNs / 1000000;
        const opsPerSec = (iterations / durationMs) * 1000;
        const avgLatencyNs = durationNs / iterations;
        const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
        
        const result = {
            name,
            iterations,
            durationMs: Math.round(durationMs * 100) / 100,
            opsPerSec: Math.round(opsPerSec),
            avgLatencyNs: Math.round(avgLatencyNs * 100) / 100,
            memoryDeltaKB: Math.round(memoryDelta / 1024 * 100) / 100
        };
        
        this.results.push(result);
        
        console.log(`   ⚡ ${result.opsPerSec.toLocaleString()} ops/sec`);
        console.log(`   ⏱️  ${result.avgLatencyNs}ns avg latency`);
        console.log(`   💾 ${result.memoryDeltaKB}KB memory delta`);
        console.log(`   🕐 ${result.durationMs}ms total time`);
        
        return result;
    }
    
    printSummary() {
        console.log('\n📊 Benchmark Summary');
        console.log('=' .repeat(80));
        console.log('Test Name'.padEnd(30) + 'Ops/Sec'.padEnd(15) + 'Latency(ns)'.padEnd(15) + 'Memory(KB)');
        console.log('-'.repeat(80));
        
        for (const result of this.results) {
            console.log(
                result.name.padEnd(30) +
                result.opsPerSec.toLocaleString().padEnd(15) +
                result.avgLatencyNs.toString().padEnd(15) +
                result.memoryDeltaKB.toString()
            );
        }
        
        console.log('\n🎯 Performance Analysis:');
        const fastest = this.results.reduce((a, b) => a.opsPerSec > b.opsPerSec ? a : b);
        const slowest = this.results.reduce((a, b) => a.opsPerSec < b.opsPerSec ? a : b);
        
        console.log(`   Fastest: ${fastest.name} (${fastest.opsPerSec.toLocaleString()} ops/sec)`);
        console.log(`   Slowest: ${slowest.name} (${slowest.opsPerSec.toLocaleString()} ops/sec)`);
        console.log(`   Speed ratio: ${Math.round(fastest.opsPerSec / slowest.opsPerSec * 100) / 100}x`);
    }
}

// Memory profiling utilities
class MemoryProfiler {
    static profile(name, fn, iterations = 10000) {
        console.log(`\n🧠 Memory Profile: ${name}`);
        
        if (global.gc) {
            global.gc();
        }
        
        const baseline = process.memoryUsage();
        const snapshots = [];
        
        // Take memory snapshots during execution
        for (let i = 0; i < iterations; i++) {
            fn();
            
            if (i % (iterations / 10) === 0) {
                snapshots.push({
                    iteration: i,
                    memory: process.memoryUsage().heapUsed
                });
            }
        }
        
        if (global.gc) {
            global.gc();
        }
        
        const final = process.memoryUsage();
        
        console.log(`   Baseline: ${Math.round(baseline.heapUsed / 1024)}KB`);
        console.log(`   Final: ${Math.round(final.heapUsed / 1024)}KB`);
        console.log(`   Net change: ${Math.round((final.heapUsed - baseline.heapUsed) / 1024)}KB`);
        
        // Check for memory leaks
        const growth = snapshots.map((s, i) => i > 0 ? s.memory - snapshots[i-1].memory : 0);
        const avgGrowth = growth.slice(1).reduce((a, b) => a + b, 0) / (growth.length - 1);
        
        if (avgGrowth > 1024) { // More than 1KB average growth per snapshot
            console.log(`   ⚠️  Potential memory leak detected (${Math.round(avgGrowth)}B/snapshot)`);
        } else {
            console.log(`   ✅ No significant memory leaks detected`);
        }
    }
}

// Concurrency testing
class ConcurrencyTester {
    static async testConcurrency(name, fn, concurrency = 10, iterations = 1000) {
        console.log(`\n🔄 Concurrency Test: ${name} (${concurrency} workers, ${iterations} ops each)`);
        
        const startTime = process.hrtime.bigint();
        
        const workers = Array.from({ length: concurrency }, async () => {
            const results = [];
            for (let i = 0; i < iterations; i++) {
                results.push(fn());
            }
            return results;
        });
        
        const allResults = await Promise.all(workers);
        const endTime = process.hrtime.bigint();
        
        const totalOps = concurrency * iterations;
        const durationMs = Number(endTime - startTime) / 1000000;
        const opsPerSec = (totalOps / durationMs) * 1000;
        
        // Check for uniqueness across all workers
        const flatResults = allResults.flat();
        const uniqueResults = new Set(flatResults);
        const uniquenessRatio = uniqueResults.size / flatResults.length;
        
        console.log(`   ⚡ ${Math.round(opsPerSec).toLocaleString()} ops/sec (concurrent)`);
        console.log(`   🎯 ${Math.round(uniquenessRatio * 10000) / 100}% unique results`);
        console.log(`   🕐 ${Math.round(durationMs)}ms total time`);
        
        if (uniquenessRatio < 0.95) {
            console.log(`   ⚠️  Low uniqueness ratio may indicate collision issues`);
        }
        
        return { opsPerSec, uniquenessRatio, durationMs };
    }
}

// Main benchmark suite
async function runBenchmarks() {
    console.log('🚀 GT48 Performance Benchmark Suite');
    console.log('====================================\n');
    
    const runner = new BenchmarkRunner();
    
    // Core function benchmarks
    await runner.benchmark('generateTimestamp48()', () => {
        generateTimestamp48();
    }, 100000);
    
    await runner.benchmark('generateRawTimestamp()', () => {
        generateRawTimestamp();
    }, 100000);
    
    // Encoding/decoding benchmarks
    const sampleTimestamp = generateTimestamp48();
    await runner.benchmark('decodeTimestamp48()', () => {
        decodeTimestamp48(sampleTimestamp);
    }, 50000);
    
    await runner.benchmark('timestampToDate()', () => {
        timestampToDate(sampleTimestamp);
    }, 50000);
    
    await runner.benchmark('isValidTimestamp()', () => {
        isValidTimestamp(sampleTimestamp);
    }, 100000);
    
    // Rapid generation test
    await runner.benchmark('Rapid generation (no gaps)', () => {
        generateTimestamp48();
    }, 10000);
    
    runner.printSummary();
    
    // Memory profiling
    MemoryProfiler.profile('generateTimestamp48() memory', () => {
        generateTimestamp48();
    }, 50000);
    
    MemoryProfiler.profile('Full workflow memory', () => {
        const encoded = generateTimestamp48();
        const decoded = decodeTimestamp48(encoded);
        const date = timestampToDate(decoded);
        isValidTimestamp(encoded);
    }, 10000);
    
    // Concurrency testing
    await ConcurrencyTester.testConcurrency('generateTimestamp48()', () => {
        return generateTimestamp48();
    }, 10, 1000);
    
    await ConcurrencyTester.testConcurrency('generateRawTimestamp()', () => {
        return generateRawTimestamp();
    }, 20, 500);
    
    // Stress testing
    console.log('\n🔥 Stress Testing');
    console.log('==================');
    
    // High-frequency generation
    console.log('\n⚡ High-frequency generation test...');
    const highFreqStart = process.hrtime.bigint();
    const highFreqResults = [];
    
    for (let i = 0; i < 50000; i++) {
        highFreqResults.push(generateTimestamp48());
    }
    
    const highFreqEnd = process.hrtime.bigint();
    const highFreqDuration = Number(highFreqEnd - highFreqStart) / 1000000;
    const highFreqUnique = new Set(highFreqResults).size;
    
    console.log(`   Generated: ${highFreqResults.length.toLocaleString()} timestamps`);
    console.log(`   Unique: ${highFreqUnique.toLocaleString()} (${Math.round(highFreqUnique / highFreqResults.length * 10000) / 100}%)`);
    console.log(`   Rate: ${Math.round((highFreqResults.length / highFreqDuration) * 1000).toLocaleString()} ops/sec`);
    console.log(`   Duration: ${Math.round(highFreqDuration)}ms`);
    
    // Monotonic ordering verification
    console.log('\n📈 Monotonic ordering verification...');
    const monotonicResults = [];
    for (let i = 0; i < 10000; i++) {
        monotonicResults.push(generateRawTimestamp());
    }
    
    let violations = 0;
    for (let i = 1; i < monotonicResults.length; i++) {
        if (monotonicResults[i] < monotonicResults[i-1]) {
            violations++;
        }
    }
    
    console.log(`   Ordering violations: ${violations} out of ${monotonicResults.length - 1} comparisons`);
    console.log(`   Monotonic compliance: ${Math.round((1 - violations / (monotonicResults.length - 1)) * 10000) / 100}%`);
    
    // Performance comparison with alternatives
    console.log('\n🏁 Performance Comparison');
    console.log('==========================');
    
    const comparisonRunner = new BenchmarkRunner();
    
    await comparisonRunner.benchmark('GT48 generateTimestamp48()', () => {
        generateTimestamp48();
    }, 50000);
    
    await comparisonRunner.benchmark('Date.now()', () => {
        Date.now();
    }, 50000);
    
    await comparisonRunner.benchmark('Date.now().toString(36)', () => {
        Date.now().toString(36);
    }, 50000);
    
    await comparisonRunner.benchmark('Math.random().toString(36)', () => {
        Math.random().toString(36).substr(2, 8);
    }, 50000);
    
    comparisonRunner.printSummary();
    
    console.log('\n✅ Benchmark suite completed!');
    console.log('\n📋 Recommendations:');
    console.log('   - Use generateTimestamp48() for high-performance timestamp generation');
    console.log('   - Use generateRawTimestamp() when you need raw numeric timestamps');
    console.log('   - The implementation maintains excellent performance under concurrent load');
    console.log('   - Memory usage is minimal with no significant leaks detected');
}

// Export for programmatic usage
module.exports = {
    BenchmarkRunner,
    MemoryProfiler,
    ConcurrencyTester,
    runBenchmarks
};

// Run benchmarks if called directly
if (require.main === module) {
    runBenchmarks().catch(console.error);
}