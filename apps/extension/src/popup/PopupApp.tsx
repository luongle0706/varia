import React, { useState } from 'react';
import { Link2, Download, Settings, Sparkles, Keyboard } from 'lucide-react';
import { useExtensionStorage } from '../core/storage/useExtensionStorage';
import {
  DEFAULT_LINK_CONVERTER_CONFIG,
  STORAGE_KEY_LINK_CONVERTER,
} from '../features/link-converter/defaults';
import { LinkConverterConfig } from '../features/link-converter/types';
import { LinkConverterSection } from '../features/link-converter/ui/LinkConverterSection';
import { QuickConvertBox } from '../features/link-converter/ui/QuickConvertBox';
import {
  DEFAULT_MEDIA_DOWNLOADER_CONFIG,
  STORAGE_KEY_MEDIA_DOWNLOADER,
} from '../features/media-downloader/types';
import { MediaDownloaderSection } from '../features/media-downloader/ui/MediaDownloaderSection';

export const PopupApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'links' | 'downloader' | 'about'>('links');

  const [linkConfig, setLinkConfig] = useExtensionStorage<LinkConverterConfig>(
    STORAGE_KEY_LINK_CONVERTER,
    DEFAULT_LINK_CONVERTER_CONFIG,
  );

  const [mediaConfig, setMediaConfig] = useExtensionStorage(
    STORAGE_KEY_MEDIA_DOWNLOADER,
    DEFAULT_MEDIA_DOWNLOADER_CONFIG,
  );

  return (
    <div className="popup-app">
      {/* Top Header */}
      <header className="popup-header">
        <div className="header-left">
          <div className="brand-logo">
            <Link2 size={16} className="logo-icon" />
          </div>
          <div className="brand-info">
            <div className="brand-title-row">
              <span className="brand-name">Varia</span>
              <span className="brand-badge">v1.0.0</span>
            </div>
            <span className="brand-subtitle">Smart Link & Media Fixer</span>
          </div>
        </div>

        <div className="header-status">
          <span className={`status-pill ${linkConfig.enabled ? 'active' : 'disabled'}`}>
            <span className="status-dot" />
            {linkConfig.enabled ? 'Active' : 'Paused'}
          </span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tab-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <Link2 size={14} />
          <span>Link Fixer</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'downloader' ? 'active' : ''}`}
          onClick={() => setActiveTab('downloader')}
        >
          <Download size={14} />
          <span>Media (IDM)</span>
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          <Settings size={14} />
          <span>About</span>
        </button>
      </nav>

      {/* Main Tab Content */}
      <main className="popup-content">
        {activeTab === 'links' && (
          <div className="tab-panel animate-fade-in">
            <QuickConvertBox config={linkConfig} />
            <LinkConverterSection config={linkConfig} onChange={setLinkConfig} />
          </div>
        )}

        {activeTab === 'downloader' && (
          <div className="tab-panel animate-fade-in">
            <MediaDownloaderSection config={mediaConfig} onChange={setMediaConfig} />
          </div>
        )}

        {activeTab === 'about' && (
          <div className="tab-panel animate-fade-in">
            <div className="card-box">
              <div className="card-box-header">
                <div className="title-with-icon">
                  <Keyboard size={16} className="text-accent" />
                  <div>
                    <div className="box-title">Shortcuts & Tips</div>
                  </div>
                </div>
              </div>

              <div className="shortcut-row">
                <span className="shortcut-desc">Copy embed link for active tab</span>
                <kbd className="kbd-badge">Alt + Shift + C</kbd>
              </div>

              <div className="shortcut-row">
                <span className="shortcut-desc">X (Twitter) Share Menu</span>
                <span className="hint-badge">Automatic Injected</span>
              </div>
            </div>

            <div className="card-box">
              <div className="card-box-header">
                <div className="title-with-icon">
                  <Sparkles size={16} className="text-accent" />
                  <div>
                    <div className="box-title">Varia Workspace</div>
                    <div className="box-subtitle">Part of the Varia media toolkit monorepo</div>
                  </div>
                </div>
              </div>

              <p className="about-text">
                This extension is designed with a plugin architecture ready to connect with your
                local Varia Hub server for video downloads, GIF studio, and audio conversion tools.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="popup-footer">
        <div className="footer-tip">
          <Keyboard size={12} />
          <span>
            Press <strong>Alt+Shift+C</strong> to convert tab
          </span>
        </div>
      </footer>
    </div>
  );
};
