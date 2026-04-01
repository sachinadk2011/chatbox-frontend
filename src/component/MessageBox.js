import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import UserContext from '../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';
import MessageContext from '../context/message/MessageContext';
import socket from '../server/socket';

const MessageBox = () => {
  const { messages, Selecteduser, markAsRead, fetchConversation } = useContext(MessageContext);
  const { user } = useContext(UserContext);

  const [olderMessages, setOlderMessages] = useState([]);
  const [hasMore, setHasMore]     = useState(false);
  const [page, setPage]           = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevLengthRef = useRef(0);

  // ── Read from context instantly (SidebarList already loaded all msgs) ──────
  const contextChat     = messages.find(m => m.otherUserId === Selecteduser?.receiverId?.toString());
  const contextMessages = contextChat?.messages ?? [];
  const contextIds      = new Set(contextMessages.map(m => m._id));
  const allMessages     = [
    ...olderMessages.filter(m => !contextIds.has(m._id)),
    ...contextMessages,
  ];

  // ── Scroll the #messages div to bottom ────────────────────────────────────
  const scrollToBottom = useCallback((behavior = 'auto') => {
    requestAnimationFrame(() => {
      const el = document.getElementById('messages');
      if (!el) return;
      behavior === 'smooth'
        ? el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
        : (el.scrollTop = el.scrollHeight);
    });
  }, []);

  // ── Reset + mark-read when chat partner changes ───────────────────────────
  useEffect(() => {
    if (!Selecteduser?.receiverId) return;
    setOlderMessages([]);
    setPage(1);
    setHasMore(false);
    prevLengthRef.current = 0;
    markAsRead(Selecteduser.receiverId);
    // Scroll instantly after next paint so all context messages are rendered
    scrollToBottom('auto');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Selecteduser?.receiverId]);

  // ── Smooth scroll when new message arrives in the SAME chat ───────────────
  useEffect(() => {
    const curr = allMessages.length;
    if (curr > prevLengthRef.current && prevLengthRef.current !== 0) {
      scrollToBottom('smooth');
    }
    prevLengthRef.current = curr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMessages.length]);

  // ── Real-time seen ticks ───────────────────────────────────────────────────
  useEffect(() => {
    const handler = ({ by }) => {
      if (Selecteduser?.receiverId?.toString() !== by?.toString()) return;
      setOlderMessages(prev =>
        prev.map(m => m.sender?._id?.toString() === user?.id?.toString()
          ? { ...m, status: 'read' } : m)
      );
    };
    socket.on('messagesRead', handler);
    return () => socket.off('messagesRead', handler);
  }, [Selecteduser?.receiverId, user?.id]);

  // ── Load older messages on demand ──────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !Selecteduser?.receiverId) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetchConversation(Selecteduser.receiverId, nextPage);
      const existingIds = new Set(allMessages.map(m => m._id));
      const fresh = res.messages.filter(m => !existingIds.has(m._id));
      setOlderMessages(prev => [...fresh, ...prev]);
      setHasMore(res.hasMore);
      setPage(nextPage);
    } catch (e) {
      console.error('loadMore:', e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, page, Selecteduser?.receiverId, allMessages, fetchConversation]);

  // ── Check if DB has more messages than what context holds ─────────────────
  useEffect(() => {
    if (!Selecteduser?.receiverId) return;
    fetchConversation(Selecteduser.receiverId, 1, 1)
      .then(res => setHasMore(res.total > contextMessages.length))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Selecteduser?.receiverId]);

  // ── Messenger-style grouping (isLast = last message in a consecutive run) ─
  const grouped = allMessages.map((msg, idx, arr) => {
    const isOwn = msg.sender?._id?.toString() === user?.id?.toString();
    const next  = arr[idx + 1];
    const nextIsSameSender = next && next.sender?._id?.toString() === msg.sender?._id?.toString();
    const isLast = !nextIsSameSender;           // group boundary
    if (isOwn) return { msg, isOwn, showAvatar: false, isLast };
    return { msg, isOwn, showAvatar: isLast, isLast }; // avatar only on last of run
  });

  if (!Selecteduser?.receiverId) return null;

  return (
    /*
      No overflow here — the #messages div in ChatWindow owns the scroll.
      min-h-full + flex-1 spacer keeps messages pinned to the bottom
      when there are few; overflows up into parent scroll when many.
    */
    <div className="flex flex-col min-h-full">

      {/* Top spacer — pushes messages to bottom when there are few */}
      <div className="flex-1" />

      {/* Load older messages button */}
      {hasMore && (
        <div className="flex justify-center pt-3 pb-1">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-xs text-indigo-500 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
          >
            {loadingMore ? '⏳ Loading…' : '↑ Load older messages'}
          </button>
        </div>
      )}

      {/* Messages list */}
      <div className="flex flex-col px-3 py-2 gap-y-0">
        {grouped.map(({ msg, isOwn, showAvatar, isLast }) => (
          <React.Fragment key={msg._id}>
            {isOwn
              ? <SendMsg    types={msg.types} send={msg.message}     status={msg.status} isLast={isLast} />
              : <ReceivedMsg types={msg.types} received={msg.message} showAvatar={showAvatar} isLast={isLast} />
            }
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MessageBox;