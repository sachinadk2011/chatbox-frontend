import MessageContext from "./MessageContext";
import React, { useState, useCallback, useContext, useEffect, useRef } from 'react';
import UserContext from "../users/UserContext";
import socket from "../../server/socket";
import { api } from '../../utils/SetAuthToken';

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
 // Override setSelectedUser to keep ref in sync immediately (no useEffect delay)
  const setSelectedUserWithRef = useCallback((val) => {
    const resolved = typeof val === 'function' ? val(selectedUserRef.current) : val;
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
    const handler = async (msg) => {
      const senderId = msg.sender?._id?.toString();
      const frdId = senderId === user?.id?.toString()
        ? msg.receiver?._id?.toString()
        : senderId;
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

      // auto mark as read if currently chatting with sender
      const isIncoming = senderId && senderId !== user?.id?.toString();
     const openChatId = selectedUserRef.current?.receiverId?.toString();
      const isViewingThisChat = isIncoming && openChatId === senderId;
      console.info(`Received message ${msg._id} from ${senderId}. isIncoming: ${isIncoming}, isViewingThisChat: ${isViewingThisChat}`);

      if (isViewingThisChat ) {
        // Mark as read silently — user is already looking at this chat
        console.info(`Auto-marking message ${msg.message} as read since user is viewing the chat`);
        await api.put(`/api/messages/markasread/${senderId}`).catch(() => {});
        socket.emit("markRead", { senderId, receiverId: user?.id });
      }
    };
    
    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [user?.id]);

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

  return (
    <MessageContext.Provider value={{
      messages, setMessages,
      Selecteduser, setSelectedUser,
      fetchMessages, fetchConversation, sendMessage, markAsRead,
      drafts, setDraft,
    }}>
      {props.children}
    </MessageContext.Provider>
  );
};