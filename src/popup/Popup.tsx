import { useBucket } from '@extend-chrome/storage';

export const Popup = () => {
  document.body.className = 'w-[5rem] h-[5rem]';
  const bucket = useBucket<{ token: string }>('local', 'token');

  const copyToken = async () => {
    const { token } = await bucket.get('token');
    if (!token) {
      alert('No token found');
      return;
    }
    await navigator.clipboard.writeText(token);
    // show toast for 3 seconds
  };

  return (
    <div className="flex justify-center mt-2 text-base">
      <button className="ml-2" onClick={copyToken}>
        copy token
      </button>
    </div>
  );
};
