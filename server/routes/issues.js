// ========================================
// ISSUE ROUTES
// ========================================
// Handles CRUD operations for issues with search, filter, and pagination

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();

// ====================================
// APPLY AUTHENTICATION TO ALL ROUTES
// ====================================
// All routes in this file require authentication
// This middleware runs before any route handler
router.use(authenticateToken);

// ========================================
// GET STATUS COUNTS
// ========================================
// GET /api/issues/stats
// Returns count of issues grouped by status (Open, InProgress, Resolved, Closed)
router.get('/stats', async (req, res) => {
  try {
    // Use Prisma's groupBy to count issues by status
    // This is more efficient than fetching all issues and counting in JavaScript
    const statusCounts = await prisma.issue.groupBy({
      by: ['status'], // Group by status field
      _count: {
        status: true // Count the number of issues in each group
      },
      where: {
        userId: req.user.userId // Only count issues belonging to current user
      }
    });

    // Transform the result into a more readable format
    // Convert array of objects into a single object with status as keys
    const counts = {
      Open: 0,
      InProgress: 0,
      Resolved: 0,
      Closed: 0
    };

    // Map the database results to our counts object
    statusCounts.forEach(item => {
      counts[item.status] = item._count.status;
    });

    // Calculate total count
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    res.status(200).json({
      success: true,
      data: {
        counts,
        total
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issue statistics',
      error: error.message
    });
  }
});

// ========================================
// GET ALL ISSUES (WITH SEARCH, FILTER, PAGINATION)
// ========================================
// GET /api/issues
// Query parameters:
//   - page: Page number (default: 1)
//   - limit: Items per page (default: 10)
//   - search: Search term for title/description
//   - status: Filter by status (Open, InProgress, Resolved, Closed)
//   - priority: Filter by priority (Low, Medium, High, Critical)
//   - severity: Filter by severity (Low, Medium, High, Critical)
router.get('/', async (req, res) => {
  try {
    // ====================================
    // EXTRACT AND PARSE QUERY PARAMETERS
    // ====================================

    // Pagination parameters
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
    const skip = (page - 1) * limit; // Calculate how many items to skip

    // Search and filter parameters
    const { search, status, priority, severity } = req.query;

    // ====================================
    // BUILD WHERE CLAUSE
    // ====================================
    // This object defines the conditions for filtering issues

    const where = {
      userId: req.user.userId // Only show issues belonging to current user
    };

    // Add search filter if search term is provided
    // Search in both title and description (case-insensitive)
    if (search) {
      where.OR = [
        {
          title: {
            contains: search, // MySQL LIKE %search%
            mode: 'insensitive' // Case-insensitive search
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add priority filter if provided
    if (priority) {
      where.priority = priority;
    }

    // Add severity filter if provided
    if (severity) {
      where.severity = severity;
    }

    // ====================================
    // FETCH ISSUES FROM DATABASE
    // ====================================

    // Fetch issues with pagination
    const issues = await prisma.issue.findMany({
      where,
      skip, // Skip items for pagination
      take: limit, // Limit number of items
      orderBy: {
        createdAt: 'desc' // Most recent issues first
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Get total count of issues matching the filters (for pagination info)
    const totalCount = await prisma.issue.count({ where });

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // ====================================
    // SEND RESPONSE
    // ====================================

    res.status(200).json({
      success: true,
      data: {
        issues,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues',
      error: error.message
    });
  }
});

// ========================================
// GET SINGLE ISSUE BY ID
// ========================================
// GET /api/issues/:id
router.get('/:id', async (req, res) => {
  try {
    const issueId = parseInt(req.params.id);

    // Validate ID
    if (isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    // Fetch issue with user details
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Check if issue exists
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user owns this issue
    if (issue.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this issue'
      });
    }

    res.status(200).json({
      success: true,
      data: { issue }
    });

  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issue',
      error: error.message
    });
  }
});

// ========================================
// CREATE NEW ISSUE
// ========================================
// POST /api/issues
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, severity } = req.body;

    // ====================================
    // INPUT VALIDATION
    // ====================================

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Validate title length
    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters long'
      });
    }

    // Validate description length
    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters long'
      });
    }

    // Validate status if provided
    const validStatuses = ['Open', 'InProgress', 'Resolved', 'Closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Validate priority if provided
    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be one of: ' + validPriorities.join(', ')
      });
    }

    // Validate severity if provided
    const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity. Must be one of: ' + validSeverities.join(', ')
      });
    }

    // ====================================
    // CREATE ISSUE
    // ====================================

    const newIssue = await prisma.issue.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        status: status || 'Open', // Default to 'Open' if not provided
        priority: priority || 'Medium', // Default to 'Medium' if not provided
        severity: severity || 'Medium', // Default to 'Medium' if not provided
        userId: req.user.userId // Associate issue with current user
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: { issue: newIssue }
    });

  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating issue',
      error: error.message
    });
  }
});

// ========================================
// UPDATE ISSUE
// ========================================
// PUT /api/issues/:id
router.put('/:id', async (req, res) => {
  try {
    const issueId = parseInt(req.params.id);
    const { title, description, status, priority, severity } = req.body;

    // Validate ID
    if (isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    // ====================================
    // CHECK IF ISSUE EXISTS AND USER OWNS IT
    // ====================================

    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check ownership
    if (existingIssue.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this issue'
      });
    }

    // ====================================
    // INPUT VALIDATION
    // ====================================

    // Build update data object (only include fields that are provided)
    const updateData = {};

    if (title !== undefined) {
      if (title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Title must be at least 3 characters long'
        });
      }
      updateData.title = title.trim();
    }

    if (description !== undefined) {
      if (description.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Description must be at least 10 characters long'
        });
      }
      updateData.description = description.trim();
    }

    if (status !== undefined) {
      const validStatuses = ['Open', 'InProgress', 'Resolved', 'Closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
      }
      updateData.status = status;
    }

    if (priority !== undefined) {
      const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Must be one of: ' + validPriorities.join(', ')
        });
      }
      updateData.priority = priority;
    }

    if (severity !== undefined) {
      const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
      if (!validSeverities.includes(severity)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid severity. Must be one of: ' + validSeverities.join(', ')
        });
      }
      updateData.severity = severity;
    }

    // ====================================
    // UPDATE ISSUE
    // ====================================

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: { issue: updatedIssue }
    });

  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating issue',
      error: error.message
    });
  }
});

// ========================================
// DELETE ISSUE
// ========================================
// DELETE /api/issues/:id
router.delete('/:id', async (req, res) => {
  try {
    const issueId = parseInt(req.params.id);

    // Validate ID
    if (isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    // ====================================
    // CHECK IF ISSUE EXISTS AND USER OWNS IT
    // ====================================

    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check ownership
    if (existingIssue.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this issue'
      });
    }

    // ====================================
    // DELETE ISSUE
    // ====================================

    await prisma.issue.delete({
      where: { id: issueId }
    });

    res.status(200).json({
      success: true,
      message: 'Issue deleted successfully'
    });

  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting issue',
      error: error.message
    });
  }
});

module.exports = router;
