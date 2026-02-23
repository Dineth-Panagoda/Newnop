// ========================================
// MAIN ENTRY POINT
// ========================================
// This is the entry point of our React application
// It renders the root component into the DOM

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux'; // Redux Provider to make store available to all components
import { BrowserRouter } from 'react-router-dom'; // Router for navigation
import App from './App';
import store from './redux/store'; // Redux store
import './styles/global.css'; // Global CSS styles

// ========================================
// RENDER APP
// ========================================

// Get the root DOM element where React will mount
const rootElement = document.getElementById('root');

// Create a React root and render the app
ReactDOM.createRoot(rootElement).render(
  // StrictMode: Activates additional checks and warnings in development
  // It helps identify potential problems in the application
  <React.StrictMode>
    {/* Redux Provider: Makes Redux store available to all components */}
    <Provider store={store}>
      {/* BrowserRouter: Enables client-side routing */}
      <BrowserRouter>
        {/* Main App component */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
