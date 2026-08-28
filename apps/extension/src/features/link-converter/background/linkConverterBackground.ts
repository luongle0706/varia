import { StorageEngine } from '../../../core/storage/storageEngine';
import { DEFAULT_LINK_CONVERTER_CONFIG, STORAGE_KEY_LINK_CONVERTER } from '../defaults';
import { LinkConverterConfig } from '../types';
import { convertUrl } from '../urlConverter';

export function initLinkConverterBackground(): void {
  // Context Menu Setup
  if (typeof chrome !== 'undefined' && chrome?.contextMenus) {
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: 'varia-copy-embed-link',
        title: 'Copy as Embed Link',
        contexts: ['link', 'page'],
      });
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === 'varia-copy-embed-link' && tab?.id) {
        const targetUrl = info.linkUrl || info.pageUrl;
        if (!targetUrl) return;

        const config = await StorageEngine.get<LinkConverterConfig>(STORAGE_KEY_LINK_CONVERTER, DEFAULT_LINK_CONVERTER_CONFIG);
        const result = convertUrl(targetUrl, config);

        // Execute clipboard write in active tab context
        chrome.scripting?.executeScript?.({
          target: { tabId: tab.id },
          func: (textToCopy: string) => {
            navigator.clipboard.writeText(textToCopy);
          },
          args: [result.converted],
        });
      }
    });
  }

  // Keyboard Command Setup (Alt+Shift+C)
  if (typeof chrome !== 'undefined' && chrome?.commands) {
    chrome.commands.onCommand.addListener(async (command) => {
      if (command === 'convert-active-tab') {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id && tab?.url) {
          const config = await StorageEngine.get<LinkConverterConfig>(STORAGE_KEY_LINK_CONVERTER, DEFAULT_LINK_CONVERTER_CONFIG);
          const result = convertUrl(tab.url, config);

          chrome.scripting?.executeScript?.({
            target: { tabId: tab.id },
            func: (textToCopy: string) => {
              navigator.clipboard.writeText(textToCopy);
            },
            args: [result.converted],
          });
        }
      }
    });
  }
}
