/**
 * useOpenChatFromUrl.js
 *
 * PLACEHOLDER — reserved for future URL-to-chat hydration logic.
 *
 * INTENDED PURPOSE (not yet implemented):
 *   When a user navigates directly to /chats/v1/u/:userId (e.g. via a bookmark
 *   or a shared link) and the page refreshes, Selecteduser in MessageContext is
 *   empty because it lives in memory.  This hook would read the :userId param
 *   from the URL and call setSelectedUser to rehydrate the open conversation.
 *
 * WHY it is not implemented yet:
 *   Doing so requires knowing the friend's full profile (name, photo, online
 *   status) from a single id, which means either fetching it separately or
 *   deriving it from the already-loaded friends list.  The current app avoids
 *   this by always navigating programmatically (setSelectedUser + navigate),
 *   so the state is always in memory.  This hook is created as a placeholder
 *   for when direct-URL support is needed.
 */
