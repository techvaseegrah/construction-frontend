// contract/frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Your Tailwind CSS styles
import App from './App';
// import reportWebVitals from './reportWebVitals'; // Removed this line
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap your App with BrowserRouter */}
      <AuthProvider> {/* Wrap your App (or parts of it) with AuthProvider */}
        <App />
      </AuthProvider>
    </BrowserRouter>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar /> {/* Place ToastContainer here */}
  </React.StrictMode>
);
