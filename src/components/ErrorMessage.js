import React from 'react';

/**
 * Display an error message.
 * @param {string} message - The error message to display.
 */
const ErrorMessage = ({ message }) => (
  <div
    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    role="alert"
  >
    <span className="block sm:inline">{message}</span>
  </div>
);

export default ErrorMessage;
