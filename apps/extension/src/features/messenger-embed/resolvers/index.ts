import { parseSocialLink } from '@varia/core';
import { MediaEmbedPayload, MessengerEmbedConfig } from '../types';
import { resolveYouTubeEmbed } from './youtubeResolver';
import { resolveXTwitterEmbed } from './xTwitterResolver';
import { resolveInstagramEmbed } from './instagramResolver';
import { resolveFacebookEmbed } from './facebookResolver';
import { resolveTikTokEmbed } from './tiktokResolver';

export async function resolveMediaEmbed(
  url: string,
  config?: MessengerEmbedConfig,
): Promise<MediaEmbedPayload | null> {
  const parsed = parseSocialLink(url);
  if (!parsed) return null;

  // Check if platform is enabled in config
  if (config && config.enabledPlatforms) {
    if (parsed.platform === 'youtube' && !config.enabledPlatforms.youtube) return null;
    if (parsed.platform === 'x-twitter' && !config.enabledPlatforms['x-twitter']) return null;
    if (parsed.platform === 'instagram' && !config.enabledPlatforms.instagram) return null;
    if (parsed.platform === 'facebook' && !config.enabledPlatforms.facebook) return null;
    if (parsed.platform === 'tiktok' && !config.enabledPlatforms.tiktok) return null;
  }

  switch (parsed.platform) {
    case 'youtube':
      return resolveYouTubeEmbed(url);
    case 'x-twitter':
      return await resolveXTwitterEmbed(url);
    case 'instagram':
      return await resolveInstagramEmbed(url);
    case 'facebook':
      return await resolveFacebookEmbed(url);
    case 'tiktok':
      return await resolveTikTokEmbed(url);
    default:
      return null;
  }
}

export * from './youtubeResolver';
export * from './xTwitterResolver';
export * from './instagramResolver';
export * from './facebookResolver';
export * from './tiktokResolver';
