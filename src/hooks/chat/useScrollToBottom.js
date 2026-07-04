/**
 * useScrollToBottom.js
 *
 * PURPOSE:
 *   Provides a ref that marks the bottom of the message list, plus two
 *   scroll helpers used by MessageBox:
 *     - scrollToBottom(behavior) — scrolls to the anchor element
 *     - onMediaLoad()            — called when an image/video finishes loading
 *                                  so the view snaps down after media renders
 *
 * INPUTS:
 *   none
 *
 * OUTPUTS:
 *   { bottomRef, scrollToBottom, onMediaLoad }
 *     bottomRef      — attach to the sentinel <div> at the bottom of the list
 *     scrollToBottom — call with 'auto' (instant) or 'smooth'
 *     onMediaLoad    — pass as the onLoad/onLoadedData handler to media elements
 */

import { useRef, useCallback } from 'react';

export const useScrollToBottom = () => {
  const bottomRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'auto') => {
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  const onMediaLoad = useCallback(() => {
    scrollToBottom('auto');
  }, [scrollToBottom]);

  return { bottomRef, scrollToBottom, onMediaLoad };
};
