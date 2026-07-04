import React, { useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import UserContext from '../../context/users/UserContext';
import { ReceivedMsg } from './ReceivedMsg';
import { SendMsg } from './SendMsg';
import MessageContext from '../../context/message/MessageContext';
import SelectedUserContext from '../../context/message/SelectedUserContext';
import socket from '../../services/socket';
import { getDateLabel, getTimeLabel } from '../../utils/helpers/dateUtils';
import { useScrollToBottom } from '../../hooks/chat/useScrollToBottom';
import { useMessagePagination } from '../../hooks/chat/useMessagePagination';

const MessageBox = () => {
  const { messages, markAsRead, fetchConversation } = useContext(MessageContext);
  const { Selecteduser } = useContext(SelectedUserContext);
  const { user } = useContext(UserContext);

  // ── Scroll helper ─────────────────────────────────────────────────────────
  const { bottomRef, scrollToBottom, onMediaLoad } = useScrollToBottom();

  // ── Merge older (paginated) messages with the real-time context messages ──
  const contextChat     = messages.find(m => m.otherUserId === Selecteduser?.receiverId?.toString());
  const contextMessages = contextChat?.messages ?? [];

  // ── Pagination ────────────────────────────────────────────────────────────
  const { olderMessages, hasMore, loadingMore, loadMore, resetPagination } =
    useMessagePagination({ Selecteduser, fetchConversation, contextMessages });

  // Deduplicate: older pages may overlap with context messages
  const contextIds = useMemo(() => new Set(contextMessages.map(m => m._id)), [contextMessages]);
  
  const allMessages = useMemo(
    () => [...olderMessages.filter(m => !contextIds.has(m._id)), ...contextMessages],
    [olderMessages, contextMessages, contextIds]
  );

  // Tracks previous message count for smooth-scroll-on-new-message
  const prevLengthRef = useRef(0);

  // ── Reset + mark-read when chat partner changes ───────────────────────────
  useEffect(() => {
    if (!Selecteduser?.receiverId) return;
    console.info(`Chat partner changed to ${Selecteduser.receiverName} (${Selecteduser.receiverId}). Resetting.`);
    resetPagination();
    prevLengthRef.current = 0;
    markAsRead(Selecteduser.receiverId);
    const timer = setTimeout(() => scrollToBottom('auto'), 50);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Selecteduser?.receiverId]);

  // ── Smooth scroll when a new message arrives ──────────────────────────────
  useEffect(() => {
    if (allMessages.length === 0) return;
    const curr = allMessages.length;
    if (curr > prevLengthRef.current && prevLengthRef.current !== 0) {
      scrollToBottom('smooth');
    }
    prevLengthRef.current = curr;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMessages.length]);

  // ── Real-time seen ticks for older (paginated) messages ───────────────────
  useEffect(() => {
    const handler = ({ by }) => {
      if (Selecteduser?.receiverId?.toString() !== by?.toString()) return;
      // Only older messages need manual update; context messages update via context
    };
    socket.on('messagesRead', handler);
    return () => socket.off('messagesRead', handler);
  }, [Selecteduser?.receiverId, user?.id]);

  // ── Group messages for rendering (date labels, avatar, sender side) ───────
  const grouped = useMemo(() =>
    allMessages.map((msg, idx, arr) => {
      const isOwn           = msg.sender?._id?.toString() === user?.id?.toString();
      const next            = arr[idx + 1];
      const nextIsSameSender = next && next.sender?._id?.toString() === msg.sender?._id?.toString();
      const timeLabel       = getTimeLabel({ date: msg.date });
      const dateLabel       = getDateLabel({ date: msg.date });
      const isLast          = !nextIsSameSender;
      return { msg, isOwn, showAvatar: isOwn ? false : isLast, isLast, time: timeLabel, date: dateLabel };
    }),
  [allMessages, user?.id]);

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
          const prevDate        = index > 0 ? grouped[index - 1].date : null;
          const showDateSeparator = date !== prevDate;

          return (
            <React.Fragment key={msg._id}>
              {/* Date separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-3 select-none">
                  <span className="bg-gray-100 text-gray-500 text-[11px] font-medium px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                    {date}
                  </span>
                </div>
              )}

              {isOwn
                ? <SendMsg     types={msg.types} send={msg.message}     status={msg.status} isLast={isLast} onMediaLoad={onMediaLoad} time={time} />
                : <ReceivedMsg types={msg.types} received={msg.message} showAvatar={showAvatar} isLast={isLast} onMediaLoad={onMediaLoad} time={time} />
              }
            </React.Fragment>
          );
        })}
      </div>

      {/* Sentinel element — scrollIntoView targets this */}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageBox;