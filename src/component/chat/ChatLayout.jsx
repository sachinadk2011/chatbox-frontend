import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router";
import Header from "../layout/Header";
import SidebarList from "./SidebarList";
import ChatWindow from "./ChatWindow";
import SelectedUserContext from "../../context/message/SelectedUserContext";
import TwoColumnLayout from "../layout/TwoColumnLayout";
import { EMPTY_USER } from "../../constants/user";
import { getBaseChatPath } from "../../utils/helpers/pathUtils";
import { useUrlErrorMessage } from "../../hooks/routing/useUrlErrorMessage";
import ErrorBanner from "../ui/ErrorBanner";

/**
 * ChatLayout — shared by:
 *   • /chats             (ChatRoom page)
 *   • /friends/list      (FrdConnection page)
 *
 * All responsive behavior (show sidebar vs show chat on mobile, desktop both)
 * is handled by TwoColumnLayout. ChatLayout only:
 *   1. Knows which user is selected.
 *   2. Builds the back-button handler.
 *   3. Composes the sidebar + chat content and passes them to TwoColumnLayout.
 *
 * Adding a new two-column module in the future does NOT touch this file —
 * it creates its own Layout component that also uses TwoColumnLayout.
 */
const ChatLayout = () => {
  const { Selecteduser, setSelectedUser } = useContext(SelectedUserContext);
  const { message, dismiss } = useUrlErrorMessage();
  const navigate = useNavigate();
  const location = useLocation();
  const hasChatOpen = !!Selecteduser?.receiverId;

  const handleBack = () => {
    console.info(
      "Back button clicked. Clearing selected user and closing chat.",
    );
    setSelectedUser(EMPTY_USER);
    navigate(getBaseChatPath(location.pathname));
  };

  return (
    <TwoColumnLayout
      hasItemOpen={hasChatOpen}
      sidebarContent={
        <>
          <Header />
          {message && <ErrorBanner message={message} onDismiss={dismiss} />}
          {/* SidebarList fills remaining height and scrolls internally */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <SidebarList />
          </div>
        </>
      }
      mainContent={
        /*
          ChatWindow receives onBack so ProfileHeader can render
          the "← name" back-arrow row on mobile (Instagram DM style).
          It fills the full flex column — header pinned top,
          messages scroll in middle, input pinned bottom.
        */
        <ChatWindow onBack={handleBack} />
      }
      emptyState={
        /* Desktop empty-state placeholder — shown when no chat is open */
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 select-none gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 opacity-25"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.25}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="font-semibold text-base">Select a conversation</p>
          <p className="text-sm opacity-60">
            Choose a friend to start chatting
          </p>
        </div>
      }
    />
  );
};

export default ChatLayout;
