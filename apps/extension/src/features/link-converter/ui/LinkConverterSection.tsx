import React, { useState, useEffect } from 'react';
import {
  Globe,
  Settings2,
  Check,
  ShieldCheck,
  Layers,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LinkConverterConfig, PlatformPreset } from '../types';
import { extractHost } from '../urlConverter';

interface LinkConverterSectionProps {
  config: LinkConverterConfig;
  onChange: (updater: (prev: LinkConverterConfig) => LinkConverterConfig) => Promise<void>;
  detectedPlatformId?: string | null;
}

const PLATFORM_ICONS: Record<string, string> = {
  x: '𝕏',
  youtube: '📺',
  reddit: '👽',
  instagram: '📷',
  tiktok: '🎵',
  bluesky: '🦋',
  threads: '🧵',
  pixiv: '🎨',
};

export const LinkConverterSection: React.FC<LinkConverterSectionProps> = ({
  config,
  onChange,
  detectedPlatformId,
}) => {
  const [activePlatformId, setActivePlatformId] = useState<string>(detectedPlatformId || 'x');
  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);

  // Automatically switch active platform when user opens popup on a detected platform
  useEffect(() => {
    if (detectedPlatformId) {
      setActivePlatformId(detectedPlatformId);
    }
  }, [detectedPlatformId]);

  // Find active platform preset
  const activePreset: PlatformPreset | undefined = config.platforms.find(
    p => p.id === activePlatformId,
  );

  // Engines for currently active platform
  let activeEngines: string[] = [];
  let currentSelectedEngine = '';

  if (activePlatformId === 'x') {
    activeEngines = [
      'https://fixupx.com',
      'https://fxtwitter.com',
      'https://cunnyx.com',
      'https://vxtwitter.com',
      'https://twittpr.com',
    ];
    currentSelectedEngine = config.xEngine || 'https://fixupx.com';
  } else if (activePreset) {
    activeEngines = activePreset.engines || [];
    currentSelectedEngine = activePreset.selectedEngine || activeEngines[0] || '';
  }

  const handleSelectEngine = (engine: string) => {
    if (activePlatformId === 'x') {
      onChange(prev => ({
        ...prev,
        xEngine: engine,
      }));
    } else {
      onChange(prev => ({
        ...prev,
        platforms: prev.platforms.map(p =>
          p.id === activePlatformId ? { ...p, selectedEngine: engine } : p,
        ),
      }));
    }
  };

  const handleToggle = (
    key: keyof Pick<
      LinkConverterConfig,
      'enabled' | 'showInShareMenu' | 'stripTrackingParams' | 'showToast'
    >,
  ) => {
    onChange(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePlatformEngineChange = (platformId: string, engine: string) => {
    onChange(prev => ({
      ...prev,
      platforms: prev.platforms.map(p =>
        p.id === platformId ? { ...p, selectedEngine: engine } : p,
      ),
    }));
  };

  const handlePlatformToggle = (platformId: string) => {
    onChange(prev => ({
      ...prev,
      platforms: prev.platforms.map(p => (p.id === platformId ? { ...p, enabled: !p.enabled } : p)),
    }));
  };

  const currentPlatformTitle =
    activePreset?.name || (activePlatformId === 'x' ? 'X (Twitter)' : activePlatformId);

  return (
    <div className="section-container">
      {/* Dynamic Context-Aware Featured Platform Engine Card */}
      <div className="card-box highlight-card">
        <div className="card-box-header">
          <div className="title-with-icon">
            <span className="platform-icon-badge">{PLATFORM_ICONS[activePlatformId] || '🔗'}</span>
            <div>
              <div className="box-title-row">
                <span className="box-title">{currentPlatformTitle} Embed Engine</span>
              </div>
              <div className="box-subtitle">
                Choose destination format for {currentPlatformTitle} links
              </div>
            </div>
          </div>
        </div>

        {/* Engine Grid / Pills */}
        <div className="engine-grid">
          {activeEngines.map(engine => {
            const host = extractHost(engine);
            const isSelected = extractHost(currentSelectedEngine) === host;

            return (
              <button
                key={engine}
                type="button"
                className={`engine-pill ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectEngine(engine)}
              >
                <span className="pill-dot" />
                <span className="pill-name">{host}</span>
                {isSelected && <Check size={13} className="pill-check" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferences & Integration */}
      <div className="card-box">
        <div className="card-box-header">
          <div className="title-with-icon">
            <Settings2 size={16} className="text-accent" />
            <div>
              <div className="box-title">Preferences & Integration</div>
            </div>
          </div>
        </div>

        <div className="toggle-list">
          {/* In-Menu Injector */}
          <div className="toggle-item" onClick={() => handleToggle('showInShareMenu')}>
            <div className="toggle-info">
              <div className="toggle-label">
                <Layers size={14} />
                <span>Show in 𝕏 & YouTube Context Menus</span>
              </div>
              <div className="toggle-desc">Adds native copy embed option to post/video menus</div>
            </div>
            <div className={`switch ${config.showInShareMenu ? 'checked' : ''}`}>
              <div className="switch-thumb" />
            </div>
          </div>

          {/* Tracking Parameter Stripper */}
          <div className="toggle-item" onClick={() => handleToggle('stripTrackingParams')}>
            <div className="toggle-info">
              <div className="toggle-label">
                <ShieldCheck size={14} />
                <span>Strip Tracking & Playlists</span>
              </div>
              <div className="toggle-desc">Removes ?s=20, &list=..., &index=..., utm_*</div>
            </div>
            <div className={`switch ${config.stripTrackingParams ? 'checked' : ''}`}>
              <div className="switch-thumb" />
            </div>
          </div>

          {/* Toast Notification */}
          <div className="toggle-item" onClick={() => handleToggle('showToast')}>
            <div className="toggle-info">
              <div className="toggle-label">
                <Bell size={14} />
                <span>Native Toast & Bezel Feedback</span>
              </div>
              <div className="toggle-desc">Displays confirmation toast when link is copied</div>
            </div>
            <div className={`switch ${config.showToast ? 'checked' : ''}`}>
              <div className="switch-thumb" />
            </div>
          </div>
        </div>
      </div>

      {/* Other Platforms Accordion */}
      <div className="card-box">
        <div
          className="card-box-header clickable"
          onClick={() => setShowOtherPlatforms(!showOtherPlatforms)}
        >
          <div className="title-with-icon">
            <Globe size={16} className="text-accent" />
            <div>
              <div className="box-title">All Supported Platforms ({config.platforms.length})</div>
              <div className="box-subtitle">YouTube, Reddit, Instagram, TikTok, Bluesky, Pixiv</div>
            </div>
          </div>
          {showOtherPlatforms ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>

        {showOtherPlatforms && (
          <div className="platform-list animate-fade-in">
            {config.platforms.map(platform => (
              <div key={platform.id} className="platform-row">
                <div className="platform-name-col">
                  <div
                    className={`platform-checkbox ${platform.enabled ? 'checked' : ''}`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    {platform.enabled && <Check size={12} />}
                  </div>
                  <span className="platform-title">{platform.name}</span>
                </div>

                <div className="platform-engine-select-wrapper">
                  <select
                    className="platform-select"
                    value={platform.selectedEngine}
                    disabled={!platform.enabled}
                    onChange={e => handlePlatformEngineChange(platform.id, e.target.value)}
                  >
                    {platform.engines.map(engine => (
                      <option key={engine} value={engine}>
                        {extractHost(engine)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
