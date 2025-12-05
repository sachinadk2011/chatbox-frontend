import MessageContext from "./MessageContext";
import React, { useState, useCallback, useContext, useEffect } from 'react';

import UserContext from "../users/UserContext";
import socket from "../../server/socket"; 
import { api } from '../../utils/SetAuthToken';
import LastActive from "../../utils/lastactive";

export const MessageState = (props) => {
   ;
    const { user } = useContext(UserContext);
    

    const [messages, setMessages] = useState([]); // Example state for messages
    const [Selecteduser, setSelectedUser] = useState(
      {
        receiverId: null,
        senderId: null,
        receiverName: " ",
        senderName: " " ,
        lastActive: null,
        onlineStatus: false
      });

      

      // inside component or hook:
useEffect(() => {
  socket.on("receiveMessage", (msg) => {
    console.log("Received via socket:", msg);
    setMessages(prevMessages =>{
           // determine friend ID safely
      const frdId = msg.sender?._id === user?.id 
        ? msg.receiver?._id.toString() 
        : msg.sender?._id.toString();

  // clone old state
  let updated = [...prevMessages];
  
  // find chat with that friend
  let existing = updated.find(item => item.otherUserId === frdId);

  if (existing) {
    if(!existing.messages.some(m => m._id === msg._id)) {
      existing.messages = [...existing.messages, msg];
    }
  } else {
    // create new chat if not exists
    updated.push({ otherUserId: frdId, messages: [msg] });
  }

  return updated;
});
  });
  return () => {
    socket.off("receiveMessage");
  };
}, []);

useEffect(() => {
  if (!socket.connected) return;

  let idleTimer;
  const idleLimit =  5 * 60 *1000; // 5 min

  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      console.log("User idle, disconnecting socket...");
      socket.disconnect(); // triggers server-side disconnect
    }, idleLimit);
  };

  window.addEventListener("mousemove", resetIdleTimer);
  window.addEventListener("keydown", resetIdleTimer);
  window.addEventListener("scroll", resetIdleTimer);

  resetIdleTimer();

  return () => {
    clearTimeout(idleTimer);
    window.removeEventListener("mousemove", resetIdleTimer);
    window.removeEventListener("keydown", resetIdleTimer);
    window.removeEventListener("scroll", resetIdleTimer);
  };
}, [socket.connected]);


useEffect(() => {
  if (!user?.id) return; // wait until user ID is available

  const handleConnect = () => {
    const token = localStorage.getItem("token");
    if (token ) {
      socket.emit("joinRoom", user.id);
    }
  };

  socket.on("connect", handleConnect);

  const interval = setInterval(() => {
    if (user?.id) socket.emit("alive");
  }, 10000);

  return () => {
    socket.off("connect", handleConnect);
    clearInterval(interval);
  };
}, [user?.id]);






    // fetch all messages
    const fetchMessages = useCallback(async () => {
        try {
            const response = await api.get('/api/messages/fetchallmessages');
           
            const msg = response.data.messages;
           
            return msg;
            
        } catch (error) {
          
            console.error("Error fetching messages:",  error.message, error.status);
            throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    }, []);

    //send a message
    const sendMessage = async (formData) => {
        try {
          
            const response = await api.post('/api/messages/sendmessage', formData
            );
            if (!response.data.success) {
              throw new Error(response.data.error || 'Message sending failed');
            }
           

            socket.emit("sendMessage", response.data.message);

            
          } catch (error) {
          console.error("Error sending message error:", error);
          console.error("Error sending message error.error:",  error.error);
          console.error("Error sending message error.message:",  error.message);

         throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    };

    //marksasread a message
    const markAsRead = async (senderId) => {
        try {
             await api.put(`/api/messages/markasread/${senderId}`);

        } catch (error) {
            console.error("Error marking message as read:", error);
            throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    }; 

    return (
    <MessageContext.Provider value={{ messages,setMessages, Selecteduser, setSelectedUser, fetchMessages, sendMessage, markAsRead }}>
      {props.children}
    </MessageContext.Provider>
  );
};