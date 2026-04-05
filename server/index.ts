import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';

import './load-env';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_DEV_URL = process.env.CLIENT_DEV_URL || 'http://localhost:3000';

app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use('/uploads', express.static('server/uploads'));

const publicDirCandidates = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../public'),
];

const publicDir = publicDirCandidates.find((candidate) => fs.existsSync(candidate));
if (publicDir) {
  app.use('/public', express.static(publicDir));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'Server running', port: PORT });
});

async function startServer() {
  try {
    const { connectDatabase } = await import('./config/database');
    await connectDatabase();

    const { initCloudinary } = await import('./config/cloudinary');
    initCloudinary();

    const apiRoutes = (await import('./routes')).default;
    app.use('/api', apiRoutes);

    // Global error handler - must be after all routes
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
      console.error('❌ [Global Error Handler]', err.message);
      console.error(err.stack);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || 'Internal server error' });
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend URL: ${CLIENT_DEV_URL}`);
      console.log(`🛠️ Admin URL: ${CLIENT_DEV_URL}/admin/index.html`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
