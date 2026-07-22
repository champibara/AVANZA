/**
 * Core types for Violence Digital Platform
 */

import { z } from 'zod';

// Base case schema
export const CaseSchema = z.object({
  id: z.string().uuid(),
  pin: z.string().length(6),
  status: z.enum(['pending', 'validating', 'classified', 'referred', 'closed']),
  createdAt: z.date(),
  updatedAt: z.date(),
  isAnonymous: z.boolean(),
  consentGiven: z.boolean(),
});

export type Case = z.infer<typeof CaseSchema>;

// Evidence schema
export const EvidenceSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  type: z.enum(['url', 'screenshot', 'file', 'text']),
  content: z.string(),
  hash: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
  timestamp: z.date(),
  chainOfCustody: z.array(z.object({
    timestamp: z.date(),
    action: z.string(),
    actor: z.string(),
  })).default([]),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// User session schema
export const SessionSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid().optional(),
  createdAt: z.date(),
  expiresAt: z.date(),
  lastActivity: z.date(),
});

export type Session = z.infer<typeof SessionSchema>;

// Validation result schema
export const ValidationResultSchema = z.object({
  caseId: z.string().uuid(),
  validatedBy: z.string(),
  validatedAt: z.date(),
  classification: z.enum(['public_action', 'private_action']),
  notes: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// Referral schema
export const ReferralSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  entityType: z.enum(['prosecutor_office', 'legal_advice', 'cem']),
  entityId: z.string(),
  referredAt: z.date(),
  status: z.enum(['sent', 'received', 'processing', 'completed']),
  trackingId: z.string().optional(),
});

export type Referral = z.infer<typeof ReferralSchema>;

// Chat message schema
export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  sender: z.enum(['victim', 'ai', 'operator']),
  content: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
  };
}