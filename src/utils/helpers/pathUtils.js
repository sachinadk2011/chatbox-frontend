/**
 * pathUtils.js — URL / pathname helpers
 *
 * WHY it exists:
 *   The logic for stripping the /v1/u/:id segment from a chat URL was
 *   copy-pasted across SidebarList.jsx, ChatLayout.jsx, and ChatList.jsx.
 *   Any future URL-structure change only needs to be made here.
 *
 * WHEN to use getBaseChatPath:
 *   Whenever you need to navigate "back" from a specific chat URL to the
 *   parent section (e.g., /chats/v1/u/abc → /chats).
 */

/**
 * Strips the /v1/u/:id tail from a chat pathname and returns the section root.
 *
 * Examples:
 *   '/chats/v1/u/abc123'          → '/chats'
 *   '/friends/list/v1/u/abc123'   → '/friends/list'
 *   '/chats'                      → '/chats'
 *
 * @param {string} pathname — window.location.pathname or useLocation().pathname
 * @returns {string} base path without leading slash variations (always starts with '/')
 */
export const getBaseChatPath = (pathname) => {
  const parts    = pathname.split('/').filter(Boolean);
  const v1Index  = parts.indexOf('v1');
  const endIndex = v1Index !== -1 ? v1Index : parts.length;
  return '/' + parts.slice(0, endIndex).join('/');
};
