import type { Pipeline, PipelineStatus, PipelineSource, Alert, AlertRule, AlertTrend } from '../types';

// Enhanced pipeline configuration with realistic naming patterns
interface PipelineConfig {
  source: PipelineSource;
  dataTypes: string[];
  processes: string[];
  regions: ('US' | 'EU' | 'APAC' | 'Global')[];
  teams: string[];
  slaRequirements: number[];
  dataClassifications: ('Public' | 'Internal' | 'Confidential' | 'Secret')[];
}

const pipelineConfigs: PipelineConfig[] = [
  {
    source: 'LinkedIn',
    dataTypes: ['ProfileData', 'CompanyIntel', 'ThreatActors', 'JobPostings'],
    processes: ['Ingestion', 'Analysis', 'Monitoring', 'Classification'],
    regions: ['US', 'EU'],
    teams: ['Threat Intelligence', 'Social Media Analytics', 'OSINT'],
    slaRequirements: [60, 120, 240],
    dataClassifications: ['Internal', 'Confidential']
  },
  {
    source: 'Twitter',
    dataTypes: ['ThreatFeeds', 'SentimentData', 'HashtagIntel', 'AccountData'],
    processes: ['Ingestion', 'Processing', 'RealTimeAnalysis', 'Enrichment'],
    regions: ['US', 'EU', 'Global'],
    teams: ['Threat Intelligence', 'Social Media Analytics', 'Real-time Monitoring'],
    slaRequirements: [30, 60, 120],
    dataClassifications: ['Public', 'Internal', 'Confidential']
  },
  {
    source: 'Office365',
    dataTypes: ['EmailIntel', 'UserActivity', 'SecurityLogs', 'ComplianceData'],
    processes: ['Ingestion', 'Monitoring', 'Security', 'Analysis'],
    regions: ['US', 'EU'],
    teams: ['Enterprise Security', 'Compliance', 'Productivity Analytics'],
    slaRequirements: [15, 30, 60],
    dataClassifications: ['Confidential', 'Secret']
  },
  {
    source: 'AzureAD',
    dataTypes: ['IdentityData', 'SignInLogs', 'RiskEvents', 'AccessLogs'],
    processes: ['Ingestion', 'RiskAnalysis', 'Monitoring'],
    regions: ['US', 'EU', 'Global'],
    teams: ['Identity Security', 'Access Management', 'Risk Assessment'],
    slaRequirements: [15, 30, 60],
    dataClassifications: ['Confidential', 'Secret']
  },
  {
    source: 'GitHub',
    dataTypes: ['RepoIntel', 'SecurityAlerts', 'UserActivity', 'CodeAnalysis'],
    processes: ['Ingestion', 'SecurityScanning', 'Monitoring'],
    regions: ['US', 'EU', 'Global'],
    teams: ['DevSec', 'Code Intelligence', 'Repository Security'],
    slaRequirements: [60, 120, 240],
    dataClassifications: ['Public', 'Internal', 'Confidential']
  },
  {
    source: 'ThreatIntel',
    dataTypes: ['IOCFeeds', 'MalwareIntel', 'ThreatActors', 'VulnData'],
    processes: ['Ingestion', 'Analysis', 'Correlation'],
    regions: ['Global', 'US'],
    teams: ['Threat Intelligence', 'Malware Analysis', 'APT Tracking'],
    slaRequirements: [15, 30, 60],
    dataClassifications: ['Confidential', 'Secret']
  },
  {
    source: 'Exchange',
    dataTypes: ['MessageTracking', 'SecurityLogs', 'ComplianceData', 'AntiSpamLogs'],
    processes: ['Ingestion', 'Monitoring', 'Security'],
    regions: ['US', 'EU'],
    teams: ['Exchange Security', 'Email Security', 'Compliance'],
    slaRequirements: [15, 30, 60],
    dataClassifications: ['Confidential', 'Secret']
  },
  {
    source: 'Teams',
    dataTypes: ['MeetingData', 'ChatLogs', 'SecurityEvents'],
    processes: ['Ingestion', 'Monitoring', 'Security'],
    regions: ['US', 'EU', 'APAC'],
    teams: ['Teams Security', 'Collaboration Analytics', 'Compliance'],
    slaRequirements: [30, 60, 120],
    dataClassifications: ['Internal', 'Confidential']
  },
  {
    source: 'SharePoint',
    dataTypes: ['DocumentData', 'PermissionAudits', 'UserActivity', 'ComplianceData'],
    processes: ['Ingestion', 'Monitoring', 'Security'],
    regions: ['US', 'EU'],
    teams: ['SharePoint Security', 'Content Management', 'Compliance'],
    slaRequirements: [60, 120, 240],
    dataClassifications: ['Internal', 'Confidential', 'Secret']
  },
  {
    source: 'PowerBI',
    dataTypes: ['UsageAnalytics', 'SecurityAudits', 'TenantAnalytics'],
    processes: ['Ingestion', 'Monitoring', 'Analysis'],
    regions: ['US', 'EU', 'Global'],
    teams: ['BI Analytics', 'Data Governance', 'Performance Monitoring'],
    slaRequirements: [60, 120, 240],
    dataClassifications: ['Internal', 'Confidential']
  }
];

