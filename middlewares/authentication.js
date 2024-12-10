
const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();  // No token, proceed without user
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;

      // Make user info available in all views
      res.locals.user = userPayload;
    } catch (error) {
      // Optionally handle invalid token errors (log, redirect, etc.)
    }

    return next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
