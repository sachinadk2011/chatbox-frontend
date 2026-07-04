/**
 * ChatList.jsx
 *
 * PURPOSE:
 *   Renders a single friend row in the sidebar.
 *
 * VARIANT PROP:
 *   variant — 'chat' (default) | 'friends'
 *     'chat'    — shows last-message preview, delivery tick, unread badge,
 *                 timestamp, and the 3-dot "Close Chat" context menu.
 *     'friends' — shows mutual-friend count + total-friend count instead of
 *                 the message preview. Hides unread badge and context menu.
 *
 *   WHY a prop instead of useLocation:
 *     The parent (SidebarList) already knows which section it's in and passes
 *     the variant explicitly. This removes the useLocation call from ChatList,
 *     making it route-agnostic and reusable in any future context that needs
 *     the same card layout (groups sidebar, archived chats, etc.).
 *
 * CLOSE HANDLER:
 *   onClose — () => void — passed from SidebarList; called when the user
 *     clicks "Close Chat" in the 3-dot menu. SidebarList owns the navigation
 *     + setSelectedUser logic; ChatList only manages local menu state.
 */

import React, { useState, useRef, useEffect, useContext } from 'react';
import SelectedUserContext from '../../context/message/SelectedUserContext';
import { getProfileImageUrl } from '../../utils/helpers/profileUtils';

// ── Mini delivery tick for the sidebar ───────────────────────────────────────
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

const ChatList = ({
  name,
  receiverId,
  message,
  onClick,
  mutualfrdlen,
  profileUrl,
  frdlen,
  time,
  status,
  isOwn,
  unreadCount,
  variant = 'chat', // 'chat' | 'friends'
  onClose,          // () => void — only used in 'chat' variant context menu
}) => {
  const { Selecteduser } = useContext(SelectedUserContext);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const menuRef    = useRef(null);
  const dotsBtnRef = useRef(null);

  const isFriendsVariant = variant === 'friends';
  const hasUnread        = unreadCount > 0 && !isFriendsVariant;
  const previewMessage   = hasUnread && unreadCount > 1
    ? unreadCount <= 4 ? `new message's ${unreadCount}` : 'new messages 4+'
    : message;

  // Cloudinary → UI Avatars fallback via shared util
  const avatarSrc = getProfileImageUrl(name, profileUrl);

  // Close context menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (
        menuRef.current    && !menuRef.current.contains(e.target) &&
        dotsBtnRef.current && !dotsBtnRef.current.contains(e.target)
      ) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMenuOpen(false);
  };

  const handleDotsClick = (e) => {
    e.stopPropagation();
    setMenuOpen(p => !p);
  };

  // Delegates the actual navigation + selectedUser clear to the parent via onClose.
  // ChatList only manages closing its own menu afterwards.
  const handleCloseChat = () => {
    onClose?.();
    setMenuOpen(false);
  };

  return (
    <div
      className="relative flex items-center w-full cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Avatar */}
      <img src={avatarSrc} alt={name}
        className="w-12 h-12 rounded-full object-cover mr-3 flex-shrink-0" />

      {/* Name + sub-text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h2 className={`text-sm ${hasUnread && !isOwn && !isFriendsVariant ? 'font-black text-black' : 'font-semibold text-gray-800'} truncate`}>
            {name}
          </h2>
          {time && !isFriendsVariant && (
            <span className={`text-[11px] ${hasUnread && !isFriendsVariant && !isOwn ? 'font-black text-black' : 'text-gray-400'} flex-shrink-0 whitespace-nowrap`}>
              {time}
            </span>
          )}
        </div>

        {isFriendsVariant
          /* Friends variant: mutual + total friend count */
          ? <div className="flex space-x-3 text-xs text-gray-500">
              <span><strong>{mutualfrdlen ?? 0}</strong> Mutual</span>
              <span><strong>{frdlen ?? 0}</strong> Friends</span>
            </div>
          /* Chat variant: last message preview with delivery tick */
          : <div className="flex items-center gap-1 min-w-0">
              {isOwn && status && (
                <span className="flex-shrink-0">
                  <SidebarTick status={status} />
                </span>
              )}
              <p className={`text-xs ${hasUnread && !isFriendsVariant && !isOwn ? 'font-black text-black' : 'text-gray-500'} truncate`}>
                {previewMessage || <span className="italic text-gray-400">Tap to start chatting</span>}
              </p>
            </div>
        }
      </div>

      {/* Desktop-only hover 3-dot context menu (chat variant only) */}
      {isHovered && !isFriendsVariant && (
        <div className="hidden md:flex items-center flex-shrink-0 ml-1" onClick={e => e.stopPropagation()}>
          <button
            ref={dotsBtnRef}
            onClick={handleDotsClick}
            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3ZM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3ZM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0Z" />
            </svg>
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-9 z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1"
            >
              {/* Open chat — only when no chat is currently open */}
              {Selecteduser?.receiverId !== receiverId &&
                <button
                  onClick={(e) => { e.stopPropagation(); onClick(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-400">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6l-4 4V5z" clipRule="evenodd" />
                  </svg>
                  Open Chat
                </button>
              }

              {/* Close chat — only when a chat is open */}
              {Selecteduser?.receiverId === receiverId && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleCloseChat(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22Z" />
                  </svg>
                  Close Chat
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * React.memo — safe: ChatList is a pure display component.
 * Local state (hover, menu) is not shared externally.
 * With memo, only the cards whose props actually changed re-render
 * when a new message arrives in any conversation.
 */
export default React.memo(ChatList);