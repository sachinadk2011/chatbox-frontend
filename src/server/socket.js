// src/socket.js
import { io } from "socket.io-client";

// connect to your backend
const socket = io(import.meta.env.VITE_URL, {
  withCredentials: true,   // send cookies if needed
  transports: ["websocket", "polling"], // ensures real-time connection
});

export default socket;
