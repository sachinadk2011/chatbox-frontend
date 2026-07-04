/**
 * MessageToolbar.jsx
 *
 * PURPOSE:
 *   The sticky bottom input bar of the chat window. Renders:
 *     • Microphone / voice placeholder button (left)
 *     • Text input field (middle)
 *     • Emoji picker toggle + floating picker panel
 *     • File attachment picker button
 *     • Send button (shows spinner while sending, arrow when idle)
 *
 * RESPONSIBILITY:
 *   Pure UI + UX for the input row.  Has NO knowledge of:
 *     - How messages are stored
 *     - Which user is selected
 *     - The message list above
 *   It receives everything it needs via props from ChatWindow.
 *
 * PROPS:
 *   inputRef        — ref forwarded to the <input> element
 *   fileRef         — ref forwarded to the hidden <input type="file">
 *   isSending       — boolean; when true the send button shows a spinner
 *   sendError       — string | '' — displayed below the toolbar on error
 *   onSubmit        — (event) => void — form submit handler
 *   onFileChange    — (event) => void — file input change handler
 *   emojiBtnRef     — ref for the emoji toggle button (used for outside-click detection)
 *   isShowingEmoji  — boolean
 *   onEmojiToggle   — () => void
 *   onEmojiClick    — (emojiObject) => void
 */

import React from 'react';
import Picker from 'emoji-picker-react';

const iconBtn =
  'inline-flex items-center justify-center rounded-full h-9 w-9 transition-all duration-200 ' +
  'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 focus:outline-none flex-shrink-0';

const MessageToolbar = ({
  inputRef,
  fileRef,
  isSending,
  sendError,
  onSubmit,
  onFileChange,
  emojiBtnRef,
  isShowingEmoji,
  onEmojiToggle,
  onEmojiClick,
}) => (
  <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-2">
    <form onSubmit={onSubmit}>
      <div className="flex items-center gap-1">

        {/* Voice placeholder */}
        <button type="button" className={iconBtn} title="Voice">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        {/* Text input */}
        <input
          type="text"
          name="message"
          ref={inputRef}
          placeholder="Message…"
          className="flex-1 min-w-0 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        />

        {/* Emoji picker */}
        <div className="relative" ref={emojiBtnRef}>
          <button
            type="button"
            onClick={onEmojiToggle}
            className={`${iconBtn} ${isShowingEmoji ? 'text-indigo-500 bg-indigo-50' : ''}`}
            title="Emoji"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {isShowingEmoji && (
            <div className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-2xl overflow-hidden">
              <Picker onEmojiClick={onEmojiClick} height={380} width={320} />
            </div>
          )}
        </div>

        {/* File attachment */}
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          ref={fileRef}
          onChange={onFileChange}
          className="hidden"
        />
        <button type="button" onClick={() => fileRef.current?.click()} className={iconBtn} title="Attach">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Send button — spinner while sending, arrow when idle */}
        <button
          type="submit"
          disabled={isSending}
          title={isSending ? 'Sending…' : 'Send'}
          className={
            `inline-flex items-center justify-center rounded-full h-9 w-9 transition-all duration-200 text-white shadow-md focus:outline-none flex-shrink-0 ` +
            (isSending
              ? 'bg-indigo-400 cursor-not-allowed scale-95'
              : 'bg-indigo-500 hover:bg-indigo-600 active:scale-95')
          }
        >
          {isSending ? (
            /* Spinning ring while sending */
            <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
          ) : (
            /* Arrow (send) icon */
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 rotate-90">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>

      </div>
    </form>

    {/* Inline error message */}
    {sendError && (
      <p className="text-xs text-red-500 mt-1 px-1">{sendError}</p>
    )}
  </div>
);

export default MessageToolbar;
