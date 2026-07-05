/**
 * useSidebarData.js
 *
 * PURPOSE:
 *   On mount (once user.id is known), fetches both friends and messages from
 *   the server, normalises them into the shape expected by MessageContext, and
 *   populates FriendsContext + MessageContext state.
 *   Includes the same retry logic as the original SidebarList effect:
 *   network-only errors are retried up to 2 times (for Render cold-starts).
 *
 * INPUTS:
 *   { user, fetchFriends, fetchMessages, setFriends, setMessages }
 *
 * OUTPUTS:
 *   none (effect only)
 *
 * DEPENDENCIES:
 *   react-router-dom — useNavigate() (for auth-failure redirect)
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSidebarData = ({ user, fetchFriends, fetchMessages,friends, messages, setFriends, setMessages, setFriendsLoaded  }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return; // wait until user is loaded from context

    const fetchdata = async (retryCount = 0) => {
      try {
        if (friends.length > 0 && messages.length > 0) {
          console.info('Friends and messages already loaded, skipping fetch.');
          return;
        }
        const frd = await fetchFriends();
        const msg = await fetchMessages();
        console.info('Fetched friends and messages:', frd, msg);
        setFriends(frd);
        setFriendsLoaded(true);
        // Normalise flat message list into per-conversation buckets,
        // keeping only messages that belong to a known friend.
        setMessages(
          msg.reduce((acc, mg) => {
            const otherUserId =
              mg.sender._id.toString() === user.id.toString()
                ? mg.receiver._id.toString()
                : mg.sender._id.toString();

            if (frd.some(f => f._id.toString() === otherUserId)) {
              const existing = acc.find(item => item.otherUserId === otherUserId);
              if (existing) {
                existing.messages.push(mg);
              } else {
                acc.push({ otherUserId, messages: [mg] });
              }
            }
            return acc;
          }, [])
        );

      } catch (error) {
        const isAuth =
          error.response?.status === 401 ||
          error.status === 401 ||           // set by interceptor on refresh failure
          error.isAuthFailure;              // set by interceptor on 4xx refresh rejection

        if (isAuth) {
          navigate('/login');
        } else if (!error.response && !error.isAuthFailure && retryCount < 2) {
          // Network-only error (no HTTP response) — server may be waking up
          console.log(`Server may be waking up, retrying in 3s (attempt ${retryCount + 1})`);
          setTimeout(() => {
            fetchdata(retryCount + 1)
            
          
          }, 3000);
            
        } 
    // Retries exhausted, OR a non-401 4xx, OR 5xx not caught by StatusGate.
    // Unblock useResourceFromUrl so it can resolve to "not found" instead of hanging forever.
    console.error('Failed to load friends/messages after retries:', error);
    setFriendsLoaded(true);
        }
        // 4xx (not 401) or 5xx → StatusGate handles the error page
      
    };

    fetchdata();
  }, [user?.id, fetchFriends, fetchMessages, navigate]);
};