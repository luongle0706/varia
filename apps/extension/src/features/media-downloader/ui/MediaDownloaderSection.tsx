import React from 'react';
import { Download, Radio, Server, Film } from 'lucide-react';
import { MediaDownloaderConfig } from '../types';

interface MediaDownloaderSectionProps {
  config: MediaDownloaderConfig;
  onChange: (updater: (prev: MediaDownloaderConfig) => MediaDownloaderConfig) => Promise<void>;
}

export const MediaDownloaderSection: React.FC<MediaDownloaderSectionProps> = ({ config, onChange }) => {
  const handleToggle = (key: keyof Pick<MediaDownloaderConfig, 'enabled' | 'autoSniff' | 'bridgeToVariaHub'>) => {
    onChange((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="section-container">
      {/* IDM Architecture Preview Card */}
      <div className="card-box highlight-card">
        <div className="card-box-header">
          <div className="title-with-icon">
            <div className="icon-badge-gradient">
              <Download size={16} />
            </div>
            <div>
              <div className="box-title">Media Grabber & IDM Hub</div>
              <div className="box-subtitle">Extensible stream capture & Varia tool ecosystem</div>
            </div>
          </div>
        </div>

        <p className="highlight-description">
          This extension is architected with a modular plugin system. When you are ready to implement stream sniffing (m3u8, mp4, HLS) or YouTube download triggers, this module plugs directly into your local Varia Hub.
        </p>

        <div className="toggle-list">
          <div className="toggle-item" onClick={() => handleToggle('enabled')}>
            <div className="toggle-info">
              <div className="toggle-label">
                <Radio size={14} />
                <span>Media Sniffer Engine</span>
              </div>
              <div className="toggle-desc">Detect video streams and audio media on web pages</div>
            </div>
            <div className={`switch ${config.enabled ? 'checked' : ''}`}>
              <div className="switch-thumb" />
            </div>
          </div>

          <div className="toggle-item" onClick={() => handleToggle('bridgeToVariaHub')}>
            <div className="toggle-info">
              <div className="toggle-label">
                <Server size={14} />
                <span>Varia Hub Direct Bridge</span>
              </div>
              <div className="toggle-desc">Forward media to local Varia Hub for FFmpeg / GIF processing</div>
            </div>
            <div className={`switch ${config.bridgeToVariaHub ? 'checked' : ''}`}>
              <div className="switch-thumb" />
            </div>
          </div>
        </div>
      </div>

      <div className="card-box">
        <div className="card-box-header">
          <div className="title-with-icon">
            <Film size={16} className="text-accent" />
            <div>
              <div className="box-title">Supported Media Streams</div>
              <div className="box-subtitle">Configured format extractors</div>
            </div>
          </div>
        </div>

        <div className="tags-row">
          {config.supportedFormats.map((fmt) => (
            <span key={fmt} className="format-tag">
              .{fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
