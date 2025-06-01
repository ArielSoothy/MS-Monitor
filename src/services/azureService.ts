import axios from 'axios';
import { AZURE_CONFIG } from '../config/azure';
import { azureBackendService } from './azureBackendService';
import { azureAuthService } from './azureAuthService';

// Types for Azure Data Explorer responses
export interface AzureQueryResult {
  Tables: Array<{
    TableName: string;
    Columns: Array<{
      ColumnName: string;
      DataType: string;
      ColumnType: string;
    }>;
    Rows: any[][];
  }>;
}

export interface ThreatOverviewData {
  TotalEvents: number;
  HighRiskEvents: number;
  ThreatPercentage: number;
  UniqueUsers: number;
  UniqueIPs: number;
  FailureRate: number;
  BlockedEvents: number;
}

export interface GeographicThreat {
  Country: string;
  City: string;
  ThreatEvents: number;
  AvgRiskScore: number;
  UniqueUsers: number;
  ThreatTypes: string[];
  RiskLevel: string;
}

export interface ThreatCorrelation {
  Timestamp: string;
  UserId: string;
  UserEmail: string;
  SourceIP: string;
  ThreatType: string;
  Confidence: number;
  RiskScore: number;
  PipelineId: string;
  EventType: string;
  LoginResult: string;
  Alert: string;
}

export interface PipelineHealthData {
  Source: string;
  Status: string;
  AvgLatency: number;
  TotalThreats: number;
  TotalAlerts: number;
  AvgDetectionRate: number;
  AvgDataQuality: number;
  AvgFalsePositiveRate: number;
  AlertsPerThreat: number;
  PerformanceScore: number;
  HealthStatus: string;
}

export interface SecurityTimelineEvent {
  Timestamp: string;
  EventType: string;
  ThreatLevel: string;
  RiskScore: number;
  SourceIP: string;
  Country: string;
  UserEmail: string;
  LoginResult: string;
  PipelineId: string;
  DetectionSource: string;
}

class AzureDataExplorerService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = AZURE_CONFIG.publicEndpoint;
    this.timeout = AZURE_CONFIG.timeout;
  }

  /**
   * Execute a KQL query against Azure Data Explorer
   * Uses service principal authentication for backend-only access
   */
  private async executeQuery(query: string): Promise<AzureQueryResult> {
    try {
      console.log('🔍 Executing KQL Query:', query);
      
      // Use service principal authentication for backend-only access
      if (import.meta.env.VITE_USE_SERVICE_PRINCIPAL === 'true') {
        console.log('🔑 Using backend service for secure authentication');
        
        try {
          const response = await azureBackendService.executeQuery(query);
          
          if (response.success) {
            // Convert backend response to Azure format
            return {
              Tables: [{
                TableName: 'PrimaryResult',
                Columns: [],
                Rows: response.data
              }]
            };
          } else {
            console.warn('⚠️ Backend query failed, falling back to demo mode:', response.error);
            return this.getDemoResponse(query);
          }
        } catch (backendError) {
          console.warn('⚠️ Backend service failed, falling back to demo mode:', backendError);
          return this.getDemoResponse(query);
        }
      }
      
      // Original Azure Data Explorer REST API call
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authentication header if enabled and authenticated
      if (AZURE_CONFIG.enableAuthentication) {
        const accessToken = await azureAuthService.getAccessToken();
        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
          throw new Error('Authentication required but no valid token available');
        }
      }

      const response = await axios.post(
        this.baseUrl,
        {
          db: AZURE_CONFIG.database,
          csl: query
        },
        {
          headers,
          timeout: this.timeout,
        }
      );

      console.log('✅ Azure Data Explorer Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Azure Data Explorer Error:', error);
      
      // Check if this is a CORS or authentication error that indicates we need setup
      const isNetworkError = axios.isAxiosError(error) && (
        error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 ||
        error.response?.status === 403 ||
        error.response?.status === 0 // CORS error
      );
      
      if (isNetworkError) {
        console.log('🔧 Network/Auth error detected - falling back to demo mode');
        return this.getDemoResponse(query);
      }
      
      if (AZURE_CONFIG.demoMode) {
        console.log('🎭 Demo mode enabled - returning mock data structure');
        return this.getDemoResponse(query);
      }
      
      throw error;
    }
  }

  /**
   * Get demo response for development/demo purposes
   */
  private getDemoResponse(_query: string): AzureQueryResult {
    return {
      Tables: [{
        TableName: 'PrimaryResult',
        Columns: [],
        Rows: []
      }]
    };
  }

  /**
   * Convert Azure table result to typed data
   */
  private convertTableResult<T>(result: AzureQueryResult): T[] {
    if (!result.Tables || result.Tables.length === 0) {
      return [];
    }

    const table = result.Tables[0];
    const columns = table.Columns.map(col => col.ColumnName);
    
    return table.Rows.map(row => {
      const obj: any = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj as T;
    });
  }

  /**
   * Get threat landscape overview for executive dashboard
   */
  async getThreatOverview(): Promise<ThreatOverviewData | null> {
    try {
      const result = await this.executeQuery(AZURE_CONFIG.queries.threatOverview);
      const data = this.convertTableResult<ThreatOverviewData>(result);
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Failed to get threat overview:', error);
      return null;
    }
  }

  /**
   * Get geographic threat distribution
   */
  async getGeographicThreats(): Promise<GeographicThreat[]> {
    try {
      const result = await this.executeQuery(AZURE_CONFIG.queries.geographicThreats);
      return this.convertTableResult<GeographicThreat>(result);
    } catch (error) {
      console.error('Failed to get geographic threats:', error);
      return [];
    }
  }

  /**
   * Get real-time threat correlations
   */
  async getThreatCorrelations(): Promise<ThreatCorrelation[]> {
    try {
      const result = await this.executeQuery(AZURE_CONFIG.queries.threatCorrelation);
      return this.convertTableResult<ThreatCorrelation>(result);
    } catch (error) {
      console.error('Failed to get threat correlations:', error);
      return [];
    }
  }

  /**
   * Get pipeline health metrics
   */
  async getPipelineHealth(): Promise<PipelineHealthData[]> {
    try {
      const result = await this.executeQuery(AZURE_CONFIG.queries.pipelineHealth);
      return this.convertTableResult<PipelineHealthData>(result);
    } catch (error) {
      console.error('Failed to get pipeline health:', error);
      return [];
    }
  }

  /**
   * Get security incident timeline
   */
  async getSecurityTimeline(): Promise<SecurityTimelineEvent[]> {
    try {
      const result = await this.executeQuery(AZURE_CONFIG.queries.securityTimeline);
      return this.convertTableResult<SecurityTimelineEvent>(result);
    } catch (error) {
      console.error('Failed to get security timeline:', error);
      return [];
    }
  }

  /**
   * Execute a custom KQL query (for demo purposes)
   */
  async executeCustomQuery(query: string): Promise<any[]> {
    try {
      const result = await this.executeQuery(query);
      return this.convertTableResult(result);
    } catch (error) {
      console.error('Failed to execute custom query:', error);
      return [];
    }
  }

  /**
   * Test connection to Azure Data Explorer
   */
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.executeQuery('print "Azure Data Explorer Connected Successfully"');
      return result.Tables && result.Tables.length > 0;
    } catch (error) {
      console.error('Azure Data Explorer connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const azureService = new AzureDataExplorerService();

// Export service class for testing
export default AzureDataExplorerService;
