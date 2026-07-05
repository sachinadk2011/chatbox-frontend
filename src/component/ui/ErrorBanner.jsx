// component/ui/ErrorBanner.jsx
/**
 * ErrorBanner — small dismissible inline message, styled like the
 * auth-error banner in Login.jsx, reused wherever useUrlErrorMessage fires.
 */
const ErrorBanner = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 mx-3 mt-3 rounded-xl">
      <span className="flex-shrink-0">⚠️</span>
      <p className="flex-1">{message}</p>
      <button onClick={onDismiss} className="flex-shrink-0 text-red-400 hover:text-red-600 font-bold px-1">
        ✕
      </button>
    </div>
  );
};

export default ErrorBanner;