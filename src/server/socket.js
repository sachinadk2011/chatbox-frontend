// src/socket.js
import { io } from "socket.io-client";

// connect to your backend
const socket = io(process.env.REACT_APP_URL, {
  withCredentials: true,   // send cookies if needed
  transports: ["websocket"], // ensures real-time connection
});

export default socket;
