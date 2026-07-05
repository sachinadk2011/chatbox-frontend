
export const redirectWithError = ({navigate, path, code = 'not-found'}) =>
  navigate(`${path}?error=${code}`, { replace: true });