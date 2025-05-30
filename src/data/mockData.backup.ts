import type { Pipeline, PipelineStatus, PipelineSource, Alert, AlertRule, AlertTrend } from '../types';

// Enhanced pipeline configuration with realistic naming patterns
interface PipelineConfig {
  source: PipelineSource;
  dataTypes: string[];
  processes: string[];
  regions: string[];
  teams: string[];
  slaRequirements: number[];
  dataClassifications: ('Public' | 'Internal' | 'Confidential' | 'Secret')[];
}

const pipelineConfigs: PipelineConfig[] = [
  {
    source: 'LinkedIn',
    dataTypes: ['ProfileData', 'CompanyIntel', 'NetworkGraph', 'ThreatActors', 'JobPostings', 'SkillsData'],
    processes: ['Ingestion', 'Enrichment', 'Analysis', 'Monitoring', 'Classification'],
    regions: ['US', 'EU', 'APAC'],
    teams: ['Threat Intelligence', 'Social Media Analytics', 'OSINT'],
    slaRequirements: [60, 120, 240],
    dataClassifications: ['Internal', 'Confidential']
  },
  {
    source: 'Twitter',
    dataTypes: ['ThreatFeeds', 'SentimentData', 'HashtagIntel', 'AccountData', 'TrendAnalysis', 'BotDetection'],
    processes: ['Ingestion', 'Processing', 'Enrichment', 'RealTimeAnalysis', 'HistoricalAnalysis'],
    regions: ['US', 'EU', 'APAC', 'Global'],
    teams: ['Threat Intelligence', 'Social Media Analytics', 'Real-time Monitoring'],
    slaRequirements: [30, 60, 120],
    dataClassifications: ['Public', 'Internal', 'Confidential']
  },
  {
    source: 'Office365',
    dataTypes: ['EmailIntel', 'CalendarData', 'DocumentMetadata', 'UserActivity', 'SecurityLogs', 'ComplianceData'],
    processes: ['Ingestion', 'Monitoring', 'Analysis', 'Compliance', 'Security'],
    regions: ['US', 'EU'],
    teams: ['Enterprise Security', 'Compliance', 'Productivity Analytics'],
    slaRequirements: [15, 30, 60],
    dataClassifications: ['Confidential', 'Secret']
  },
  {
    source: 'AzureAD',
    dataTypes: ['IdentityData', 'SignInLogs', 'RiskEvents', 'GroupData', 'AccessLogs', 'AuditTrails'],
    processes: ['Ingestion', 'RiskAnalysis', 'Monitoring', 'Compliance', 'SecurityAnalysis'],
    regions: ['US', 'EU', 'Global'],
    teams: ['Identity Security', 'Access Management', 'Risk Assessment'],
    slaRequirements: [15, 30, 60],
    dataClassifications: ['Confidential', 'Secret']
  },
  {
    source: 'GitHub',
    dataTypes: ['RepoIntel', 'CommitData', 'IssueTracking', 'SecurityAlerts', 'UserActivity', 'CodeAnalysis'],
    processes: ['Ingestion', 'Analysis', 'SecurityScanning', 'Monitoring', 'Compliance'],
    regions: ['US', 'EU', 'Global'],
    teams: ['DevSec', 'Code Intelligence', 'Repository Security'],
    slaRequirements: [60, 120, 240],
    dataClassifications: ['Public', 'Internal', 'Confidential']
  },
  {
    source: 'ThreatIntel',
    dataTypes: ['IOCFeeds', 'MalwareIntel', 'ThreatActors', 'APTCampaigns', 'VulnData', 'DarkWebIntel'],
    processes: ['Ingestion', 'Enrichment', 'Analysis', 'Correlation', 'Attribution'],
    regions: ['Global', 'US', 'EU'],
    teams: ['Threat Intelligence', 'Malware Analysis', 'APT Tracking'],
    slaRequirements: [15, 30, 60],
    dataClassifications: ['Confidential', 'Secret']
  },
  {
    source: 'Exchange',
    dataTypes: ['MessageTracking', 'TransportRules', 'SecurityLogs', 'ComplianceData', 'MailboxData', 'AntiSpamLogs'],
    processes: ['Ingestion', 'Monitoring', 'Security', 'Compliance', 'Analysis'],
    regions: ['US', 'EU'],
    teams: ['Exchange Security', 'Email Security', 'Compliance'],
    slaRequirements: [15, 30, 60],
    dataClassifications: ['Confidential', 'Secret']
  },
  {
    source: 'Teams',
    dataTypes: ['MeetingData', 'ChatLogs', 'FileActivity', 'CallAnalytics', 'AppUsage', 'SecurityEvents'],
    processes: ['Ingestion', 'Monitoring', 'Analysis', 'Compliance', 'Security'],
    regions: ['US', 'EU', 'APAC'],
    teams: ['Teams Security', 'Collaboration Analytics', 'Compliance'],
    slaRequirements: [30, 60, 120],
    dataClassifications: ['Internal', 'Confidential']
  },
  {
    source: 'SharePoint',
    dataTypes: ['SiteIntel', 'DocumentData', 'PermissionAudits', 'UserActivity', 'ComplianceData', 'SearchAnalytics'],
    processes: ['Ingestion', 'Monitoring', 'Analysis', 'Compliance', 'Security'],
    regions: ['US', 'EU', 'APAC'],
    teams: ['SharePoint Security', 'Content Management', 'Compliance'],
    slaRequirements: [60, 120, 240],
    dataClassifications: ['Internal', 'Confidential', 'Secret']
  },
  {
    source: 'PowerBI',
    dataTypes: ['UsageAnalytics', 'DatasetMetrics', 'ReportIntel', 'CapacityMetrics', 'SecurityAudits', 'TenantAnalytics'],
    processes: ['Ingestion', 'Monitoring', 'Analysis', 'Performance', 'Security'],
    regions: ['US', 'EU', 'APAC', 'Global'],
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
const maintenanceWindows = {
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
  'Data Governance': 'Sundays 03:00-05:00 UTC'
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
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
  const sourceToEnrichment = new Map<string, Pipeline[]>();
  const enrichmentToAnalysis = new Map<string, Pipeline[]>();
  
  pipelines.forEach(pipeline => {
    const { source, process, dataType } = pipeline;
    const key = `${source}_${dataType}`;
    
    if (process === 'Ingestion') {
      if (!sourceToEnrichment.has(key)) sourceToEnrichment.set(key, []);
    } else if (process === 'Enrichment') {
      if (!enrichmentToAnalysis.has(key)) enrichmentToAnalysis.set(key, []);
      enrichmentToAnalysis.get(key)!.push(pipeline);
    }
  });
  
  // Set up dependencies: Ingestion -> Enrichment -> Analysis
  pipelines.forEach(pipeline => {
    const { source, process, dataType } = pipeline;
    const key = `${source}_${dataType}`;
    
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
    'Phishing Detection',
    'Domain Reputation',
    'IP Intelligence',
    'Hash Analysis',
    'YARA Rule Processing',
    'Threat Hunting Analytics',
    'Indicator Enrichment',
    'Attribution Analysis',
    'Threat Landscape Mapping'
  ],
  Exchange: [
    'Exchange Message Tracking',
    'Exchange Transport Rules',
    'Exchange Security Monitoring',
    'Exchange Calendar Intelligence',
    'Exchange Mobile Device',
    'Exchange Mailbox Analysis',
    'Exchange Anti-Spam',
    'Exchange DLP Monitoring',
    'Exchange Compliance Center',
    'Exchange Journaling',
    'Exchange Public Folders',
    'Exchange Hybrid Analytics',
    'Exchange Protection Service',
    'Exchange Admin Audit',
    'Exchange Message Trace',
    'Exchange Connection Filtering'
  ],
  Teams: [
    'Teams Meeting Intelligence',
    'Teams Chat Analysis',
    'Teams File Sharing',
    'Teams Channel Monitoring',
    'Teams Call Analytics',
    'Teams App Usage',
    'Teams Security Compliance',
    'Teams Guest Access',
    'Teams Phone System',
    'Teams Live Events',
    'Teams Recording Analysis',
    'Teams Presence Intelligence',
    'Teams Integration Monitoring',
    'Teams Policy Compliance',
    'Teams External Access',
    'Teams Device Analytics'
  ],
  SharePoint: [
    'SharePoint Site Intelligence',
    'SharePoint Document Analysis',
    'SharePoint Permission Audit',
    'SharePoint Search Analytics',
    'SharePoint Version Control',
    'SharePoint Workflow Monitoring',
    'SharePoint External Sharing',
    'SharePoint Content Types',
    'SharePoint List Intelligence',
    'SharePoint Library Analysis',
    'SharePoint User Activity',
    'SharePoint Compliance Center',
    'SharePoint Migration Analytics',
    'SharePoint App Monitoring',
    'SharePoint Taxonomy Intelligence',
    'SharePoint Hub Site Analytics'
  ],
  PowerBI: [
    'PowerBI Usage Analytics',
    'PowerBI Dataset Monitoring',
    'PowerBI Report Intelligence',
    'PowerBI Dashboard Analysis',
    'PowerBI Gateway Monitoring',
    'PowerBI Workspace Analytics',
    'PowerBI Data Refresh',
    'PowerBI Security Audit',
    'PowerBI Capacity Monitoring',
    'PowerBI App Analytics',
    'PowerBI Dataflow Intelligence',
    'PowerBI Premium Metrics',
    'PowerBI Tenant Analytics',
    'PowerBI Sharing Intelligence',
    'PowerBI Performance Monitoring',
    'PowerBI Embedding Analytics'
  ]
};

function getRandomStatus(): PipelineStatus {
  const weights = { healthy: 0.6, warning: 0.2, processing: 0.15, failed: 0.05 };
  const random = Math.random();
  
  if (random < weights.healthy) return 'healthy';
  if (random < weights.healthy + weights.warning) return 'warning';
  if (random < weights.healthy + weights.warning + weights.processing) return 'processing';
  return 'failed';
}

function getRandomDate(daysBack: number = 7): Date {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const randomHours = Math.floor(Math.random() * 24);
  const randomMinutes = Math.floor(Math.random() * 60);
  
  return new Date(now.getTime() - (randomDays * 24 * 60 * 60 * 1000) - (randomHours * 60 * 60 * 1000) - (randomMinutes * 60 * 1000));
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
            maintenanceWindow: maintenanceWindows[team]
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
          actions: ['Investigate', 'Acknowledge', 'Dismiss']
        });
      }
    });

  // Add some additional resolved alerts for history
  for (let i = 0; i < 15; i++) {
    const pipelineId = pipelines[Math.floor(Math.random() * pipelines.length)].id;
    const messageIndex = Math.floor(Math.random() * alertMessages.length);
    const timestamp = getRandomDate(7);
    
    alerts.push({
      id: `alert-${idCounter++}`,
      pipelineId,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      message: alertMessages[messageIndex],
      description: descriptions[messageIndex],
      timestamp,
      resolved: true,
      resolvedAt: new Date(timestamp.getTime() + Math.random() * 2 * 24 * 60 * 60 * 1000),
      acknowledgedBy: Math.random() < 0.8 ? 'admin@microsoft.com' : undefined,
      actions: ['Investigate', 'Acknowledge', 'Dismiss']
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
