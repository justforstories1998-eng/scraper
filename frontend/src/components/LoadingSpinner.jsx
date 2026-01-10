/**
 * LoadingSpinner.jsx
 *
 * A reusable loading spinner component with customizable size and color.
 */

import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'text-primary-500' }) => {
  let spinnerSizeClasses = '';
  let borderSizeClasses = '';

  switch (size) {
    case 'sm':
      spinnerSizeClasses = 'h-4 w-4';
      borderSizeClasses = 'border-2';
      break;
    case 'md':
      spinnerSizeClasses = 'h-6 w-6';
      borderSizeClasses = 'border-2';
      break;
    case 'lg':
      spinnerSizeClasses = 'h-8 w-8';
      borderSizeClasses = 'border-4';
      break;
    case 'xl':
      spinnerSizeClasses = 'h-12 w-12';
      borderSizeClasses = 'border-4';
      break;
    default:
      spinnerSizeClasses = 'h-6 w-6';
      borderSizeClasses = 'border-2';
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`inline-block ${spinnerSizeClasses} ${borderSizeClasses} border-current border-t-transparent rounded-full animate-spin ${color}`}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;