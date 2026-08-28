/**
 * Core Extension Types & Contracts
 */

export interface BaseFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  version: string;
}

export type StorageArea = 'sync' | 'local';

export interface StorageChangeCallback<T> {
  (newValue: T, oldValue?: T): void;
}
