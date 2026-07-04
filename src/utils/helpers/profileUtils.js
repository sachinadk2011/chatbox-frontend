/**
 * profileUtils.js — profile image URL helpers
 *
 * WHY it exists:
 *   Two patterns were repeated in Navbar.jsx, ChatList.jsx, ProfileHeader.jsx,
 *   and FriendsCard.jsx:
 *     1. Building a Cloudinary face-crop optimised URL from a raw upload URL.
 *     2. Falling back to a UI Avatars generated image when no real photo exists.
 *   One source of truth prevents silent drift between components.
 *
 * WHEN to use:
 *   Any component that displays a user/friend avatar.
 */

/**
 * Transforms a raw Cloudinary upload URL into an optimised face-crop variant.
 * Returns null if no Cloudinary URL is provided.
 *
 * @param {string|null|undefined} cloudinaryUrl
 * @returns {string|null}
 */
export const getResizedCloudinaryUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  return cloudinaryUrl.replace('/upload/', '/upload/w_200,h_200,c_fill,g_face/');
};

/**
 * Generates a UI Avatars placeholder URL for a given name.
 *
 * @param {string}  name                 — display name
 * @param {object}  [options]
 * @param {string}  [options.background] — hex colour or "random" (default "random")
 * @param {string}  [options.color]      — text colour or "random" (default "random")
 * @returns {string}
 */
export const getAvatarFallbackUrl = (name, options = {}) => {
  const { background = 'random', color = 'random' } = options;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=${background}&color=${color}&bold=true&rounded=true`;
};

/**
 * Returns the best available profile image URL.
 * Prefers the Cloudinary optimised URL; falls back to a generated avatar.
 *
 * @param {string}  name          — display name (used for avatar fallback)
 * @param {string|null} cloudinaryUrl
 * @param {object}  [options]     — forwarded to getAvatarFallbackUrl
 * @returns {string}
 */
export const getProfileImageUrl = (name, cloudinaryUrl, options = {}) =>
  getResizedCloudinaryUrl(cloudinaryUrl) || getAvatarFallbackUrl(name, options);
