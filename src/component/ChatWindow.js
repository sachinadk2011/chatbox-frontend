import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import ProfileHeader from './ProfileHeader';
import MessageBox from './MessageBox';
import MessageContext from '../context/message/MessageContext';
import Picker from 'emoji-picker-react';


const ChatWindow = ({ onBack }) => {
  const { sendMessage, Selecteduser, setMessages, messages } = React.useContext(MessageContext);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const emojiBtnRef = useRef(null);

  const [isShowingEmoji, setIsShowingEmoji] = useState(false);
  const [images, setImages] = useState([]);

  /* ── Detect mobile (< 768px) ── */
  const isMobile = () => window.innerWidth < 768;

  /* ── Emoji click: insert into input ── */
  const onEmojiClick = (emojiObject) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? input.value.length;
      const newVal = input.value.slice(0, start) + emojiObject.emoji + input.value.slice(end);
      input.value = newVal;
      // move cursor after inserted emoji
      requestAnimationFrame(() => {
        input.selectionStart = input.selectionEnd = start + emojiObject.emoji.length;
        input.focus();
      });
    }
  };

  /* ── Toggle emoji: native on mobile, picker on desktop ── */
  const handleEmojiToggle = () => {
    if (isMobile()) {
      // Trick: blur then focus with inputmode="emoji" to open native emoji keyboard
      if (inputRef.current) {
        inputRef.current.blur();
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    } else {
      setIsShowingEmoji((prev) => !prev);
    }
  };

  /* ── Close picker on outside click ── */
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        isShowingEmoji &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setIsShowingEmoji(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isShowingEmoji]);

  /* ── File handling ── */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = ['image/', 'video/'];
    for (const file of files) {
      if (!allowed.some((type) => file.type.startsWith(type))) return;
    }
    const mapped = files.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      preview: file.type.startsWith('image/'),
      file,
    }));
    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Paste handler ── */
  useEffect(() => {
    const handlePaste = (e) => {
      const pastedFiles = [];
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      const allowed = ['image/', 'video/'];
      for (const file of pastedFiles) {
        if (!allowed.some((type) => file.type.startsWith(type))) return;
      }
      if (pastedFiles.length > 0) {
        const mapped = pastedFiles.map((file) => ({
          url: URL.createObjectURL(file),
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          preview: file.type.startsWith('image/'),
          file,
        }));
        setImages((prev) => [...prev, ...mapped]);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  /* ── Send message ── */
  const SendMessage = async (e) => {
    e.preventDefault();
    if (images.length === 0 && inputRef.current?.value.trim() === '') return;

    const formData = new FormData();
    const message = inputRef.current?.value || '';
    if (message) formData.append('message', message);
    images.forEach((f) => formData.append('files', f.file));
    formData.append('receiver', Selecteduser.receiverId);

    try {
      await sendMessage(formData);
      setImages([]);
      if (inputRef.current) inputRef.current.value = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  /* ── Icon button style ── */
  const iconBtn =
    'inline-flex items-center justify-center rounded-full h-9 w-9 transition-all duration-200 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 focus:outline-none flex-shrink-0';

  return (
    <>
      {/*
        ┌──────── ChatWindow layout ────────┐
        │  ProfileHeader  (fixed height)    │
        │  Messages area  (flex-1 scroll)   │
        │  [image previews if any]          │
        │  Input toolbar  (fixed height)    │
        └───────────────────────────────────┘
      */}
      <div className="flex flex-col w-full h-full overflow-hidden bg-gray-50">

        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <ProfileHeader onBack={onBack} />
        </div>

        {/* ── Messages (grows to fill available space) ── */}
        <div
          id="messages"
          className="flex-1 flex flex-col-reverse gap-y-1 overflow-y-auto px-3 py-3 min-h-0"
        >
          <MessageBox />

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            ref={fileRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* ── Image previews (shown above toolbar) ── */}
        {images.length > 0 && (
          <div className="flex-shrink-0 flex flex-wrap gap-2 px-4 pt-2 pb-1 bg-white border-t border-gray-100">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
              >
                {image.preview ? (
                  <img src={image.url} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                    <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M15 2v5h5v15h-16v-20h11zm1-2h-14v24h20v-18l-6-6z" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 text-white bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 truncate px-0.5">
                  {image.size}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Input toolbar ── */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-2">
          <form onSubmit={SendMessage}>
            <div className="flex items-center gap-1">

              {/* Mic button */}
              <button type="button" className={iconBtn} title="Voice">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              {/* Text input (grows) */}
              <input
                type="text"
                name="message"
                ref={inputRef}
                placeholder="Message..."
                className="flex-1 min-w-0 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              />

              {/* Emoji toggle — with floating picker on desktop */}
              <div className="relative" ref={emojiBtnRef}>
                <button
                  type="button"
                  onClick={handleEmojiToggle}
                  className={`${iconBtn} ${isShowingEmoji ? 'text-indigo-500 bg-indigo-50' : ''}`}
                  title="Emoji"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {/* Floating emoji picker — desktop only */}
                {isShowingEmoji && (
                  <div className="absolute bottom-12 right-0 z-50 shadow-2xl rounded-2xl overflow-hidden">
                    <Picker onEmojiClick={onEmojiClick} height={380} width={320} />
                  </div>
                )}
              </div>

              {/* Attach / camera */}
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className={iconBtn}
                title="Attach photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Send button */}
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full h-9 w-9 bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all duration-200 text-white shadow-md focus:outline-none flex-shrink-0"
                title="Send"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 rotate-90">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>

            </div>
          </form>
        </div>

      </div>
    </>
  );
};

export default ChatWindow;