import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/index.js';

describe('Fastify YouTube Server API Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/health', () => {
    it('should return 200 OK with engine status and timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload.status).toBe('ok');
      expect(payload.engine).toBe('yt-dlp');
      expect(payload.timestamp).toBeDefined();
    });
  });

  describe('GET /api/youtube/info', () => {
    it('should return 400 Bad Request if URL parameter is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/youtube/info',
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toContain('Invalid or missing YouTube URL');
    });

    it('should return 400 Bad Request if URL is not a valid YouTube domain', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/youtube/info?url=https://vimeo.com/123456',
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toContain('Invalid or missing YouTube URL');
    });
  });

  describe('POST /api/youtube/download/start', () => {
    it('should reject requests with missing or invalid URLs', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/youtube/download/start',
        headers: { 'content-type': 'application/json' },
        payload: {
          url: 'not-a-youtube-url',
          format: 'mp4',
        },
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toContain('Invalid or missing YouTube URL');
    });
  });

  describe('GET /api/youtube/download/progress', () => {
    it('should return 400 Bad Request if jobId is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/youtube/download/progress',
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toContain('Missing jobId parameter');
    });
  });

  describe('GET /api/youtube/download/file', () => {
    it('should return 400 Bad Request if jobId is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/youtube/download/file',
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toContain('Missing jobId parameter');
    });

    it('should return 404 Not Found if jobId does not exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/youtube/download/file?jobId=nonexistent_job_123',
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toContain('Download file not found or expired');
    });
  });
});
