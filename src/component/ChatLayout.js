import React, { useContext } from 'react';
import Header from './Header';
import SidebarList from './SidebarList';
import ChatWindow from './ChatWindow';
import MessageContext from '../context/message/MessageContext';

/**
 * ChatLayout — shared by:
 *   • /           (ChatRoom / home)
 *   • /friends/list  (FriendList)
 *
 * Desktop (md+):  sidebar always visible on left, chat on right
 * Mobile (<md):   show ONLY the sidebar OR ONLY the chat,
 *                 switching when a user is selected / back is pressed.
 *
 * This is the single source of truth for that behaviour — change
 * it here and both routes update automatically.
 */
const EMPTY_USER = {
  receiverId: null,
  receiverName: '',
  senderId: null,
  senderName: '',
  lastActive: null,
  onlineStatus: false,
  profile_url: null,
};

const ChatLayout = () => {
  const { Selecteduser, setSelectedUser } = useContext(MessageContext);
  const hasChatOpen = !!Selecteduser?.receiverId;

  const handleBack = () => setSelectedUser(EMPTY_USER);

  return (
    /*
      Use 100dvh (dynamic viewport height) so the layout shrinks correctly
      when the mobile soft keyboard opens, keeping the input bar visible.
      Fall back to 100% (which is constrained by the parent).
    */
    <div
      className="flex w-full overflow-hidden bg-gray-50"
      style={{ height: '100dvh', maxHeight: '100%' }}
    >

      {/* ══ PANEL 1 — Sidebar / friend list ══
          • Desktop: always shown, fixed width
          • Mobile:  shown only when no chat is open
      */}
      <div
        className={[
          'flex-shrink-0 flex flex-col bg-white border-r border-gray-200',
          'w-full md:w-80 lg:w-96',         // full-width on mobile, fixed on desktop
          hasChatOpen ? 'hidden md:flex' : 'flex',
        ].join(' ')}
      >
        <Header />
        {/* SidebarList fills remaining height and scrolls internally */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <SidebarList />
        </div>
      </div>

      {/* ══ PANEL 2 — Chat window ══
          • Desktop: always shown (flex-1), placeholder if no chat
          • Mobile:  shown full-screen only when a chat is open
      */}
      <div
        className={[
          'flex-1 flex flex-col min-w-0 min-h-0',
          hasChatOpen ? 'flex' : 'hidden md:flex',
        ].join(' ')}
      >
        {hasChatOpen ? (
          /*
            ChatWindow receives onBack so ProfileHeader can render
            the "← name" back-arrow row on mobile (Instagram DM style).
            It fills the full flex column — header pinned top,
            messages scroll in middle, input pinned bottom.
          */
          <ChatWindow onBack={handleBack} />
        ) : (
          /* Desktop empty-state placeholder */
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 select-none gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 opacity-25"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.25}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="font-semibold text-base">Select a conversation</p>
            <p className="text-sm opacity-60">Choose a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
