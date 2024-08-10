import { useCallback, useEffect } from 'react';
import { useBucket } from '@extend-chrome/storage';

export const Content = () => {
  const INDEXED_DB_NAME = 'firebaseLocalStorageDb';
  const STORAGE_NAME = 'firebaseLocalStorage';
  const bucket = useBucket<{ token: string }>('local', 'token');

  const getToken = useCallback(() => {
    const request = window.indexedDB.open(INDEXED_DB_NAME);

    request.onsuccess = (event) => {
      // @ts-expect-error target is not defined
      const db = event.target?.result as IDBDatabase;

      const transaction = db.transaction([STORAGE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORAGE_NAME);

      objectStore.getAll().onsuccess = async (event) => {
        // @ts-expect-error target is not defined
        const result = event.target?.result;
        const value = result[0].value;
        const accessToken = value.stsTokenManager.accessToken;
        bucket.set({ token: accessToken });
        console.log(await bucket.get());
      };

      objectStore.getAll().onerror = function (event) {
        console.error('Error fetching data from firebaseLocalStorage:', event);
      };
    };

    request.onerror = function (event) {
      console.error('Error opening firebaseLocalStorageDb:', event);
    };
  }, [bucket]);

  useEffect(() => {
    getToken();
  }, [getToken]);

  return null;
};
