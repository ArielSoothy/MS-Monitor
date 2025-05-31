export type PipelineStatus = 'healthy' | 'warning' | 'failed' | 'processing';

export type PipelineSource = 
  | 'LinkedIn' 
  | 'Twitter' 
  | 'Office365' 
  | 'AzureAD' 
  | 'GitHub' 
  | 'ThreatIntel' 
  | 'Exchange' 
  | 'Teams' 
  | 'SharePoint' 
  | 'PowerBI';

// Enhanced error tracking and monitoring interfaces
export interface ErrorDetails {
  errorCode: string;
  errorMessage: string;
  stackTrace?: string;
  errorType: 'connection' | 'data_quality' | 'timeout' | 'authentication' | 'rate_limit' | 'parsing' | 'validation' | 'infrastructure';
  timestamp: Date;
  context?: Record<string, any>;
  suggestedActions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface LogReference {
  logSystem: 'azure_monitor' | 'elasticsearch' | 'splunk' | 'cloudwatch';
  logUrl: string;
  queryTemplate?: string;
  correlationId: string;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface MetricHistory {
  timestamp: Date;
  recordsPerSecond: number;
  avgProcessingTime: number;
  errorRate: number;
  dataQuality: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

export interface ImpactAnalysis {
  affectedDownstreamPipelines: string[];
  affectedDestinations: string[];
  estimatedDataLoss: number;
  businessImpactLevel: 'low' | 'medium' | 'high' | 'critical';
  recoveryTimeEstimate: number; // in minutes
}

export interface RunbookReference {
  title: string;
  url: string;
  description: string;
  estimatedResolutionTime: number; // in minutes
}

export interface Pipeline {
  id: string;
  name: string;
  source: PipelineSource;
  status: PipelineStatus;
  lastRun: Date;
  avgProcessingTime: number; // in minutes
  recordsProcessed: number;
  failureRate: number; // percentage
  description?: string;
  // Enhanced metadata
  ownerTeam: string;
  slaRequirement: number; // in minutes
  dataClassification: 'Public' | 'Internal' | 'Confidential' | 'Secret';
  region: 'US' | 'EU' | 'APAC' | 'Global';
  dataType: string;
  process: string;
  lastFailureReason?: string;
  maintenanceWindow?: string;
  dependsOn?: string[]; // Pipeline IDs this depends on
  
  // Enhanced error tracking and monitoring
  currentError?: ErrorDetails;
  errorHistory: ErrorDetails[];
  logReferences: LogReference[];
  metricsHistory: MetricHistory[];
  impactAnalysis?: ImpactAnalysis;
  runbooks: RunbookReference[];
  alertingEnabled: boolean;
  oncallTeam: string;
  slackChannel?: string;
  teamsChannel?: string;
  dashboardUrl?: string;
  grafanaUrl?: string;
  healthCheckUrl?: string;
}

export interface Alert {
  id: string;
  pipelineId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  description?: string;
  actions?: string[];
  // Enhanced enterprise features
  logReferences: LogReference[];
  pointOfContact: {
    team: string;
    primaryContact: string;
    email: string;
    slackChannel?: string;
    escalationPath: string[];
  };
  impactAssessment: {
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    affectedSystems: string[];
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    customerImpact: boolean;
  };
  troubleshooting: {
    knownIssues: string[];
    diagnosticQueries: string[];
    relatedIncidents: string[];
    runbooks: string[];
  };
  alertContext: {
    alertRule: string;
    triggerCondition: string;
    threshold: number;
    actualValue: number;
    frequency: number; // How many times this has occurred
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'threshold' | 'timeout' | 'failure_rate';
  threshold?: number;
  timeWindow?: number; // in minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlertTrend {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface DataLineageNode {
  id: string;
  name: string;
  type: 'source' | 'pipeline' | 'destination';
  x: number;
  y: number;
}

export interface DataLineageConnection {
  from: string;
  to: string;
}

// Pipeline Health Prediction Types
export interface PredictionFeatures {
  hoursSinceLastRun: number;
  avgFailureRate: number;
  dataVolumeVariance: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hourOfDay: number; // 0-23
}

export interface HistoricalRecord extends PredictionFeatures {
  pipelineId: string;
  timestamp: Date;
  willFailInNext2Hours: boolean;
}

export interface DecisionNode {
  feature?: keyof PredictionFeatures;
  threshold?: number;
  left?: DecisionNode;
  right?: DecisionNode;
  prediction?: boolean;
  confidence?: number;
  sampleCount?: number;
}

export interface PipelinePrediction {
  pipelineId: string;
  pipelineName: string;
  willFail: boolean;
  confidence: number;
  riskScore: number; // 0-100
  reasoning: string[];
  features: PredictionFeatures;
  lastUpdated: Date;
}

export interface DecisionTreeModel {
  tree: DecisionNode;
  accuracy: number;
  trainingDate: Date;
  featureImportance: Record<keyof PredictionFeatures, number>;
}

// AI Agent Investigation System Types
export type AgentStatus = 'idle' | 'investigating' | 'reporting' | 'monitoring';

export interface AgentTrigger {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    failureThreshold?: number;
    timeWindow?: number; // minutes
    patternType?: 'multiple_failures' | 'unusual_patterns' | 'cascade_failures' | 'performance_degradation';
    sourcePatterns?: string[];
  };
}

export interface InvestigationStep {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  status: 'completed' | 'in_progress' | 'failed';
  data?: any;
}

export interface InvestigationFinding {
  id: string;
  timestamp: Date;
  type: 'pattern' | 'correlation' | 'anomaly' | 'root_cause' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedPipelines: string[];
  evidence: string[];
  suggestedActions: string[];
}

export interface Investigation {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  trigger: AgentTrigger;
  triggerData: any;
  steps: InvestigationStep[];
  findings: InvestigationFinding[];
  summary?: string;
  recommendations: string[];
  affectedPipelines: string[];
  estimatedImpact: {
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedSources: string[];
    estimatedDowntime?: number; // minutes
  };
}

export interface AgentState {
  status: AgentStatus;
  currentInvestigation?: Investigation;
  recentInvestigations: Investigation[];
  triggers: AgentTrigger[];
  findings: InvestigationFinding[];
  activityLog: InvestigationStep[];
  lastActivity: Date;
  investigationsToday: number;
  meanTimeToResolution: number; // minutes
}