// Realistic failure reasons by category
const failureReasons = {
  'API_RATE_LIMIT': [
    'LinkedIn API rate limit exceeded (100 requests/hour)',
    'Twitter API rate limit exceeded (300 requests/15min)',
    'GitHub API rate limit exceeded (5000 requests/hour)',
    'ThreatIntel feed API throttling active during high activity',
  ],
  'AUTH_EXPIRED': [
    'OAuth token expired for LinkedIn connection',
    'API key authentication failed for Twitter',
    'Service principal credentials expired for AzureAD',
    'App registration certificate expired',
    'Government API credentials revoked (security compliance)',
  ],
  'NETWORK_TIMEOUT': [
    'Connection timeout to external API (30s)',
    'Network latency exceeded threshold (5s)',
    'DNS resolution failed for endpoint',
    'SSL handshake timeout',
    'Regional internet infrastructure disruption detected',
    'Cross-border data routing blocked by network policies',
  ],
  'DATA_QUALITY': [
    'Invalid JSON format in response payload',
    'Missing required fields in 45% of records',
    'Data schema validation failed',
    'Duplicate records detected (threshold: 10%)',
    'Encoding issues in UTF-8 conversion',
    'Threat actor attribution data inconsistent with MITRE standards',
    'Geolocation data accuracy below 85% threshold',
  ],
  'RESOURCE_EXHAUSTION': [
    'Memory usage exceeded 4GB limit',
    'Disk space insufficient for processing',
    'CPU usage at 100% for >5 minutes',
    'Database connection pool exhausted',
    'APT tracking analysis consuming excessive compute resources',
  ],
  'SILENT_FAILURE': [
    'Pipeline completing successfully but processing 0 records',
    'Authentication succeeding but data source returning empty responses',
    'Processing appears normal but missing critical threat indicators',
    'Pipeline status healthy but downstream dependencies failing silently',
    'Data ingestion successful but enrichment engine not receiving data',
    'Threat intelligence feed active but IOC extraction returning null values',
  ],
  'GEOPOLITICAL_THREAT': [
    'Iran-attributed APT group targeting Israeli infrastructure detected',
    'Nation-state actor campaign against critical infrastructure identified',
    'Cross-border credential stuffing attack pattern detected',
    'State-sponsored phishing campaign targeting government entities',
    'Advanced persistent threat targeting defense contractors',
    'Foreign intelligence service attempting technology exfiltration',
    'Cyber espionage campaign targeting telecommunications infrastructure',
    'Nation-state malware detected in energy sector networks',
  ]
};

