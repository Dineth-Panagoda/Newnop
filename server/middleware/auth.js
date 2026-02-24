// Authentication Middleware - Verifies JWT tokens for protected routes

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Extract token from Authorization header (format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify token and attach decoded user data to request
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains: { userId, email }
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};

module.exports = authenticateToken;
