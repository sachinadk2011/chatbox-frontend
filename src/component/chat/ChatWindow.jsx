/**
 * ChatWindow.jsx
 *
 * PURPOSE:
 *   Coordinator / container for the open chat panel. Manages all local state
 *   and handlers, then delegates rendering to focused sub-components:
 *
 *     ProfileHeader    — name, avatar, back button (pinned top)
 *     MessageBox       — scrollable message list (flex-1, scroll internally)
 *     AttachmentPreview — pending file thumbnails above the toolbar
 *     MessageToolbar   — emoji, file, text input, send button (pinned bottom)
 *
 * WHAT ChatWindow owns:
 *   • Input ref (inputRef) — avoids controlled re-renders on every keystroke
 *   • images state — pending attachments waiting to be sent
 *   • isSending / sendError states — for the send-button animation + error display
 *   • isSendingRef — ref guard that prevents double-send on rapid clicks / Enter
 *   • Emoji picker visibility state
 *   • Event handlers: handleFileChange, SendMessage, onEmojiClick, etc.
 *   • useDraftMessage hook — saves/restores typed text when switching chats
 *
 * WHAT ChatWindow does NOT own:
 *   • Message rendering → MessageBox
 *   • Toolbar rendering → MessageToolbar
 *   • Attachment thumbnails → AttachmentPreview
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../../App.css';
import ProfileHeader from '../layout/ProfileHeader';
import MessageBox from './MessageBox';
import AttachmentPreview from './AttachmentPreview';
import MessageToolbar from './MessageToolbar';
import MessageContext from '../../context/message/MessageContext';
import SelectedUserContext from '../../context/message/SelectedUserContext';
import { useDraftMessage } from '../../hooks/chat/useDraftMessage';

const ChatWindow = ({ onBack }) => {
  const { sendMessage, drafts, setDraft } = React.useContext(MessageContext);
  const { Selecteduser } = React.useContext(SelectedUserContext);

  const fileRef     = useRef(null);
  const inputRef    = useRef(null);
  const emojiBtnRef = useRef(null);

  const [isShowingEmoji, setIsShowingEmoji] = useState(false);
  const [images,         setImages]         = useState([]);
  const [sendError,      setSendError]      = useState('');
  const [isSending,      setIsSending]      = useState(false);
  const isSendingRef = useRef(false); // ref guard — prevents double-send on concurrent calls

  // ── Save draft for previous user; restore draft for new user on switch ────
  useDraftMessage({ receiverId: Selecteduser?.receiverId, drafts, setDraft, inputRef });

  // Clear images + error when switching conversations
  useEffect(() => {
    setImages([]);
    setSendError('');
  }, [Selecteduser?.receiverId]);

  const isMobile = () => window.innerWidth < 768;

  // ── Emoji ─────────────────────────────────────────────────────────────────
  const onEmojiClick = (emojiObject) => {
    if (!inputRef.current) return;
    const el    = inputRef.current;
    const start = el.selectionStart ?? el.value.length;
    const end   = el.selectionEnd   ?? el.value.length;
    el.value = el.value.slice(0, start) + emojiObject.emoji + el.value.slice(end);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + emojiObject.emoji.length;
      el.focus();
    });
  };

  const handleEmojiToggle = () => {
    if (isMobile()) {
      // On mobile the keyboard would prevent the picker from appearing —
      // blur first, then re-focus so the keyboard closes.
      inputRef.current?.blur();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setIsShowingEmoji(p => !p);
    }
  };

  // Close emoji picker when clicking outside it
  useEffect(() => {
    const handleOutside = (e) => {
      if (isShowingEmoji && emojiBtnRef.current && !emojiBtnRef.current.contains(e.target))
        setIsShowingEmoji(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isShowingEmoji]);

  // ── File handling ─────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const allowed = ['image/', 'video/'];
    const valid   = Array.from(e.target.files).filter(f => allowed.some(t => f.type.startsWith(t)));
    if (!valid.length) return;
    setImages(p => [...p, ...valid.map(f => ({
      url:     URL.createObjectURL(f),
      name:    f.name,
      size:    (f.size / 1024).toFixed(1) + ' KB',
      preview: f.type.startsWith('image/'),
      file:    f,
    }))]);
    e.target.value = ''; // allow re-selection of the same file
  };

  const removeImage = (i) => setImages(p => p.filter((_, idx) => idx !== i));

  // Paste image/video from clipboard directly into the input area
  useEffect(() => {
    const handlePaste = (e) => {
      const allowed = ['image/', 'video/'];
      const valid   = Array.from({ length: e.clipboardData.items.length }, (_, i) => e.clipboardData.items[i])
        .filter(item => item.kind === 'file')
        .map(item => item.getAsFile())
        .filter(f => f && allowed.some(t => f.type.startsWith(t)));
      if (!valid.length) return;
      setImages(p => [...p, ...valid.map(f => ({
        url:     URL.createObjectURL(f),
        name:    f.name,
        size:    (f.size / 1024).toFixed(1) + ' KB',
        preview: f.type.startsWith('image/'),
        file:    f,
      }))]);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // ── Send ──────────────────────────────────────────────────────────────────
  // isSendingRef is a synchronous guard. isSending is the UI state (for button animation).
  // Using BOTH ensures the button can't be double-triggered even during the React render cycle.
  const SendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (isSendingRef.current) return; // already in-flight — ignore
    setSendError('');
    if (images.length === 0 && !inputRef.current?.value.trim()) return;

    isSendingRef.current = true;
    setIsSending(true);

    const formData = new FormData();
    const msg = inputRef.current?.value || '';
    if (msg) formData.append('message', msg);
    images.forEach(f => formData.append('files', f.file));
    formData.append('receiver', Selecteduser.receiverId);

    try {
      await sendMessage(formData);
      setImages([]);
      if (inputRef.current) inputRef.current.value = '';
      setDraft(Selecteduser.receiverId, null); // clear draft on successful send
    } catch (err) {
      const errMsg = err?.response?.data?.error || err?.message || 'Send failed. Please try again.';
      setSendError(errMsg);
      console.error('Send failed:', err);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  }, [images, Selecteduser?.receiverId, sendMessage, setDraft]);

  // Enter key → send (Shift+Enter = newline)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        SendMessage(e);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [SendMessage]);

  return (
    /*
      KEY LAYOUT RULES:
      • height: 100% + min-height: 0 — never exceed the dvh parent
      • flex-shrink-0 on header + toolbar — they are always visible, never squeezed
      • MessageBox (flex-1 + overflow-y-auto) gets all remaining height and scrolls internally
    */
    <div className="flex flex-col w-full overflow-hidden bg-gray-50" style={{ height: '100%', minHeight: 0 }}>

      {/* ── Header: avatar, name, online status, action buttons ── */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white z-10">
        <ProfileHeader onBack={onBack} />
      </div>

      {/* ── Message list: scrolls internally, fills available height ── */}
      <div
        id="messages"
        className="flex-1 min-h-0 overflow-y-auto scrollbar-hide"
        style={{ overscrollBehavior: 'contain' }}
      >
        <MessageBox key={Selecteduser?.receiverId} />
      </div>

      {/* ── Attachment thumbnails: shown above toolbar when files are pending ── */}
      <AttachmentPreview images={images} onRemove={removeImage} />

      {/* ── Input toolbar: text, emoji, attach, send ── */}
      <MessageToolbar
        inputRef={inputRef}
        fileRef={fileRef}
        isSending={isSending}
        sendError={sendError}
        onSubmit={SendMessage}
        onFileChange={handleFileChange}
        emojiBtnRef={emojiBtnRef}
        isShowingEmoji={isShowingEmoji}
        onEmojiToggle={handleEmojiToggle}
        onEmojiClick={onEmojiClick}
      />
    </div>
  );
};

export default ChatWindow;