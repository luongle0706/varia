/**
 * LinkConverter Feature Types
 */

export interface PlatformPreset {
  id: string;
  name: string;
  matchDomains: string[];
  engines: string[];
  selectedEngine: string;
  enabled: boolean;
}

export interface LinkConverterConfig {
  enabled: boolean;
  xEngine: string;
  customXEngines: string[];
  stripTrackingParams: boolean;
  showToast: boolean;
  showInShareMenu: boolean;
  autoConvertClipboard: boolean;
  platforms: PlatformPreset[];
}

export interface ConversionResult {
  original: string;
  converted: string;
  matched: boolean;
  platform?: string;
  engine?: string;
}
