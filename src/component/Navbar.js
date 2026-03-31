import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import UserContext from '../context/users/UserContext';

/**
 * Navbar
 * ──────
 * Desktop (md+): vertical sidebar — Instagram/Messenger style
 * Mobile (<md):  horizontal scrollable bottom tab bar — new Instagram style
 *
 * Color scheme: indigo/violet — modern, premium, not default red/green/blue
 */
const Navbar = () => {
  const { user, logout, setUser } = React.useContext(UserContext);

  const profile_url = `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&bold=true&rounded=true`;
  const resizedUrl = user.profile_Url
    ? user.profile_Url.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face/')
    : false;

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser({ name: '', email: '', id: '', onlineStatus: false, lastActive: null, profile_Url: null, public_id: null });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /* ─── nav items ─── */
  const navItems = [
    {
      key: 'home',
      label: 'Chats',
      path: '/',
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6"
          fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
          <path fillRule="evenodd" clipRule="evenodd"
            d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" />
        </svg>
      ),
    },
    {
      key: 'friends',
      label: 'Friends',
      path: '/friends/list',
      icon: (active) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6"
          fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.75}>
          <path fillRule="evenodd" clipRule="evenodd"
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" />
        </svg>
      ),
    },
    {
      key: 'add-friend',
      label: 'Add',
      path: '/friends/add-friend',
      icon: (_active) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6"
          fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>
      ),
    },
    {
      key: 'sent-requests',
      label: 'Sent',
      path: '/friends/sent-requests',
      icon: (_active) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6"
          fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 12h6m0 0l-3 3m3-3l-3-3" />
          <path d="M12.75 7.5a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.11A12.318 12.318 0 0 1 9.375 21c-2.33 0-4.512-.645-6.374-1.765Z" />
        </svg>
      ),
    },
    {
      key: 'received-requests',
      label: 'Received',
      path: '/friends/received-requests',
      icon: (_active) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6"
          fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12h-6m0 0 3-3m-3 3 3 3" />
          <path d="M12.75 7.5a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.11A12.318 12.318 0 0 1 9.375 21c-2.33 0-4.512-.645-6.374-1.765Z" />
        </svg>
      ),
    },
  ];

  /* shared classes */
  const desktopLink = ({ isActive }) =>
    `relative group flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200
     ${isActive
       ? 'bg-indigo-50 text-indigo-600'
       : 'text-gray-400 hover:bg-indigo-50 hover:text-indigo-500'
     }`;

  const mobileLink = ({ isActive }) =>
    `flex-shrink-0 snap-start flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200
     ${isActive
       ? 'text-indigo-600'
       : 'text-gray-400 hover:text-indigo-500'
     }`;

  /* Tooltip for desktop */
  const Tip = ({ label }) => (
    <span className="
      pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2
      whitespace-nowrap rounded-lg bg-gray-900 text-white text-xs px-2.5 py-1.5
      opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-xl
    ">
      {label}
    </span>
  );

  return (
    <>
      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR  (md and up)
      ══════════════════════════════════════ */}
      <aside className="
        hidden md:flex flex-col items-center
        w-16 h-screen flex-shrink-0
        bg-white border-r border-gray-100
        py-4 z-40
      ">
        {/* Profile */}
        <div className="mb-7 flex-shrink-0">
          <img
            src={resizedUrl || profile_url}
            alt={user?.name || 'Profile'}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200"
          />
        </div>

        {/* Nav links */}
        <nav className="flex flex-col items-center gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink key={item.key} to={item.path} end={item.path === '/'} className={desktopLink} title={item.label}>
              {({ isActive }) => (
                <>
                  {item.icon(isActive)}
                  <Tip label={item.label} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout — bottom */}
        <div className="mt-auto flex-shrink-0">
          <button
            onClick={handleLogout}
            title="Logout"
            className="
              group relative flex items-center justify-center w-11 h-11 rounded-xl
              text-gray-400 hover:bg-red-50 hover:text-red-500
              transition-all duration-200
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={1.75} className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <Tip label="Logout" />
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MOBILE BOTTOM BAR  (below md)
          Smooth horizontal scroll + snap
      ══════════════════════════════════════ */}
      <nav
        className="
          md:hidden fixed bottom-0 left-0 right-0 z-50
          bg-white/95 backdrop-blur-md border-t border-gray-100
          flex items-center
          overflow-x-auto scrollbar-hide
          snap-x snap-mandatory
          px-2 gap-0
          safe-area-inset-bottom
        "
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Profile avatar - leftmost */}
        <div className="flex-shrink-0 snap-start flex flex-col items-center px-3 py-2 gap-0.5">
          <img
            src={resizedUrl || profile_url}
            alt="me"
            className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-300"
          />
          <span className="text-[9px] text-indigo-400 font-semibold">Me</span>
        </div>

        {/* Thin divider */}
        <div className="w-px h-7 bg-gray-100 flex-shrink-0 mx-1" />

        {/* Nav items */}
        {navItems.map((item) => (
          <NavLink key={item.key} to={item.path} end={item.path === '/'} className={mobileLink}>
            {({ isActive }) => (
              <>
                {item.icon(isActive)}
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {item.label}
                </span>
                {/* Active dot indicator */}
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex-shrink-0 snap-start flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl text-gray-400 hover:text-red-500 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={1.75} className="w-6 h-6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
          </svg>
          <span className="text-[10px] font-medium leading-none">Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;