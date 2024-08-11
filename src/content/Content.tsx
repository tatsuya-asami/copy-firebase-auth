import { useCallback, useEffect } from 'react';
import { useBucket } from '@extend-chrome/storage';
import { runtime } from 'webextension-polyfill';

const TARGET_HOSTNAMES = ['localhost'];
const isTargetHostname = TARGET_HOSTNAMES.includes(window.location.hostname);

export const Content = () => {
  const INDEXED_DB_NAME = 'firebaseLocalStorageDb';
  const STORAGE_NAME = 'firebaseLocalStorage';
  const bucket = useBucket<{ token: string }>('local', 'token');

  const removeToken = useCallback(() => {
    return bucket.remove('token');
  }, [bucket]);

  const getToken = useCallback(() => {
    const request = window.indexedDB.open(INDEXED_DB_NAME);

    request.onsuccess = async (event) => {
      // @ts-expect-error target is not defined
      const db = event.target?.result as IDBDatabase | undefined;

      if (!db || db.objectStoreNames.length === 0) {
        return;
      }

      const transaction = db.transaction([STORAGE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORAGE_NAME);

      objectStore.getAll().onsuccess = async (event) => {
        // @ts-expect-error target is not defined
        const result = event.target?.result;
        const value = result?.[0]?.value;
        if (!value) {
          await removeToken();
          console.log('No token found');
          return;
        }
        const accessToken = value.stsTokenManager.accessToken;
        bucket.set({ token: accessToken });
      };

      objectStore.getAll().onerror = async (event) => {
        await removeToken();
        console.log('Error getting token:', event);
      };
    };

    request.onerror = async (event) => {
      await removeToken();
      throw new Error(`Error opening firebaseLocalStorageDb: ${event}`);
    };
  }, [bucket, removeToken]);

  useEffect(() => {
    if (!isTargetHostname) {
      return;
    }
    getToken();
  }, [getToken]);

  runtime.onMessage.addListener(async (message, _, sendResponse) => {
    if (message.type !== 'set-token') {
      return;
    }
    const authorizeOpenButton = document.querySelector(
      'button.btn.authorize.unlocked'
    ) as HTMLButtonElement | null;
    if (!authorizeOpenButton) {
      console.log('authorizeOpenButton not found');
      return;
    }
    authorizeOpenButton.click();

    await new Promise((resolve) => setTimeout(resolve, 100));

    const element = document.getElementById('api_key_value') as HTMLInputElement | null;
    if (!element) {
      console.log('element not found');
      return;
    }
    const { token } = await bucket.get('token');

    element.setAttribute('value', token);
    // inputイベントを発火させないとクリックできない
    const event = new Event('input', { bubbles: true });
    element.dispatchEvent(event);

    const button = document.querySelector(
      'button.btn.modal-btn.auth.authorize.button[aria-label="Apply credentials"]'
    ) as HTMLButtonElement | null;
    if (!button) {
      console.log('Authorize button not found');
      return;
    }
    button.click();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find the Close button with the specified class
    const closeButton = document.querySelector(
      'button.btn.modal-btn.auth.btn-done.button'
    ) as HTMLButtonElement | null;
    if (!closeButton) {
      console.log('Close button not found');
      return;
    }

    closeButton.click();
    sendResponse();
    return true;
  });
  return null;
};
