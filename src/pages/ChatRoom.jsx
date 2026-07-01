import React, { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import ChatLayout from '../component/chat/ChatLayout';
import MessageContext from '../context/message/MessageContext';
import FriendsContext from '../context/friends/FriendsContext';

const ChatRoom = () => {
  const { userId } = useParams(); // undefined when at /chat, has value at /chat/v1/u/:userId
  const { setSelectedUser } = useContext(MessageContext);
  const { friends } = useContext(FriendsContext);

  useEffect(() => {
    if (!userId) {
      // /chat — no user selected, clear chat
      setSelectedUser({
        receiverId: null, receiverName: '', senderId: null,
        senderName: '', lastActive: null, onlineStatus: false, profile_url: null,
      });
      return;
    }

    // /chat/v1/u/:userId — find the friend and open their chat
    const friend = friends.find(f => f._id === userId);
    if (friend) {
      setSelectedUser({
        receiverId: friend._id,
        receiverName: friend.name,
        senderId: null,         // ChatLayout doesn't use this
        senderName: '',
        lastActive: friend.lastActive,
        onlineStatus: friend.onlineStatus,
        profile_url: friend.profile_Url,
      });
    }
  }, [userId, friends]); // re-runs when URL changes or friends load

  return <ChatLayout />;
};

export default ChatRoom;