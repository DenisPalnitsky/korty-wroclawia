import React from 'react';

const ErrorPage = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Something went wrong</h1>
      <p>We're sorry, but something went wrong. Please try again later.</p>
      <button onClick={handleReload}>Reload Page</button>
    </div>
  );
};

export default ErrorPage;
