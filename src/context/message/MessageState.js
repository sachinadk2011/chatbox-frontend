import MessageContext from "./MessageContext";
import React, { useState } from 'react';
import axios from 'axios';

export const MessageState = (props) => {
    axios.defaults.baseURL = process.env.REACT_APP_URL;
    axios.defaults.headers.common['auth-token'] = localStorage.getItem('token');
    

    const [messages, setMessages] = useState([]); // Example state for messages
    const [Selecteduser, setSelectedUser] = useState(
      {
        receiverId: null,
        senderId: null,
        receiverName: "",
        senderName: ""
      });
      const sendername = JSON.parse(localStorage.getItem('user')).name;
    // fetch all messages
    const fetchMessages = async () => {
        try {
            const response = await axios.get('/api/messages/fetchallmessages');
            
            setMessages(response.data.messages);
            console.log(messages);
            setSelectedUser({
              receiverId: response.data.messages.receiver.name!== sendername ? response.data.messages.receiver._id : response.data.messages.sender._id,
              senderId: response.data.messages.sender.name=== sendername ? response.data.messages.sender._id : response.data.messages.receiver._id,
              receiverName: response.data.messages.receiver.name!== sendername ? response.data.messages.receiver.name : response.data.messages.sender.name,
              senderName: response.data.messages.sender.name=== sendername ? response.data.messages.sender.name : response.data.messages.receiver.name
            });
        } catch (error) {
          
            console.error("Error fetching messages:", error);
        }
    };

    //send a message
    const sendMessage = async (messageData, receiverId) => {
        try {
            const response = await axios.post('/api/messages/sendmessage', { ...messageData, receiverId });
            console.log("Message sent:", response.data);
            setMessages(prevMessages => [...prevMessages, response.data.message]);
        } catch (error) {
            console.error("Error sending message:", error);
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