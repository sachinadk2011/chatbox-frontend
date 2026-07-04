/**
 * SidebarList.jsx  (moved from component/layout/ → component/chat/)
 *
 * PURPOSE:
 *   Chat section's sidebar data layer. Owns all data-fetching (via useSidebarData),
 *   last-message preview building, and friend sorting by recency.
 *
 *   Delegates ONLY the scroll container + empty-state to <ListPanel>.
 *   Delegates ONLY the row rendering to <ChatList variant="chat">.
 *
 * WHAT this component owns:
 *   • useSidebarData — fetch friends + messages on mount
 *   • lastMsg computation — per-friend preview text, time, status, unreadCount
 *   • sortedFriends — sorted by most recent message
 *   • displayChat — sets selected user + navigates to the chat URL
 *   • handleCloseChat — clears selected user + navigates back to base path
 *     (passed as onClose to ChatList so ChatList stays route-agnostic)
 *
 * WHAT this component does NOT own:
 *   • Scroll container → ListPanel
 *   • Empty-state JSX → ListPanel (default or custom via emptyState prop)
 *   • Row UI → ChatList
 *   • Any route-reading for mode/variant decisions → ChatList receives variant="chat"
 */

import React, { useContext, useMemo, useCallback } from 'react';
import ChatList from './ChatList';
import MessageContext from '../../context/message/MessageContext';
import FriendsContext from '../../context/friends/FriendsContext';
import { useNavigate, useLocation } from 'react-router';
import UserContext from '../../context/users/UserContext';
import SelectedUserContext from '../../context/message/SelectedUserContext';
import { getSidebarDateLabel } from '../../utils/helpers/dateUtils';
import { useSidebarData } from '../../hooks/chat/useSidebarData';
import { getBaseChatPath } from '../../utils/helpers/pathUtils';
import { EMPTY_USER } from '../../constants/user';
import ListPanel from '../layout/ListPanel';

const SidebarList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedUser } = useContext(SelectedUserContext);
  const { messages, fetchMessages, setMessages } = useContext(MessageContext);
  const { friends, fetchFriends, setFriends } = useContext(FriendsContext);
  const { user } = useContext(UserContext);

  // ── Fetch friends + messages on mount (extracted to hook) ─────────────────
  useSidebarData({ user, fetchFriends, fetchMessages, setFriends, setMessages });

  // ── Build per-friend last-message preview data ────────────────────────────
  const lastMsg = friends.map(frd => {
    const chat = messages.find(msg => msg.otherUserId === frd._id.toString());
    let previewText   = 'Tap to start messaging';
    let lastMsgTime   = null;
    let lastMsgStatus = null;
    let isLastMsgMine = false;
    let unreadCount   = 0;
    let rawDate       = null;

    if (chat && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];

      isLastMsgMine = lastMessage.sender?._id?.toString() === user?.id?.toString();
      lastMsgStatus = lastMessage.status;
      const date  = lastMessage.date;
      lastMsgTime = date ? getSidebarDateLabel({ date }) : null;
      rawDate     = date ?? null;

      unreadCount = chat.messages.filter(
        msg => msg.sender?._id?.toString() !== user?.id?.toString() && msg.status !== 'read'
      ).length;

      const rawText  = lastMessage.message ?? '';
      const msgTypes = lastMessage.types || 'text';

      let displayText;
      if      (msgTypes === 'image')    displayText = '📷 Photo';
      else if (msgTypes === 'video')    displayText = '🎥 Video';
      else if (msgTypes === 'multiple') displayText = '📎 Attachments';
      else displayText = rawText.length < 30 ? rawText : rawText.slice(0, 30) + '...';

      previewText = (isLastMsgMine ? 'You: ' : '') + displayText;
    }

    return {
      frdId: frd._id,
      message: previewText,
      time:    lastMsgTime,
      status:  lastMsgStatus,
      isOwn:   isLastMsgMine,
      unreadCount,
      rawDate,
    };
  });

  // ── Sort friends by most recent message ───────────────────────────────────
  const sortedFriends = useMemo(() =>
    [...friends].sort((a, b) => {
      const aDate = lastMsg.find(m => m.frdId === a._id)?.rawDate;
      const bDate = lastMsg.find(m => m.frdId === b._id)?.rawDate;
      return (bDate ? new Date(bDate) : 0) - (aDate ? new Date(aDate) : 0);
    }),
  [friends, lastMsg]);

  // ── Open a chat: set selected user + navigate ─────────────────────────────
  const isFriendsPage = location.pathname.startsWith('/friends');
  const displayChat = (friend) => {
    setSelectedUser({
      receiverId:   friend._id,
      receiverName: friend.name,
      senderId:     JSON.parse(localStorage.getItem('user')).id,
      senderName:   JSON.parse(localStorage.getItem('user')).name,
      lastActive:   friend.lastActive,
      onlineStatus: friend.onlineStatus,
      profile_url:  friend.profile_Url,
    });
    const basePath = getBaseChatPath(location.pathname);
    navigate(`${basePath}/v1/u/${friend._id}`);
  };


  // ── Close handler passed to ChatList — keeps ChatList route-agnostic ──────
  // useCallback ensures ChatList's React.memo is not broken by a new function
  // reference on every SidebarList render.
  const handleCloseChat = useCallback(() => {
    setSelectedUser(EMPTY_USER);
    navigate(getBaseChatPath(location.pathname));
  }, [location.pathname, navigate, setSelectedUser]);

  return (
    <ListPanel
      items={sortedFriends}
      keyExtractor={(frd) => frd._id}
      emptyState={
        <p className="text-center text-sm text-gray-400 mt-10 select-none px-4">
          No conversations yet.<br />Add a friend to start chatting.
        </p>
      }
      renderItem={(element) => {
        const msgData = lastMsg.find(msg => msg.frdId === element._id);
        return (
          <div className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md">
            <ChatList
              variant={isFriendsPage ? 'friends' : 'chat'}
              name={element.name}
              message={msgData?.message}
              time={msgData?.time}
              status={msgData?.status}
              isOwn={msgData?.isOwn}
              unreadCount={msgData?.unreadCount}
              onClick={() => displayChat(element)}
              onClose={handleCloseChat}
              mutualfrdlen={element.mutualfrdlen}
              profileUrl={element.profile_Url}
              frdlen={element.friends.length}
            />
          </div>
        );
      }}
    />
  );
};

export default SidebarList;