// Maintenance windows by team
const maintenanceWindows: Record<string, string> = {
  'Threat Intelligence': 'Sundays 02:00-04:00 UTC',
  'Social Media Analytics': 'Saturdays 23:00-01:00 UTC',
  'Enterprise Security': 'Sundays 01:00-03:00 UTC',
  'Identity Security': 'Sundays 00:00-02:00 UTC',
  'DevSec': 'Sundays 03:00-05:00 UTC',
  'Exchange Security': 'Sundays 02:00-04:00 UTC',
  'Teams Security': 'Saturdays 22:00-00:00 UTC',
  'SharePoint Security': 'Sundays 01:00-03:00 UTC',
  'BI Analytics': 'Sundays 04:00-06:00 UTC',
  'OSINT': 'Saturdays 21:00-23:00 UTC',
  'Real-time Monitoring': 'Sundays 05:00-06:00 UTC',
  'Compliance': 'Sundays 00:00-02:00 UTC',
  'Data Governance': 'Sundays 03:00-05:00 UTC',
  'Malware Analysis': 'Sundays 01:00-03:00 UTC',
  'APT Tracking': 'Sundays 02:00-04:00 UTC',
  'Code Intelligence': 'Sundays 03:00-05:00 UTC',
  'Repository Security': 'Sundays 04:00-06:00 UTC',
  'Email Security': 'Sundays 01:00-03:00 UTC',
  'Collaboration Analytics': 'Saturdays 22:00-00:00 UTC',
  'Content Management': 'Sundays 02:00-04:00 UTC',
  'Performance Monitoring': 'Sundays 04:00-06:00 UTC',
  'Access Management': 'Sundays 00:00-02:00 UTC',
  'Risk Assessment': 'Sundays 01:00-03:00 UTC',
  'Productivity Analytics': 'Sundays 02:00-04:00 UTC'
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getBusinessHourWeight(): number {
  const now = new Date();
  const hour = now.getHours();
  // Higher activity during business hours (9 AM - 5 PM)
  if (hour >= 9 && hour <= 17) {
    return 1.5; // 50% more activity
  }
  // Lower activity during night hours (11 PM - 6 AM)
  if (hour >= 23 || hour <= 6) {
    return 0.3; // 70% less activity
  }
  return 1.0;
}

function getWeeklyPattern(): number {
  const now = new Date();
  const day = now.getDay();
  // Lower activity on weekends
  if (day === 0 || day === 6) {
    return 0.4; // 60% less activity on weekends
  }
  // Higher activity on Monday and Friday (start/end of week spikes)
  if (day === 1 || day === 5) {
    return 1.3; // 30% more activity
  }
  return 1.0;
}

function getEndOfMonthSpike(): number {
  const now = new Date();
  const day = now.getDate();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  // Spike in activity during last 3 days of month
  if (day >= lastDay - 2) {
    return 1.8; // 80% more activity
  }
  return 1.0;
}

function getRealisticStatus(config: PipelineConfig, dataType: string, process: string): PipelineStatus {
  let failureWeight = 0.05; // Base 5% failure rate
  
  // Social media sources have higher API rate limit issues
  if (['LinkedIn', 'Twitter'].includes(config.source)) {
    failureWeight += 0.03;
  }
  
  // Real-time processes are more prone to failures
  if (process.includes('RealTime') || process.includes('Monitoring')) {
    failureWeight += 0.02;
  }
  
  // Authentication-heavy processes
  if (config.source === 'AzureAD' || config.source === 'Office365') {
    failureWeight += 0.01;
  }
  
  // High-volume data types are more prone to issues
  if (dataType.includes('Logs') || dataType.includes('Activity') || dataType.includes('Feeds')) {
    failureWeight += 0.015;
  }
  
  // Apply time-based patterns
  const businessHourWeight = getBusinessHourWeight();
  const weeklyWeight = getWeeklyPattern();
  const monthlyWeight = getEndOfMonthSpike();
  
  const activityMultiplier = businessHourWeight * weeklyWeight * monthlyWeight;
  
  // Higher activity increases chance of issues
  if (activityMultiplier > 1.2) {
    failureWeight += 0.02;
  }
  
  const random = Math.random();
  
  if (random < failureWeight) return 'failed';
  if (random < failureWeight + 0.15) return 'warning';
  if (random < failureWeight + 0.25) return 'processing';
  return 'healthy';
}

function getRealisticLastRun(status: PipelineStatus): Date {
  const now = new Date();
  const businessHourWeight = getBusinessHourWeight();
  const weeklyWeight = getWeeklyPattern();
  
  let maxHoursBack = 8; // Default last run within 8 hours
  
  // Failed pipelines might not have run recently
  if (status === 'failed') {
    maxHoursBack = 48; // Up to 2 days ago
  }
  
  // Apply time patterns - less frequent runs during off hours
  if (businessHourWeight < 0.5) {
    maxHoursBack *= 2;
  }
  
  if (weeklyWeight < 0.5) {
    maxHoursBack *= 1.5;
  }
  
  const randomHours = Math.random() * maxHoursBack;
  return new Date(now.getTime() - randomHours * 60 * 60 * 1000);
}

function getFailureReason(source: PipelineSource, status: PipelineStatus): string | undefined {
  if (status !== 'failed' && status !== 'warning') return undefined;
  
  let reasonCategory: string;
  
  // Source-specific failure patterns with geopolitical and silent failure scenarios
  switch (source) {
    case 'LinkedIn':
    case 'Twitter':
      const socialRandom = Math.random();
      if (socialRandom < 0.4) reasonCategory = 'API_RATE_LIMIT';
      else if (socialRandom < 0.6) reasonCategory = 'AUTH_EXPIRED';
      else if (socialRandom < 0.8) reasonCategory = 'SILENT_FAILURE';
      else reasonCategory = 'GEOPOLITICAL_THREAT';
      break;
    case 'AzureAD':
    case 'Office365':
      const msRandom = Math.random();
      if (msRandom < 0.3) reasonCategory = 'AUTH_EXPIRED';
      else if (msRandom < 0.5) reasonCategory = 'NETWORK_TIMEOUT';
      else if (msRandom < 0.7) reasonCategory = 'SILENT_FAILURE';
      else reasonCategory = 'GEOPOLITICAL_THREAT';
      break;
    case 'ThreatIntel':
      const tiRandom = Math.random();
      if (tiRandom < 0.2) reasonCategory = 'DATA_QUALITY';
      else if (tiRandom < 0.4) reasonCategory = 'NETWORK_TIMEOUT';
      else if (tiRandom < 0.6) reasonCategory = 'SILENT_FAILURE';
      else reasonCategory = 'GEOPOLITICAL_THREAT';
      break;
    case 'GitHub':
      const ghRandom = Math.random();
      if (ghRandom < 0.3) reasonCategory = 'API_RATE_LIMIT';
      else if (ghRandom < 0.5) reasonCategory = 'DATA_QUALITY';
      else if (ghRandom < 0.7) reasonCategory = 'SILENT_FAILURE';
      else reasonCategory = 'GEOPOLITICAL_THREAT';
      break;
    default:
      const defaultRandom = Math.random();
      if (defaultRandom < 0.25) reasonCategory = 'NETWORK_TIMEOUT';
      else if (defaultRandom < 0.45) reasonCategory = 'DATA_QUALITY';
      else if (defaultRandom < 0.65) reasonCategory = 'RESOURCE_EXHAUSTION';
      else if (defaultRandom < 0.8) reasonCategory = 'SILENT_FAILURE';
      else reasonCategory = 'GEOPOLITICAL_THREAT';
  }
  
  const reasons = failureReasons[reasonCategory as keyof typeof failureReasons];
  return getRandomElement(reasons);
}

function createPipelineDependencies(pipelines: Pipeline[]): void {
  // Create realistic dependency chains
  pipelines.forEach(pipeline => {
    const { source, process, dataType } = pipeline;
    
    if (process === 'Enrichment') {
      const ingestionPipeline = pipelines.find(p => 
        p.source === source && p.dataType === dataType && p.process === 'Ingestion'
      );
      if (ingestionPipeline) {
        pipeline.dependsOn = [ingestionPipeline.id];
      }
    } else if (process === 'Analysis' || process === 'RealTimeAnalysis') {
      const enrichmentPipeline = pipelines.find(p => 
        p.source === source && p.dataType === dataType && p.process === 'Enrichment'
      );
      if (enrichmentPipeline) {
        pipeline.dependsOn = [enrichmentPipeline.id];
      }
    }
  });
}

function simulateCorrelatedFailures(pipelines: Pipeline[]): void {
  // When a source pipeline fails, related pipelines show warnings
  const failedPipelines = pipelines.filter(p => p.status === 'failed');
  
  failedPipelines.forEach(failedPipeline => {
    // Find pipelines that depend on this one
    const dependentPipelines = pipelines.filter(p => 
      p.dependsOn?.includes(failedPipeline.id)
    );
    
    dependentPipelines.forEach(dependent => {
      if (dependent.status === 'healthy' && Math.random() < 0.7) {
        dependent.status = 'warning';
        dependent.lastFailureReason = `Upstream dependency failure: ${failedPipeline.name}`;
      }
    });
    
    // Find related pipelines from same source
    const relatedPipelines = pipelines.filter(p => 
      p.source === failedPipeline.source && 
      p.id !== failedPipeline.id &&
      p.status === 'healthy'
    );
    
    relatedPipelines.slice(0, 2).forEach(related => {
      if (Math.random() < 0.3) {
        related.status = 'warning';
        related.lastFailureReason = `Related pipeline impact: ${failedPipeline.source} infrastructure issues`;
      }
    });
  });
}

// Enhanced error tracking and monitoring data generators
function generateErrorDetails(status: PipelineStatus, source: PipelineSource, process: string): {
  currentError?: any;
  errorHistory: any[];
  logReferences: any[];
  metricsHistory: any[];
  impactAnalysis?: any;
  runbooks: any[];
} {
  const errorTypes = ['connection', 'data_quality', 'timeout', 'authentication', 'rate_limit', 'parsing', 'validation', 'infrastructure'];
  
  // Generate current error for failed pipelines
  const currentError = status === 'failed' ? {
    errorCode: `E${Math.floor(Math.random() * 9000) + 1000}`,
    errorMessage: getFailureReason(source, status) || 'Unknown error occurred',
    stackTrace: generateStackTrace(source, process),
    errorType: getRandomElement(errorTypes),
    timestamp: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Within last 2 hours
    context: generateErrorContext(source, process),
    suggestedActions: generateSuggestedActions(source, process),
    severity: status === 'failed' ? getRandomElement(['high', 'critical']) : 
              status === 'warning' ? getRandomElement(['medium', 'high']) : 'low'
  } : undefined;

  // Generate error history (last 10 errors)
  const errorHistory = Array.from({ length: Math.floor(Math.random() * 10) + 3 }, (_, index) => ({
    errorCode: `E${Math.floor(Math.random() * 9000) + 1000}`,
    errorMessage: getRandomElement([
      'Connection timeout to external API',
      'Rate limit exceeded',
      'Authentication token expired',
      'Invalid data format received',
      'Database connection lost',
      'Memory limit exceeded',
      'Network connectivity issues',
      'Service temporarily unavailable'
    ]),
    errorType: getRandomElement(errorTypes),
    timestamp: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000),
    severity: getRandomElement(['low', 'medium', 'high', 'critical']),
    suggestedActions: ['Check service status', 'Retry operation', 'Contact support team']
  }));

  // Generate log references
  const logSystems = ['azure_monitor', 'elasticsearch', 'splunk', 'cloudwatch'];
  const correlationId = `corr-${Math.random().toString(36).substr(2, 9)}`;
  
  const logReferences = [
    {
      logSystem: getRandomElement(logSystems),
      logUrl: `https://portal.azure.com/#view/Microsoft_Azure_MonitoringMetrics/AzureMonitoringBrowseBlade/~/logs`,
      queryTemplate: generateLogQuery(source, process, correlationId),
      correlationId,
      timeRange: {
        start: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        end: new Date()
      }
    },
    {
      logSystem: 'elasticsearch',
      logUrl: `https://kibana.example.com/app/discover`,
      queryTemplate: `source:"${source.toLowerCase()}" AND process:"${process}" AND correlationId:"${correlationId}"`,
      correlationId,
      timeRange: {
        start: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        end: new Date()
      }
    }
  ];

  // Generate metrics history (last 24 hours)
  const metricsHistory = Array.from({ length: 24 }, (_, index) => ({
    timestamp: new Date(Date.now() - (23 - index) * 60 * 60 * 1000),
    recordsPerSecond: Math.floor(Math.random() * 1000) + 100,
    avgProcessingTime: Math.floor(Math.random() * 200) + 50,
    errorRate: Math.random() * (status === 'failed' ? 15 : status === 'warning' ? 5 : 2),
    dataQuality: Math.floor(Math.random() * 20) + 80,
    cpuUsage: Math.random() * 100,
    memoryUsage: Math.random() * 100
  }));

  // Generate impact analysis for failed pipelines
  const impactAnalysis = status === 'failed' ? {
    affectedDownstreamPipelines: generateDownstreamPipelines(source),
    affectedDestinations: generateAffectedDestinations(source),
    estimatedDataLoss: Math.floor(Math.random() * 100000) + 10000,
    businessImpactLevel: getRandomElement(['medium', 'high', 'critical']),
    recoveryTimeEstimate: Math.floor(Math.random() * 120) + 30 // 30-150 minutes
  } : undefined;

  // Generate runbooks
  const runbooks = [
    {
      title: `${source} Pipeline Recovery Runbook`,
      url: `https://docs.microsoft.com/mstic/runbooks/${source.toLowerCase()}-recovery`,
      description: `Step-by-step guide to recover ${source} data ingestion pipeline`,
      estimatedResolutionTime: 45
    },
    {
      title: `${process} Process Troubleshooting`,
      url: `https://docs.microsoft.com/mstic/runbooks/${process.toLowerCase()}-troubleshooting`,
      description: `Common issues and solutions for ${process} processes`,
      estimatedResolutionTime: 30
    },
    {
      title: 'API Rate Limit Handling',
      url: 'https://docs.microsoft.com/mstic/runbooks/api-rate-limits',
      description: 'How to handle and prevent API rate limit issues',
      estimatedResolutionTime: 15
    }
  ];

  return {
    currentError,
    errorHistory,
    logReferences,
    metricsHistory,
    impactAnalysis,
    runbooks
  };
}

