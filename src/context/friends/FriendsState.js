import FriendsContext from "./FriendsContext";
import { useState, useCallback } from "react";
import axios from "axios";


export const FriendsState = (props) => {
    axios.defaults.baseURL = process.env.REACT_APP_URL;
    axios.defaults.headers.common['auth-token'] = localStorage.getItem('token');

    const [friends, setFriends] = useState([]);
    const [people, setPeople] = useState([]);
    const [receivedFrdReq, setReceivedFrdReq] = useState([]);
    const [sentFrdReq, setSentFrdReq] = useState([]);

    // Fetch all friends
    const fetchFriends = useCallback(async () => {
        try {
            const response = await axios.get('/api/friends/fetchallfriends');
        
            setFriends(response.data.friends);
        } catch (error) {
            console.error("Error fetching friends:", error);
            throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    }, []);

    // fetch all received frd req 
    const fetchReceivedRequests = useCallback(async () => {
        try {
            const response = await axios.get('/api/friends/fetchallreceivedrequests');
            setReceivedFrdReq(response.data.friendRequests);
            return response.data;
        } catch (error) {
            console.error("Error fetching received friend requests:",  error.response?.data.error || error.response?.data.message);
            throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    }, [])

    //suggestion frd 
    const suggestionFrds =useCallback(async () => {
        try {
            const response = await axios.get('/api/friends/suggestfriends');
            setPeople(response.data.suggestionFriends);
            console.log(response.data.suggestionFriends);
        } catch (error) {
            console.error("Error fetching suggested friends:", error);
            throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    }, []);

    // received frd req 
    const receivedFriendRequest = async (friendId, action) => {
        try {
            const response = await axios.post(`/api/friends/actiononfriendrequest`, { friendId, action });

            return response.data;
        } catch (error) {
            console.error("Error handling friend request:", error);
            throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    };

    //fetch all send frd req
    const fetchSentRequests = async () => {
        try {
            const response = await axios.get('/api/friends/fetchallsentrequests');
            return response.data;
        } catch (error) {
            console.error("Error fetching sent friend requests:", error);
            throw error.response?.data.error || error.response?.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    };

    //sent frd req 
    const sendFriendRequest = async (friendId) => {
        try {
            const response = await axios.post('/api/friends/sendfriendrequest', { friendId });
            return response.data;
        } catch (error) {
            console.error("Error sending friend request:", error.response.data.error , error.response.data.message);
            throw error.response?.data.error || error.response.data.message || { success: false, message:error.error || "Something went wrong" };
        }
    };

    return (
    <FriendsContext.Provider value={{ friends, setFriends, people, setPeople, fetchFriends, suggestionFrds, fetchReceivedRequests, receivedFriendRequest, fetchSentRequests, sendFriendRequest, receivedFrdReq, setReceivedFrdReq, sentFrdReq, setSentFrdReq }}>
      {props.children}
    </FriendsContext.Provider>
  );
}