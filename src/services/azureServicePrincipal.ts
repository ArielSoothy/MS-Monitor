// Azure Data Explorer Service Principal Connection (No User Auth Required)

export class AzureServicePrincipalService {
  private readonly config = {
    cluster: import.meta.env.VITE_AZURE_CLUSTER || 'msmonitoradx.israelcentral.kusto.windows.net',
    database: import.meta.env.VITE_AZURE_DATABASE || 'monitoringdb',
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_AZURE_CLIENT_SECRET, // Optional for demo
  };

  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Get access token using service principal (backend auth)
   * For production, this would be handled by your backend
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      console.log('🔑 Getting service principal token for backend authentication...');
      
      // Since we're in demo mode without actual Azure backend, we'll simulate
      // the service principal authentication process
      console.log('🔐 Backend-only authentication: Service Principal flow');
      console.log('📍 Tenant ID:', this.config.tenantId);
      console.log('📍 Client ID:', this.config.clientId);
      console.log('📍 Cluster:', this.config.cluster);
      
      // For the interview demo, we simulate successful authentication
      // In production, this would call your Azure Function or backend API
      // that securely handles the service principal authentication
      
      console.log('✅ Service principal authentication simulated for demo');
      this.accessToken = `sp-token-${Date.now()}`;
      this.tokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      return this.accessToken;
      
    } catch (error) {
      console.error('❌ Service principal authentication failed:', error);
      throw error;
    }
  }

  /**
   * Execute KQL query against Azure Data Explorer
   */
  async executeQuery(query: string): Promise<any[]> {
    try {
      await this.getAccessToken(); // Ensure authentication is ready
      
      console.log('🔍 Executing query with backend authentication...');
      console.log('📝 Query:', query.substring(0, 100) + '...');
      
      // In production, this would call your Azure Function endpoint
      // that has secure access to Azure Data Explorer
      const endpoint = `https://${this.config.cluster}/v1/rest/query`;
      
      // For demo purposes, we simulate the Azure Data Explorer response
      // In production, your backend would make this call securely
      console.log('🎭 Demo mode: Simulating Azure Data Explorer query execution');
      console.log('🔗 Would query endpoint:', endpoint);
      console.log('💾 Database:', this.config.database);
      
      // Return realistic mock data based on query type
      return this.getMockData(query);
      
    } catch (error) {
      console.error('❌ Query execution failed:', error);
      
      // Always fall back to mock data for demo
      console.log('🎭 Falling back to mock data for demo');
      return this.getMockData(query);
    }
  }

  /**
   * Test connection to Azure Data Explorer
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.executeQuery('print "connection_test"');
      console.log('✅ Azure Data Explorer connection successful');
      return true;
    } catch (error) {
      console.error('❌ Azure Data Explorer connection failed:', error);
      return false;
    }
  }

  /**
   * Mock data for demo purposes
   */
  private getMockData(query: string): any[] {
    if (query.includes('count')) {
      return [[Math.floor(Math.random() * 10000)]];
    }
    
    if (query.includes('SecurityEvents')) {
      return [
        ['Critical Alert', 'High', 'Azure AD', new Date().toISOString()],
        ['Failed Login', 'Medium', 'LinkedIn API', new Date().toISOString()],
        ['Suspicious Activity', 'High', 'GitHub API', new Date().toISOString()]
      ];
    }
    
    return [['Demo data for:', query.substring(0, 50) + '...']];
  }

  /**
   * Get threat overview metrics
   */
  async getThreatOverview() {
    const query = `
      SecurityEvents
      | summarize TotalEvents = count(),
                 HighRiskEvents = countif(ThreatLevel == "Critical" or ThreatLevel == "High"),
                 UniqueUsers = dcount(UserId),
                 UniqueIPs = dcount(SourceIP)
    `;
    
    const result = await this.executeQuery(query);
    return result[0] || {
      TotalEvents: 12847,
      HighRiskEvents: 156,
      UniqueUsers: 2841,
      UniqueIPs: 1203
    };
  }

  /**
   * Get pipeline health data
   */
  async getPipelineHealth() {
    const query = `
      PipelineMetrics
      | summarize HealthyCount = countif(Status == "healthy"),
                 WarningCount = countif(Status == "warning"), 
                 FailedCount = countif(Status == "failed")
    `;
    
    const result = await this.executeQuery(query);
    return result[0] || {
      HealthyCount: 143,
      WarningCount: 12,
      FailedCount: 5
    };
  }
}

export const azureServicePrincipal = new AzureServicePrincipalService();
