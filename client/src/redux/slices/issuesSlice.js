// Issues Slice - Manages issue state, filters, and pagination

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// Get authorization headers with JWT token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

const initialState = {
  issues: [],
  currentIssue: null,

  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPreviousPage: false
  },

  filters: {
    search: '',
    status: '',
    priority: '',
    severity: ''
  },

  stats: {
    Open: 0,
    InProgress: 0,
    Resolved: 0,
    Closed: 0,
    total: 0
  },

  loading: false,
  statsLoading: false,
  actionLoading: false,
  error: null
};

// Async thunks for API calls

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async ({ page = 1, limit = 10, search = '', status = '', priority = '', severity = '' }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(severity && { severity })
      });

      const response = await axios.get(`${API_URL}/issues?${params}`, getAuthHeaders());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  'issues/fetchIssueById',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/issues/${issueId}`, getAuthHeaders());
      return response.data.data.issue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issue');
    }
  }
);

export const fetchIssueStats = createAsyncThunk(
  'issues/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/issues/stats`, getAuthHeaders());
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/issues`, issueData, getAuthHeaders());
      return response.data.data.issue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create issue');
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issues/updateIssue',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/issues/${id}`, data, getAuthHeaders());
      return response.data.data.issue;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update issue');
    }
  }
);

export const deleteIssue = createAsyncThunk(
  'issues/deleteIssue',
  async (issueId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/issues/${issueId}`, getAuthHeaders());
      return issueId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete issue');
    }
  }
);

const issuesSlice = createSlice({
  name: 'issues',
  initialState,

  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },

    clearFilters: (state) => {
      state.filters = {
        search: '',
        status: '',
        priority: '',
        severity: ''
      };
      state.pagination.currentPage = 1;
    },

    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },

    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },

    clearError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    // Fetch issues
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

    // Fetch issue by ID
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

    // Fetch stats
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

    // Create issue
    builder.addCase(createIssue.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });

    builder.addCase(createIssue.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.issues.unshift(action.payload);
      state.pagination.totalCount += 1;
    });

    builder.addCase(createIssue.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    });

    // Update issue
    builder.addCase(updateIssue.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });

    builder.addCase(updateIssue.fulfilled, (state, action) => {
      state.actionLoading = false;
      const index = state.issues.findIndex(issue => issue.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = action.payload;
      }
      if (state.currentIssue?.id === action.payload.id) {
        state.currentIssue = action.payload;
      }
    });

    builder.addCase(updateIssue.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload;
    });

    // Delete issue
    builder.addCase(deleteIssue.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });

    builder.addCase(deleteIssue.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.issues = state.issues.filter(issue => issue.id !== action.payload);
      state.pagination.totalCount -= 1;
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

export const {
  setFilters,
  clearFilters,
  setPage,
  clearCurrentIssue,
  clearError
} = issuesSlice.actions;

export default issuesSlice.reducer;
