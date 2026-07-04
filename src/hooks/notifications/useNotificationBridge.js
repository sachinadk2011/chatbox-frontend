/**
 * useNotificationBridge.js
 *
 * PURPOSE:
 *   Two related effects that connect push notifications to in-app navigation:
 *
 *   1. Service-worker bridge — listens for postMessage events from the SW
 *      (fired when the user taps a push notification while the app is open)
 *      and re-dispatches them as a DOM CustomEvent so other listeners can react.
 *
 *   2. navigateToChat handler — listens for that CustomEvent and navigates the
 *      user to the correct chat, also marking those messages as read.
 *
 * INPUTS:
 *   { markAsRead, receiverId }
 *     markAsRead  — from MessageContext; marks messages from a sender as read
 *     receiverId  — the currently open chat's receiverId; used as a dependency
 *                   so the handler is re-registered when the chat changes
 *
 * OUTPUTS:
 *   none (effects only)
 *
 * DEPENDENCIES:
 *   react-router-dom — useNavigate()
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useNotificationBridge = ({ markAsRead, receiverId }) => {
  const navigate = useNavigate();

  // ── Effect 1: forward SW postMessage → DOM CustomEvent ──────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (event) => {
      console.info('Message from service worker:', event.data);
      if (event.data?.type === 'navigateToChat' && event.data?.senderId) {
        window.dispatchEvent(
          new CustomEvent('navigateToChat', { detail: { senderId: event.data.senderId } })
        );
      }
    };

    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, []);

  // ── Effect 2: act on the CustomEvent → navigate + mark read ─────────────
  useEffect(() => {
    const handler = (e) => {
      console.info('Notification click event received:', e);
      markAsRead(e.detail.senderId);
      navigate(`/chats/v1/u/${e.detail.senderId}`);
    };

    window.addEventListener('navigateToChat', handler);
    return () => window.removeEventListener('navigateToChat', handler);
  }, [navigate, receiverId]);
};