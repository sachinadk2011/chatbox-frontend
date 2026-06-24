<div align="center">

# 💬 ChatWave — Frontend

**A modern, real-time React application.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%F0%9F%9A%80-indigo?style=for-the-badge)](https://chatwaves.sachinadhikari.com.np/chats)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

[**→ Open Live Demo**](https://chatwaves.sachinadhikari.com.np/chats)

</div>

---

## ✨ Overview

This is the frontend repository for **ChatWave**, a full-stack real-time messaging application. It is built focusing on speed, responsiveness, and a highly resilient user experience, handling server sleeping states gracefully without breaking the UI.

## 🛠️ Tech Stack

- **React 19** + **Vite 8** — Fast builds and modern React features.
- **React Router v7** — Client-side routing.
- **Tailwind CSS** — Utility-first styling for a beautiful, responsive UI.
- **Socket.IO Client** — Real-time event handling.
- **Axios** — HTTP client with interceptors for token refresh and offline detection.
- **@react-oauth/google** — Google one-tap authentication.

---

## 🔒 Environment Variables

To run this project locally, create a `.env` file in the root directory. 
**Note: Do not expose real secrets in your public repositories.**

```env
# Backend Base URL (e.g., http://localhost:8000 for local development 
or put whatever port you want)
VITE_URL=http://localhost:8000

# Environment Mode ("development" or "production")
VITE_ENV=development

# Google OAuth Client ID (Get this from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Optional: Maintenance Mode Toggle (true/false)
VITE_MAINTENANCE_MODE=false
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

---

## 🗂️ Project Structure

```text
src/
├── auth_pages/      # Authentication views (Login, SignUp, OTP, SetPassword)
├── component/       # Reusable UI components (ChatWindow, MessageBox, Navbar, etc.)
├── context/         # React Context API state management (Users, Messages, Friends)
├── pages/           # Main page layouts (ChatRoom, ErrorPage, etc.)
├── server/          # Socket.IO client setup singleton
└── utils/           # Utilities (Axios config, Token helpers, Date formatters)
```

---

## 🧠 Key Design Decisions

### Resilience Against Server Sleep (Render Free Tier)
To combat cold starts on free hosting, we implemented:
- **Global Status Store:** `backendStatus.js` holds a module-level status (`online | sleeping | offline | error500`) outside the React lifecycle, ensuring it survives Strict-Mode remounts.
- **`StatusGate` Component:** Wraps the entire app and polls `/api/auth/ping` every few seconds while in an error state. Once the backend wakes up, it automatically restores the user's view without requiring a page reload.
- **Seamless Login Retries:** If a user attempts to log in while the server is asleep, the `Login.jsx` component saves credentials and retries automatically upon server recovery.

### Secure Token Management
- Access tokens are proactively refreshed 2 minutes before expiry.
- Axios response interceptors catch `401 Unauthorized` errors, automatically fetch a new token, and retry the failed request transparently.
