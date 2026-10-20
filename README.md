<p align="center">
  <img src="public/icon/android-chrome-192x192.png" alt="ChatWave Logo" width="100" />
</p>

<h1 align="center">ChatWave — Frontend</h1>

<p align="center">
  A modern, real-time chat application built with React 19, Socket.IO, and Tailwind CSS.
  <br />
  Featuring Google OAuth, media sharing, push notifications, and a polished, responsive UI.
</p>

<p align="center">
  <a href="https://chatwaves.sachinadhikari.com.np/" target="_blank">
    <img alt="Live Demo" src="https://img.shields.io/badge/Live%20Demo-ChatWave-blueviolet?style=for-the-badge&logo=vercel&logoColor=white" />
  </a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-12.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routing](#pages--routing)
- [State Management](#state-management)
- [Custom Hooks](#custom-hooks)
- [Real-Time Layer](#real-time-layer)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Docker](#docker)
- [Scripts](#scripts)

---

## Overview

ChatWave is a **single-page React application** that delivers a seamless real-time messaging experience. It communicates with the [ChatWave Backend](../chatBox-backend/README.md) over both REST (Axios) and WebSockets (Socket.IO). The app is fully responsive, handles network errors gracefully with a server-waking banner (for cold-start detection on free hosting tiers), and supports push notifications via Firebase Cloud Messaging.

---

## Live Demo

🌐 **[https://chatwaves.sachinadhikari.com.np/](https://chatwaves.sachinadhikari.com.np/)**

> Hosted on a free-tier server — the first load may take a few seconds while the backend wakes from sleep. A cold-start banner guides the user during this time.

---

## Features

| Category | Highlights |
|---|---|
| **Authentication** | Email/password sign-up & login, Google OAuth 2.0 (`@react-oauth/google`), OTP email verification, password reset flow |
| **Messaging** | Real-time text messages via Socket.IO, media sharing (image, video, audio, file, multi-file), message status ticks (sent / delivered / **read** — WhatsApp-style blue ticks) |
| **Presence** | Live online/offline status, last-seen timestamps, heartbeat `alive` pings to keep presence accurate |
| **Friends** | Friend suggestions, send/accept/decline/cancel/remove requests, mutual-friend count display |
| **Push Notifications** | Firebase FCM integration — in-app notification prompt, foreground & background message handling |
| **UI/UX** | Emoji picker, DOMPurify-sanitised messages, tab-title unread-count badge, server cold-start waking banner, custom 404 / error pages |
| **Security** | Silent token refresh (JWT rotation), XSS sanitisation with DOMPurify, JOSE for client-side token inspection |
| **Performance** | Vite build tooling, code-splitting via React Router, lazy context state loading |
| **DevEx** | Concurrently script to run frontend + backend together, Vite `--host` flag for LAN testing |
| **Docker** | Production-ready Dockerfile and docker-compose integration |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 3 |
| HTTP client | Axios |
| Real-time | Socket.IO Client 4 |
| Auth | `@react-oauth/google`, Firebase (Google Sign-In), JOSE |
| Icons | Lucide React, React Icons, Heroicons |
| Emoji | `emoji-picker-react` |
| Sanitisation | DOMPurify |
| Push | Firebase Cloud Messaging |
| User-agent | `ua-parser-js` |
| Containerisation | Docker |

---

## Project Structure

```
chatbox-frontend/
├── index.html                  # Vite HTML entry point
├── vite.config.js              # Vite configuration (proxy, plugins)
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS setup
├── public/                     # Static assets (favicon, FCM service worker)
└── src/
    ├── main.jsx                # React DOM entry, context providers
    ├── App.jsx                 # Router setup, auth guards, socket lifecycle
    ├── App.css / index.css     # Global styles
    │
    ├── pages/
    │   ├── ChatRoom.jsx        # Main chat layout page
    │   ├── FrdConnection.jsx   # Friend requests & connections page
    │   ├── ErrorPage.jsx       # Catch-all error / 404 page
    │   └── auth/
    │       ├── Login.jsx       # Login form + Google OAuth
    │       ├── SignUp.jsx      # Registration form
    │       ├── VerifyOtpCode.jsx  # OTP input screen
    │       ├── UpdateEmail.jsx    # Email update flow
    │       └── SetPassword.jsx   # Password reset screen
    │
    ├── component/
    │   ├── chat/               # Chat window, message list, input bar
    │   ├── friends/            # SuggestionFriend, ReceivedReq, SentfrdReq
    │   ├── layout/             # Navbar, sidebar, shell components
    │   ├── notifications/      # NotificationPrompt (FCM opt-in)
    │   └── ui/                 # ServerWakingBanner, shared UI primitives
    │
    ├── context/
    │   ├── users/              # UserContext + UserState (current user data)
    │   ├── message/            # MessageContext, MessageState, SelectedUserContext
    │   └── friends/            # FriendsContext + FriendsState
    │
    ├── hooks/
    │   ├── auth/
    │   │   ├── useAuthSession.js    # Restore session on mount from token
    │   │   └── useTokenRefresh.js   # Silent JWT access-token rotation
    │   ├── notifications/
    │   │   ├── useForegroundNotifications.js  # Handle FCM messages in foreground
    │   │   └── useNotificationBridge.js       # Bridge FCM → in-app state
    │   └── ui/
    │       └── useTabTitle.js       # Dynamic tab title with unread count badge
    │
    ├── services/
    │   └── socket.js           # Socket.IO singleton instance
    │
    ├── utils/
    │   ├── auth/
    │   │   └── SetAuthToken.js  # Axios instance with Authorization header
    │   └── helpers/
    │       ├── backendStatus.js # Backend cold-start detection & subscriber pattern
    │       └── userDeviceInfo.js # ua-parser-js device detection
    │
    └── constants/
        ├── routes.js           # KNOWN_ROUTES, AUTH_PAGES route constants
        └── user.js             # EMPTY_USER default shape
```

---

## Pages & Routing

| Path | Component | Guard | Description |
|------|-----------|-------|-------------|
| `/` | `RootRedirect` | — | Redirects to `/chats` if logged in, else `/login` |
| `/login` | `Login` | Public | Email/password + Google OAuth login |
| `/signup` | `SignUp` | Public | New account registration |
| `/verify-otp` | `VerifyOtpCode` | — | OTP verification after signup |
| `/update-email` | `UpdateEmail` | — | Email update flow |
| `/set-password` | `SetPassword` | — | Password reset after OTP verification |
| `/chats` | `ChatRoom` | 🔒 Protected | Main chat interface |
| `/friends` | `FrdConnection` | 🔒 Protected | Friend requests and connections |
| `*` | `ErrorPage` | — | 404 / unknown error page |

Protected routes redirect unauthenticated users to `/login?redirect=<original-path>` and restore the destination after login.

---

## State Management

The app uses **React Context API** with a three-context architecture — no Redux or Zustand required:

| Context | Responsibility |
|---------|----------------|
| `UserContext` / `UserState` | Authenticated user profile, login/logout actions |
| `MessageContext` / `MessageState` | Conversation messages, send/fetch/delete actions |
| `SelectedUserContext` | Which friend's conversation is currently open |
| `FriendsContext` / `FriendsState` | Friends list, requests, suggestions |

All contexts are composed at the root in `main.jsx`, making them available application-wide without prop drilling.

---

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuthSession` | Reads the stored token on app mount and rehydrates the user context silently |
| `useTokenRefresh` | Sets up a background interval to silently rotate the JWT access token before it expires |
| `useForegroundNotifications` | Subscribes to Firebase FCM foreground messages and dispatches them as in-app alerts |
| `useNotificationBridge` | Bridges FCM payload data to application state (e.g., updating unread counts) |
| `useTabTitle` | Dynamically sets `document.title` to show `(N) ChatBox` unread badge when the tab is not focused |

---

## Real-Time Layer

A **singleton Socket.IO client** (`src/services/socket.js`) is shared across the entire application. The socket lifecycle is managed inside `App.jsx`:

```
User logs in
    │
    └─▶ socket connects (JWT sent on handshake)
           │
           ├─▶ emit joinRoom       → user marked online in DB
           ├─▶ emit alive (60s)    → keep lastActive fresh
           └─▶ listen receiveMessage, messagesRead
```

| Direction | Event | Effect |
|-----------|-------|--------|
| ↑ Client → Server | `joinRoom` | Mark user online |
| ↑ Client → Server | `sendMessage` | Deliver message; server auto-reads if chat is open |
| ↑ Client → Server | `markRead` | Flip all unread messages to "read" |
| ↑ Client → Server | `chatOpen` | Tell server which conversation is active |
| ↑ Client → Server | `chatClose` | Clear active-chat tracking |
| ↑ Client → Server | `alive` | Heartbeat ping |
| ↓ Server → Client | `receiveMessage` | Append message to conversation |
| ↓ Server → Client | `messagesRead` | Turn delivery ticks blue |

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Backend API base URL
VITE_URL=http://localhost:8000

# Google OAuth Client ID (same as backend)
VITE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Firebase configuration (for FCM push notifications)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

> All Vite environment variables must be prefixed with `VITE_` to be accessible in the browser bundle.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- The [ChatBox Backend](../chatBox-backend/README.md) running on port `8000`

### Installation

```bash
# 1. Clone the repository and navigate to the frontend
git clone https://github.com/your-username/chatbox.git
cd chatbox/chatbox-frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your values

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Run Frontend + Backend Together

From the `chatbox-frontend` directory:

```bash
npm run both
```

This uses `concurrently` to start the Vite dev server and the backend with a single command.

---

## Docker

```bash
# Build the frontend image
docker build -t chatbox-frontend .
docker run -p 5173:5173 chatbox-frontend

# Or use the root-level docker-compose (starts both services)
cd ..
docker-compose up --build
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (LAN-accessible via `--host`) |
| `npm run build` | Build optimised production bundle to `dist/` |
| `npm run preview` | Serve the production build locally for testing |
| `npm run start-backend` | Start the backend from the frontend directory |
| `npm run both` | Run frontend + backend concurrently in one terminal |

---

<p align="center">Made with ❤️ by <strong>Sachin</strong></p>
