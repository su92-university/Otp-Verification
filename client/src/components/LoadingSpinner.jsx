// src/components/LoadingSpinner.js
import React from 'react';
import '../style/LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  return (
    <div className={`spinner spinner-${size} spinner-${color}`}>
      <div className="spinner-circle"></div>
    </div>
  );
};

export default LoadingSpinner;