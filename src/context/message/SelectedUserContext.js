import { createContext } from 'react';

/**
 * SelectedUserContext
 *
 * WHY a separate context from MessageContext?
 *   The original MessageContext held both "who is selected" (Selecteduser) and
 *   "all messages" (messages) in the same value object.  Any incoming message
 *   caused the whole value to change → components that only care about the
 *   selected user (ProfileHeader, ChatLayout, ChatList) unnecessarily re-rendered.
 *
 * WHAT lives here:
 *   { Selecteduser, setSelectedUser, selectedUserRef }
 *
 * WHAT stays in MessageContext:
 *   { messages, setMessages, fetchMessages, fetchConversation, sendMessage,
 *     markAsRead, drafts, setDraft, totalUnread }
 *
 * HOW they are provided:
 *   MessageState wraps children in BOTH providers, so no change is needed in
 *   App.jsx or the Router tree — only individual components import the context
 *   that matches what they actually need.
 */
const SelectedUserContext = createContext({
  Selecteduser:     { 
    receiverId: null, 
    receiverName: '', 
    senderId: null, 
    senderName: '', 
    lastActive: null, 
    onlineStatus: false, 
    profile_url: null
  },
  setSelectedUser:  () => {},
  selectedUserRef:  { current: null },
});

export default SelectedUserContext;
