import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import UserContext from '../../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';
import MessageContext from '../../context/message/MessageContext';
import socket from '../../services/socket';
import {getDateLabel, getTimeLabel} from '../../utils/helpers/dateUtils';

const MessageBox = () => {
  const { messages, Selecteduser, markAsRead, fetchConversation } = useContext(MessageContext);
  const { user } = useContext(UserContext);

  const [olderMessages, setOlderMessages] = useState([]);
  const [hasMore, setHasMore]     = useState(false);
  const [page, setPage]           = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const prevLengthRef = useRef(0);
  const bottomRef = useRef(null); // ✅ only new thing added

  const contextChat     = messages.find(m => m.otherUserId === Selecteduser?.receiverId?.toString());
  const contextMessages = contextChat?.messages ?? [];
  const contextIds      = new Set(contextMessages.map(m => m._id));
  const allMessages     = [
    ...olderMessages.filter(m => !contextIds.has(m._id)),
    ...contextMessages,
  ];
  

  const scrollToBottom = useCallback((behavior = 'auto') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  const onMediaLoad = useCallback(() => {
  scrollToBottom('auto');
}, [scrollToBottom]);

  // ── Reset + mark-read when chat partner changes ───────────────────────────
  useEffect(() => {
    if (!Selecteduser?.receiverId) return;
    console.info(`Chat partner changed to ${Selecteduser.receiverName} (${Selecteduser.receiverId}). Resetting messages and marking as read.`);
    setOlderMessages([]);
    setPage(1);
    setHasMore(false);
    prevLengthRef.current = 0;
    markAsRead(Selecteduser.receiverId);
    const timer = setTimeout(() => scrollToBottom('auto'), 50);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Selecteduser?.receiverId]);

  // ── Smooth scroll on new message ─────────────────────────────────────────
  useEffect(() => {
    if (allMessages.length === 0) return;
    const curr = allMessages.length;
    if (curr > prevLengthRef.current && prevLengthRef.current !== 0) {
      scrollToBottom('smooth');
    }
    prevLengthRef.current = curr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMessages.length]);

  // ── Real-time seen ticks ──────────────────────────────────────────────────
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

  // ── Load older messages ───────────────────────────────────────────────────
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

  // ── Check DB for more ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!Selecteduser?.receiverId) return;
    fetchConversation(Selecteduser.receiverId, 1, 1)
      .then(res => setHasMore(res.total > contextMessages.length))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Selecteduser?.receiverId]);

  // ── Grouping ──────────────────────────────────────────────────────────────
  const grouped = allMessages.map((msg, idx, arr) => {
    const isOwn = msg.sender?._id?.toString() === user?.id?.toString();
    const next  = arr[idx + 1];
    const nextIsSameSender = next && next.sender?._id?.toString() === msg.sender?._id?.toString();
    //console.info(` Message date : ${msg.timestamp}`)
    const timeLabel = getTimeLabel({ date: msg.date });
    const dateLabel = getDateLabel({ date: msg.date });
    
    const isLast = !nextIsSameSender;
    if (isOwn) return { msg, isOwn, showAvatar: false, isLast, time: timeLabel, date: dateLabel };
    return { msg, isOwn, showAvatar: isLast, isLast, time: timeLabel, date: dateLabel };
  });

  if (!Selecteduser?.receiverId) return null;

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1" />

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

      <div className="flex flex-col px-3 py-2 gap-y-0">
  {grouped.map(({ msg, isOwn, showAvatar, isLast, time, date }, index) => {
    
    // Show date separator if first message OR date changed from previous message
    const prevDate = index > 0 ? grouped[index - 1].date : null;
    const showDateSeparator = date !== prevDate;

    return (
      <React.Fragment key={msg._id}>

        {/* ── Date separator — Today / Yesterday / Mon / Jan 5 / Jan 5 2023 ── */}
        {showDateSeparator && (
          <div className="flex items-center justify-center my-3 select-none">
            <span className="bg-gray-100 text-gray-500 text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              {date}
            </span>
          </div>
        )}

        {isOwn
          ? <SendMsg types={msg.types} send={msg.message} status={msg.status} isLast={isLast} onMediaLoad={onMediaLoad} time={time} />
          : <ReceivedMsg types={msg.types} received={msg.message} showAvatar={showAvatar} isLast={isLast} onMediaLoad={onMediaLoad} time={time} />
        }

      </React.Fragment>
    );
  })}
</div>

      {/* ✅ Anchor at very bottom — scrollIntoView targets this */}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageBox;