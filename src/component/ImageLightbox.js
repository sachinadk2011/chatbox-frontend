import { createPortal } from 'react-dom';

/**
 * Inline image lightbox — renders at document.body via portal.
 * Close: click backdrop or × button. Download: ↓ button.
 */
const ImageLightbox = ({ src, onClose }) => {
  if (!src) return null;
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
          <a
            href={src}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full border border-white/20 transition-colors"
            title="Download"
          >
            ⬇ Download
          </a>
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
