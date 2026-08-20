import type { ComponentType } from 'react';

export type ToolCategory = 'media' | 'dev' | 'network' | 'social' | 'text';

export interface VariaToolManifest {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  tags: string[];
  isOfflineReady: boolean;
  requiresServer?: boolean;
  wasmRequired?: boolean;
  route: string;
  component?: () => Promise<{ default: ComponentType<any> }>;
}

export interface CategoryMetadata {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
}

export const TOOL_CATEGORIES: Record<ToolCategory, CategoryMetadata> = {
  media: {
    id: 'media',
    name: 'Media Studio',
    description: 'Video, audio, GIF and image processing client-side with WebAssembly',
    icon: 'MovieFilter',
    badgeColor: '#ec4899', // Pink
  },
  dev: {
    id: 'dev',
    name: 'Developer Utilities',
    description: 'Instant zero-latency utilities for everyday coding & debugging',
    icon: 'Code',
    badgeColor: '#8b5cf6', // Violet
  },
  network: {
    id: 'network',
    name: 'Network & Connectivity',
    description: 'Speed test, DNS lookup, IP and connection inspection tools',
    icon: 'Speed',
    badgeColor: '#06b6d4', // Cyan
  },
  social: {
    id: 'social',
    name: 'Social Media',
    description: 'Media downloaders and extractors for social platforms',
    icon: 'CloudDownload',
    badgeColor: '#f59e0b', // Amber
  },
  text: {
    id: 'text',
    name: 'Text & Productivity',
    description: 'Markdown, QR codes, diff comparison, and case converters',
    icon: 'TextFields',
    badgeColor: '#10b981', // Emerald
  },
};
