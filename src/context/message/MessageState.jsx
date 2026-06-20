import MessageContext from "./MessageContext";
import React, { useState, useCallback, useContext, useEffect, useRef, useMemo } from 'react';
import UserContext from "../users/UserContext";
import socket from "../../server/socket";
import { api } from '../../utils/SetAuthToken';
import { showChatNotification } from "../../utils/notificationUtils";

export const MessageState = (props) => {
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([]);
  const [drafts, setDraftsState] = useState({});  // { [receiverId]: draftText }
  const joinedRef = useRef(false);

  const [Selecteduser, setSelectedUser] = useState({
    receiverId: null, senderId: null,
    receiverName: " ", senderName: " ",
    lastActive: null, onlineStatus: false, profile_url: null
  });

  const selectedUserRef = useRef(Selecteduser);

  const setSelectedUserWithRef = useCallback((val) => {
    
  const resolved = typeof val === 'function' ? val(selectedUserRef.current) : val;

  // No-op if nothing actually changes
  if (selectedUserRef.current?.receiverId === resolved?.receiverId) {
    return;
  }

  // Tell server previous chat is closed
  if (selectedUserRef.current?.receiverId) {
    socket.emit('chatClose');
  }
  
  // Tell server new chat is open
  if (resolved?.receiverId) {
    console.info(`Setting selected user to ${resolved.receiverName} (${resolved.receiverId}). Informing server of chat change.`);
    socket.emit('chatOpen', { viewingUserId: resolved.receiverId });
  }

  selectedUserRef.current = resolved;
  setSelectedUser(resolved);
}, []);

  // ── Connect + join room once user.id is known ──────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const doJoin = () => { socket.emit("joinRoom", user.id); joinedRef.current = true; };
    if (!socket.connected) {
      socket.connect();
      socket.once("connect", doJoin);
    } else if (!joinedRef.current) {
      doJoin();
    }
    return () => socket.off("connect", doJoin);
  }, [user?.id]);

  // ── Re-join after reconnect (Render wake-up) ───────────────────────────────
  useEffect(() => {
    const onReconnect = () => { if (user?.id) socket.emit("joinRoom", user.id); };
    socket.on("connect", onReconnect);
    return () => socket.off("connect", onReconnect);
  }, [user?.id]);

  // ── Keep-alive ping ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const iv = setInterval(() => { if (socket.connected) socket.emit("alive"); }, 10000);
    return () => clearInterval(iv);
  }, [user?.id]);

  // ── Receive incoming messages ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (msg) => {
      const senderId = msg.sender?._id?.toString();
      const myId     = user?.id?.toString();
      const frdId    = senderId === myId
            ? msg.receiver?._id?.toString()
            : senderId;

      // existing state update      
      setMessages(prev => {
        let updated = [...prev];
        let chat = updated.find(c => c.otherUserId === frdId);
        if (chat) {
          if (!chat.messages.some(m => m._id === msg._id)) {
            chat = { ...chat, messages: [...chat.messages, msg] };
            updated = updated.map(c => c.otherUserId === frdId ? chat : c);
          }
        } else {
          updated.push({ otherUserId: frdId, messages: [msg] });
        }
        return updated;
      });
   

    // show notification for incoming messages 
    const isIncoming = senderId && senderId !== myId;
    const isViewingThisChat = selectedUserRef.current?.receiverId?.toString() === senderId;
    
    if (isIncoming && !isViewingThisChat){
      showChatNotification({
        senderName: msg.sender?.name || "Someone",
        message: msg.message,
        types: msg.types,
        senderId
      });
    }
  };
    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [user?.id]);

// Total unread messages across all the conversations - for navbar badge + tab title 
const totalUnread = useMemo (() =>{
  if (!user?.id) return 0;
  const myId = user.id.toString();
  return messages.reduce((sum, chat) => {
    const senderId = chat.messages[0]?.sender?._id?.toString();
    if (!senderId || senderId === myId) return sum;
    const unreadCount = chat.messages.reduce((c, m) => 
      c + (m.sender?._id?.toString() === senderId && m.status !== 'read' ? 1 : 0)
    , 0);
    return sum + unreadCount;
  }, 0);
})


  // ── messagesRead → turn ticks blue ────────────────────────────────────────
  useEffect(() => {
    const handler = ({ by }) => {
      setMessages(prev => prev.map(chat => ({
        ...chat,
        messages: chat.messages.map(m =>
          m.sender?._id?.toString() === user?.id?.toString()
            && m.receiver?._id?.toString() === by?.toString()
            ? { ...m, status: 'read' }
            : m
        )
      })));
    };
    socket.on("messagesRead", handler);
    return () => socket.off("messagesRead", handler);
  }, [user?.id]);

  // ── Fetch all (for sidebar preview) ───────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    const response = await api.get('/api/messages/fetchallmessages');
    return response.data.messages;
  }, []);

  // ── Fetch paginated conversation ───────────────────────────────────────────
  const fetchConversation = useCallback(async (otherUserId, page = 1, limit = 20) => {
    const response = await api.get(`/api/messages/conversation/${otherUserId}?page=${page}&limit=${limit}`);
    return response.data; // { messages, hasMore, page }
  }, []);

  // ── Send message (optimistic) ──────────────────────────────────────────────
  const sendMessage = async (formData) => {
    const response = await api.post('/api/messages/sendmessage', formData);
    if (!response.data.success) throw new Error( response.data.error);
    const saved = response.data.message;
    // Optimistic: add to context so sidebar preview updates
    setMessages(prev => {
      const frdId = saved.receiver?._id?.toString();
      let updated = [...prev];
      let chat = updated.find(c => c.otherUserId === frdId);
      if (chat) {
        if (!chat.messages.some(m => m._id === saved._id)) {
          chat = { ...chat, messages: [...chat.messages, saved] };
          updated = updated.map(c => c.otherUserId === frdId ? chat : c);
        }
      } else {
        updated.push({ otherUserId: frdId, messages: [saved] });
      }
      return updated;
    });
    // Emit to receiver's socket room
    socket.emit("sendMessage", saved);
    return saved;
  };

  // ── Draft helpers ────────────────────────────────────────────────────
  const setDraft = useCallback((receiverId, text) => {
    if (!receiverId) return;
    setDraftsState(prev => {
      if (text) return { ...prev, [receiverId]: text };
      const next = { ...prev };
      delete next[receiverId];
      return next;
    });
  }, []);

  // ── Mark as read ───────────────────────────────────────────────────────────
  const markAsRead = async (senderId) => {
    if (!senderId) return;
    try {
      await api.put(`/api/messages/markasread/${senderId}`);
      socket.emit("markRead", { senderId, receiverId: user?.id });
    } catch (e) { /* silent */ }
  };


  const  value = useMemo(() =>({
messages, setMessages,
      Selecteduser, setSelectedUser: setSelectedUserWithRef,
      fetchMessages, fetchConversation, sendMessage, markAsRead,
      drafts, setDraft, totalUnread
  }), [messages, Selecteduser, drafts]);
  return (
    <MessageContext.Provider value={value}>
      {props.children}
    </MessageContext.Provider>
  );
};