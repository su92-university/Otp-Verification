// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireVerification = false,
  redirectTo = '/login' 
}) => {
  const { user, loading, isAuthenticated, isverified } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container"> 
        <LoadingSpinner size="lg" /> 
        <p>Loading...</p>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login with return url
    return (
      <Navigate
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check if email verification is required
  if (requireVerification && !isverified()) {
    return (
      <Navigate 
        to="/verify-email-required" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // User is authenticated and verified (if required)
  return children;
};

// Higher-order component for protecting routes
export const withProtectedRoute = (
  Component, 
  requireVerification = false
) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requireVerification={requireVerification}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

export default ProtectedRoute;