function generateStackTrace(source: PipelineSource, process: string): string {
  const baseStackTrace = `
Microsoft.MSTIC.DataPipeline.${source}.${process}Exception: Pipeline execution failed
   at Microsoft.MSTIC.DataPipeline.${source}.${process}Service.ProcessData(DataBatch batch) in C:\\src\\pipelines\\${source}\\${process}Service.cs:line 142
   at Microsoft.MSTIC.DataPipeline.Core.PipelineExecutor.ExecuteStep[T](IPipelineStep step, T input) in C:\\src\\core\\PipelineExecutor.cs:line 89
   at Microsoft.MSTIC.DataPipeline.Core.PipelineOrchestrator.RunPipeline(PipelineDefinition definition) in C:\\src\\core\\PipelineOrchestrator.cs:line 56
   at Microsoft.MSTIC.DataPipeline.Host.PipelineWorker.DoWork(CancellationToken cancellationToken) in C:\\src\\host\\PipelineWorker.cs:line 33`;
  
  return baseStackTrace.trim();
}

function generateErrorContext(source: PipelineSource, process: string): Record<string, any> {
  const baseContext = {
    pipelineId: `${source}_${process}_${Math.random().toString(36).substr(2, 8)}`,
    batchId: `batch_${Date.now()}`,
    region: getRandomElement(['us-east-1', 'eu-west-1', 'ap-southeast-2']),
    instanceId: `worker-${Math.floor(Math.random() * 100)}`,
    version: '2.3.1'
  };

  // Add source-specific context
  if (['LinkedIn', 'Twitter'].includes(source)) {
    return {
      ...baseContext,
      apiEndpoint: `https://api.${source.toLowerCase()}.com/v2/data`,
      rateLimitRemaining: Math.floor(Math.random() * 100),
      requestsInWindow: Math.floor(Math.random() * 300),
      windowResetTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  }

  if (['AzureAD', 'Office365'].includes(source)) {
    return {
      ...baseContext,
      tenantId: '12345678-1234-1234-1234-123456789012',
      applicationId: '87654321-4321-4321-4321-210987654321',
      scopes: ['https://graph.microsoft.com/.default'],
      tokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    };
  }

  return baseContext;
}

function generateSuggestedActions(source: PipelineSource, _process: string): string[] {
  const commonActions = [
    'Check service health dashboard',
    'Verify network connectivity',
    'Review recent deployment changes',
    'Check resource utilization metrics'
  ];

  const sourceSpecificActions: Record<string, string[]> = {
    LinkedIn: [
      'Verify LinkedIn API credentials',
      'Check API rate limit status',
      'Review LinkedIn developer portal for service announcements'
    ],
    Twitter: [
      'Check Twitter API v2 bearer token',
      'Verify tweet filtering parameters',
      'Review Twitter API status page'
    ],
    AzureAD: [
      'Renew Azure AD application certificate',
      'Check tenant-specific permissions',
      'Verify Microsoft Graph API availability'
    ],
    Office365: [
      'Check Exchange Online connection',
      'Verify Office 365 service health',
      'Review compliance settings'
    ]
  };

  return [
    ...commonActions,
    ...(sourceSpecificActions[source] || [])
  ];
}

function generateLogQuery(source: PipelineSource, process: string, correlationId: string): string {
  return `KustoQuery
| where TimeGenerated >= ago(4h)
| where Source == "${source}"
| where Process == "${process}"
| where CorrelationId == "${correlationId}"
| where Level in ("Error", "Warning")
| order by TimeGenerated desc`;
}

function generateDownstreamPipelines(source: PipelineSource): string[] {
  const downstreamMap: Record<PipelineSource, string[]> = {
    LinkedIn: ['LinkedIn_ProfileData_Analysis_US', 'LinkedIn_CompanyIntel_Enrichment_EU'],
    Twitter: ['Twitter_ThreatFeeds_RealTimeAnalysis_Global', 'Twitter_SentimentData_Processing_US'],
    Office365: ['Office365_EmailIntel_Analysis_US', 'Office365_UserActivity_Monitoring_EU'],
    AzureAD: ['AzureAD_IdentityData_RiskAnalysis_Global', 'AzureAD_SignInLogs_Monitoring_US'],
    GitHub: ['GitHub_RepoIntel_Analysis_US', 'GitHub_ThreatActors_Monitoring_Global'],
    ThreatIntel: ['ThreatIntel_IOCs_Processing_Global', 'ThreatIntel_Campaigns_Analysis_US'],
    Exchange: ['Exchange_EmailSecurity_Analysis_US', 'Exchange_ThreatDetection_RealTime_EU'],
    Teams: ['Teams_CollabData_Analysis_US', 'Teams_SecurityLogs_Monitoring_EU'],
    SharePoint: ['SharePoint_ContentIntel_Analysis_US', 'SharePoint_AccessLogs_Monitoring_EU'],
    PowerBI: ['PowerBI_UsageAnalytics_Processing_US', 'PowerBI_SecurityMetrics_Analysis_Global']
  };
  
  return downstreamMap[source] || [];
}

function generateAffectedDestinations(source: PipelineSource): string[] {
  const destinationMap: Record<PipelineSource, string[]> = {
    LinkedIn: ['MSTIC Data Lake', 'Threat Intelligence DB', 'ML Training Data'],
    Twitter: ['Real-time Dashboard', 'Alert System', 'Security Analytics Store'],
    Office365: ['Compliance Archive', 'Security Analytics Store', 'Alert System'],
    AzureAD: ['Security Analytics Store', 'Alert System', 'Threat Intelligence DB'],
    GitHub: ['Threat Intelligence DB', 'Security Analytics Store', 'API Gateway'],
    ThreatIntel: ['Alert System', 'Threat Intelligence DB', 'Real-time Dashboard'],
    Exchange: ['Compliance Archive', 'Security Analytics Store', 'Alert System'],
    Teams: ['Compliance Archive', 'Real-time Dashboard', 'Security Analytics Store'],
    SharePoint: ['Compliance Archive', 'MSTIC Data Lake', 'Security Analytics Store'],
    PowerBI: ['Real-time Dashboard', 'Security Analytics Store', 'API Gateway']
  };
  
  return destinationMap[source] || ['MSTIC Data Lake'];
}

export function generateMockPipelines(): Pipeline[] {
  const pipelines: Pipeline[] = [];
  let idCounter = 1;
  
  // Track team assignments to ensure better distribution
  const teamAssignmentCounters: Record<string, number> = {};

  // Generate pipelines using the enhanced configuration
  pipelineConfigs.forEach((config, configIndex) => {
    config.dataTypes.forEach((dataType, dataTypeIndex) => {
      config.processes.forEach((process, processIndex) => {
        config.regions.forEach((region, regionIndex) => {
          // Create pipeline name following the convention: "{Source}{DataType}{Process}_{Region}"
          const name = `${config.source}_${dataType}_${process}_${region}`;
          const status = getRealisticStatus(config, dataType, process);
          const lastRun = getRealisticLastRun(status);
          
          // Improved team assignment for better distribution
          // Use a rotating assignment based on indices to ensure each team gets pipelines
          const teamIndex = (configIndex + dataTypeIndex + processIndex + regionIndex) % config.teams.length;
          const team = config.teams[teamIndex];
          
          // Track assignments to ensure distribution
          if (!teamAssignmentCounters[team]) {
            teamAssignmentCounters[team] = 0;
          }
          teamAssignmentCounters[team]++;
          
          const slaRequirement = getRandomElement(config.slaRequirements);
          const dataClassification = getRandomElement(config.dataClassifications);
          
          // Realistic processing times based on data type and process
          let baseProcessingTime = 30; // Default 30 minutes
          if (process.includes('RealTime')) baseProcessingTime = 5;
          if (process.includes('Analysis')) baseProcessingTime = 60;
          if (dataType.includes('Intel') || dataType.includes('Security')) baseProcessingTime = 45;
          
          const avgProcessingTime = Math.floor(baseProcessingTime * (0.7 + Math.random() * 0.6));
          
          // Records processed based on source and data type
          let baseRecords = 10000;
          if (['Twitter', 'LinkedIn'].includes(config.source)) baseRecords = 50000;
          if (dataType.includes('Logs') || dataType.includes('Activity')) baseRecords = 100000;
          if (process.includes('RealTime')) baseRecords *= 0.1; // Real-time processes smaller batches
          
          const recordsProcessed = Math.floor(baseRecords * (0.5 + Math.random()));
          
          // Realistic failure rates
          let baseFailureRate = 2; // Base 2%
          if (status === 'failed') baseFailureRate = Math.random() * 15 + 5; // 5-20%
          else if (status === 'warning') baseFailureRate = Math.random() * 8 + 2; // 2-10%
          else baseFailureRate = Math.random() * 3; // 0-3%

          // Generate enhanced error tracking data
          const errorTrackingData = generateErrorDetails(status, config.source, process);
          
          const pipeline: Pipeline = {
            id: `pipeline-${idCounter++}`,
            name,
            source: config.source,
            status,
            lastRun,
            avgProcessingTime,
            recordsProcessed,
            failureRate: Math.round(baseFailureRate * 100) / 100,
            ownerTeam: team,
            slaRequirement,
            dataClassification,
            region,
            dataType,
            process,
            lastFailureReason: getFailureReason(config.source, status),
            maintenanceWindow: maintenanceWindows[team] || 'Not scheduled',
            
            // Enhanced error tracking and monitoring
            currentError: errorTrackingData.currentError,
            errorHistory: errorTrackingData.errorHistory,
            logReferences: errorTrackingData.logReferences,
            metricsHistory: errorTrackingData.metricsHistory,
            impactAnalysis: errorTrackingData.impactAnalysis,
            runbooks: errorTrackingData.runbooks,
            alertingEnabled: true,
            oncallTeam: team,
            slackChannel: `mstic-${team.toLowerCase().replace(/\s+/g, '-')}`,
            teamsChannel: `https://teams.microsoft.com/l/channel/mstic-${team.toLowerCase().replace(/\s+/g, '-')}`,
            dashboardUrl: `https://portal.azure.com/dashboard/mstic/${config.source.toLowerCase()}-${process.toLowerCase()}`,
            grafanaUrl: `https://grafana.mstic.microsoft.com/d/pipeline-${config.source.toLowerCase()}`,
            healthCheckUrl: `https://healthcheck.mstic.microsoft.com/api/v1/pipelines/${config.source.toLowerCase()}/${process.toLowerCase()}`
          };

          pipelines.push(pipeline);
        });
      });
    });
  });

  // Create dependencies and simulate correlated failures
  createPipelineDependencies(pipelines);
  simulateCorrelatedFailures(pipelines);

  return pipelines;
}

function getRandomDate(daysBack: number = 7): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  return new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000));
}

