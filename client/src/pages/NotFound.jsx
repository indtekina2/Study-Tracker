import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] p-4 text-center">
      <h1 className="text-9xl font-bold text-[var(--primary)] opacity-20">404</h1>
      <h2 className="text-2xl font-bold text-[var(--foreground)] mt-4 mb-2">Page Not Found</h2>
      <p className="text-[var(--muted-foreground)] mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/dashboard" 
        className="px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg font-medium hover:bg-opacity-90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
