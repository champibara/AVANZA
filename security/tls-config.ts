/**
 * TLS 1.3+ Configuration for Violence Digital Platform
 * Implements Requirement 8.1: Encryption in transit
 */

import { createServer } from 'https';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface TLSOptions {
  certPath: string;
  keyPath: string;
  caPath?: string;
  minVersion: string;
  maxVersion: string;
  cipherSuites: string[];
  honorCipherOrder: boolean;
  requestCert: boolean;
  rejectUnauthorized: boolean;
}

/**
 * Default TLS 1.3 configuration
 */
export const DEFAULT_TLS_CONFIG: TLSOptions = {
  certPath: join(process.cwd(), 'security', 'certs', 'server.crt'),
  keyPath: join(process.cwd(), 'security', 'certs', 'server.key'),
  minVersion: 'TLSv1.3',
  maxVersion: 'TLSv1.3',
  cipherSuites: [
    // TLS 1.3 cipher suites (RFC 8446)
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
  ],
  honorCipherOrder: true,
  requestCert: false,
  rejectUnauthorized: true,
};

/**
 * Creates a secure HTTPS server with TLS 1.3+
 */
export function createSecureServer(
  app: any,
  options: Partial<TLSOptions> = {}
) {
  const config = { ...DEFAULT_TLS_CONFIG, ...options };

  try {
    const tlsOptions = {
      cert: readFileSync(config.certPath),
      key: readFileSync(config.keyPath),
      ca: config.caPath ? readFileSync(config.caPath) : undefined,
      minVersion: config.minVersion,
      maxVersion: config.maxVersion,
      ciphers: config.cipherSuites.join(':'),
      honorCipherOrder: config.honorCipherOrder,
      requestCert: config.requestCert,
      rejectUnauthorized: config.rejectUnauthorized,
    };

    return createServer(tlsOptions, app);
  } catch (error) {
    throw new Error(`Failed to create secure server: ${error.message}`);
  }
}

/**
 * Validates TLS configuration meets security requirements
 */
export function validateTLSConfig(options: TLSOptions): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Check TLS version
  if (options.minVersion !== 'TLSv1.3') {
    issues.push(`Minimum TLS version must be 1.3, got ${options.minVersion}`);
  }

  // Check cipher suites
  const hasTLS13Cipher = options.cipherSuites.some((cipher) =>
    cipher.startsWith('TLS_AES_') || cipher.startsWith('TLS_CHACHA20_')
  );
  if (!hasTLS13Cipher) {
    issues.push('No TLS 1.3 cipher suites configured');
  }

  // Check certificate files exist
  try {
    readFileSync(options.certPath);
    readFileSync(options.keyPath);
    if (options.caPath) {
      readFileSync(options.caPath);
    }
  } catch (error) {
    issues.push(`Certificate file error: ${error.message}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Security headers for TLS connections
 */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};