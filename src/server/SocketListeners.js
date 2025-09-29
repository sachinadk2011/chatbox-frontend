import socket from "./socket";
import React, { useContext, useEffect } from "react";
import UserContext from "../context/users/UserContext";
import MessageContext from "../context/message/MessageContext";

const SocketListeners = () => {
  const { user } = useContext(UserContext);
  const { setMessages, messages, Selecteduser } = useContext(MessageContext);

    useEffect(() => {
  
  if (!Selecteduser?.id) return;

   socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    socket.emit("joinRoom", Selecteduser.id);
 
  socket.on("receiveMessage", (messageData) => {
    console.log("Live message received:", messageData);
    setMessages((prev) => [...prev, messageData]);
    console.log("socket useeffect a: ", messages);
  });
});

  return () => {
    socket.off("receiveMessage");
  };
}, [Selecteduser?.id, setMessages]);
};

export default SocketListeners;
