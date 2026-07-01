import { createPortal } from 'react-dom';
import { useState } from 'react';

/**
 * Inline image lightbox — renders at document.body via portal.
 * Close: click backdrop or × button. Download: Fetch + Blob to force local download.
 */
const ImageLightbox = ({ src, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!src) return null;

  const handleDownload = async (e) => {
    // 1. Prevent default <a> tag navigation behavior
    e.preventDefault();
    if (isDownloading) return;

    try {
      setIsDownloading(true);

      // 2. Fetch the image data directly from Cloudinary
      const response = await fetch(src, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();

      // 3. Create a local temporary object URL for the image data binary
      const blobUrl = window.URL.createObjectURL(blob);

      // 4. Extract a filename from the Cloudinary URL or fall back to a generic name
      const filename = src.split('/').pop().split('?')[0] || 'download.jpg';

      // 5. Create a temporary hidden anchor tag, simulate a click, and clean up
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup DOM and memory
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image seamlessly:', error);
      // Fallback: If CORS blocks the fetch, open it in a new tab so the user can right-click save
      window.open(src, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <img
          src={src}
          alt="preview"
          className="max-w-[92vw] max-h-[82vh] object-contain rounded-xl shadow-2xl select-none"
        />

        {/* Controls bar */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full border border-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download"
          >
            {isDownloading ? '⏳ Downloading...' : '⬇ Download'}
          </button>
          
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-red-500/80 text-white text-sm rounded-full border border-white/20 transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageLightbox;