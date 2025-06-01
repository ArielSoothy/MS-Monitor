import { useState, useEffect, useCallback } from 'react';
import { azureService, type ThreatOverviewData, type GeographicThreat, type ThreatCorrelation, type PipelineHealthData, type SecurityTimelineEvent } from '../services/azureService';
import { generateMockPipelines } from '../data/mockData';

interface AzureDataState {
  // Connection status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data from Azure
  threatOverview: ThreatOverviewData | null;
  geographicThreats: GeographicThreat[];
  threatCorrelations: ThreatCorrelation[];
  pipelineHealth: PipelineHealthData[];
  securityTimeline: SecurityTimelineEvent[];
  
  // Fallback data
  mockPipelines: any[];
  
  // Methods
  refresh: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  executeCustomQuery: (query: string) => Promise<any[]>;
}

export const useAzureData = (): AzureDataState => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Azure data state
  const [threatOverview, setThreatOverview] = useState<ThreatOverviewData | null>(null);
  const [geographicThreats, setGeographicThreats] = useState<GeographicThreat[]>([]);
  const [threatCorrelations, setThreatCorrelations] = useState<ThreatCorrelation[]>([]);
  const [pipelineHealth, setPipelineHealth] = useState<PipelineHealthData[]>([]);
  const [securityTimeline, setSecurityTimeline] = useState<SecurityTimelineEvent[]>([]);
  
  // Fallback mock data
  const [mockPipelines] = useState(() => generateMockPipelines());

  /**
   * Test connection to Azure Data Explorer
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const connected = await azureService.testConnection();
      setIsConnected(connected);
      if (connected) {
        setError(null);
      }
      return connected;
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
      return false;
    }
  }, []);

  /**
   * Load all data from Azure Data Explorer
   */
  const loadAzureData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading MSTIC data from Azure Data Explorer...');
      
      // Load all data in parallel
      const [
        overviewData,
        geoData,
        correlationData,
        healthData,
        timelineData
      ] = await Promise.all([
        azureService.getThreatOverview(),
        azureService.getGeographicThreats(),
        azureService.getThreatCorrelations(),
        azureService.getPipelineHealth(),
        azureService.getSecurityTimeline()
      ]);

      // Update state with real data
      setThreatOverview(overviewData);
      setGeographicThreats(geoData);
      setThreatCorrelations(correlationData);
      setPipelineHealth(healthData);
      setSecurityTimeline(timelineData);

      console.log('✅ Azure data loaded successfully', {
        threatOverview: overviewData,
        geographicThreats: geoData.length,
        threatCorrelations: correlationData.length,
        pipelineHealth: healthData.length,
        securityTimeline: timelineData.length
      });

    } catch (err) {
      console.error('❌ Failed to load Azure data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      
      // If Azure fails, we'll use mock data for the demo
      console.log('🎭 Falling back to mock data for demo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh all data
   */
  const refresh = useCallback(async () => {
    await testConnection();
    await loadAzureData();
  }, [testConnection, loadAzureData]);

  /**
   * Execute custom KQL query
   */
  const executeCustomQuery = useCallback(async (query: string): Promise<any[]> => {
    try {
      return await azureService.executeCustomQuery(query);
    } catch (err) {
      console.error('Failed to execute custom query:', err);
      return [];
    }
  }, []);

  /**
   * Initialize data on mount
   */
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      console.log('🚀 Initializing Azure Data Explorer connection...');
      
      // Test connection first
      const connected = await testConnection();
      
      if (mounted) {
        if (connected) {
          console.log('✅ Azure Data Explorer connected');
          await loadAzureData();
        } else {
          console.log('⚠️ Azure Data Explorer not available - using mock data for demo');
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [testConnection, loadAzureData]);

  return {
    // Connection status
    isConnected,
    isLoading,
    error,
    
    // Azure data
    threatOverview,
    geographicThreats,
    threatCorrelations,
    pipelineHealth,
    securityTimeline,
    
    // Fallback data
    mockPipelines,
    
    // Methods
    refresh,
    testConnection,
    executeCustomQuery
  };
};

export default useAzureData;
