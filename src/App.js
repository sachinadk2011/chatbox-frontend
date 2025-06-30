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


function App() {
  return (
   <>
   <UserState>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/" element={<ChatRoom />} />
      </Routes>
    </Router>
    </UserState>


   </>
  );
}

export default App;
