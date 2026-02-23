// ========================================
// REDUX STORE CONFIGURATION
// ========================================
// This file sets up the Redux Toolkit store
// Redux is a state management library that helps manage application state in a predictable way

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import issuesReducer from './slices/issuesSlice';

// ========================================
// CONFIGURE STORE
// ========================================

/**
 * Redux Toolkit's configureStore simplifies store setup
 * It automatically sets up:
 * - Redux DevTools Extension (for debugging)
 * - Redux Thunk middleware (for async actions)
 * - Immutability checks in development
 */
const store = configureStore({
  // Reducer: Defines how state is updated in response to actions
  // Each slice manages its own part of the state
  reducer: {
    auth: authReducer,     // Manages authentication state (user, token, login status)
    issues: issuesReducer  // Manages issues state (issues list, filters, pagination)
  },

  // Middleware: Functions that intercept actions before they reach reducers
  // Default middleware includes Redux Thunk for async operations
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Serializable check: Ensures state is JSON-serializable
      // We keep it enabled for better debugging
      serializableCheck: {
        // Ignore these action types if they contain non-serializable data
        ignoredActions: ['auth/login/fulfilled'],
        // Ignore these paths in state
        ignoredPaths: []
      }
    }),

  // Enable Redux DevTools in development only
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;
