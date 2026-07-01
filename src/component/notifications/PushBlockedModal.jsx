import { createPortal } from 'react-dom';
import { useState } from 'react';

const detectBrowser = () => {
  const ua = navigator.userAgent;
  // Brave exposes navigator.brave
  if (navigator.brave) return 'brave';
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Edg/')) return 'edge';
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Safari')) return 'safari';
  return 'other';
};

const INSTRUCTIONS = {
  brave: {
    title: 'Enable push notifications in Brave',
    steps: [
      'Open a new tab and go to brave://settings/privacy',
      'Scroll down to "Use Google services for push messaging"',
      'Turn the toggle ON',
      'Come back here, refresh this page, and try enabling notifications again',
    ],
  },
  firefox: {
    title: 'Enable push notifications in Firefox',
    steps: [
      'Click the lock/info icon in the address bar',
      'Make sure "Notifications" permission is set to Allow',
      'If push still fails, check Settings → Privacy & Security → Permissions → Notifications',
    ],
  },
  safari: {
    title: 'Push notifications aren\'t supported',
    steps: [
      'Safari on iOS only supports push notifications if this site is added to your Home Screen',
      'Tap the Share icon → "Add to Home Screen"',
      'Open ChatWaves from the Home Screen icon, then enable notifications again',
    ],
  },
  other: {
    title: 'Push notifications unavailable',
    steps: [
      'Your browser may be blocking Google\'s push notification service for privacy reasons',
      'Check your browser\'s privacy or notification settings',
      'You can still use ChatWaves normally — you\'ll just get notifications only while the tab is open',
    ],
  },
};
INSTRUCTIONS.chrome = INSTRUCTIONS.other;
INSTRUCTIONS.edge = INSTRUCTIONS.other;

const PushBlockedModal = ({ onClose }) => {
  const browser = detectBrowser();
  const info = INSTRUCTIONS[browser] || INSTRUCTIONS.other;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">🔕</span>
          <div>
            <h3 className="font-bold text-gray-800 text-base">{info.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              Your browser is blocking background push notifications. You can still chat normally — notifications will work while ChatWaves is open.
            </p>
          </div>
        </div>

        <ol className="space-y-2 mb-5">
          {info.steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <button
          onClick={onClose}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Got it
        </button>
      </div>
    </div>,
    document.body
  );
};

export default PushBlockedModal;