export function generateMockAlerts(pipelines: Pipeline[]): Alert[] {
  const alerts: Alert[] = [];
  let idCounter = 1;

  // Organized alert categories for Microsoft MSTIC interview demo
  const alertCategories = {
    infrastructure: [
      {
        message: 'ThreatIntel pipeline failure - IOC ingestion stopped',
        description: 'Critical threat intelligence pipeline has failed 3 consecutive runs. Zero IOCs ingested in last 45 minutes. Downstream security tools affected.',
        severity: 'critical' as const,
        category: 'Infrastructure'
      },
      {
        message: 'High memory usage - LinkedIn analytics pipeline',
        description: 'Memory consumption at 94% for 12 minutes. Risk of OOM killer activation. Large dataset processing detected.',
        severity: 'high' as const,
        category: 'Infrastructure'
      },
      {
        message: 'API rate limit exceeded - Twitter feed',
        description: 'Twitter API rate limit reached (300 req/15min). Data ingestion throttled. Consider upgrading API tier.',
        severity: 'medium' as const,
        category: 'Infrastructure'
      }
    ],
    internalUser: [
      {
        message: 'Privilege escalation detected - Admin role granted',
        description: 'User john.doe@microsoft.com elevated to Global Admin at 02:30 AM. Unusual time detected. Previous role: Security Reader.',
        severity: 'high' as const,
        category: 'Internal User Security'
      },
      {
        message: 'Large data export - Threat intelligence download',
        description: 'User exported 2.3GB of classified threat intelligence data. Export size 10x larger than baseline.',
        severity: 'medium' as const,
        category: 'Internal User Security'
      }
    ],
    externalUser: [
      {
        message: 'Brute force detected - Multiple failed logins',
        description: 'Source IP 192.168.1.100 attempted 47 login failures in 5 minutes. Targeting admin accounts.',
        severity: 'high' as const,
        category: 'External Threat'
      },
      {
        message: 'Suspicious geolocation - Login from Iran',
        description: 'Admin user logged in from Tehran, Iran. Previous location: Tel Aviv, Israel (impossible travel time: 2 hours).',
        severity: 'critical' as const,
        category: 'External Threat'
      }
    ],
    aiAnomaly: [
      {
        message: 'Anomalous user behavior - Unusual access pattern',
        description: 'ML model detected 3.2 standard deviations from user baseline. Pattern: login → role change → bulk data access.',
        severity: 'medium' as const,
        category: 'AI/ML Anomaly'
      },
      {
        message: 'Data volume spike detected - 500% increase',
        description: 'Threat feed processing volume increased 5x without scheduled batch job. Possible data poisoning attack.',
        severity: 'high' as const,
        category: 'AI/ML Anomaly'
      }
    ],
    dataAccess: [
      {
        message: 'Sensitive data access - Classified threat actor profiles',
        description: 'Unauthorized access to CLASSIFIED threat actor database. User lacks required security clearance.',
        severity: 'critical' as const,
        category: 'Data Access'
      },
      {
        message: 'Query anomaly - SELECT * on production database',
        description: 'Full table scan detected on 50TB threat intelligence database. Query will impact production performance.',
        severity: 'high' as const,
        category: 'Data Access'
      }
    ],
    dataEngineering: [
      {
        message: 'Schema drift detected - Missing required fields',
        description: 'LinkedIn data source schema changed. Missing fields: threat_level, actor_attribution. 45% of records affected.',
        severity: 'high' as const,
        category: 'Data Quality'
      },
      {
        message: 'Duplicate records detected - 15% duplication rate',
        description: 'IOC deduplication threshold exceeded. Duplicate rate: 15.2% (threshold: 10%). Data quality compromised.',
        severity: 'medium' as const,
        category: 'Data Quality'
      },
      {
        message: 'Late arriving data - SLA breach imminent',
        description: 'Government threat feed delayed 4.2 hours. SLA requirement: <2 hours. Critical threat indicators may be missed.',
        severity: 'high' as const,
        category: 'Data Quality'
      }
    ],
    geopolitical: [
      {
        message: 'Nation-state threat detected - APT targeting',
        description: 'Iranian APT group "Charming Kitten" detected targeting Israeli infrastructure. Active campaign in progress.',
        severity: 'critical' as const,
        category: 'Geopolitical Threat'
      }
    ]
  };

  const alertTemplates: Array<{message: string, description: string, severity: 'low' | 'medium' | 'high' | 'critical', category: string}> = [
    ...alertCategories.infrastructure,
    ...alertCategories.internalUser,
    ...alertCategories.externalUser,
    ...alertCategories.aiAnomaly,
    ...alertCategories.dataAccess,
    ...alertCategories.dataEngineering,
    ...alertCategories.geopolitical
  ];

  const msticTeams = [
    { team: 'Threat Intelligence', contact: 'John Doe', email: 'john.doe@microsoft.com', slack: '#ti-ops' },
    { team: 'Security Analytics', contact: 'Jane Smith', email: 'jane.smith@microsoft.com', slack: '#sec-analytics' },
    { team: 'Incident Response', contact: 'Mike Johnson', email: 'mike.johnson@microsoft.com', slack: '#ir-team' },
    { team: 'Data Engineering', contact: 'Sarah Wilson', email: 'sarah.wilson@microsoft.com', slack: '#data-eng' },
    { team: 'Infrastructure', contact: 'David Brown', email: 'david.brown@microsoft.com', slack: '#infra-ops' }
  ];

  const generateEnhancedAlertData = (pipeline: Pipeline, severity: string, alertTemplate: typeof alertTemplates[0]) => {
    const team = msticTeams[Math.floor(Math.random() * msticTeams.length)];
    const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      logReferences: [
        {
          logSystem: 'azure_monitor' as const,
          logUrl: `https://portal.azure.com/#blade/Microsoft_Azure_Monitoring_Logs/LogsBlade/resourceId/${pipeline.id}`,
          correlationId,
          queryTemplate: `PipelineLogs | where CorrelationId == "${correlationId}" | order by TimeGenerated desc`,
          timeRange: { start: new Date(Date.now() - 24*60*60*1000), end: new Date() }
        },
        {
          logSystem: 'elasticsearch' as const,
          logUrl: `https://elasticsearch.internal.microsoft.com:9200/pipeline-logs-*/_search`,
          correlationId,
          queryTemplate: `GET /pipeline-logs-*/_search { "query": { "term": { "pipeline_id": "${pipeline.id}" } } }`,
          timeRange: { start: new Date(Date.now() - 24*60*60*1000), end: new Date() }
        }
      ],
      pointOfContact: {
        team: team.team,
        primaryContact: team.contact,
        email: team.email,
        slackChannel: team.slack,
        escalationPath: ['Team Lead', 'Engineering Manager', 'Director of Engineering', 'VP Engineering']
      },
      impactAssessment: {
        businessImpact: severity === 'critical' ? 'critical' : severity === 'high' ? 'high' : 'medium',
        affectedSystems: [`${pipeline.source} Data Pipeline`, 'Threat Intelligence Platform', 'Security Operations Center'] as string[],
        dataClassification: pipeline.source === 'Office365' || pipeline.source === 'AzureAD' ? 'restricted' : 'confidential',
        customerImpact: severity === 'critical' || severity === 'high'
      } as const,
      troubleshooting: {
        knownIssues: [
          'API rate limiting during peak hours',
          'Network connectivity issues with external data sources',
          'Memory spikes during large data processing batches'
        ],
        diagnosticQueries: [
          'SELECT * FROM pipeline_metrics WHERE pipeline_id = ? AND timestamp > NOW() - INTERVAL 1 HOUR',
          'SELECT error_count, error_type FROM error_logs WHERE pipeline_id = ? ORDER BY timestamp DESC LIMIT 10'
        ],
        relatedIncidents: [`INC-${Math.floor(Math.random() * 10000)}`, `INC-${Math.floor(Math.random() * 10000)}`],
        runbooks: [
          'https://docs.microsoft.com/mstic/runbooks/pipeline-troubleshooting',
          'https://docs.microsoft.com/mstic/runbooks/data-source-connectivity'
        ]
      },
      alertContext: {
        alertRule: `rule-${alertTemplate.category.toLowerCase().replace(/\s+/g, '-')}`,
        triggerCondition: severity === 'critical' ? 'failure_rate > 15%' : 'processing_time > 60min',
        threshold: severity === 'critical' ? 15 : 60,
        actualValue: severity === 'critical' ? Math.floor(Math.random() * 30) + 16 : Math.floor(Math.random() * 120) + 61,
        frequency: Math.floor(Math.random() * 10) + 1
      }
    };
  };

  // Create focused set of alerts - one for each major category
  alertTemplates.forEach((template, index) => {
    // Select appropriate pipeline based on alert type
    let selectedPipeline = pipelines[0]; // default
    
    if (template.category === 'Infrastructure' && template.message.includes('ThreatIntel')) {
      selectedPipeline = pipelines.find(p => p.source === 'ThreatIntel') || pipelines[0];
    } else if (template.category === 'Infrastructure' && template.message.includes('LinkedIn')) {
      selectedPipeline = pipelines.find(p => p.source === 'LinkedIn') || pipelines[0];
    } else if (template.category === 'Infrastructure' && template.message.includes('Twitter')) {
      selectedPipeline = pipelines.find(p => p.source === 'Twitter') || pipelines[0];
    } else if (template.category === 'External Threat' || template.category === 'Internal User Security') {
      selectedPipeline = pipelines.find(p => p.source === 'AzureAD') || pipelines[0];
    } else if (template.category === 'Data Access') {
      selectedPipeline = pipelines.find(p => p.source === 'Office365') || pipelines[0];
    } else if (template.category === 'Data Quality') {
      selectedPipeline = pipelines.find(p => p.source === 'LinkedIn') || pipelines[0];
    } else if (template.category === 'Geopolitical Threat') {
      selectedPipeline = pipelines.find(p => p.source === 'ThreatIntel') || pipelines[0];
    }

    const isResolved = index % 4 === 0; // 25% resolved for variety
    const timestamp = getRandomDate(1); // Within last day for relevance
    const enhancedData = generateEnhancedAlertData(selectedPipeline, template.severity, template);
    
    alerts.push({
      id: `alert-${idCounter++}`,
      pipelineId: selectedPipeline.id,
      severity: template.severity,
      message: template.message,
      description: template.description,
      category: template.category,
      timestamp,
      resolved: isResolved,
      resolvedAt: isResolved ? new Date(timestamp.getTime() + Math.random() * 4 * 60 * 60 * 1000) : undefined,
      acknowledgedBy: isResolved && Math.random() < 0.8 ? 'admin@microsoft.com' : undefined,
      actions: ['Investigate', 'Acknowledge', 'Escalate', 'Create Incident'],
      ...enhancedData
    });
  });

  // Add a few additional historical alerts for trend analysis
  for (let i = 0; i < 8; i++) {
    const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
    const pipeline = pipelines[Math.floor(Math.random() * pipelines.length)];
    const timestamp = getRandomDate(7);
    const enhancedData = generateEnhancedAlertData(pipeline, template.severity, template);
    
    alerts.push({
      id: `alert-${idCounter++}`,
      pipelineId: pipeline.id,
      severity: template.severity,
      message: template.message,
      description: template.description,
      category: template.category,
      timestamp,
      resolved: true,
      resolvedAt: new Date(timestamp.getTime() + Math.random() * 6 * 60 * 60 * 1000),
      acknowledgedBy: Math.random() < 0.8 ? 'admin@microsoft.com' : undefined,
      actions: ['Investigate', 'Acknowledge', 'Escalate', 'Create Incident'],
      ...enhancedData
    });
  }

  return alerts;
}

