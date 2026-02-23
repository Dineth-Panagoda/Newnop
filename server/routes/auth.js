// ========================================
// AUTHENTICATION ROUTES
// ========================================
// Handles user registration and login

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ========================================
// REGISTER NEW USER
// ========================================
// POST /api/auth/register
// Creates a new user account with hashed password
router.post('/register', async (req, res) => {
  try {
    // Extract data from request body
    const { email, password, name } = req.body;

    // ====================================
    // INPUT VALIDATION
    // ====================================

    // Check if required fields are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // ====================================
    // CHECK IF USER ALREADY EXISTS
    // ====================================

    // Search for existing user with this email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    // If user exists, return error
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // ====================================
    // HASH PASSWORD
    // ====================================

    // Generate a salt (random data added to password before hashing)
    // Salt rounds = 10 means the hashing algorithm will run 2^10 iterations
    // Higher number = more secure but slower
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ====================================
    // CREATE NEW USER
    // ====================================

    // Store user in database with hashed password (never store plain passwords!)
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null // Name is optional
      },
      // Select which fields to return (exclude password for security)
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    // ====================================
    // GENERATE JWT TOKEN
    // ====================================

    // Create JWT payload (data to be encoded in the token)
    const payload = {
      userId: newUser.id,
      email: newUser.email
    };

    // Sign the token with secret key and set expiration
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // ====================================
    // SEND RESPONSE
    // ====================================

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// ========================================
// LOGIN USER
// ========================================
// POST /api/auth/login
// Authenticates user and returns JWT token
router.post('/login', async (req, res) => {
  try {
    // Extract credentials from request body
    const { email, password } = req.body;

    // ====================================
    // INPUT VALIDATION
    // ====================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // ====================================
    // FIND USER
    // ====================================

    // Search for user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // If user doesn't exist, return error
    // Note: We use a generic message to avoid revealing if email exists (security best practice)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ====================================
    // VERIFY PASSWORD
    // ====================================

    // Compare provided password with hashed password in database
    // bcrypt.compare() hashes the input password and compares it with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ====================================
    // GENERATE JWT TOKEN
    // ====================================

    const payload = {
      userId: user.id,
      email: user.email
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ====================================
    // SEND RESPONSE
    // ====================================

    // Remove password from user object before sending
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

// ========================================
// GET CURRENT USER (OPTIONAL - USEFUL FOR FRONTEND)
// ========================================
// GET /api/auth/me
// Returns current user's info based on JWT token
const authenticateToken = require('../middleware/auth');

router.get('/me', authenticateToken, async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
});

module.exports = router;
