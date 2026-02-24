// Issue Routes - CRUD operations with search, filtering, and pagination

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');

const prisma = new PrismaClient();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/issues/stats - Get issue counts by status
router.get('/stats', async (req, res) => {
  try {
    const statusCounts = await prisma.issue.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { userId: req.user.userId }
    });

    const counts = {
      Open: 0,
      InProgress: 0,
      Resolved: 0,
      Closed: 0
    };

    statusCounts.forEach(item => {
      counts[item.status] = item._count.status;
    });

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    res.status(200).json({
      success: true,
      data: { counts, total }
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

// GET /api/issues - Get all issues with optional filters and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, priority, severity } = req.query;

    // Build filter conditions
    const where = {
      userId: req.user.userId
    };

    // Search in title or description
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (severity) where.severity = severity;

    const issues = await prisma.issue.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    const totalCount = await prisma.issue.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

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

// GET /api/issues/:id - Get single issue
router.get('/:id', async (req, res) => {
  try {
    const issueId = parseInt(req.params.id);

    if (isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

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

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Verify user owns this issue
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

// POST /api/issues - Create new issue
router.post('/', async (req, res) => {
  try {
    const { title, description, status, priority, severity } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Title must be at least 3 characters long'
      });
    }

    if (title.trim().length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Title must not exceed 255 characters'
      });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Description must be at least 10 characters long'
      });
    }

    if (description.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Description must not exceed 5000 characters'
      });
    }

    const validStatuses = ['Open', 'InProgress', 'Resolved', 'Closed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const validPriorities = ['Low', 'Medium', 'High', 'Critical'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be one of: ' + validPriorities.join(', ')
      });
    }

    const validSeverities = ['Low', 'Medium', 'High', 'Critical'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity. Must be one of: ' + validSeverities.join(', ')
      });
    }

    const newIssue = await prisma.issue.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        status: status || 'Open',
        priority: priority || 'Medium',
        severity: severity || 'Medium',
        userId: req.user.userId
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

// PUT /api/issues/:id - Update issue
router.put('/:id', async (req, res) => {
  try {
    const issueId = parseInt(req.params.id);
    const { title, description, status, priority, severity } = req.body;

    if (isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Verify user owns this issue
    if (existingIssue.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this issue'
      });
    }

    const updateData = {};

    if (title !== undefined) {
      if (title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Title must be at least 3 characters long'
        });
      }
      if (title.trim().length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Title must not exceed 255 characters'
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
      if (description.trim().length > 5000) {
        return res.status(400).json({
          success: false,
          message: 'Description must not exceed 5000 characters'
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

// DELETE /api/issues/:id - Delete issue
router.delete('/:id', async (req, res) => {
  try {
    const issueId = parseInt(req.params.id);

    if (isNaN(issueId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    const existingIssue = await prisma.issue.findUnique({
      where: { id: issueId }
    });

    if (!existingIssue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Verify user owns this issue
    if (existingIssue.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this issue'
      });
    }

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
