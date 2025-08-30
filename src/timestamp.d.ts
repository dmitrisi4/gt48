/**
 * GT48 - High-Performance 48-bit Timestamp Generator
 * TypeScript Definitions
 * 
 * @version 1.0.0
 */

/**
 * Statistics about timestamp generation
 */
export interface TimestampStats {
  /** Last generated timestamp value */
  lastTimestamp: number;
  /** Current sequence counter for monotonic ordering */
  sequenceCounter: number;
  /** Maximum possible 48-bit value */
  maxValue: number;
  /** Epoch offset (Unix epoch = 0) */
  epochOffset: number;
}

/**
 * Configuration interface for GT48 timestamp generation
 */
export interface GT48Config {
  /** Output format for timestamps */
  format?: 'base64url' | 'hex' | 'binary';
  /** Time precision level */
  precision?: 'seconds' | 'milliseconds' | 'nanoseconds';
  /** Enable monotonic ordering */
  monotonic?: boolean;
  /** Number of bits for sequence counter (1-16) */
  sequenceBits?: number;
  /** Use high-resolution time (process.hrtime.bigint()) */
  useHighResTime?: boolean;
  /** Custom epoch offset */
  epochOffset?: number;
}

/**
 * Generic timestamp type based on format
 */
export type TimestampOutput<T extends GT48Config['format']> = 
  T extends 'base64url' ? string :
  T extends 'hex' ? string :
  T extends 'binary' ? Uint8Array :
  string;

/**
 * Builder class for GT48 configuration
 */
export declare class GT48Builder {
  constructor();
  
  /**
   * Set precision level
   * @param precision - 'seconds', 'milliseconds', or 'nanoseconds'
   * @returns Builder instance for chaining
   */
  precision<T extends GT48Config['precision']>(precision: T): GT48Builder;
  
  /**
   * Set output format
   * @param format - 'base64url', 'hex', or 'binary'
   * @returns Builder instance for chaining
   */
  format<T extends GT48Config['format']>(format: T): GT48Builder;
  
  /**
   * Enable or disable monotonic ordering
   * @param monotonic - Enable monotonic ordering
   * @returns Builder instance for chaining
   */
  monotonic(monotonic?: boolean): GT48Builder;
  
  /**
   * Set sequence bits count
   * @param bits - Number of bits for sequence counter (1-16)
   * @returns Builder instance for chaining
   */
  sequenceBits(bits: number): GT48Builder;
  
  /**
   * Enable high-resolution time
   * @param enabled - Use process.hrtime.bigint()
   * @returns Builder instance for chaining
   */
  highResTime(enabled?: boolean): GT48Builder;
  
  /**
   * Build GT48 instance with configured options
   * @returns Configured GT48 instance
   */
  build(): GT48;
}

/**
 * Main GT48 class providing structured API
 */
export declare class GT48<TConfig extends GT48Config = GT48Config> {
  constructor(config?: TConfig);
  
  /**
   * Generate timestamp with configured format
   * @returns Timestamp in configured format
   */
  generate(): TimestampOutput<TConfig['format']>;
  
  /**
   * Generate raw timestamp as number
   * @returns Raw 48-bit timestamp
   */
  generateRaw(): number;
  
  /**
   * Decode timestamp from string
   * @param encoded - Encoded timestamp string
   * @returns Raw timestamp number
   */
  decode(encoded: string): number;
  
  /**
   * Convert timestamp to Date
   * @param timestamp - Timestamp string or number
   * @returns Date object
   */
  toDate(timestamp: string | number): Date;
  
  /**
   * Validate timestamp format
   * @param encoded - Encoded timestamp to validate
   * @returns True if valid
   */
  isValid(encoded: string): boolean;
  
  /**
   * Get generation statistics
   * @returns Statistics object
   */
  getStats(): TimestampStats;
  
  /**
   * Static method to create new instance
   * @param config - Configuration
   * @returns New GT48 instance
   */
  static create<T extends GT48Config>(config?: T): GT48<T>;
  
  /**
   * Static method to create builder instance
   * @returns New builder instance
   */
  static builder(): GT48Builder;
}

/**
 * Generate 48-bit timestamp with Base64URL encoding
 * 
 * Returns a UUIDv7-compatible timestamp encoded as Base64URL string.
 * Guarantees monotonic ordering and handles edge cases gracefully.
 * 
 * @returns Base64URL encoded 48-bit timestamp (8 characters)
 * @example
 * ```typescript
 * const timestamp = generateTimestamp48();
 * console.log(timestamp); // "AQEBAQEB" (example)
 * ```
 */
export function generateTimestamp48(): string;

/**
 * Generate raw 48-bit timestamp as integer
 * 
 * Useful for applications that need the raw timestamp value
 * for custom encoding or mathematical operations.
 * 
 * @returns 48-bit timestamp as integer
 * @example
 * ```typescript
 * const rawTimestamp = generateRawTimestamp();
 * console.log(rawTimestamp); // 1704067200000 (example)
 * ```
 */
export function generateRawTimestamp(): number;

/**
 * Decode Base64URL string back to 48-bit timestamp
 * 
 * @param encoded - Base64URL encoded timestamp (must be 8 characters)
 * @returns 48-bit timestamp as integer
 * @throws {Error} If the encoded string is invalid
 * @example
 * ```typescript
 * const decoded = decodeTimestamp48("AQEBAQEB");
 * console.log(decoded); // 1108152157446
 * ```
 */
