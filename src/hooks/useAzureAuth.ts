import { useState, useEffect, useCallback } from 'react';
import { azureAuthService } from '../services/azureAuthService';
import { AZURE_CONFIG } from '../config/azure';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  userInfo: any | null;
  requiresAuth: boolean;
}

export const useAzureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    userInfo: null,
    requiresAuth: AZURE_CONFIG.enableAuthentication
  });

  const checkAuthStatus = useCallback(() => {
    try {
      const isAuthenticated = azureAuthService.isAuthenticated();
      const userInfo = azureAuthService.getUserInfo();
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated,
        userInfo,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        userInfo: null,
        isLoading: false,
        error: 'Authentication check failed'
      }));
    }
  }, []);

  const login = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      azureAuthService.login();
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed. Please try again.'
      }));
    }
  }, []);

  const logout = useCallback(() => {
    try {
      azureAuthService.signOut();
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        userInfo: null,
        error: null
      }));
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const handleAuthCallback = useCallback(() => {
    try {
      const success = azureAuthService.handleAuthCallback();
      if (success) {
        checkAuthStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth callback error:', error);
      setAuthState(prev => ({
        ...prev,
        error: 'Authentication callback failed'
      }));
      return false;
    }
  }, [checkAuthStatus]);

  useEffect(() => {
    // Check for authentication callback on mount
    if (window.location.hash.includes('access_token')) {
      handleAuthCallback();
    } else {
      checkAuthStatus();
    }
  }, [checkAuthStatus, handleAuthCallback]);

  // Auto-refresh auth status every 5 minutes
  useEffect(() => {
    if (!authState.requiresAuth) return;

    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAuthStatus, authState.requiresAuth]);

  return {
    ...authState,
    login,
    logout,
    refresh: checkAuthStatus,
    handleAuthCallback
  };
};
