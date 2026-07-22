/**
 * AES-256 Encryption Utilities for Violence Digital Platform
 * Implements Requirement 8.2: Encryption at rest
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  salt: string;
  tag?: string;
}

export interface DecryptionOptions {
  encrypted: string;
  iv: string;
  salt: string;
  tag?: string;
}

/**
 * AES-256-GCM encryption algorithm configuration
 */
export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm' as const,
  keyLength: 32, // 256 bits
  ivLength: 16, // 128 bits
  saltLength: 16,
  tagLength: 16,
  iterations: 100000,
  digest: 'sha256' as const,
};

/**
 * Derives encryption key from password using scrypt
 */
async function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number = ENCRYPTION_CONFIG.keyLength
): Promise<Buffer> {
  const key = (await scryptAsync(
    password,
    salt,
    keyLength,
    {
      N: ENCRYPTION_CONFIG.iterations,
      r: 8,
      p: 1,
      maxmem: 32 * 1024 * 1024,
    }
  )) as Buffer;
  return key;
}

/**
 * Encrypts data using AES-256-GCM
 * @param data - Data to encrypt (string or Buffer)
 * @param encryptionKey - Encryption key (32 bytes for AES-256)
 * @returns Encrypted result with IV and salt
 */
export async function encryptData(
  data: string | Buffer,
  encryptionKey: string
): Promise<EncryptionResult> {
  try {
    // Validate encryption key
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters');
    }

    // Generate random salt and IV
    const salt = randomBytes(ENCRYPTION_CONFIG.saltLength);
    const iv = randomBytes(ENCRYPTION_CONFIG.ivLength);

    // Derive key from password and salt
    const key = await deriveKey(encryptionKey, salt);

    // Create cipher
    const cipher = createCipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);

    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(typeof data === 'string' ? Buffer.from(data, 'utf8') : data),
      cipher.final(),
    ]);

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Return encrypted result
    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      salt: salt.toString('base64'),
      tag: tag.toString('base64'),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts data using AES-256-GCM
 * @param options - Decryption options including encrypted data, IV, and salt
 * @param encryptionKey - Encryption key used for encryption
 * @returns Decrypted data as string
 */
export async function decryptData(
  options: DecryptionOptions,
  encryptionKey: string
): Promise<string> {
  try {
    // Validate inputs
    if (!options.encrypted || !options.iv || !options.salt) {
      throw new Error('Missing required decryption parameters');
    }

    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters');
    }

    if (!options.tag) {
      throw new Error('Authentication tag is required for GCM decryption');
    }

    // Convert base64 strings to buffers
    const encryptedBuffer = Buffer.from(options.encrypted, 'base64');
    const iv = Buffer.from(options.iv, 'base64');
    const salt = Buffer.from(options.salt, 'base64');
    const tag = Buffer.from(options.tag, 'base64');

    // Validate buffer sizes
    if (iv.length !== ENCRYPTION_CONFIG.ivLength) {
      throw new Error(`Invalid IV length: expected ${ENCRYPTION_CONFIG.ivLength}, got ${iv.length}`);
    }

    if (salt.length !== ENCRYPTION_CONFIG.saltLength) {
      throw new Error(`Invalid salt length: expected ${ENCRYPTION_CONFIG.saltLength}, got ${salt.length}`);
    }

    // Derive key from password and salt
    const key = await deriveKey(encryptionKey, salt);

    // Create decipher
    const decipher = createDecipheriv(ENCRYPTION_CONFIG.algorithm, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt data
    const decrypted = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Generates a secure encryption key
 * @returns Base64 encoded encryption key
 */
export function generateEncryptionKey(): string {
  return randomBytes(ENCRYPTION_CONFIG.keyLength).toString('base64');
}

/**
 * Validates encryption configuration
 */
export function validateEncryptionConfig(): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check for required environment variables
  if (!process.env.ENCRYPTION_KEY) {
    issues.push('ENCRYPTION_KEY environment variable is not set');
  }

  // Check key length
  if (process.env.ENCRYPTION_KEY) {
    const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
    if (keyBuffer.length !== ENCRYPTION_CONFIG.keyLength) {
      issues.push(`Encryption key must be ${ENCRYPTION_CONFIG.keyLength} bytes (${ENCRYPTION_CONFIG.keyLength * 8} bits)`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}