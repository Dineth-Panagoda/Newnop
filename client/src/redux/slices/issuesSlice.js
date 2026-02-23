// ========================================
// ISSUES SLICE
// ========================================
// Manages issues state (list, filters, pagination, stats)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ========================================
// HELPER FUNCTION TO GET AUTH HEADERS
// ========================================

/**
 * Get authorization headers with JWT token
 * Token is required for all API requests to protected routes
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}` // Format: "Bearer <token>"
    }
  };
};

// ========================================
// INITIAL STATE
// ========================================

const initialState = {
  // Issues data
  issues: [],              // Array of issue objects
  currentIssue: null,      // Currently selected issue (for detail page)

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  },

  // Filters
  filters: {
    search: '',            // Search term
    status: '',            // Filter by status
    priority: '',          // Filter by priority
    severity: ''           // Filter by severity
  },

  // Statistics (issue counts by status)
  stats: {
    Open: 0,
    InProgress: 0,
    Resolved: 0,
    Closed: 0,
    total: 0
  },

  // Loading states
  loading: false,          // General loading state
  statsLoading: false,     // Loading state for stats
  actionLoading: false,    // Loading state for create/update/delete

  // Error handling
  error: null
};

// ========================================
// ASYNC THUNKS (API CALLS)
// ========================================

// Fetch all issues with filters and pagination
export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async ({ page = 1, limit = 10, search = '', status = '', priority = '', severity = '' }, { rejectWithValue }) => {
    try {
      // Build query string from parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(severity && { severity })
      });

      const response = await axios.get(`/api/issues?${params}`, getAuthHeaders());
      return response.data.data; // Returns { issues, pagination }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
    }
  }
);

// Fetch single issue by ID
export const fetchIssueById = createAsyncThunk(
  'issues/fetchIssueById',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/issues/${issueId}`, getAuthHeaders());
      return response.data.data.issue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issue');
    }
  }
);

// Fetch issue statistics (counts by status)
export const fetchIssueStats = createAsyncThunk(
  'issues/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/issues/stats', getAuthHeaders());
      return response.data.data; // Returns { counts, total }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// Create new issue
export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/issues', issueData, getAuthHeaders());
      return response.data.data.issue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create issue');
    }
  }
);

// Update existing issue
export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/issues/${id}`, data, getAuthHeaders());
      return response.data.data.issue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update issue');
    }
  }
);

// Delete issue
export const deleteIssue = createAsyncThunk(
  'issues/deleteIssue',
  async (issueId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/issues/${issueId}`, getAuthHeaders());
      return issueId; // Return deleted issue ID
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete issue');
    }
  }
);

// ========================================
// SLICE DEFINITION
// ========================================

const issuesSlice = createSlice({
  name: 'issues',

  initialState,

  // Synchronous actions
  reducers: {
    // Update filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },

    // Clear all filters
    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        priority: '',
        severity: ''
      };
      state.pagination.currentPage = 1;
    },

    // Set current page
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    // Clear current issue
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  },

  // Handle async thunk actions
  extraReducers: (builder) => {
    // ====================================
    // FETCH ISSUES
    // ====================================

    builder.addCase(fetchIssues.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchIssues.fulfilled, (state, action) => {
      state.loading = false;
      state.issues = action.payload.issues;
      state.pagination = action.payload.pagination;
    });

    builder.addCase(fetchIssues.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ====================================
    // FETCH ISSUE BY ID
    // ====================================

    builder.addCase(fetchIssueById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchIssueById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentIssue = action.payload;
    });

    builder.addCase(fetchIssueById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // ====================================
    // FETCH STATS
    // ====================================

    builder.addCase(fetchIssueStats.pending, (state) => {
      state.statsLoading = true;
    });

    builder.addCase(fetchIssueStats.fulfilled, (state, action) => {
      state.statsLoading = false;
      state.stats = action.payload;
    });

    builder.addCase(fetchIssueStats.rejected, (state, action) => {
      state.statsLoading = false;
      state.error = action.payload;
    });

    // ====================================
    // CREATE ISSUE
    // ====================================

    builder.addCase(createIssue.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });

    builder.addCase(createIssue.fulfilled, (state, action) => {
      state.actionLoading = false;
      // Add new issue to the beginning of the list
      state.issues.unshift(action.payload);
      // Update total count
      state.pagination.totalCount += 1;
    });

    builder.addCase(createIssue.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    });

    // ====================================
    // UPDATE ISSUE
    // ====================================

    builder.addCase(updateIssue.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });

    builder.addCase(updateIssue.fulfilled, (state, action) => {
      state.actionLoading = false;
      // Update issue in the list
      const index = state.issues.findIndex(issue => issue.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
      // Update current issue if it's the same one
      if (state.currentIssue?.id === action.payload.id) {
        state.currentIssue = action.payload;
      }
    });

    builder.addCase(updateIssue.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    });

    // ====================================
    // DELETE ISSUE
    // ====================================

    builder.addCase(deleteIssue.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });

    builder.addCase(deleteIssue.fulfilled, (state, action) => {
      state.actionLoading = false;
      // Remove issue from list
      state.issues = state.issues.filter(issue => issue.id !== action.payload);
      // Update total count
      state.pagination.totalCount -= 1;
      // Clear current issue if it was deleted
      if (state.currentIssue?.id === action.payload) {
        state.currentIssue = null;
      }
    });

    builder.addCase(deleteIssue.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    });
  }
});

// Export actions
export const {
  setFilters,
  clearFilters,
  setPage,
  clearCurrentIssue,
  clearError
} = issuesSlice.actions;

// Export reducer
export default issuesSlice.reducer;
