import MessageContext from "./MessageContext";
import React, { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import UserContext from "../users/UserContext"; 

export const MessageState = (props) => {
    axios.defaults.baseURL = process.env.REACT_APP_URL;
    axios.defaults.headers.common['auth-token'] = localStorage.getItem('token');
    const { user } = useContext(UserContext);
    

    const [messages, setMessages] = useState([]); // Example state for messages
    const [Selecteduser, setSelectedUser] = useState(
      {
        receiverId: null,
        senderId: null,
        receiverName: " ",
        senderName: " " 
      });

      let sendername = user?.name || "";
      console.log("sendername: ", sendername, user.name);
    // fetch all messages
    const fetchMessages = useCallback(async () => {
        try {
            const response = await axios.get('/api/messages/fetchallmessages');
           
            const msg = response.data.messages;
            setMessages(msg);
            console.log(msg);
            if (msg.length > 0) {
            const lastMsg = msg[msg.length - 1];
            setSelectedUser({
              receiverId: lastMsg.receiver.name!== sendername ? lastMsg.receiver._id : lastMsg.sender._id,
              senderId: lastMsg.sender.name=== sendername ? lastMsg.sender._id : lastMsg.receiver._id,
              receiverName: lastMsg.receiver.name!== sendername ? lastMsg.receiver.name : lastMsg.sender.name,
              senderName: lastMsg.sender.name=== sendername ? lastMsg.sender.name : lastMsg.receiver.name
            });
          }
        } catch (error) {
          
            console.error("Error fetching messages:", error.error, error.message, error.status);
            return error.status;
        }
    }, []);

    //send a message
    const sendMessage = async (message, receiver) => {
        try {
            const response = await axios.post('/api/messages/sendmessage', { message, receiver });
            if (!response.data.success) {
              throw new Error(response.data.error || 'Message sending failed');
            }
            console.log("Message sent:", response.data);
            setMessages(prevMessages => [...prevMessages, response.data.message]);
            console.log(messages, response.data, response.data.message);
            return response.data;
          } catch (error) {
          console.error("Error sending message:", error, error.error, error.message);
          return error.response?.data || { success: false, message: error.message || "Something went wrong" };
        }
    };

    //marksasread a message
    const markAsRead = async (senderId) => {
        try {
             await axios.put(`/api/messages/markasread/${senderId}`);

        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    }; 

    return (
    <MessageContext.Provider value={{ messages,setMessages, Selecteduser, setSelectedUser, fetchMessages, sendMessage, markAsRead }}>
      {props.children}
    </MessageContext.Provider>
  );
};