export function generateAlertRules(): AlertRule[] {
  return [
    {
      id: 'rule-infra-failure',
      name: 'Critical Pipeline Failure',
      description: 'Pipeline failure rate exceeds 15% or consecutive failures > 3',
      enabled: true,
      type: 'failure_rate',
      threshold: 15,
      severity: 'critical'
    },
    {
      id: 'rule-memory-high',
      name: 'High Memory Usage',
      description: 'Memory usage exceeds 90% for more than 10 minutes',
      enabled: true,
      type: 'threshold',
      threshold: 90,
      severity: 'high'
    },
    {
      id: 'rule-api-rate-limit',
      name: 'API Rate Limit Exceeded',
      description: 'External API rate limit reached - ingestion throttled',
      enabled: true,
      type: 'threshold',
      threshold: 100,
      severity: 'medium'
    },
    {
      id: 'rule-privilege-escalation',
      name: 'Unusual Privilege Escalation',
      description: 'Admin privileges granted outside business hours',
      enabled: true,
      type: 'threshold',
      threshold: 1,
      severity: 'high'
    },
    {
      id: 'rule-data-export-large',
      name: 'Large Data Export',
      description: 'Data export size exceeds 1GB threshold',
      enabled: true,
      type: 'threshold',
      threshold: 1024,
      severity: 'medium'
    },
    {
      id: 'rule-brute-force',
      name: 'Brute Force Attack',
      description: 'Multiple failed login attempts from single IP',
      enabled: true,
      type: 'threshold',
      threshold: 10,
      severity: 'high'
    },
    {
      id: 'rule-impossible-travel',
      name: 'Impossible Travel Detection',
      description: 'User login from geographically impossible location',
      enabled: true,
      type: 'threshold',
      threshold: 1,
      severity: 'critical'
    },
    {
      id: 'rule-ml-anomaly',
      name: 'ML Behavioral Anomaly',
      description: 'User behavior deviates >3 standard deviations from baseline',
      enabled: true,
      type: 'threshold',
      threshold: 3,
      severity: 'medium'
    },
    {
      id: 'rule-data-volume-spike',
      name: 'Unexpected Data Volume Spike',
      description: 'Data processing volume exceeds 200% of baseline',
      enabled: true,
      type: 'threshold',
      threshold: 200,
      severity: 'high'
    },
    {
      id: 'rule-sensitive-data-access',
      name: 'Unauthorized Sensitive Data Access',
      description: 'Access to classified/restricted data without clearance',
      enabled: true,
      type: 'threshold',
      threshold: 1,
      severity: 'critical'
    },
    {
      id: 'rule-full-table-scan',
      name: 'Performance-Impacting Query',
      description: 'Full table scan on production database detected',
      enabled: true,
      type: 'threshold',
      threshold: 1,
      severity: 'high'
    },
    {
      id: 'rule-schema-drift',
      name: 'Data Schema Drift',
      description: 'Schema changes affecting >25% of incoming records',
      enabled: true,
      type: 'threshold',
      threshold: 25,
      severity: 'high'
    },
    {
      id: 'rule-duplicate-data',
      name: 'Data Quality - Duplicates',
      description: 'Duplicate record threshold exceeded (>10%)',
      enabled: true,
      type: 'threshold',
      threshold: 10,
      severity: 'medium'
    },
    {
      id: 'rule-sla-breach',
      name: 'SLA Breach Imminent',
      description: 'Data processing delay approaching SLA limits',
      enabled: true,
      type: 'timeout',
      timeWindow: 120,
      severity: 'high'
    },
    {
      id: 'rule-nation-state-threat',
      name: 'Nation-State Threat Detection',
      description: 'Advanced persistent threat or nation-state activity detected',
      enabled: true,
      type: 'threshold',
      threshold: 1,
      severity: 'critical'
    }
  ];
}

export function generateAlertTrends(): AlertTrend[] {
  const trends: AlertTrend[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      critical: Math.floor(Math.random() * 5) + 1,
      high: Math.floor(Math.random() * 8) + 2,
      medium: Math.floor(Math.random() * 12) + 3,
      low: Math.floor(Math.random() * 15) + 5
    });
  }
  
  return trends;
}

export const mockPipelines = generateMockPipelines();
export const mockAlerts = generateMockAlerts(mockPipelines);
export const mockAlertRules = generateAlertRules();
export const mockAlertTrends = generateAlertTrends();
