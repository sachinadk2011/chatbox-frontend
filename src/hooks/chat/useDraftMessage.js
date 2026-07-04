/**
 * useDraftMessage.js
 *
 * PURPOSE:
 *   Saves the current input text as a draft when switching away from a
 *   conversation, and restores the saved draft (or clears the field) when
 *   switching to a new one.  This preserves typed-but-unsent text across
 *   chat switches without polluting the MessageContext.
 *
 * INPUTS:
 *   { receiverId, drafts, setDraft, inputRef }
 *     receiverId — current chat partner's id (changes trigger save/restore)
 *     drafts     — draft map from MessageContext  { [receiverId]: text }
 *     setDraft   — context setter to persist a draft
 *     inputRef   — ref attached to the <input> element in ChatWindow
 *
 * OUTPUTS:
 *   none (effect only — mutates inputRef.current.value directly)
 */

import { useEffect, useRef } from 'react';

export const useDraftMessage = ({ receiverId, drafts, setDraft, inputRef }) => {
  const prevRecvRef = useRef(null);

  useEffect(() => {
    const prevId = prevRecvRef.current;
    const newId  = receiverId;

    // Save whatever is currently typed as a draft for the PREVIOUS partner
    if (prevId && inputRef.current) {
      setDraft(prevId, inputRef.current.value || null);
    }

    // Restore the saved draft (or empty the field) for the NEW partner
    if (inputRef.current) {
      inputRef.current.value = (newId && drafts[newId]) || '';
    }

    prevRecvRef.current = newId;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiverId]);
};
