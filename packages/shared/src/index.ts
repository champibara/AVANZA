/**
 * Shared exports for Violence Digital Platform
 */

export * from './types';

// Security utilities
export { encryptData, decryptData, generateEncryptionKey } from '../../security/encryption';
export { createSecureServer, validateTLSConfig, SECURITY_HEADERS } from '../../security/tls-config';

// Validation utilities
export function validateCasePin(pin: string): boolean {
  // PIN must be 6 alphanumeric characters
  return /^[A-Z0-9]{6}$/.test(pin);
}

export function generateCasePin(): string {
  // Generate a 6-character alphanumeric PIN
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toISOString();
}

export function isDateWithinDays(date: Date, days: number): boolean {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= days;
}