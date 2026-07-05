import FriendsContext from "./FriendsContext";
import { useState, useCallback, useMemo } from "react";
import { api } from '../../utils/auth/SetAuthToken';
import { throwFriendlyError } from '../../utils/helpers/errorUtils';


export const FriendsState = (props) => {
    const [friends, setFriends]             = useState([]);
    const [people, setPeople]               = useState([]);
    const [receivedFrdReq, setReceivedFrdReq] = useState([]);
    const [sentFrdReq, setSentFrdReq]       = useState([]);
    const [friendsLoaded, setFriendsLoaded] = useState(false);

    // All API functions wrapped in useCallback(fn, []) so the useMemo value
    // is stable — prevents React.memo from being silently broken on consumers.
    // useState setters are guaranteed stable by React — safe in [].

    const fetchFriends = useCallback(async () => {
        try {
            setFriendsLoaded(false);
            const response = await api.get('/api/friends/fetchallfriends');
            
            return response.data.friends;
        } catch (error) {
            console.error("Error fetching friends:", error.message);
            // Re-throw the original error so callers keep error.response,
            // error.status, and error.isAuthFailure set by the interceptor.
            throw error;
        }
    }, []);

    const fetchReceivedRequests = useCallback(async () => {
        try {
            const response = await api.get('/api/friends/fetchallreceivedrequests');
            setReceivedFrdReq(response.data.friendRequests);
            return response.data;
        } catch (error) {
            console.error("Error fetching received friend requests:",
                error.response?.data.error || error.response?.data.message || error.message);
            throwFriendlyError(error);
        }
    }, []);

    const suggestionFrds = useCallback(async () => {
        try {
            const response = await api.get('/api/friends/suggestfriends');
            setPeople(response.data.suggestionFriends);
            console.log(response.data.suggestionFriends);
        } catch (error) {
            console.error("Error fetching suggested friends:", error);
            throwFriendlyError(error);
        }
    }, []);

    // receivedFriendRequest was not wrapped before — now it is.
    const receivedFriendRequest = useCallback(async (friendId, action) => {
        try {
            const response = await api.post(`/api/friends/actiononfriendrequest`, { friendId, action });
            return response.data;
        } catch (error) {
            console.error("Error handling friend request:", error);
            throwFriendlyError(error);
        }
    }, []);

    const fetchSentRequests = useCallback(async () => {
        try {
            const response = await api.get('/api/friends/fetchallsentrequests');
            setSentFrdReq(response.data.sentRequests);
            return response.data;
        } catch (error) {
            console.error("Error fetching sent friend requests:", error);
            throwFriendlyError(error);
        }
    }, []);

    // sendFriendRequest was not wrapped before — now it is.
    const sendFriendRequest = useCallback(async (friendId) => {
        try {
            const response = await api.post('/api/friends/sendfriendrequest', { friendId });
            return response.data;
        } catch (error) {
            console.error("Error sending friend request:",
                error.response?.data?.error, error.response?.data?.message || error.message);
            throwFriendlyError(error);
        }
    }, []);

    // cancelFriendRequest was not wrapped before — now it is.
    const cancelFriendRequest = useCallback(async (friendId) => {
        try {
            const response = await api.post('/api/friends/cancelsentfriendrequest', { friendId });
            setSentFrdReq(prev => prev.filter(r => r._id !== friendId));
            return response.data;
        } catch (error) {
            console.error("Error cancelling friend request:", error);
            throwFriendlyError(error);
        }
    }, []);

    const value = useMemo(() => ({
        friends, setFriends, people, setPeople,
        fetchFriends, suggestionFrds,
        fetchReceivedRequests, receivedFriendRequest,
        fetchSentRequests, sendFriendRequest,
        receivedFrdReq, setReceivedFrdReq,
        sentFrdReq, setSentFrdReq,
        cancelFriendRequest,friendsLoaded, setFriendsLoaded
    }), [friends, people, receivedFrdReq, sentFrdReq, friendsLoaded]);
    // All function refs are stable — only state arrays cause re-memoization.

    return (
        <FriendsContext.Provider value={value}>
            {props.children}
        </FriendsContext.Provider>
    );
}