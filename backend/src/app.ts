import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes       from './routes/auth.routes';
import credentialRoutes from './routes/credentials.routes';
import entityRoutes     from './routes/entities.routes';
import userRoutes       from './routes/users.routes';
import toolsRoutes      from './routes/tools.routes';
import reportRoutes     from './routes/reports.routes';
import { errorHandler, notFound } from './middleware/error.middleware';

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ── Body / compression ───────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
});

app.use('/api', globalLimiter);
app.use('/api/v1/auth/login', authLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/credentials', credentialRoutes);
app.use('/api/v1/entities',    entityRoutes);
app.use('/api/v1/users',       userRoutes);
app.use('/api/v1/tools',       toolsRoutes);
app.use('/api/v1/reports',     reportRoutes);

// ── 404 / Error ───────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
