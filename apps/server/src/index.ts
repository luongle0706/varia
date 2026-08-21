import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { youtubeRoutes } from './routes/youtube.routes.js';
import { ensureYtDlpBinary } from './services/ytdlp-bin.js';

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '127.0.0.1'; // Bind strictly to loopback interface for security

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  // Register CORS restricted to local development origins
  await app.register(cors, {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  });

  // Register API Routes
  await app.register(youtubeRoutes, { prefix: '/api' });

  return app;
}

async function bootstrap() {
  const app = await buildApp();

  // Pre-warm yt-dlp binary
  try {
    await ensureYtDlpBinary();
  } catch (err) {
    app.log.warn(`[Varia:Server] Pre-warming yt-dlp binary encountered an issue: ${err}`);
  }

  try {
    const address = await app.listen({ port: PORT, host: HOST });
    console.log(`\n⚡ Varia Companion Engine is running at: ${address}`);
    console.log(`   Health Check: ${address}/api/health\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
