import type { FastifyPluginAsync } from 'fastify';
import { type YouTubeDownloadQuery, isValidYouTubeUrl } from '@varia/core';
import {
  fetchYouTubeInfo,
  startYouTubeDownloadJob,
  subscribeToJobProgress,
  serveJobFile,
} from '../services/ytdlp.service.js';

export const youtubeRoutes: FastifyPluginAsync = async fastify => {
  // Health & Engine Verification Check
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      engine: 'yt-dlp',
      timestamp: new Date().toISOString(),
    };
  });

  // Get Video Metadata & Available Formats
  fastify.get<{
    Querystring: { url?: string };
  }>('/youtube/info', async (request, reply) => {
    const { url } = request.query;

    if (!url || typeof url !== 'string' || !isValidYouTubeUrl(url)) {
      return reply.status(400).send({
        error:
          'Invalid or missing YouTube URL. Please provide a valid youtube.com or youtu.be link.',
      });
    }

    try {
      const info = await fetchYouTubeInfo(url);
      return info;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[Varia:Server-API] Failed to fetch info:', msg);
      return reply.status(500).send({
        error: `Failed to fetch video info: ${msg}`,
      });
    }
  });

  // 1. Start Asynchronous Download Job
  fastify.post<{
    Body: YouTubeDownloadQuery;
  }>('/youtube/download/start', async (request, reply) => {
    const query = request.body;

    if (!query || !query.url || !isValidYouTubeUrl(query.url)) {
      return reply.status(400).send({ error: 'Invalid or missing YouTube URL' });
    }

    try {
      const { jobId } = await startYouTubeDownloadJob(query);
      return { jobId, status: 'started' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return reply.status(500).send({ error: `Could not start download job: ${msg}` });
    }
  });

  // 2. Server-Sent Events (SSE) Live Progress Stream
  fastify.get<{
    Querystring: { jobId?: string };
  }>('/youtube/download/progress', async (request, reply) => {
    const { jobId } = request.query;

    if (!jobId) {
      return reply.status(400).send({ error: 'Missing jobId parameter' });
    }

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');

    const unsubscribe = subscribeToJobProgress(jobId, progress => {
      try {
        reply.raw.write(`data: ${JSON.stringify(progress)}\n\n`);
        if (progress.stage === 'ready' || progress.stage === 'error') {
          // Allow client to receive the final tick before closing
          setTimeout(() => {
            try {
              reply.raw.end();
            } catch {
              // Ignore
            }
          }, 1000);
        }
      } catch {
        unsubscribe();
      }
    });

    request.raw.on('close', () => {
      unsubscribe();
    });
  });

  // 3. Serve the Completed Binary File
  fastify.get<{
    Querystring: { jobId?: string };
  }>('/youtube/download/file', async (request, reply) => {
    const { jobId } = request.query;

    if (!jobId) {
      return reply.status(400).send({ error: 'Missing jobId parameter' });
    }

    return serveJobFile(jobId, reply);
  });
};
