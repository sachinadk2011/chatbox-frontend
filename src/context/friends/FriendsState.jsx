import FriendsContext from "./FriendsContext";
import { useState, useCallback, useMemo } from "react";
import { api } from '../../utils/auth/SetAuthToken';

const throwFriendlyError = (error) => {
  const message = error.response?.data.error || error.response?.data.message || error.message || "Something went wrong";
  const msgText = typeof message === 'object' ? (message.message || "Something went wrong") : message;
  const err = new Error(msgText);
  err.msg = msgText;
  if (error.response) {
    err.response = error.response;
  }
  if (error.response?.data?.errors) {
    err.errors = error.response.data.errors;
  }
  if (error.status !== undefined) {
    err.status = error.status;
  } else if (error.response?.status !== undefined) {
    err.status = error.response.status;
  }
  if (error.isAuthFailure !== undefined) {
    err.isAuthFailure = error.isAuthFailure;
  }
  throw err;
};

export const FriendsState = (props) => {
    const [friends, setFriends] = useState([]);
    const [people, setPeople] = useState([]);
    const [receivedFrdReq, setReceivedFrdReq] = useState([]);
    const [sentFrdReq, setSentFrdReq] = useState([]);

    const fetchFriends = useCallback(async () => {
        try {
            const response = await api.get('/api/friends/fetchallfriends');
            return response.data.friends;
        } catch (error) {
            console.error("Error fetching friends:", error.message);
            // Re-throw the original error so callers keep error.response,
            // error.status, and error.isAuthFailure set by the interceptor.
            throw error;
        }
    }, []);

    // fetch all received frd req 
    const fetchReceivedRequests = useCallback(async () => {
        try {
            const response = await api.get('/api/friends/fetchallreceivedrequests');
            setReceivedFrdReq(response.data.friendRequests);
            return response.data;
        } catch (error) {
            console.error("Error fetching received friend requests:",  error.response?.data.error || error.response?.data.message || error.message);
            throwFriendlyError(error);
        }
    }, [])

    //suggestion frd 
    const suggestionFrds =useCallback(async () => {
        try {
            const response = await api.get('/api/friends/suggestfriends');
            setPeople(response.data.suggestionFriends);
            console.log(response.data.suggestionFriends);
        } catch (error) {
            console.error("Error fetching suggested friends:", error);
            throwFriendlyError(error);
        }
    }, []);

    // received frd req 
    const receivedFriendRequest = async (friendId, action) => {
        try {
            const response = await api.post(`/api/friends/actiononfriendrequest`, { friendId, action });

            return response.data;
        } catch (error) {
            console.error("Error handling friend request:", error);
            throwFriendlyError(error);
        }
    };

    //fetch all send frd req
    const fetchSentRequests = useCallback(async () => {
        try {
            const response = await api.get('/api/friends/fetchallsentrequests');
            setSentFrdReq(response.data.sentRequests);
            return response.data;
        } catch (error) {
            console.error("Error fetching sent friend requests:", error);
            throwFriendlyError(error);
        }
    }, [])

    //sent frd req 
    const sendFriendRequest = async (friendId) => {
        try {
            const response = await api.post('/api/friends/sendfriendrequest', { friendId });
            return response.data;
        } catch (error) {
            console.error("Error sending friend request:", error.response?.data?.error, error.response?.data?.message || error.message);
            throwFriendlyError(error);
        }
    };

    //cancel sent frd req
    const cancelFriendRequest = async (friendId) => {
        try {
            const response = await api.post('/api/friends/cancelsentfriendrequest', { friendId });
            setSentFrdReq(prevRequests => prevRequests.filter(request => request._id !== friendId));
            return response.data;
        } catch (error) {
            console.error("Error cancelling friend request:", error);
            throwFriendlyError(error);
        }  
    };                         

    const value = useMemo(() => ({
        friends, setFriends, people, setPeople, fetchFriends, suggestionFrds, fetchReceivedRequests, receivedFriendRequest, fetchSentRequests, sendFriendRequest, receivedFrdReq, setReceivedFrdReq, sentFrdReq, setSentFrdReq, cancelFriendRequest
    }), [friends, people, receivedFrdReq, sentFrdReq]);
    return (
    <FriendsContext.Provider value={value}>
      {props.children}
    </FriendsContext.Provider>
  );
}