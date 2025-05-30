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
