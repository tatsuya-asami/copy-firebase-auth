import { useCallback, useEffect } from 'react';
import { useBucket } from '@extend-chrome/storage';

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
    getToken();
  }, [getToken]);

  return null;
};
