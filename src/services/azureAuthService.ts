// Azure Authentication Service for Production
import { AZURE_CONFIG } from '../config/azure';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface AuthConfig {
  tenantId: string;
  clientId: string;
  scope: string;
  redirectUri: string;
}

class AzureAuthService {
  private tokens: AuthTokens | null = null;
  private authConfig: AuthConfig;

  constructor() {
    this.authConfig = {
      tenantId: AZURE_CONFIG.azureAd.tenantId,
      clientId: AZURE_CONFIG.azureAd.clientId,
      scope: AZURE_CONFIG.azureAd.scope,
      redirectUri: AZURE_CONFIG.azureAd.redirectUri
    };
  }

  /**
   * Get the Azure AD login URL for OAuth2 authentication
   */
  getLoginUrl(): string {
    const params = new URLSearchParams({
      client_id: this.authConfig.clientId,
      response_type: 'token',
      redirect_uri: this.authConfig.redirectUri,
      scope: this.authConfig.scope,
      response_mode: 'fragment',
      state: this.generateState(),
      nonce: this.generateNonce()
    });

    return `https://login.microsoftonline.com/${this.authConfig.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Handle the authentication callback from Azure AD
   */
  handleAuthCallback(): boolean {
    const hash = window.location.hash;
    if (!hash.includes('access_token')) {
      return false;
    }

    try {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const expiresIn = params.get('expires_in');

      if (accessToken && expiresIn) {
        this.tokens = {
          accessToken,
          expiresAt: Date.now() + (parseInt(expiresIn) * 1000)
        };

        // Clear the hash from URL for security
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('✅ Azure authentication successful');
        return true;
      }
    } catch (error) {
      console.error('❌ Error parsing authentication callback:', error);
    }

    return false;
  }

  /**
   * Get current access token (refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.tokens) {
      return null;
    }

    // Check if token is expired (with 5 minute buffer)
    if (Date.now() >= (this.tokens.expiresAt - 300000)) {
      console.log('🔄 Access token expired, requiring re-authentication');
      this.tokens = null;
      return null;
    }

    return this.tokens.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokens !== null && Date.now() < (this.tokens.expiresAt - 300000);
  }

  /**
   * Sign out the user
   */
  signOut(): void {
    this.tokens = null;
    
    // Optional: Redirect to Azure AD logout
    const logoutUrl = `https://login.microsoftonline.com/${this.authConfig.tenantId}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(this.authConfig.redirectUri)}`;
    window.location.href = logoutUrl;
  }

  /**
   * Initiate login flow
   */
  login(): void {
    const loginUrl = this.getLoginUrl();
    window.location.href = loginUrl;
  }

  /**
   * Get user info from token (basic parsing)
   */
  getUserInfo(): any {
    if (!this.tokens?.accessToken) {
      return null;
    }

    try {
      // Parse JWT token payload (basic implementation)
      const payload = this.tokens.accessToken.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateNonce(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const azureAuthService = new AzureAuthService();
export default azureAuthService;

// Check for authentication callback on app load
if (window.location.hash.includes('access_token')) {
  azureAuthService.handleAuthCallback();
}
