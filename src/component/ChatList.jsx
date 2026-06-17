import React, { useState, useRef, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import MessageContext from '../context/message/MessageContext';

const EMPTY_USER = {
  receiverId: null, receiverName: '', senderId: null, senderName: '',
  lastActive: null, onlineStatus: false, profile_url: null,
};

// ── Mini tick for sidebar ─────────────────────────────────────────
const SidebarTick = ({ status }) => {
  if (status === 'sent') {
    return (
      <svg viewBox="0 0 16 11" className="w-3.5 h-2.5 inline-block flex-shrink-0" fill="none">
        <path d="M1 5.5L5.5 10L15 1" stroke="#9ca3af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  const isRead = status === 'read';
  return (
    <svg viewBox="0 0 22 11" className="w-4 h-2.5 inline-block flex-shrink-0" fill="none">
      <path d="M1 5.5L5.5 10L15 1"  stroke={isRead ? '#3b82f6' : '#9ca3af'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 5.5L11.5 10L21 1" stroke={isRead ? '#3b82f6' : '#9ca3af'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const ChatList = ({ name, message, onClick, mutualfrdlen, profileUrl, frdlen, time, status, isOwn }) => {
  const { Selecteduser, setSelectedUser } = useContext(MessageContext);
  const location = useLocation();
  const isFriendsPage = location.pathname.startsWith('/friends');
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  

  const profile_url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=random&color=random&bold=true&rounded=true`;
  const resizedUrl = profileUrl
    ? profileUrl.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face/')
    : null;

  useEffect(() => {
    
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div
      className="relative flex items-center w-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); }}
      onClick={onClick}
    >
      {/* Avatar */}
      <img src={resizedUrl || profile_url} alt={name}
        className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0" />

      {/* Name + sub-text — depends on which page we're on */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
        <h2 className="text-sm font-semibold text-gray-800 truncate">{name}</h2>
        {/* ── Time — top right ── */}
          {time && !isFriendsPage && (
            <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">
              {time}
            </span>
          )}
        </div>
        {isFriendsPage
          /* Friends page: always show mutual friends count */
          ? <div className="flex space-x-3 text-xs text-gray-500">
              <span><strong>{mutualfrdlen ?? 0}</strong> Mutual</span>
              <span><strong>{frdlen ?? 0}</strong> Friends</span>
            </div>
          /* Chat home: show last message preview */
          : (
          /* ── Preview row: tick (if own) + message text ── */
          <div className="flex items-center gap-1 min-w-0">
            {/* Show tick only for messages I sent */}
            {isOwn && status && (
              <span className="flex-shrink-0">
                <SidebarTick status={status} />
              </span>
            )}
          <p className="text-xs text-gray-500 truncate">
              {message || <span className="italic text-gray-400">Tap to start chatting</span>}
            </p>
            </div>)
        }
      </div>

      {/* ── Desktop only: hover 3-dot menu ── */}
      {isHovered && (
        <div ref={menuRef} className="hidden md:flex items-center flex-shrink-0 ml-1"
          onClick={e => e.stopPropagation()}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); }}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3ZM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3ZM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0Z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-50 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1">
              <button
                onClick={e => { e.stopPropagation(); setSelectedUser(EMPTY_USER); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
                Close Chat
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;