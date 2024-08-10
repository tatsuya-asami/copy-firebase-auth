import browser, { tabs } from 'webextension-polyfill';
import store, { initializeWrappedStore } from '../app/store';

initializeWrappedStore();

store.subscribe(() => {
  // access store state
  // const state = store.getState();
  // console.log('state', state);
});

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type !== 'token-copied') {
    return;
  }
  const tab = await tabs.query({ active: true, currentWindow: true });
  const tabId = tab[0]?.id ?? 0;
  if (!tabId) {
    return;
  }
  browser.tabs.sendMessage(tabId, { type: 'token-copied', token: message.token });
  sendResponse();
});

// show welcome page on new install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    //show the welcome page
    const url = browser.runtime.getURL('welcome/welcome.html');
    await browser.tabs.create({ url });
  }
});
