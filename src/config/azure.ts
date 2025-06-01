// Azure Data Explorer Configuration
export const AZURE_CONFIG = {
  // Your Azure Data Explorer cluster details
  cluster: 'msmonitoradx.israelcentral.kusto.windows.net',
  database: 'monitoringdb',
  
  // Connection endpoints
  publicEndpoint: `https://msmonitoradx.israelcentral.kusto.windows.net/v1/rest/query`,
  managementEndpoint: `https://msmonitoradx.israelcentral.kusto.windows.net/v1/rest/mgmt`,
  
  // Azure AD Authentication (for production)
  azureAd: {
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID || 'a0a91867-5c72-4cca-b8f2-735803aa267d',
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '5ed6a827-00dd-4d4f-ba92-eea47325cc07',
    scope: 'https://help.kusto.windows.net/.default',
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/MS-Monitor/',
  },
  
  // Connection settings
  timeout: 30000, // 30 seconds
  retryCount: 3,
  
  // Demo mode - when true, falls back to mock data if Azure is unavailable
  demoMode: import.meta.env.VITE_DEMO_MODE === 'true',
  
  // Feature flags
  enableRealTimeUpdates: true,
  enableAuthentication: import.meta.env.VITE_ENABLE_AZURE_AUTH === 'true',
  useServicePrincipal: import.meta.env.VITE_USE_SERVICE_PRINCIPAL === 'true',
  
  // Sample queries for the MSTIC demo
  queries: {
    threatOverview: `
      SecurityEvents
      | summarize TotalEvents = count(),
                 HighRiskEvents = countif(ThreatLevel == "Critical" or ThreatLevel == "High"),
                 UniqueUsers = dcount(UserId),
                 UniqueIPs = dcount(SourceIP),
                 FailedLogins = countif(LoginResult == "Failed"),
                 BlockedEvents = countif(LoginResult == "Blocked")
      | extend ThreatPercentage = round(HighRiskEvents * 100.0 / TotalEvents, 1),
               FailureRate = round(FailedLogins * 100.0 / TotalEvents, 1)
    `,
    
    geographicThreats: `
      SecurityEvents
      | where ThreatLevel in ("High", "Critical")
      | summarize ThreatEvents = count(), 
                 AvgRiskScore = avg(RiskScore),
                 UniqueUsers = dcount(UserId),
                 ThreatTypes = make_set(EventType)
        by Country, City
      | extend RiskLevel = case(
          AvgRiskScore > 90, "🔴 Critical",
          AvgRiskScore > 70, "🟠 High", 
          AvgRiskScore > 50, "🟡 Medium",
          "🟢 Low"
      )
      | order by ThreatEvents desc, AvgRiskScore desc
      | take 10
    `,
    
    threatCorrelation: `
      SecurityEvents
      | join kind=inner (
          ThreatIndicators 
          | where Confidence > 0.8
      ) on $left.SourceIP == $right.IndicatorValue
      | project Timestamp, 
               UserId, 
               UserEmail, 
               SourceIP, 
               ThreatType, 
               Confidence, 
               RiskScore, 
               PipelineId,
               EventType,
               LoginResult
      | extend Alert = strcat("🚨 ", ThreatType, " detected from ", SourceIP)
      | order by Timestamp desc
    `,
    
    pipelineHealth: `
      PipelineHealth
      | summarize AvgLatency = avg(ProcessingLatency),
                 TotalThreats = sum(ThreatEventsProcessed),
                 TotalAlerts = sum(SecurityAlertsGenerated),
                 AvgDetectionRate = avg(ThreatDetectionRate),
                 AvgDataQuality = avg(DataQualityScore),
                 AvgFalsePositiveRate = avg(FalsePositiveRate)
        by Source, Status
      | extend AlertsPerThreat = round(TotalAlerts * 1.0 / TotalThreats * 1000, 2),
               PerformanceScore = round((AvgDetectionRate * AvgDataQuality) / 100, 1),
               HealthStatus = case(
                   Status == "healthy" and AvgLatency < 5, "🟢 Excellent",
                   Status == "healthy", "🟡 Good", 
                   Status == "warning", "🟠 Needs Attention",
                   "🔴 Critical"
               )
      | order by PerformanceScore desc
    `,
    
    securityTimeline: `
      SecurityEvents
      | where RiskScore > 70
      | project Timestamp,
               EventType,
               ThreatLevel,
               RiskScore,
               SourceIP,
               Country,
               UserEmail,
               LoginResult,
               PipelineId,
               DetectionSource
      | order by Timestamp desc
      | take 20
    `
  }
} as const;

export type AzureQueryType = keyof typeof AZURE_CONFIG.queries;
