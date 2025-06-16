// components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 rounded-full border-b-2 border-purple-500" />
      </div>
    );
  }

  return  <>{children}</> ;

  //return user ? <>{children}</> : <Navigate to="/login" replace />;
};
