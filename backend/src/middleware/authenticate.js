
const jwt = require("jsonwebtoken");

// Middleware that protects private API endpoints.
function authenticate(req, res, next) {
  // Read the Authorization header sent by the client.
  const authorization = req.headers.authorization;

  // Require a Bearer token.
  if (
    !authorization ||
    !authorization.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  // Extract the JWT from the Authorization header.
  const token = authorization.slice(7).trim();

  // Reject an empty token.
  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  try {
    // Verify the token signature and expiration.
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    // Ensure the token contains a valid staff ID.
    if (!Number.isInteger(decoded.userId) || decoded.userId <= 0) {
      return res.status(401).json({
        message: "Invalid authentication token"
      });
    }

    // Make the authenticated staff ID available to controllers.
    req.user = {
      id: decoded.userId
    };

    // Continue to the protected endpoint.
    next();

  } catch (error) {
    // Reject invalid, expired, or incorrectly signed tokens.
    return res.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
}

module.exports = authenticate;
