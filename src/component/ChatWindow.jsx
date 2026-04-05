import React, { useState, useRef, useEffect } from 'react';
import '../App.css';
import ProfileHeader from './ProfileHeader';
import MessageBox from './MessageBox';
import MessageContext from '../context/message/MessageContext';
import Picker from 'emoji-picker-react';

const ChatWindow = ({ onBack }) => {
  const { sendMessage, Selecteduser, drafts, setDraft } = React.useContext(MessageContext);
  const fileRef     = useRef(null);
  const inputRef    = useRef(null);
  const emojiBtnRef = useRef(null);
  const prevRecvRef = useRef(null);
  const [isShowingEmoji, setIsShowingEmoji] = useState(false);
  const [images, setImages] = useState([]);
  const [sendError, setSendError] = useState('');

  // ── Save draft for old user; restore draft for new user on switch ──
  useEffect(() => {
    const prevId = prevRecvRef.current;
    const newId  = Selecteduser?.receiverId;
    // Save current text as draft for previous partner
    if (prevId && inputRef.current) {
      setDraft(prevId, inputRef.current.value || null);
    }
    // Restore draft (or empty) for newly selected partner
    if (inputRef.current) {
      inputRef.current.value = (newId && drafts[newId]) || '';
    }
    prevRecvRef.current = newId;
    setImages([]);
    setSendError('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Selecteduser?.receiverId]);

  const isMobile = () => window.innerWidth < 768;

  const onEmojiClick = (emojiObject) => {
    if (!inputRef.current) return;
    const el = inputRef.current;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    el.value = el.value.slice(0, start) + emojiObject.emoji + el.value.slice(end);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + emojiObject.emoji.length;
      el.focus();
    });
  };

  const handleEmojiToggle = () => {
    if (isMobile()) {
      inputRef.current?.blur();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsShowingEmoji(p => !p);
    }
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (isShowingEmoji && emojiBtnRef.current && !emojiBtnRef.current.contains(e.target))
        setIsShowingEmoji(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isShowingEmoji]);

  const handleFileChange = (e) => {
    const allowed = ['image/', 'video/'];
    const valid = Array.from(e.target.files)
      .filter(f => allowed.some(t => f.type.startsWith(t)));
    if (!valid.length) return;
    setImages(p => [...p, ...valid.map(f => ({
      url: URL.createObjectURL(f), name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      preview: f.type.startsWith('image/'), file: f
    }))]);
    // reset so the same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (i) => setImages(p => p.filter((_, idx) => idx !== i));

  useEffect(() => {
    const handlePaste = (e) => {
      const allowed = ['image/', 'video/'];
      const valid = Array.from({ length: e.clipboardData.items.length },
        (_, i) => e.clipboardData.items[i])
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile())
        .filter(f => f && allowed.some(t => f.type.startsWith(t)));
      if (!valid.length) return;
      setImages(p => [...p, ...valid.map(f => ({
        url: URL.createObjectURL(f), name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        preview: f.type.startsWith('image/'), file: f
      }))]);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const SendMessage = async (e) => {
    e.preventDefault();
    setSendError('');
    if (images.length === 0 && !inputRef.current?.value.trim()) return;
    const formData = new FormData();
    const msg = inputRef.current?.value || '';
    if (msg) formData.append('message', msg);
    images.forEach(f => formData.append('files', f.file));
    formData.append('receiver', Selecteduser.receiverId);
    try {
      await sendMessage(formData);
      setImages([]);
      if (inputRef.current) inputRef.current.value = '';
      setDraft(Selecteduser.receiverId, null);  // clear draft on successful send
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Send failed. Please try again.';
      setSendError(msg);
      console.error('Send failed:', err);
    }
  };

  const iconBtn = 'inline-flex items-center justify-center rounded-full h-9 w-9 transition-all duration-200 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 focus:outline-none flex-shrink-0';

  return (
    /*
      KEY MOBILE FIX:
      - h-full + min-h-0 ensures this div never exceeds the dvh parent
      - flex-col with flex-shrink-0 on header+input pins them permanently
      - MessageBox handles its own scroll internally
    */
    <div className="flex flex-col w-full overflow-hidden bg-gray-50" style={{ height: '100%', minHeight: 0 }}>

      {/* ── Header — always pinned top ── */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
        <ProfileHeader onBack={onBack} />
      </div>

      {/* ── Messages — the scroll lives HERE, not in MessageBox ── */}
      <div
        id="messages"
        className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
        style={{ overscrollBehavior: 'contain' }}
      >
        <MessageBox />
      </div>

      {/* ── Image previews ── */}
      {images.length > 0 && (
        <div className="flex-shrink-0 flex flex-wrap gap-2 px-4 pt-2 pb-1 bg-white border-t border-gray-100">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              {img.preview
                ? <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center px-1">{img.name}</div>
              }
              <button onClick={() => removeImage(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">×</button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 truncate px-1">{img.size}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Input toolbar — always pinned bottom ── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 py-2">
        <form onSubmit={SendMessage}>
          <div className="flex items-center gap-1">

            <button type="button" className={iconBtn} title="Voice">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <input type="text" name="message" ref={inputRef} placeholder="Message…"
              className="flex-1 min-w-0 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all" />

            <div className="relative" ref={emojiBtnRef}>
              <button type="button" onClick={handleEmojiToggle}
                className={`${iconBtn} ${isShowingEmoji ? 'text-indigo-500 bg-indigo-50' : ''}`} title="Emoji">
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

            <input type="file" multiple accept="image/*,video/*" ref={fileRef} onChange={handleFileChange} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} className={iconBtn} title="Attach">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            <button type="submit"
              className="inline-flex items-center justify-center rounded-full h-9 w-9 bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all text-white shadow-md focus:outline-none flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 rotate-90">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;