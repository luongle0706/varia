import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type YouTubeVideoInfo,
  type YouTubeResolutionQuality,
  type YouTubeVideoCodec,
  type YouTubeAudioBitrate,
  type YouTubeJobProgress,
  isValidYouTubeUrl,
} from '@varia/core';

export interface UseYouTubeDownloaderReturn {
  // State
  url: string;
  videoInfo: YouTubeVideoInfo | null;
  isLoadingInfo: boolean;
  isDownloading: boolean;
  progress: YouTubeJobProgress | null;
  format: 'mp4' | 'mp3';
  selectedResolution: YouTubeResolutionQuality;
  selectedCodec: YouTubeVideoCodec;
  selectedBitrate: YouTubeAudioBitrate;
  isServerOnline: boolean;
  errorMessage: string | null;

  // Actions
  setUrl: (url: string) => void;
  setFormat: (format: 'mp4' | 'mp3') => void;
  setSelectedResolution: (res: YouTubeResolutionQuality) => void;
  setSelectedCodec: (codec: YouTubeVideoCodec) => void;
  setSelectedBitrate: (bitrate: YouTubeAudioBitrate) => void;
  fetchVideoInfo: (urlToFetch?: string) => Promise<void>;
  downloadMedia: () => Promise<void>;
  clearSession: () => void;
}

export function useYouTubeDownloader(): UseYouTubeDownloaderReturn {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<YouTubeJobProgress | null>(null);
  const [format, setFormat] = useState<'mp4' | 'mp3'>('mp4');
  const [selectedResolution, setSelectedResolution] = useState<YouTubeResolutionQuality>('1080p');
  const [selectedCodec, setSelectedCodec] = useState<YouTubeVideoCodec>('h264');
  const [selectedBitrate, setSelectedBitrate] = useState<YouTubeAudioBitrate>('320k');
  const [isServerOnline, setIsServerOnline] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Clean up any active EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Check health status of local companion server on mount
  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (isMounted) {
          setIsServerOnline(res.ok);
        }
      } catch {
        if (isMounted) {
          setIsServerOnline(false);
        }
      }
    }

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch YouTube Metadata
  const fetchVideoInfo = useCallback(
    async (urlToFetch?: string) => {
      const targetUrl = (urlToFetch || url).trim();
      if (!isValidYouTubeUrl(targetUrl)) {
        setErrorMessage('Please provide a valid YouTube video or shorts URL.');
        return;
      }

      setIsLoadingInfo(true);
      setErrorMessage(null);

      console.log(`[Varia:YouTubeDownloader] Fetching metadata for: ${targetUrl}`);

      try {
        const res = await fetch(`/api/youtube/info?url=${encodeURIComponent(targetUrl)}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${res.status}`);
        }

        const data: YouTubeVideoInfo = await res.json();
        console.log('[Varia:YouTubeDownloader] Metadata received successfully:', data.title);

        setVideoInfo(data);
        setSelectedResolution(data.maxResolution || '1080p');
        setSelectedCodec('h264');
        setSelectedBitrate('320k');
        setIsServerOnline(true);
      } catch (err) {
        console.error('[Varia:YouTubeDownloader] Metadata fetch failed:', err);
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
          setIsServerOnline(false);
          setErrorMessage('Local companion engine is not active. Please run pnpm dev locally.');
        } else {
          setErrorMessage(msg);
        }
      } finally {
        setIsLoadingInfo(false);
      }
    },
    [url],
  );

  // Trigger real-time progress-tracked download job
  const downloadMedia = useCallback(async () => {
    if (!videoInfo || isDownloading) {
      return; // Anti-spam lock
    }

    setIsDownloading(true);
    setErrorMessage(null);
    setProgress({
      jobId: 'init',
      stage: 'fetching',
      percent: 5,
      message: 'Initializing download...',
    });

    try {
      // 1. Request server to start background job
      const startRes = await fetch('/api/youtube/download/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoInfo.url,
          format,
          ...(format === 'mp4'
            ? { resolution: selectedResolution, videoCodec: selectedCodec }
            : { audioBitrate: selectedBitrate }),
        }),
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to start download job on server');
      }

      const { jobId } = await startRes.json();
      console.log(`[Varia:YouTubeDownloader] Started job ${jobId}, connecting to progress SSE...`);

      // 2. Connect to Server-Sent Events (SSE) progress stream
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(`/api/youtube/download/progress?jobId=${jobId}`);
      eventSourceRef.current = es;

      es.onmessage = event => {
        try {
          const data: YouTubeJobProgress = JSON.parse(event.data);
          setProgress(data);

          if (data.stage === 'ready' && data.downloadUrl) {
            console.log(`[Varia:YouTubeDownloader] Job ${jobId} ready! Triggering file save...`);
            es.close();

            // Trigger browser download of the completed file
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.setAttribute('download', '');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
              setIsDownloading(false);
              setProgress(null);
            }, 2000);
          } else if (data.stage === 'error') {
            console.error(`[Varia:YouTubeDownloader] Job error:`, data.error);
            es.close();
            setIsDownloading(false);
            setErrorMessage(data.error || 'Download failed during processing');
          }
        } catch {
          // Ignore JSON parse error
        }
      };

      es.onerror = () => {
        es.close();
        setIsDownloading(false);
      };
    } catch (err) {
      console.error('[Varia:YouTubeDownloader] Start job failed:', err);
      setIsDownloading(false);
      setProgress(null);
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }, [videoInfo, isDownloading, format, selectedResolution, selectedCodec, selectedBitrate]);

  const clearSession = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setUrl('');
    setVideoInfo(null);
    setProgress(null);
    setIsDownloading(false);
    setErrorMessage(null);
  }, []);

  return {
    url,
    videoInfo,
    isLoadingInfo,
    isDownloading,
    progress,
    format,
    selectedResolution,
    selectedCodec,
    selectedBitrate,
    isServerOnline,
    errorMessage,
    setUrl,
    setFormat,
    setSelectedResolution,
    setSelectedCodec,
    setSelectedBitrate,
    fetchVideoInfo,
    downloadMedia,
    clearSession,
  };
}
