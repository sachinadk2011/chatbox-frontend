export const URL_ERROR_MESSAGES = {
  'not-found': 'You are not authorized to view that page, or it does not exist.',
  // future codes just get added here — nothing else changes:
  // 'blocked':    'You can no longer message this user.',
  // 'group-not-found': 'That group could not be found.',
};

export const getUrlErrorMessage = (code) =>
  URL_ERROR_MESSAGES[code] || 'Something went wrong loading that page.';