/**
 * user.js — shared user-related constants
 *
 * WHY it exists:
 *   The EMPTY_USER object was copy-pasted in three separate files:
 *   App.jsx, ChatLayout.jsx, and ChatList.jsx.  A single source of truth
 *   prevents them from drifting apart silently.
 *
 * WHEN to use EMPTY_USER:
 *   Any time you need to reset the currently-selected chat partner back to
 *   "nobody selected" state (e.g., back-button press, route change, close-chat).
 */

export const EMPTY_USER = {
  receiverId:   null,
  receiverName: '',
  senderId:     null,
  senderName:   '',
  lastActive:   null,
  onlineStatus: false,
  profile_url:  null,
};
