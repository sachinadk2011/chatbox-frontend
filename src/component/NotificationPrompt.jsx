import { useState, useEffect } from 'react';
import { requestNotificationPermission, getNotificationStatus } from '../utils/notificationUtils';

const NotificationPrompt = () => {
  const [status, setStatus] = useState('default');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setStatus(getNotificationStatus());
    // If already decided, don't show
    const wasDismissed = localStorage.getItem('notif-prompt-dismissed');
    console.info("Notification permission status: ", status, " | wasDismissed: ", wasDismissed);
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setStatus(result);
    if (result !== 'default') setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notif-prompt-dismissed', '1');
  };

  // Only show the banner if permission hasn't been decided yet
  if (status !== 'default' || dismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50
                    flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl
                    bg-white border border-indigo-100 max-w-sm w-[calc(100%-2rem)]">
      <span className="text-2xl flex-shrink-0">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">Enable notifications</p>
        <p className="text-xs text-gray-500">Get notified when friends message you</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleEnable}
          className="text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600
                     px-3 py-1.5 rounded-lg transition-colors"
        >
          Enable
        </button>
        <button
          onClick={handleDismiss}
          className="text-xs text-gray-400 hover:text-gray-600 px-1 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default NotificationPrompt;