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
  ],
  'AUTH_EXPIRED': [
    'OAuth token expired for LinkedIn connection',
    'API key authentication failed for Twitter',
    'Service principal credentials expired for AzureAD',
    'App registration certificate expired',
  ],
  'NETWORK_TIMEOUT': [
    'Connection timeout to external API (30s)',
    'Network latency exceeded threshold (5s)',
    'DNS resolution failed for endpoint',
    'SSL handshake timeout',
  ],
  'DATA_QUALITY': [
    'Invalid JSON format in response payload',
    'Missing required fields in 45% of records',
    'Data schema validation failed',
    'Duplicate records detected (threshold: 10%)',
    'Encoding issues in UTF-8 conversion',
  ],
  'RESOURCE_EXHAUSTION': [
    'Memory usage exceeded 4GB limit',
    'Disk space insufficient for processing',
    'CPU usage at 100% for >5 minutes',
    'Database connection pool exhausted',
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
  if (status !== 'failed') return undefined;
  
  let reasonCategory: string;
  
  // Source-specific failure patterns
  switch (source) {
    case 'LinkedIn':
    case 'Twitter':
      reasonCategory = Math.random() < 0.6 ? 'API_RATE_LIMIT' : 'AUTH_EXPIRED';
      break;
    case 'AzureAD':
    case 'Office365':
      reasonCategory = Math.random() < 0.5 ? 'AUTH_EXPIRED' : 'NETWORK_TIMEOUT';
      break;
    case 'ThreatIntel':
      reasonCategory = Math.random() < 0.4 ? 'DATA_QUALITY' : 'NETWORK_TIMEOUT';
      break;
    default:
      reasonCategory = getRandomElement(['NETWORK_TIMEOUT', 'DATA_QUALITY', 'RESOURCE_EXHAUSTION']);
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

  // Generate pipelines using the enhanced configuration
  pipelineConfigs.forEach(config => {
    config.dataTypes.forEach(dataType => {
      config.processes.forEach(process => {
        config.regions.forEach(region => {
          // Create pipeline name following the convention: "{Source}{DataType}{Process}_{Region}"
          const name = `${config.source}_${dataType}_${process}_${region}`;
          const status = getRealisticStatus(config, dataType, process);
          const lastRun = getRealisticLastRun(status);
          const team = getRandomElement(config.teams);
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

  const alertMessages = [
    'High failure rate detected',
    'Processing time exceeded threshold',
    'Data source unavailable',
    'Authentication failure',
    'Memory usage critical',
    'Disk space running low',
    'Network connectivity issues',
    'Rate limit exceeded',
    'Suspicious activity detected',
    'Data quality issues found'
  ];

  const descriptions = [
    'Pipeline has exceeded the configured failure rate threshold of 10%',
    'Average processing time has exceeded 60 minutes for the last 3 consecutive runs',
    'Unable to connect to data source for more than 30 minutes',
    'Authentication credentials have expired or are invalid',
    'Memory usage has exceeded 90% for more than 15 minutes',
    'Available disk space is below 10% threshold',
    'Network latency has exceeded acceptable limits',
    'API rate limit has been exceeded, throttling requests',
    'Unusual patterns detected in data processing',
    'Data validation checks have failed multiple times'
  ];

  const msticTeams = [
    { team: 'Threat Intelligence', contact: 'John Doe', email: 'john.doe@microsoft.com', slack: '#ti-ops' },
    { team: 'Security Analytics', contact: 'Jane Smith', email: 'jane.smith@microsoft.com', slack: '#sec-analytics' },
    { team: 'Incident Response', contact: 'Mike Johnson', email: 'mike.johnson@microsoft.com', slack: '#ir-team' },
    { team: 'Data Engineering', contact: 'Sarah Wilson', email: 'sarah.wilson@microsoft.com', slack: '#data-eng' },
    { team: 'Infrastructure', contact: 'David Brown', email: 'david.brown@microsoft.com', slack: '#infra-ops' }
  ];

  const generateEnhancedAlertData = (pipeline: Pipeline, severity: string, messageIndex: number) => {
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
        affectedSystems: [`${pipeline.source} Data Pipeline`, 'Threat Intelligence Platform', 'Security Operations Center'],
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
        alertRule: `rule-${messageIndex + 1}`,
        triggerCondition: severity === 'critical' ? 'failure_rate > 15%' : 'processing_time > 60min',
        threshold: severity === 'critical' ? 15 : 60,
        actualValue: severity === 'critical' ? Math.floor(Math.random() * 30) + 16 : Math.floor(Math.random() * 120) + 61,
        frequency: Math.floor(Math.random() * 10) + 1
      }
    };
  };

  // Generate alerts for failed and warning pipelines
  pipelines
    .filter(p => p.status === 'failed' || p.status === 'warning')
    .forEach(pipeline => {
      if (Math.random() < 0.7) { // 70% chance of having an alert
        const severity = pipeline.status === 'failed' ? 
          (Math.random() < 0.5 ? 'critical' : 'high') :
          (Math.random() < 0.5 ? 'medium' : 'low');
        
        const messageIndex = Math.floor(Math.random() * alertMessages.length);
        const isResolved = Math.random() < 0.3; // 30% chance of being resolved
        const timestamp = getRandomDate(3);
        const enhancedData = generateEnhancedAlertData(pipeline, severity, messageIndex);
        
        alerts.push({
          id: `alert-${idCounter++}`,
          pipelineId: pipeline.id,
          severity: severity as 'low' | 'medium' | 'high' | 'critical',
          message: alertMessages[messageIndex],
          description: descriptions[messageIndex],
          timestamp,
          resolved: isResolved,
          resolvedAt: isResolved ? new Date(timestamp.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000) : undefined,
          acknowledgedBy: isResolved && Math.random() < 0.8 ? 'admin@microsoft.com' : undefined,
          actions: ['Investigate', 'Acknowledge', 'Dismiss'],
          ...enhancedData
        });
      }
    });

  // Add some additional resolved alerts for history
  for (let i = 0; i < 15; i++) {
    const pipeline = pipelines[Math.floor(Math.random() * pipelines.length)];
    const messageIndex = Math.floor(Math.random() * alertMessages.length);
    const timestamp = getRandomDate(7);
    const severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
    const enhancedData = generateEnhancedAlertData(pipeline, severity, messageIndex);
    
    alerts.push({
      id: `alert-${idCounter++}`,
      pipelineId: pipeline.id,
      severity: severity as any,
      message: alertMessages[messageIndex],
      description: descriptions[messageIndex],
      timestamp,
      resolved: true,
      resolvedAt: new Date(timestamp.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000),
      acknowledgedBy: Math.random() < 0.8 ? 'admin@microsoft.com' : undefined,
      actions: ['Investigate', 'Acknowledge', 'Dismiss'],
      ...enhancedData
    });
  }

  return alerts;
}

export function generateAlertRules(): AlertRule[] {
  return [
    {
      id: 'rule-1',
      name: 'Pipeline Failure Rate',
      description: 'Pipeline failure rate exceeds 10%',
      enabled: true,
      type: 'failure_rate',
      threshold: 10,
      severity: 'high'
    },
    {
      id: 'rule-2',
      name: 'No Data Received',
      description: 'No data received for more than 30 minutes',
      enabled: true,
      type: 'timeout',
      timeWindow: 30,
      severity: 'critical'
    },
    {
      id: 'rule-3',
      name: 'Processing Time Threshold',
      description: 'Processing time exceeds 60 minutes',
      enabled: true,
      type: 'threshold',
      threshold: 60,
      severity: 'medium'
    },
    {
      id: 'rule-4',
      name: 'Memory Usage Critical',
      description: 'Memory usage exceeds 90%',
      enabled: false,
      type: 'threshold',
      threshold: 90,
      severity: 'critical'
    },
    {
      id: 'rule-5',
      name: 'Disk Space Low',
      description: 'Available disk space below 10%',
      enabled: true,
      type: 'threshold',
      threshold: 10,
      severity: 'high'
    },
    {
      id: 'rule-6',
      name: 'Authentication Failures',
      description: 'Multiple authentication failures detected',
      enabled: true,
      type: 'threshold',
      threshold: 5,
      severity: 'medium'
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
