/**
 * FriendsCard.jsx
 *
 * PURPOSE:
 *   Renders a single person card in any of the friend-management pages.
 *
 * MODE PROP:
 *   mode — 'add' | 'sent' | 'received'
 *     'add'      — shown on /friends/add-friend  → "Add Friend" button
 *     'sent'     — shown on /friends/sent-requests → "Cancel Request" button
 *     'received' — shown on /friends/received-requests → Accept + Reject buttons
 *
 *   WHY a prop instead of useLocation:
 *     The parent page already knows which section it's rendering and passes
 *     mode explicitly. This removes ALL pathname comparisons from FriendsCard,
 *     making it route-agnostic and reusable in any future context.
 *
 * AVATAR:
 *   Uses getProfileImageUrl() from profileUtils.js — the same Cloudinary
 *   face-crop → UI Avatars fallback used consistently across all components.
 *   Output is visually identical to the previous inline resizedUrl logic
 *   (same /upload/w_200,h_200,c_fill,g_face/ transform under the hood).
 */

import React from 'react';
import FriendsContext from '../../context/friends/FriendsContext';
import UserContext from '../../context/users/UserContext';
import { getProfileImageUrl } from '../../utils/helpers/profileUtils';

const FriendsCard = ({ id, name, mutualFriends = 0, friendlen = 0, profileUrl, email, mode }) => {
  const {
    sendFriendRequest, cancelFriendRequest,
    setPeople, receivedFriendRequest, setReceivedFrdReq,
    receivedFrdReq, sentFrdReq, people,
  } = React.useContext(FriendsContext);
  const { user } = React.useContext(UserContext);

  // Cloudinary face-crop → UI Avatars fallback — visually identical to previous inline logic.
  // profileUtils applies the same /w_200,h_200,c_fill,g_face/ crop transform.
  const avatarSrc = getProfileImageUrl(name, profileUrl);

  const Accept = async () => {
    try {
      const json = await receivedFriendRequest(id, "accept");
      console.log("Accept friend response: ", id, json);
      setReceivedFrdReq(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const CancelReq = async () => {
    try {
      const json = await cancelFriendRequest(id);
      console.log("Cancel friend response: ", id, json);
    } catch (error) {
      console.error("Error cancelling friend request:", error);
    }
  };

  const Reject = async () => {
    try {
      const json = await receivedFriendRequest(id, "reject");
      console.log("Reject friend response: ", id, json);
      setReceivedFrdReq(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const AddingFrd = async () => {
    try {
      const json = await sendFriendRequest(id);
      console.log("Add friend response: ", json);
      setPeople(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  return (
    <div className="bg-white pt-10 shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition">
      <img
        src={avatarSrc}
        alt={name}
        className="w-24 h-24 mx-auto rounded-full -mt-12 border-4 border-white shadow-md"
      />

      <h3 className="mt-4 text-xl font-semibold text-gray-900">{name}</h3>

      <div className="flex justify-around items-center my-4 text-sm text-gray-700">
        <span><strong>{mutualFriends}</strong> Mutual Friends</span>
        <span><strong>{friendlen}</strong> Friends</span>
      </div>

      {/* Add / Cancel button — visible in 'add' and 'sent' modes */}
      {(mode === 'add' || mode === 'sent') && (
        <button
          onClick={() => mode === 'add' ? AddingFrd() : CancelReq()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full font-medium transition"
        >
          {mode === 'add' ? 'Add Friend' : 'Cancel Request'}
        </button>
      )}

      {/* Accept / Reject buttons — visible in 'received' mode only */}
      {mode === 'received' && (
        <div className="flex flex-row gap-2">
          <button
            onClick={Accept}
            className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full font-medium transition"
          >
            Accept
          </button>
          <button
            onClick={Reject}
            className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-full font-medium transition"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendsCard;
