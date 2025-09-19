import FriendsContext from "./FriendsContext";
import { useState } from "react";
import axios from "axios";


export const FriendsState = (props) => {
    axios.defaults.baseURL = process.env.REACT_APP_URL;
    axios.defaults.headers.common['auth-token'] = localStorage.getItem('token');

    const [friends, setFriends] = useState([]);

    // Fetch all friends
    const fetchFriends = async () => {
        try {
            const response = await axios.get('/api/friends/fetchallfriends');
            setFriends(response.data);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    // fetch all received frd req 
    const fetchReceivedRequests = async () => {
        try {
            const response = await axios.get('/api/friends/fetchallreceivedrequests');
            return response.data;
        } catch (error) {
            console.error("Error fetching received friend requests:", error);
        }
    };

    // received frd req 
    const receivedFriendRequest = async (requestId, action) => {
        try {
            const response = await axios.post(`/api/friends/handlefriendrequest/${requestId}`, { action });
            return response.data;
        } catch (error) {
            console.error("Error handling friend request:", error);
        }
    };

    //fetch all send frd req
    const fetchSentRequests = async () => {
        try {
            const response = await axios.get('/api/friends/fetchallsentrequests');
            return response.data;
        } catch (error) {
            console.error("Error fetching sent friend requests:", error);
        }
    };

    //sent frd req 
    const sendFriendRequest = async (userId) => {
        try {
            const response = await axios.post('/api/friends/sendfriendrequest', { userId });
            return response.data;
        } catch (error) {
            console.error("Error sending friend request:", error);
        }
    };

    return (
    <FriendsContext.Provider value={{ friends, fetchFriends, fetchReceivedRequests, receivedFriendRequest, fetchSentRequests, sendFriendRequest }}>
      {props.children}
    </FriendsContext.Provider>
  );
}