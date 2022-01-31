function extractToken(str) {
  let token = str.trim();
  return token.substring(token.indexOf('=') + 2, token.length);
}

export {
  extractToken
};