import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { LinkConverterConfig } from '../types';
import { convertUrl } from '../urlConverter';

interface QuickConvertBoxProps {
  config: LinkConverterConfig;
}

export const QuickConvertBox: React.FC<QuickConvertBoxProps> = ({ config }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const conversion = inputUrl.trim() ? convertUrl(inputUrl, config) : null;

  const handleCopy = async () => {
    if (!conversion?.converted) return;
    try {
      await navigator.clipboard.writeText(conversion.converted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="quick-convert-card">
      <div className="card-header">
        <div className="card-title-row">
          <Sparkles className="icon-sparkle" size={15} />
          <span>Quick Link Tester</span>
        </div>
      </div>

      <div className="input-group">
        <input
          type="text"
          className="text-input"
          placeholder="Paste an X, Reddit, or Instagram link..."
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
        />
      </div>

      {conversion && conversion.matched && (
        <div className="conversion-result animate-fade-in">
          <div className="result-header">
            <span className="badge-platform">{conversion.platform}</span>
            <span className="badge-engine">via {conversion.engine}</span>
          </div>

          <div className="result-box">
            <div className="result-url" title={conversion.converted}>
              {conversion.converted}
            </div>
            <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
