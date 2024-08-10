import { useBucket } from '@extend-chrome/storage';
import { useState } from 'react';

export const Popup = () => {
  document.body.className = 'w-[10rem] h-[5rem]';
  const bucket = useBucket<{ token: string }>('local', 'token');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; message: string }>({
    type: 'success',
    message: '',
  });

  const copyToken = async () => {
    const { token } = await bucket.get('token');
    if (!token) {
      setMessage({ type: 'error', message: 'No token found' });
      setTimeout(() => setMessage({ type: 'success', message: '' }), 5000);
      return;
    }
    await navigator.clipboard.writeText(token);
    setMessage({ type: 'success', message: 'Token copied' });
    setTimeout(() => setMessage({ type: 'success', message: '' }), 5000);
  };

  return (
    <div className="flex justify-center mt-2 text-base">
      <ul>
        <li>
          <button
            type="button"
            onClick={copyToken}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            Copy token
          </button>
        </li>
        <li>
          <p className={`ml-2 ${message.type === 'error' ? 'text-red-500' : ''}`}>
            {message.message}
          </p>
        </li>
      </ul>
    </div>
  );
};
