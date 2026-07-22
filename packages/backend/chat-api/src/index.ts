/**
 * Chat API Service for Violence Digital Platform
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createSecureServer } from '../../../security/tls-config';
import { SECURITY_HEADERS } from '../../../security/tls-config';

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: SECURITY_HEADERS,
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'chat-api',
    timestamp: new Date().toISOString(),
  });
});

// API routes placeholder
app.get('/api/chat/session', (req, res) => {
  res.status(200).json({
    message: 'Chat session endpoint',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      timestamp: new Date().toISOString(),
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
      timestamp: new Date().toISOString(),
    },
  });
});

// Start server
if (process.env.NODE_ENV === 'production') {
  // Use TLS in production
  const server = createSecureServer(app, {
    certPath: process.env.TLS_CERT_PATH,
    keyPath: process.env.TLS_KEY_PATH,
  });

  server.listen(PORT, () => {
    console.log(`Chat API Service running securely on port ${PORT}`);
  });
} else {
  // HTTP for development
  app.listen(PORT, () => {
    console.log(`Chat API Service running on port ${PORT}`);
  });
}