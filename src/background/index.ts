import browser, { tabs } from 'webextension-polyfill';
import { initializeWrappedStore } from '../app/store';

initializeWrappedStore();

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type !== 'set-token') {
    return;
  }
  const tab = await tabs.query({ active: true, currentWindow: true });
  const tabId = tab[0]?.id ?? 0;
  if (!tabId) {
    return;
  }
  await browser.tabs.sendMessage(tabId, { type: 'set-token' });
  sendResponse();
});
