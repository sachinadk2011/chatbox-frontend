/**
 * AttachmentPreview.jsx
 *
 * PURPOSE:
 *   Renders the thumbnail strip of pending attachments (images/videos) above
 *   the message input toolbar, before they are sent.
 *
 * RESPONSIBILITY:
 *   Pure display + a "remove" button per item.
 *   Has NO knowledge of how files are sent — it receives them as props and
 *   calls onRemove(index) when the user clicks ×.
 *
 * PROPS:
 *   images   — array of attachment objects from ChatWindow state
 *              { url, name, size, preview (bool), file }
 *   onRemove — (index: number) => void
 */

import React from 'react';

const AttachmentPreview = ({ images, onRemove }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex-shrink-0 flex flex-wrap gap-2 px-4 pt-2 pb-1 bg-white border-t border-gray-100">
      {images.map((img, i) => (
        <div
          key={i}
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
        >
          {/* Preview thumbnail — image shows the image, video/file shows filename */}
          {img.preview
            ? <img src={img.url} alt="preview" className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center px-1">
                {img.name}
              </div>
            )
          }

          {/* Remove button */}
          <button
            onClick={() => onRemove(i)}
            className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold leading-none"
            aria-label={`Remove ${img.name}`}
          >
            ×
          </button>

          {/* File size label */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 truncate px-1">
            {img.size}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentPreview;
