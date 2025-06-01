import React from 'react';
import { useAzureAuth } from '../hooks/useAzureAuth';
import AzureAuth from './AzureAuth';
import LoadingSkeleton from './LoadingSkeleton';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallbackToDemo?: boolean;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ 
  children, 
  fallbackToDemo = true 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    requiresAuth,
    handleAuthCallback 
  } = useAzureAuth();

  // If authentication is not required, always show children
  if (!requiresAuth) {
    return <>{children}</>;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <LoadingSkeleton variant="card" count={3} />
      </div>
    );
  }

  // If authenticated, show children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If fallback to demo is enabled and there's an error, show children
  if (fallbackToDemo && error) {
    console.log('🎭 Authentication failed, falling back to demo mode');
    return <>{children}</>;
  }

  // Show authentication prompt
  return (
    <AzureAuth 
      onAuthSuccess={() => {
        handleAuthCallback();
      }} 
    />
  );
};

export default AuthWrapper;
