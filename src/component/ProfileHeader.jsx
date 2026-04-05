import React, { useContext } from 'react';
import LastActive from '../utils/lastactive';
import MessageContext from '../context/message/MessageContext';
import FriendsContext from '../context/friends/FriendsContext';

/**
 * ProfileHeader
 * ─────────────
 * Desktop: same as before — avatar + name + action buttons on the right
 * Mobile:  Instagram DM style — back arrow · avatar · name (left) · action buttons (right)
 */
const ProfileHeader = ({ onBack }) => {
  const { Selecteduser } = useContext(MessageContext);
  const { friends } = useContext(FriendsContext);

  let profile_url = `https://ui-avatars.com/api/?name=${Selecteduser.receiverName}&background=random&color=random&bold=true&rounded=true`;
  const resizedUrl = Selecteduser.profile_url
    ? Selecteduser.profile_url.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face/')
    : false;

  return (
    <div className="flex items-center justify-between w-full px-3 py-2">

      {/* ── LEFT: back arrow (mobile only) + avatar + name ── */}
      <div className="flex items-center space-x-2">

        {/* Back arrow — only on mobile */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-600 flex-shrink-0"
            aria-label="Go back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Avatar with online dot */}
        <div className="relative flex-shrink-0">
          <img
            src={resizedUrl || profile_url}
            alt={Selecteduser.receiverName}
            className="w-10 h-10 rounded-full object-cover"
          />
          {Selecteduser.onlineStatus && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>

        {/* Name + last-active */}
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-gray-800 text-sm sm:text-base">
            {Selecteduser.receiverName || 'Guest'}
          </span>
          {!Selecteduser.onlineStatus && Selecteduser.lastActive && (
            <span className="text-xs text-gray-400">
              <LastActive timestamp={Selecteduser.lastActive} />
            </span>
          )}
          {Selecteduser.onlineStatus && (
            <span className="text-xs text-green-500">Active now</span>
          )}
        </div>
      </div>

      {/* ── RIGHT: action buttons ── */}
      <div className="flex items-center space-x-1">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full h-9 w-9 transition duration-200 text-gray-500 hover:bg-gray-100"
          aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full h-9 w-9 transition duration-200 text-gray-500 hover:bg-gray-100"
          aria-label="Favourite"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full h-9 w-9 transition duration-200 text-gray-500 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;