import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Trash2,
  Settings2,
  Check,
  ShieldCheck,
  Layers,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { LinkConverterConfig } from '../types';
import { extractHost } from '../urlConverter';

interface LinkConverterSectionProps {
  config: LinkConverterConfig;
  onChange: (updater: (prev: LinkConverterConfig) => LinkConverterConfig) => Promise<void>;
}

export const LinkConverterSection: React.FC<LinkConverterSectionProps> = ({ config, onChange }) => {
  const [newCustomEngine, setNewCustomEngine] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);
  const [inputError, setInputError] = useState('');

  // Combined X engines: presets + user custom engines
  const defaultXEngines = [
    'https://fixupx.com',
    'https://fxtwitter.com',
    'https://cunnyx.com',
    'https://vxtwitter.com',
    'https://twittpr.com',
  ];

  const allXEngines = Array.from(new Set([...defaultXEngines, ...(config.customXEngines || [])]));

  const handleSelectXEngine = (engine: string) => {
    onChange(prev => ({
      ...prev,
      xEngine: engine,
    }));
  };

  const handleAddCustomEngine = () => {
    const trimmed = newCustomEngine.trim();
    if (!trimmed) return;

    let normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    try {
      new URL(normalized);
    } catch {
      setInputError('Please enter a valid URL/domain (e.g. cunnyx.com)');
      return;
    }

    onChange(prev => ({
      ...prev,
      xEngine: normalized,
      customXEngines: Array.from(new Set([...(prev.customXEngines || []), normalized])),
    }));

    setNewCustomEngine('');
    setShowCustomInput(false);
    setInputError('');
  };

  const handleRemoveCustomEngine = (engineToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(prev => {
      const nextCustom = (prev.customXEngines || []).filter(e => e !== engineToRemove);
      const nextActive = prev.xEngine === engineToRemove ? 'https://fixupx.com' : prev.xEngine;
      return {
        ...prev,
        customXEngines: nextCustom,
        xEngine: nextActive,
      };
    });
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

  return (
    <div className="section-container">
      {/* 𝕏 Post Embed Engine Selector */}
      <div className="card-box">
        <div className="card-box-header">
          <div className="title-with-icon">
            <span className="platform-icon-badge">𝕏</span>
            <div>
              <div className="box-title">𝕏 (Twitter) Embed Engine</div>
              <div className="box-subtitle">Choose the destination domain for post embeds</div>
            </div>
          </div>
        </div>

        {/* Engine Grid / Pills */}
        <div className="engine-grid">
          {allXEngines.map(engine => {
            const host = extractHost(engine);
            const isSelected = extractHost(config.xEngine) === host;
            const isCustom = !defaultXEngines.includes(engine);

            return (
              <button
                key={engine}
                type="button"
                className={`engine-pill ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectXEngine(engine)}
              >
                <span className="pill-dot" />
                <span className="pill-name">{host}</span>
                {isSelected && <Check size={13} className="pill-check" />}
                {isCustom && (
                  <Trash2
                    size={13}
                    className="pill-delete"
                    onClick={e => handleRemoveCustomEngine(engine, e)}
                  />
                )}
              </button>
            );
          })}

          {!showCustomInput ? (
            <button
              type="button"
              className="engine-pill-add"
              onClick={() => setShowCustomInput(true)}
            >
              <Plus size={13} />
              <span>Custom Engine</span>
            </button>
          ) : (
            <div className="custom-engine-input-row">
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. cunnyx.com"
                value={newCustomEngine}
                onChange={e => {
                  setNewCustomEngine(e.target.value);
                  setInputError('');
                }}
                onKeyDown={e => e.key === 'Enter' && handleAddCustomEngine()}
                autoFocus
              />
              <button type="button" className="btn-add" onClick={handleAddCustomEngine}>
                Add
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowCustomInput(false);
                  setInputError('');
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {inputError && <div className="error-text">{inputError}</div>}
      </div>

      {/* Integration & Privacy Preferences */}
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
                <span>Show in 𝕏 Share Dropdown</span>
              </div>
              <div className="toggle-desc">
                Adds "Copy embed link" natively inside X's post menu
              </div>
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
                <span>Strip Tracking Queries</span>
              </div>
              <div className="toggle-desc">Removes ?s=20, ?t=..., utm_* from copied links</div>
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
                <span>Floating Toast Feedback</span>
              </div>
              <div className="toggle-desc">
                Displays a subtle notification when embed link is copied
              </div>
            </div>
            <div className={`switch ${config.showToast ? 'checked' : ''}`}>
              <div className="switch-thumb" />
            </div>
          </div>
        </div>
      </div>

      {/* Other Platforms (Reddit, Instagram, TikTok, etc.) */}
      <div className="card-box">
        <div
          className="card-box-header clickable"
          onClick={() => setShowOtherPlatforms(!showOtherPlatforms)}
        >
          <div className="title-with-icon">
            <Globe size={16} className="text-accent" />
            <div>
              <div className="box-title">Other Platforms ({config.platforms.length})</div>
              <div className="box-subtitle">Reddit, Instagram, TikTok, Bluesky, Pixiv</div>
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
