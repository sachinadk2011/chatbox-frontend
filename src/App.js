import React from 'react';
import './App.css';
import Login from './auth_pages/Login';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import SignUp from './auth_pages/SignUp';
import ChatRoom from './auth_pages/ChatRoom';
import { UserState } from './context/users/UserState';
import { MessageState } from './context/message/MessageState';
import { FriendsState } from './context/friends/FriendsState';


function App() {
  return (
   <>
   <UserState>
      <FriendsState>
     <MessageState>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<ChatRoom />} />
      </Routes>
    </Router>
    </MessageState>
    </FriendsState>
    </UserState>


   </>
  );
}

export default App;
