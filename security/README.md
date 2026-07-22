# Security Configuration

This directory contains security-related configurations and utilities for the Violence Digital Platform.

## Security Requirements

### Requirement 8.1: Encryption in Transit
- THE System SHALL encrypt all data in transit using TLS 1.3 or higher
- Configuration files: `tls-config.ts`, `nginx-tls.conf`

### Requirement 8.2: Encryption at Rest
- THE System SHALL encrypt all data at rest using AES-256 encryption
- Configuration files: `encryption.ts`, `database-encryption.ts`

## Files

- `tls-config.ts`: TLS 1.3+ configuration for Node.js services
- `nginx-tls.conf`: Nginx TLS configuration for API gateway
- `encryption.ts`: AES-256 encryption utilities
- `database-encryption.ts`: Database-level encryption configuration
- `security-headers.ts`: Security headers middleware
- `audit-log.ts`: Security audit logging

## Usage

### TLS Configuration
```typescript
import { createSecureServer } from './security/tls-config';

const server = createSecureServer(app);
server.listen(443);
```

### Encryption
```typescript
import { encryptData, decryptData } from './security/encryption';

const encrypted = await encryptData(sensitiveData);
const decrypted = await decryptData(encrypted);
```

## Testing

Run security tests:
```bash
npm run test:security
```

## Compliance Checklist

- [ ] TLS 1.3+ enabled for all services
- [ ] AES-256 encryption implemented for data at rest
- [ ] Security headers configured
- [ ] Audit logging enabled
- [ ] Regular security scanning implemented
- [ ] Access controls and RBAC configured
- [ ] Secure session management