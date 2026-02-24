// ========================================
// AUTHENTICATION SLICE
// ========================================
// Manages authentication state (user, token, login status)
// A "slice" in Redux Toolkit is a collection of reducer logic and actions for a single feature

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config/api';

// ========================================
// INITIAL STATE
// ========================================

/**
 * Check if user is already logged in (from localStorage)
 * This allows users to stay logged in even after refreshing the page
 */
const loadAuthFromStorage = () => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      return {
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };
};

const initialState = loadAuthFromStorage();

// ========================================
// ASYNC THUNKS (for API calls)
// ========================================

/**
 * Async Thunks handle asynchronous operations (like API calls)
 * They automatically dispatch pending/fulfilled/rejected actions
 */

// Register new user
export const registerUser = createAsyncThunk(
  'auth/register', // Action type prefix
  async (userData, { rejectWithValue }) => {
    try {
      // Make API request to register endpoint
      const response = await axios.post(`${API_URL}/auth/register`, userData);

      // Save token and user to localStorage for persistence
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      // Return data (will be available in action.payload in reducer)
      return response.data.data;
    } catch (error) {
      // Return error message (will be available in action.payload in rejected case)
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Login existing user
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);

      // Save token and user to localStorage
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));

      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// ========================================
// SLICE DEFINITION
// ========================================

/**
 * createSlice automatically generates:
 * - Action creators based on reducers
 * - A reducer function
 * - Action type constants
 */
const authSlice = createSlice({
  name: 'auth', // Used as prefix for action types

  initialState,

  // Regular reducers (synchronous actions)
  reducers: {
    // Logout action: Clear auth state
    logout: (state) => {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Reset state to initial values
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    // Clear error: Reset error state
    clearError: (state) => {
      state.error = null;
    }
  },

  // Extra reducers handle actions from async thunks
  extraReducers: (builder) => {
    // ====================================
    // REGISTER USER
    // ====================================

    // When registration starts (request sent)
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    // When registration succeeds (got response)
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });

    // When registration fails (error occurred)
    builder.addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload; // Error message from rejectWithValue
    });

    // ====================================
    // LOGIN USER
    // ====================================

    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    });
  }
});

// Export action creators
export const { logout, clearError } = authSlice.actions;

// Export reducer (to be used in store)
export default authSlice.reducer;
