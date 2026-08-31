import React, { useState } from 'react';
import { MessageSquare, Trash2, VolumeX, Minimize2, Check } from 'lucide-react';
import { MessengerEmbedConfig } from '../types';
import { mediaCache } from '../cache/mediaCache';

interface MessengerEmbedSectionProps {
  config: MessengerEmbedConfig;
  onChange: (newConfig: MessengerEmbedConfig) => void;
}

export const MessengerEmbedSection: React.FC<MessengerEmbedSectionProps> = ({
  config,
  onChange,
}) => {
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const toggleMaster = () => {
    onChange({ ...config, enabled: !config.enabled });
  };

  const togglePlatform = (key: keyof MessengerEmbedConfig['enabledPlatforms']) => {
    onChange({
      ...config,
      enabledPlatforms: {
        ...config.enabledPlatforms,
        [key]: !config.enabledPlatforms[key],
      },
    });
  };

  const toggleMute = () => {
    onChange({ ...config, muteByDefault: !config.muteByDefault });
  };

  const toggleAutoCollapse = () => {
    onChange({ ...config, autoCollapse: !config.autoCollapse });
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await mediaCache.clear();
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2500);
    } catch {
      // Ignore
    } finally {
      setClearingCache(false);
    }
  };

  return (
    <div className="card-box">
      {/* Header */}
      <div className="card-box-header">
        <div className="title-with-icon">
          <MessageSquare size={16} className="text-accent" />
          <div>
            <div className="box-title">Messenger Rich Embeds</div>
            <div className="box-subtitle">Display videos & memes directly in chat bubbles</div>
          </div>
        </div>

        <label className="toggle-switch">
          <input type="checkbox" checked={config.enabled} onChange={toggleMaster} />
          <span className="slider" />
        </label>
      </div>

      {config.enabled && (
        <div className="section-body animate-fade-in" style={{ marginTop: '12px' }}>
          {/* Platforms Selection */}
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>
            ENABLED PLATFORMS
          </div>

          <div className="platform-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            <label className="checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e4e4e7', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.enabledPlatforms.youtube}
                onChange={() => togglePlatform('youtube')}
              />
              <span>YouTube Shorts</span>
            </label>

            <label className="checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e4e4e7', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.enabledPlatforms['x-twitter']}
                onChange={() => togglePlatform('x-twitter')}
              />
              <span>𝕏 / Twitter</span>
            </label>

            <label className="checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e4e4e7', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.enabledPlatforms.instagram}
                onChange={() => togglePlatform('instagram')}
              />
              <span>Instagram Reels</span>
            </label>

            <label className="checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e4e4e7', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.enabledPlatforms.facebook}
                onChange={() => togglePlatform('facebook')}
              />
              <span>Facebook Reels</span>
            </label>

            <label className="checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e4e4e7', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.enabledPlatforms.tiktok}
                onChange={() => togglePlatform('tiktok')}
              />
              <span>TikTok</span>
            </label>
          </div>

          {/* Preferences */}
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#a1a1aa', marginBottom: '8px' }}>
            PLAYBACK & DISPLAY
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#d4d4d8', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <VolumeX size={13} style={{ color: '#a1a1aa' }} /> Mute videos by default
              </span>
              <input type="checkbox" checked={config.muteByDefault} onChange={toggleMute} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#d4d4d8', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Minimize2 size={13} style={{ color: '#a1a1aa' }} /> Auto-collapse tall embeds
              </span>
              <input type="checkbox" checked={config.autoCollapse} onChange={toggleAutoCollapse} />
            </label>
          </div>

          {/* Clear Cache Button */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#71717a' }}>2-Tier RAM & Disk Cache</span>
            <button
              type="button"
              className="varia-btn-secondary"
              onClick={handleClearCache}
              disabled={clearingCache}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#d4d4d8',
                cursor: 'pointer',
              }}
            >
              {cacheCleared ? (
                <>
                  <Check size={12} style={{ color: '#4ade80' }} /> Cleared!
                </>
              ) : (
                <>
                  <Trash2 size={12} /> Clear Cache
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
