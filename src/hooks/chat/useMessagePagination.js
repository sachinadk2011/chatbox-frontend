/**
 * useMessagePagination.js
 *
 * PURPOSE:
 *   Manages the "load older messages" pagination state for an open conversation.
 *   Encapsulates:
 *     - olderMessages state (messages fetched from pages > 1)
 *     - hasMore / page / loadingMore flags
 *     - loadMore()          — fetches the next page, deduplicates, prepends
 *     - resetPagination()   — resets all state when a new chat partner is selected
 *     - initial hasMore check when a conversation is opened
 *
 * INPUTS:
 *   { Selecteduser, fetchConversation, contextMessages }
 *     Selecteduser      — needs .receiverId
 *     fetchConversation — async (userId, page, limit?) → { messages, hasMore, total }
 *     contextMessages   — the real-time messages array for this chat from MessageContext;
 *                         used for the initial "are there older pages?" check and dedup.
 *
 * NOTE on deduplication:
 *   We do NOT accept an 'allMessages' parameter (the merged view that MessageBox
 *   computes). Doing so would create a circular dependency (hook output as its own
 *   input). Instead, dedup is done inside the setState updater against:
 *     1. prev — already-fetched olderMessages (from state)
 *     2. contextMessages — the live context messages (from prop)
 *   This is equivalent and avoids any stale-closure risk.
 *
 * OUTPUTS:
 *   { olderMessages, hasMore, loadingMore, loadMore, resetPagination }
 */

import { useState, useCallback, useEffect } from 'react';

export const useMessagePagination = ({
  Selecteduser,
  fetchConversation,
  contextMessages,
}) => {
  const [olderMessages, setOlderMessages] = useState([]);
  const [hasMore,       setHasMore]       = useState(false);
  const [page,          setPage]          = useState(1);
  const [loadingMore,   setLoadingMore]   = useState(false);

  // ── Reset all pagination state when switching to a new chat partner ───────
  const resetPagination = useCallback(() => {
    setOlderMessages([]);
    setPage(1);
    setHasMore(false);
  }, []);

  // ── Fetch next page of older messages ─────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !Selecteduser?.receiverId) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetchConversation(Selecteduser.receiverId, nextPage);

      // Deduplicate against BOTH already-fetched older pages AND the live
      // context messages — so we never show the same message twice regardless
      // of which bucket it came from.
      setOlderMessages(prev => {
        const existingIds = new Set([
          ...prev.map(m => m._id),
          ...contextMessages.map(m => m._id),
        ]);
        const fresh = res.messages.filter(m => !existingIds.has(m._id));
        return [...fresh, ...prev];
      });

      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch (e) {
      console.error('loadMore:', e);
    } finally {
      setLoadingMore(false);
    }
  // contextMessages omitted from deps — read inside setState updater (always fresh).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, page, Selecteduser?.receiverId, fetchConversation]);

  // ── On conversation open, check whether older pages exist in the DB ───────
  useEffect(() => {
    if (!Selecteduser?.receiverId) return;
    fetchConversation(Selecteduser.receiverId, 1, 1)
      .then(res => setHasMore(res.total > contextMessages.length))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Selecteduser?.receiverId]);

  return { olderMessages, hasMore, loadingMore, loadMore, resetPagination };
};
