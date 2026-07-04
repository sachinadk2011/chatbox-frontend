// Decode JWT payload to get expiry time
export const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // convert seconds → milliseconds
  } catch {
    return null;
  }
};