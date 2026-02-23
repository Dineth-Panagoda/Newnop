// ========================================
// AUTHENTICATION MIDDLEWARE
// ========================================
// This middleware protects routes that require authentication
// It verifies the JWT token sent by the client and attaches user info to the request

const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  // Expected format: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer "

  // If no token is provided, return 401 Unauthorized
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify the token using the secret key
    // jwt.verify() will throw an error if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If verification succeeds, attach the decoded user info to the request object
    // This makes user data available in all route handlers that use this middleware
    req.user = decoded; // decoded contains: { userId, email }

    // Call next() to pass control to the next middleware/route handler
    next();
  } catch (error) {
    // Token verification failed (invalid, expired, or wrong secret)
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

// Export the middleware so it can be used in route files
module.exports = authenticateToken;
