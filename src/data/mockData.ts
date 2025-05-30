import type { Pipeline, PipelineStatus, PipelineSource, Alert, AlertRule, AlertTrend } from '../types';

const pipelineNames: Record<PipelineSource, string[]> = {
  LinkedIn: [
    'LinkedIn Profile Intelligence',
    'LinkedIn Company Analysis',
    'LinkedIn Network Mapping',
    'LinkedIn Threat Actor Tracking',
    'LinkedIn Job Posting Analysis',
    'LinkedIn Skills Intelligence',
    'LinkedIn Industry Trends',
    'LinkedIn Executive Tracking',
    'LinkedIn Recruitment Intelligence',
    'LinkedIn Content Analysis',
    'LinkedIn Group Monitoring',
    'LinkedIn Connection Analysis',
    'LinkedIn Endorsement Tracking',
    'LinkedIn Activity Feed Processing',
    'LinkedIn Messaging Intelligence',
    'LinkedIn Sales Navigator Data'
  ],
  Twitter: [
    'Twitter Threat Intelligence',
    'Twitter Sentiment Analysis',
    'Twitter Hashtag Monitoring',
    'Twitter Account Surveillance',
    'Twitter Trend Analysis',
    'Twitter Bot Detection',
    'Twitter Influence Mapping',
    'Twitter Geolocation Tracking',
    'Twitter Media Analysis',
    'Twitter Conversation Threading',
    'Twitter Mention Monitoring',
    'Twitter DM Intelligence',
    'Twitter List Analysis',
    'Twitter Follower Network',
    'Twitter Real-time Stream',
    'Twitter Archive Processing'
  ],
  Office365: [
    'Office365 Email Intelligence',
    'Office365 Calendar Analysis',
    'Office365 Document Tracking',
    'Office365 User Activity Monitoring',
    'Office365 SharePoint Intelligence',
    'Office365 OneDrive Analysis',
    'Office365 Teams Communication',
    'Office365 Security Alerts',
    'Office365 Compliance Monitoring',
    'Office365 Exchange Logs',
    'Office365 PowerBI Usage',
    'Office365 Yammer Analysis',
    'Office365 Flow Automation',
    'Office365 Forms Intelligence',
    'Office365 Planner Tracking',
    'Office365 Delve Insights'
  ],
  AzureAD: [
    'AzureAD Identity Intelligence',
    'AzureAD Sign-in Analysis',
    'AzureAD Risk Detection',
    'AzureAD Group Membership',
    'AzureAD Application Access',
    'AzureAD Conditional Access',
    'AzureAD Privileged Identity',
    'AzureAD Device Registration',
    'AzureAD B2B Collaboration',
    'AzureAD Authentication Logs',
    'AzureAD Directory Sync',
    'AzureAD Audit Trails',
    'AzureAD Password Protection',
    'AzureAD Identity Protection',
    'AzureAD Access Reviews',
    'AzureAD Domain Services'
  ],
  GitHub: [
    'GitHub Repository Intelligence',
    'GitHub Commit Analysis',
    'GitHub Issue Tracking',
    'GitHub Pull Request Monitoring',
    'GitHub User Activity',
    'GitHub Organization Analysis',
    'GitHub Security Alerts',
    'GitHub Code Scanning',
    'GitHub Dependency Tracking',
    'GitHub Actions Intelligence',
    'GitHub Package Registry',
    'GitHub Project Management',
    'GitHub Wiki Analysis',
    'GitHub Release Monitoring',
    'GitHub Collaboration Insights',
    'GitHub Enterprise Analytics'
  ],
  ThreatIntel: [
    'IOC Feed Processing',
    'Malware Analysis Pipeline',
    'Threat Actor Profiling',
    'APT Campaign Tracking',
    'STIX/TAXII Integration',
    'CVE Intelligence',
    'Dark Web Monitoring',
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

  Object.entries(pipelineNames).forEach(([source, names]) => {
    names.forEach(name => {
      const status = getRandomStatus();
      const lastRun = getRandomDate();
      const avgProcessingTime = Math.floor(Math.random() * 120) + 5; // 5-125 minutes
      const recordsProcessed = Math.floor(Math.random() * 100000) + 1000;
      const failureRate = status === 'failed' ? Math.random() * 20 + 10 : Math.random() * 5;

      pipelines.push({
        id: `pipeline-${idCounter++}`,
        name,
        source: source as PipelineSource,
        status,
        lastRun,
        avgProcessingTime,
        recordsProcessed,
        failureRate: Math.round(failureRate * 100) / 100
      });
    });
  });

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