export function decodeTimestamp48(encoded: string): number;

/**
 * Convert timestamp to Date object
 * 
 * @param timestamp - Encoded timestamp string or raw timestamp number
 * @returns Date object representing the timestamp
 * @example
 * ```typescript
 * const date1 = timestampToDate("AQEBAQEB");
 * const date2 = timestampToDate(1704067200000);
 * console.log(date1.toISOString());
 * ```
 */
export function timestampToDate(timestamp: string | number): Date;

/**
 * Validate timestamp format and value
 * 
 * @param encoded - Base64URL encoded timestamp to validate
 * @returns True if the timestamp is valid
 * @example
 * ```typescript
 * const isValid = isValidTimestamp("AQEBAQEB");
 * console.log(isValid); // true
 * 
 * const isInvalid = isValidTimestamp("invalid!");
 * console.log(isInvalid); // false
 * ```
 */
export function isValidTimestamp(encoded: string): boolean;

/**
 * Get current timestamp generation statistics
 * 
 * @returns Statistics object with generation info
 * @example
 * ```typescript
 * const stats = getTimestampStats();
 * console.log(`Last: ${stats.lastTimestamp}, Seq: ${stats.sequenceCounter}`);
 * ```
 */
export function getTimestampStats(): TimestampStats;

/**
 * Maximum possible 48-bit value (2^48 - 1)
 */
export const MAX_48_BIT: number;

/**
 * Base64URL character set used for encoding
 */
export const BASE64URL_CHARS: string;

/**
 * Default export - GT48 class
 */
declare const _default: typeof GT48;
export default _default;

/**
 * Module interface for CommonJS compatibility
 */
export interface GT48Module {
  // New structured API
  GT48: typeof GT48;
  GT48Builder: typeof GT48Builder;
  // Legacy API functions
  generateTimestamp48: typeof generateTimestamp48;
  generateRawTimestamp: typeof generateRawTimestamp;
  decodeTimestamp48: typeof decodeTimestamp48;
  timestampToDate: typeof timestampToDate;
  isValidTimestamp: typeof isValidTimestamp;
  getTimestampStats: typeof getTimestampStats;
  // Constants
  MAX_48_BIT: typeof MAX_48_BIT;
  BASE64URL_CHARS: typeof BASE64URL_CHARS;
  // Default export
  default: typeof GT48;
}

/**
 * Global type augmentation for Node.js require()
 */
declare global {
  namespace NodeJS {
    interface Require {
      (id: 'gt48'): GT48Module;
    }
  }
}

/**
 * Type guards for runtime type checking
 */
export namespace TypeGuards {
  /**
   * Check if value is a valid Base64URL string
   */
  export function isBase64URLString(value: unknown): value is string;
  
  /**
   * Check if value is a valid 48-bit timestamp number
   */
  export function is48BitTimestamp(value: unknown): value is number;
  
  /**
   * Check if value is a valid timestamp (string or number)
   */
  export function isTimestamp(value: unknown): value is string | number;
}

/**
 * Utility types for advanced usage
 */
export namespace Types {
  /** Base64URL encoded timestamp string (always 8 characters) */
  export type EncodedTimestamp = string & { readonly __brand: 'EncodedTimestamp' };
  
  /** Raw 48-bit timestamp number */
  export type RawTimestamp = number & { readonly __brand: 'RawTimestamp' };
  
  /** Union type for any timestamp representation */
  export type AnyTimestamp = EncodedTimestamp | RawTimestamp;
  
  /** Configuration options for timestamp generation */
  export interface GenerationOptions {
    /** Custom epoch offset (default: 0 for Unix epoch) */
    epochOffset?: number;
    /** Enable strict monotonic ordering (default: true) */
    strictMonotonic?: boolean;
  }
}

/**
 * Error types for better error handling
 */
export namespace Errors {
  /** Base error class for GT48 errors */
  export class GT48Error extends Error {
    constructor(message: string, public readonly code: string);
  }
  
  /** Error thrown when decoding invalid Base64URL */
  export class InvalidEncodingError extends GT48Error {
    constructor(invalidChar: string);
  }
  
  /** Error thrown when timestamp value is out of range */
  export class TimestampRangeError extends GT48Error {
    constructor(value: number);
  }
  
  /** Error thrown when format validation fails */
  export class FormatError extends GT48Error {
    constructor(expectedFormat: string, actualFormat: string);
  }
  
  /** Error thrown when configuration is invalid */
  export class InvalidConfigError extends GT48Error {
    constructor(field: string, value: unknown, expected: string);
  }
}

/**
 * Export error classes at module level for easier access
 */
export declare class GT48Error extends Error {
  constructor(message: string, code?: string);
  readonly code: string;
}

export declare class InvalidEncodingError extends GT48Error {
  constructor(invalidChar: string);
}

export declare class TimestampRangeError extends GT48Error {
  constructor(value: number);
}

export declare class FormatError extends GT48Error {
  constructor(expectedFormat: string, actualFormat: string);
}

export declare class InvalidConfigError extends GT48Error {
  constructor(field: string, value: unknown, expected: string);
}