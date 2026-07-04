/**
 * errorUtils.js
 *
 * Shared error-normalisation helper used by all Context state files.
 *
 * WHY it exists:
 *   throwFriendlyError was copy-pasted identically inside both UserState.jsx
 *   and FriendsState.jsx.  Moving it here removes that duplication and gives us
 *   one place to change error-shaping logic in the future.
 *
 * WHEN to use it:
 *   Inside every try/catch block in a Context state file where you want to
 *   re-throw a normalised error that preserves the original Axios metadata
 *   (response, status, isAuthFailure) while also carrying a readable message.
 */

/**
 * Normalises an Axios (or generic) error and re-throws it.
 *
 * The thrown error has:
 *   .message  — human-readable string
 *   .msg      — same as .message (legacy alias kept for backwards compat)
 *   .response — original Axios response object (if present)
 *   .errors   — field-level validation errors array (if present)
 *   .status   — HTTP status code (if present)
 *   .isAuthFailure — boolean set by the Axios interceptor (if present)
 *
 * @param {Error} error — the raw error caught in a try/catch
 * @throws {Error}
 */
export const throwFriendlyError = (error) => {
  const message =
    error.response?.data?.error ||
    error.response?.data?.message ||
    error.message ||
    'Something went wrong';

  const msgText =
    typeof message === 'object'
      ? message.message || 'Something went wrong'
      : message;

  const err = new Error(msgText);
  err.msg = msgText;

  if (error.response)                    err.response      = error.response;
  if (error.response?.data?.errors)      err.errors        = error.response.data.errors;
  if (error.status !== undefined)        err.status        = error.status;
  else if (error.response?.status !== undefined) err.status = error.response.status;
  if (error.isAuthFailure !== undefined) err.isAuthFailure = error.isAuthFailure;

  throw err;
};
