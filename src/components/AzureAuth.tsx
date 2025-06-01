import React from 'react';
import { azureAuthService } from '../services/azureAuthService';
import { AZURE_CONFIG } from '../config/azure';
import styles from './AzureAuth.module.css';

interface AzureAuthProps {
  onAuthSuccess?: () => void;
}

export const AzureAuth: React.FC<AzureAuthProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      azureAuthService.login();
    } catch (err) {
      setError('Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    azureAuthService.signOut();
  };

  // Check if user is authenticated
  const isAuthenticated = azureAuthService.isAuthenticated();
  const userInfo = azureAuthService.getUserInfo();

  React.useEffect(() => {
    // Check for authentication callback on component mount
    if (window.location.hash.includes('access_token')) {
      const success = azureAuthService.handleAuthCallback();
      if (success && onAuthSuccess) {
        onAuthSuccess();
      }
    }
  }, [onAuthSuccess]);

  if (isAuthenticated) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authSuccess}>
          <div className={styles.authIcon}>✅</div>
          <h3>Azure Authentication Successful</h3>
          <p>Connected to Azure Data Explorer</p>
          {userInfo && (
            <div className={styles.userInfo}>
              <p><strong>User:</strong> {userInfo.preferred_username || userInfo.email || 'Azure User'}</p>
              <p><strong>Tenant:</strong> {AZURE_CONFIG.azureAd.tenantId}</p>
            </div>
          )}
          <button 
            onClick={handleSignOut}
            className={styles.signOutButton}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authPrompt}>
        <div className={styles.authIcon}>🔐</div>
        <h3>Azure Authentication Required</h3>
        <p>
          This application requires authentication with Azure Active Directory 
          to access live data from Azure Data Explorer.
        </p>
        
        <div className={styles.authDetails}>
          <p><strong>Cluster:</strong> {AZURE_CONFIG.cluster}</p>
          <p><strong>Database:</strong> {AZURE_CONFIG.database}</p>
          <p><strong>Tenant:</strong> {AZURE_CONFIG.azureAd.tenantId}</p>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={isLoading}
          className={styles.loginButton}
        >
          {isLoading ? 'Connecting...' : 'Sign in with Microsoft'}
        </button>

        <div className={styles.fallbackNote}>
          <p>
            <small>
              Note: If authentication fails, the application will continue 
              in demo mode with realistic mock data.
            </small>
          </p>
        </div>
      </div>
    </div>
  );
};

export { AzureAuth as default };
