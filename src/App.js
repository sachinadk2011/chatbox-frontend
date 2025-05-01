import React from 'react';
import './App.css';
import Login from './pages/Login';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import SignUp from './pages/SignUp';
import ChatRoom from './pages/ChatRoom';


function App() {
  return (
   <>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/" element={<ChatRoom />} />
      </Routes>
    </Router>


   </>
  );
}

export default App;
