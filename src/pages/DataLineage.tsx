import { useState, useRef, memo, useMemo, useEffect } from 'react';
import {
  Database,
  ArrowRight,
  GitBranch,
  Search,
  Activity,
  Clock,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  HelpCircle,
  X,
  Maximize2,
  Minimize2,
  Server,
  Shield,
  Cpu,
  HardDrive
} from 'lucide-react';
import { mockPipelines } from '../data/mockData';
import type { PipelineSource, PipelineStatus } from '../types';
import ErrorDetailsModal from '../components/ErrorDetailsModal';
import HowItWorksModal from '../components/HowItWorksModal';
import ChallengesModal from '../components/ChallengesModal';
import styles from './DataLineage.module.css';

interface LineageNode {
  id: string;
  name: string;
  type: 'source' | 'ingestion' | 'transformation' | 'enrichment' | 'destination';
  source?: PipelineSource;
  x: number;
  y: number;
  status: PipelineStatus;
  recordsPerSecond: number;
  avgProcessingTime: number;
  connections: string[];
  description: string;
  lastUpdate: string;
  dataQuality: number;
  actualPipeline?: any; // Reference to actual pipeline for dependencies
  destinationTypes?: string[]; // For destination routing logic
  priority?: number; // For destination priority
  // Enhanced error tracking
  hasErrors?: boolean;
  errorCount?: number;
  pipelineData?: any; // Full pipeline data for error modal
  // Microsoft Technology Stack Details
  technology: string; // Specific Microsoft service (Azure Data Factory, Event Hubs, etc.)
  resourceGroup: string;
  subscriptionId: string;
  region: string;
  computeType?: string; // For processing nodes
  storageType?: string; // For destination nodes
  throughputUnits?: number; // For Event Hubs
  partitionCount?: number;
  retentionDays?: number;
  protocols?: string[]; // HTTPS, AMQP, Kafka, etc.
  authentication?: string; // Managed Identity, Service Principal, etc.
  monitoring?: {
    applicationInsights?: string;
    logAnalyticsWorkspace?: string;
    kustoCluster?: string;
    alertRules?: string[];
  };
  dependencies?: {
    keyVault?: string;
    serviceAccounts?: string[];
    externalApis?: string[];
    networkConnections?: string[];
  };
  // Enhanced operational information for MSTIC engineers
  processingMode?: 'batch' | 'streaming' | 'micro-batch' | 'hybrid';
  dataMovementTool?: string;
  batchFrequency?: string;
  streamingLatency?: string;
  dataFormat?: string[];
  compressionType?: string;
  slaMetrics?: {
    uptime: number; // percentage
    targetUptime: number; // percentage
    mttr: number; // minutes
    mtbf: number; // hours
  };
  operationalInfo?: {
    owner: string; // Team responsible
    escalationPath: string[]; // Contact hierarchy
    maintenanceWindow: string; // When updates occur
    criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    complianceRequirements: string[]; // GDPR, SOX, etc.
  };
  performanceMetrics?: {
    avgLatency: number; // ms
    p95Latency: number; // ms
    errorRate: number; // percentage
    throughputMbps: number;
    cpuUtilization: number; // percentage
    memoryUtilization: number; // percentage
  };
  troubleshooting?: {
    commonIssues: string[];
    runbookUrls: string[];
    logQuerySamples: string[];
    healthCheckEndpoints: string[];
  };
  // Interview scenario details (for demo purposes)
  scenarioDetails?: {
    problem: string;
    solution: string;
    sourceFormat: string;
    targetSystem: string;
    volumePerHour: string;
    fieldFilter: string;
    triggerCondition: string;
  };
  stagingDetails?: {
    tableName: string;
    partitionStrategy: string;
    retentionPolicy: string;
    compressionRatio: string;
    indexStrategy: string;
  };
}

interface DataConnection {
  id: string;
  from: string;
  to: string;
  volume: 'low' | 'medium' | 'high';
  health: 'healthy' | 'warning' | 'error';
  animated: boolean;
}const DataLineage = memo(() => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<PipelineSource | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<LineageNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  // New popup states
  const [showNodePopup, setShowNodePopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [popupExpanded, setPopupExpanded] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Create a stable random number generator for consistent data
  const seededRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to 0-1 range
    return Math.abs(hash) / 2147483647;
  };

  // Generate comprehensive lineage data with stable randomization
  const generateLineageData = () => {
    const nodes: LineageNode[] = [];
    const connections: DataConnection[] = [];
    
    // Data sources (left side)
    const sources: PipelineSource[] = ['LinkedIn', 'Twitter', 'Office365', 'AzureAD', 'GitHub', 'ThreatIntel', 'Exchange', 'Teams', 'SharePoint', 'PowerBI'];
    sources.forEach((source, index) => {
      const statusSeed = seededRandom(`${source}-status`);
      const statusOptions: PipelineStatus[] = ['healthy', 'warning', 'failed'];
      const status = statusOptions[Math.floor(statusSeed * statusOptions.length)];
      
      // Find a pipeline from this source to use for error data
      const sourcePipelines = mockPipelines.filter(p => p.source === source);
      const sourcePipeline = sourcePipelines.length > 0 ? sourcePipelines[0] : null;
      
      nodes.push({
        id: `source-${source}`,
        name: source,
        type: 'source',
        source,
        x: 50,
        y: 80 + index * 70,
        status,
        recordsPerSecond: Math.floor(seededRandom(`${source}-records`) * 1000) + 100,
        avgProcessingTime: Math.floor(seededRandom(`${source}-time`) * 500) + 50,
        connections: [],
        description: `Data ingestion from ${source} platform`,
        lastUpdate: new Date(Date.now() - seededRandom(`${source}-update`) * 3600000).toISOString(),
        dataQuality: Math.floor(seededRandom(`${source}-quality`) * 20) + 80,
        pipelineData: sourcePipeline, // Add pipeline data for error modal
        hasErrors: status === 'failed' || status === 'warning',
        errorCount: sourcePipeline?.errorHistory?.length || (status === 'failed' ? 3 : status === 'warning' ? 1 : 0),
        // Microsoft Technology Stack Details
        technology: source === 'Office365' || source === 'Exchange' || source === 'Teams' || source === 'SharePoint' ? 'Microsoft Graph API' :
                   source === 'AzureAD' ? 'Azure Active Directory Logs' :
                   source === 'LinkedIn' || source === 'Twitter' ? 'Azure Event Hubs' :
                   source === 'GitHub' ? 'GitHub REST API → Azure Logic Apps' :
                   source === 'ThreatIntel' ? 'Microsoft Defender for Threat Intelligence API' :
                   'Azure Event Hubs',
        resourceGroup: 'rg-mstic-prod-eastus2',
        subscriptionId: 'mstic-prod-subscription',
        region: 'East US 2',
        throughputUnits: ['LinkedIn', 'Twitter'].includes(source) ? 20 : 10,
        partitionCount: ['LinkedIn', 'Twitter'].includes(source) ? 32 : 16,
        retentionDays: 7,
        protocols: source === 'Office365' || source === 'AzureAD' ? ['HTTPS', 'OAuth 2.0'] :
                  source === 'GitHub' ? ['HTTPS', 'Webhook'] :
                  ['HTTPS', 'AMQP 1.0', 'Kafka'],
        authentication: source === 'Office365' || source === 'AzureAD' ? 'Managed Identity + Application Registration' :
                       source === 'GitHub' ? 'GitHub App + Personal Access Token' :
                       'Managed Identity + Shared Access Key',
        monitoring: {
          applicationInsights: 'ai-mstic-ingestion-prod',
          logAnalyticsWorkspace: 'law-mstic-prod-eastus2',
          kustoCluster: 'msticdata.eastus2.kusto.windows.net',
          alertRules: [`${source}_ingestion_failure`, `${source}_throughput_low`, `${source}_latency_high`]
        },
        dependencies: {
          keyVault: 'kv-mstic-secrets-prod',
          serviceAccounts: [`sa-${source.toLowerCase()}-ingestion`],
          externalApis: source === 'Office365' ? ['graph.microsoft.com'] :
                       source === 'GitHub' ? ['api.github.com'] :
                       source === 'LinkedIn' ? ['api.linkedin.com'] :
                       source === 'Twitter' ? ['api.twitter.com'] :
                       [],
          networkConnections: ['Virtual Network Gateway', 'Private Endpoints', 'Service Endpoints']
        },
        // Enhanced operational information for MSTIC engineers
        slaMetrics: {
          uptime: Math.max(95, 100 - seededRandom(`${source}-uptime`) * 5),
          targetUptime: 99.9,
          mttr: Math.floor(seededRandom(`${source}-mttr`) * 30) + 5, // 5-35 minutes
          mtbf: Math.floor(seededRandom(`${source}-mtbf`) * 168) + 24 // 24-192 hours
        },
        operationalInfo: {
          owner: source === 'Office365' || source === 'AzureAD' ? 'MSTIC Identity Team' :
                 source === 'GitHub' || source === 'LinkedIn' ? 'MSTIC External Feeds Team' :
                 'MSTIC Data Ingestion Team',
          escalationPath: ['On-call Engineer', 'Team Lead', 'Principal Engineer', 'Engineering Manager'],
          maintenanceWindow: 'Sundays 02:00-04:00 UTC',
          criticalityLevel: ['Office365', 'AzureAD', 'ThreatIntel'].includes(source) ? 'critical' :
                           ['LinkedIn', 'Twitter'].includes(source) ? 'high' : 'medium',
          dataClassification: ['Office365', 'AzureAD'].includes(source) ? 'confidential' : 'internal',
          complianceRequirements: ['Office365', 'AzureAD'].includes(source) ? 
            ['GDPR', 'SOX', 'ISO 27001', 'FedRAMP'] : 
            ['GDPR', 'ISO 27001']
        },
        performanceMetrics: {
          avgLatency: Math.floor(seededRandom(`${source}-latency`) * 200) + 50,
          p95Latency: Math.floor(seededRandom(`${source}-p95`) * 500) + 100,
          errorRate: Math.round(seededRandom(`${source}-errors`) * 2 * 100) / 100, // 0-2%
          throughputMbps: Math.floor(seededRandom(`${source}-throughput`) * 100) + 10,
          cpuUtilization: Math.floor(seededRandom(`${source}-cpu`) * 30) + 20, // 20-50%
          memoryUtilization: Math.floor(seededRandom(`${source}-memory`) * 40) + 30 // 30-70%
        },
        troubleshooting: {
          commonIssues: [
            `${source} API rate limiting`,
            'Authentication token expiration',
            'Network connectivity issues',
            'Data format validation errors'
          ],
          runbookUrls: [
            `https://mstic.wiki/runbooks/${source.toLowerCase()}-ingestion`,
            `https://mstic.wiki/troubleshooting/${source.toLowerCase()}-common-issues`
          ],
          logQuerySamples: [
            `${source}Ingestion_CL | where TimeGenerated > ago(1h) | where Level == "Error"`,
            `${source}Metrics_CL | summarize avg(RecordsPerSecond) by bin(TimeGenerated, 5m)`
          ],
          healthCheckEndpoints: [
            `https://mstic-monitoring.azurewebsites.net/health/${source.toLowerCase()}`,
            `https://mstic-api.azurewebsites.net/status/${source.toLowerCase()}`
          ]
        },
        // Processing and Data Movement Details for Sources
        processingMode: ['LinkedIn', 'Twitter', 'ThreatIntel'].includes(source) ? 'streaming' as 'streaming' : 'batch' as 'batch',
        dataMovementTool: source === 'Office365' || source === 'Exchange' || source === 'Teams' || source === 'SharePoint' ? 'Microsoft Graph API + Azure Logic Apps' :
                         source === 'AzureAD' ? 'Azure AD Logs API + Event Grid' :
                         source === 'LinkedIn' || source === 'Twitter' ? 'REST API + Azure Event Hubs' :
                         source === 'GitHub' ? 'GitHub Webhooks + Azure Logic Apps' :
                         'REST API + Azure Functions',
        batchFrequency: ['Office365', 'AzureAD', 'Exchange', 'Teams', 'SharePoint'].includes(source) ? 
                       'Every 15 minutes' : 'N/A (Streaming)',
        streamingLatency: ['LinkedIn', 'Twitter', 'ThreatIntel'].includes(source) ? 
                         '< 10 seconds' : 'N/A (Batch)',
        dataFormat: source === 'Office365' || source === 'Exchange' || source === 'Teams' ? ['JSON', 'XML'] :
                   source === 'AzureAD' ? ['JSON', 'CSV'] :
                   ['JSON', 'Avro'],
        compressionType: ['LinkedIn', 'Twitter'].includes(source) ? 'LZ4' : 'GZIP'
      });
    });

    // Processing pipelines (middle section)
    const pipelineTypes = [
      { type: 'ingestion', x: 350 },
      { type: 'transformation', x: 650 },
      { type: 'enrichment', x: 950 }
    ];

    pipelineTypes.forEach(({ type, x }) => {
      // Ensure we have pipelines from all sources by selecting pipelines more evenly
      const sourceGroups: { [key: string]: any[] } = {};
      mockPipelines.forEach(pipeline => {
        if (!sourceGroups[pipeline.source]) {
          sourceGroups[pipeline.source] = [];
        }
        sourceGroups[pipeline.source].push(pipeline);
      });
      
      // Select 1 pipeline from each source (up to 10 sources)
      const selectedPipelines: any[] = [];
      sources.forEach(source => {
        const sourcePipelines = sourceGroups[source] || [];
        if (sourcePipelines.length > 0) {
          // Use seeded random to get consistent selection for each type
          const index = Math.floor(seededRandom(`${type}-${source}`) * sourcePipelines.length);
          selectedPipelines.push(sourcePipelines[index]);
        }
      });
      
      const typeNodes = selectedPipelines.map((pipeline, index) => ({
        id: `${type}-${pipeline.id}`, // Make ID unique per type
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${pipeline.name.split(' ').slice(0, 3).join(' ')}`,
        type: type as 'ingestion' | 'transformation' | 'enrichment',
        source: pipeline.source,
        x,
        y: 80 + index * 70,
        status: pipeline.status,
        recordsPerSecond: Math.floor(pipeline.recordsProcessed / 60),
        avgProcessingTime: pipeline.avgProcessingTime,
        connections: [],
        description: `${type} pipeline: ${pipeline.name}`,
        lastUpdate: pipeline.lastRun.toISOString(),
        dataQuality: Math.floor(seededRandom(`${pipeline.id}-quality`) * 15) + 85,
        actualPipeline: pipeline, // Store reference to actual pipeline for dependencies
        pipelineData: pipeline, // Full pipeline data for error modal
        hasErrors: pipeline.status === 'failed' || pipeline.status === 'warning',
        errorCount: pipeline.errorHistory?.length || 0,
        // Microsoft Technology Stack Details for Processing Pipelines - Diversified for Realism
        technology: type === 'ingestion' ? 
                   (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'Azure Event Hubs + Stream Analytics' :
                    pipeline.source === 'Office365' || pipeline.source === 'AzureAD' ? 'Azure Data Factory (Copy Activity)' :
                    pipeline.source === 'GitHub' ? 'Azure Logic Apps + Azure Functions' :
                    'Azure Data Factory + Event Grid') :
                   type === 'transformation' ? 
                   (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'Azure Stream Analytics + Databricks Streaming' :
                    pipeline.source === 'Office365' || pipeline.source === 'Exchange' ? 'Azure Synapse Analytics (SQL Pool)' :
                    pipeline.source === 'ThreatIntel' ? 'Azure Functions + Cosmos DB Change Feed' :
                    'Azure Data Factory (Mapping Data Flows)') :
                   (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'Azure Functions (Real-time) + SignalR' :
                    pipeline.source === 'Office365' || pipeline.source === 'AzureAD' ? 'Azure Cognitive Services + ML Studio' :
                    'Azure Databricks (ML Runtime) + MLflow'),
        resourceGroup: `rg-mstic-${type}-prod-eastus2`,
        subscriptionId: 'mstic-prod-subscription',
        region: 'East US 2',
        computeType: type === 'ingestion' ? 
                    (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'Event Hubs (20 TUs) + Auto-scale Runtime' :
                     pipeline.source === 'Office365' || pipeline.source === 'AzureAD' ? 'Integration Runtime (Self-hosted)' :
                     'Azure-SSIS Integration Runtime') :
                    type === 'transformation' ? 
                    (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'Stream Analytics (120 SUs) + Databricks (8-node cluster)' :
                     pipeline.source === 'Office365' || pipeline.source === 'Exchange' ? 'Synapse SQL Pool (DW500c)' :
                     'Data Factory Mapping Data Flow (16-core)') :
                    (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'Consumption Plan Functions + SignalR (Standard)' :
                     'Databricks ML Runtime (Standard_DS4_v2)'),
        partitionCount: type === 'transformation' ? 64 : 32,
        retentionDays: 30,
        protocols: type === 'ingestion' ? ['HTTPS', 'ODBC', 'JDBC'] :
                  type === 'transformation' ? ['Spark SQL', 'Delta Lake'] :
                  ['Python', 'Scala', 'Delta Lake', 'MLflow'],
        authentication: 'Managed Identity + Azure Key Vault',
        monitoring: {
          applicationInsights: `ai-mstic-${type}-prod`,
          logAnalyticsWorkspace: 'law-mstic-prod-eastus2',
          kustoCluster: 'msticdata.eastus2.kusto.windows.net',
          alertRules: [`${type}_pipeline_failure`, `${type}_processing_delay`, `${type}_resource_exhaustion`]
        },
        dependencies: {
          keyVault: 'kv-mstic-secrets-prod',
          serviceAccounts: [`sa-${type}-${pipeline.source.toLowerCase()}`],
          externalApis: type === 'enrichment' ? ['threatintelligence.microsoft.com', 'virusshare.com'] : [],
          networkConnections: ['Azure Virtual Network', 'Private Link', 'Managed Virtual Network']
        },
        // Enhanced operational information for processing pipelines
        processingMode: (type === 'ingestion' ? 
                       (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'streaming' :
                        pipeline.source === 'Office365' || pipeline.source === 'AzureAD' ? 'batch' :
                        'hybrid') :
                       type === 'transformation' ? 
                       (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'micro-batch' :
                        pipeline.source === 'Office365' || pipeline.source === 'Exchange' ? 'batch' :
                        'hybrid') :
                       'streaming') as 'batch' | 'streaming' | 'micro-batch' | 'hybrid',
        dataMovementTool: type === 'ingestion' ? 
                         (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'Azure Event Hubs + Stream Analytics' :
                          pipeline.source === 'Office365' || pipeline.source === 'AzureAD' ? 'Azure Data Factory Copy Activity' :
                          'Azure Logic Apps + HTTP Connector') :
                         type === 'transformation' ? 
                         (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? 'Databricks Auto Loader + Delta Live Tables' :
                          pipeline.source === 'Office365' || pipeline.source === 'Exchange' ? 'Synapse Pipelines + PolyBase' :
                          'Azure Data Factory Mapping Data Flows') :
                         'Azure Functions + Service Bus',
        batchFrequency: type === 'ingestion' && ['Office365', 'AzureAD', 'Exchange', 'Teams'].includes(pipeline.source) ? 
                       'Every 15 minutes' :
                       type === 'transformation' && ['Office365', 'Exchange', 'SharePoint'].includes(pipeline.source) ?
                       'Hourly (00:15, 01:15, etc.)' :
                       'N/A (Streaming)',
        streamingLatency: ['LinkedIn', 'Twitter', 'ThreatIntel'].includes(pipeline.source) ? 
                         (type === 'ingestion' ? '< 30 seconds' :
                          type === 'transformation' ? '< 2 minutes' :
                          '< 5 seconds') :
                         'N/A (Batch)',
        dataFormat: type === 'ingestion' ? 
                   (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? ['JSON', 'Avro'] :
                    pipeline.source === 'Office365' || pipeline.source === 'AzureAD' ? ['JSON', 'CSV'] :
                    ['JSON', 'XML']) :
                   type === 'transformation' ? 
                   (pipeline.source === 'LinkedIn' || pipeline.source === 'Twitter' ? ['Parquet', 'Delta'] :
                    ['Parquet', 'ORC', 'Delta']) :
                   ['JSON', 'Parquet'],
        compressionType: type === 'ingestion' ? 'Snappy' :
                        type === 'transformation' ? 'GZIP' :
                        'LZ4',
        slaMetrics: {
          uptime: Math.max(95, 100 - seededRandom(`${pipeline.id}-uptime`) * 5),
          targetUptime: type === 'ingestion' ? 99.95 : 99.9,
          mttr: Math.floor(seededRandom(`${pipeline.id}-mttr`) * 20) + 10,
          mtbf: Math.floor(seededRandom(`${pipeline.id}-mtbf`) * 120) + 48
        },
        operationalInfo: {
          owner: type === 'ingestion' ? 'MSTIC Data Ingestion Team' :
                 type === 'transformation' ? 'MSTIC Data Platform Team' :
                 'MSTIC ML Engineering Team',
          escalationPath: ['On-call Engineer', 'Senior Engineer', 'Team Lead', 'Principal Engineer'],
          maintenanceWindow: type === 'transformation' ? 'Saturdays 01:00-03:00 UTC' : 'Sundays 03:00-05:00 UTC',
          criticalityLevel: (type === 'ingestion' ? 'high' : type === 'transformation' ? 'critical' : 'medium') as 'low' | 'medium' | 'high' | 'critical',
          dataClassification: 'internal' as 'public' | 'internal' | 'confidential' | 'restricted',
          complianceRequirements: ['GDPR', 'ISO 27001', 'SOC 2']
        },
        performanceMetrics: {
          avgLatency: type === 'ingestion' ? Math.floor(seededRandom(`${pipeline.id}-lat1`) * 100) + 20 :
                     type === 'transformation' ? Math.floor(seededRandom(`${pipeline.id}-lat2`) * 300) + 100 :
                     Math.floor(seededRandom(`${pipeline.id}-lat3`) * 500) + 200,
          p95Latency: type === 'ingestion' ? Math.floor(seededRandom(`${pipeline.id}-p95-1`) * 200) + 50 :
                     type === 'transformation' ? Math.floor(seededRandom(`${pipeline.id}-p95-2`) * 600) + 200 :
                     Math.floor(seededRandom(`${pipeline.id}-p95-3`) * 1000) + 500,
          errorRate: Math.round(seededRandom(`${pipeline.id}-errors`) * 1.5 * 100) / 100,
          throughputMbps: Math.floor(seededRandom(`${pipeline.id}-throughput`) * 200) + 50,
          cpuUtilization: Math.floor(seededRandom(`${pipeline.id}-cpu`) * 40) + 30,
          memoryUtilization: Math.floor(seededRandom(`${pipeline.id}-memory`) * 50) + 25
        },
        troubleshooting: {
          commonIssues: [
            `${type} pipeline timeout issues`,
            'Resource scaling limitations',
            'Data schema validation errors',
            'Memory pressure during peak loads'
          ],
          runbookUrls: [
            `https://mstic.wiki/runbooks/${type}-pipeline-troubleshooting`,
            `https://mstic.wiki/scaling/${type}-performance-tuning`
          ],
          logQuerySamples: [
            `${type.charAt(0).toUpperCase() + type.slice(1)}Pipeline_CL | where TimeGenerated > ago(1h) | where Level == "Error"`,
            `${type.charAt(0).toUpperCase() + type.slice(1)}Metrics_CL | summarize avg(ProcessingTimeMs) by bin(TimeGenerated, 5m)`
          ],
          healthCheckEndpoints: [
            `https://mstic-monitoring.azurewebsites.net/health/${type}`,
            `https://mstic-${type}.azurewebsites.net/status`
          ]
        }
      }));
        
      nodes.push(...typeNodes);
    });

    // Destinations (right side) - organized by purpose for realistic MSTIC routing
    const destinations = [
      { name: 'MSTIC Data Lake', types: ['storage', 'archive'], priority: 1 },
      { name: 'Threat Intelligence DB', types: ['threat', 'intel'], priority: 1 },
      { name: 'Security Analytics Store', types: ['analytics', 'ml'], priority: 2 },
      { name: 'Alert System', types: ['realtime', 'alerts'], priority: 1 },
      { name: 'ML Training Data', types: ['ml', 'training'], priority: 3 },
      { name: 'Compliance Archive', types: ['compliance', 'audit'], priority: 2 },
      { name: 'Real-time Dashboard', types: ['realtime', 'dashboard'], priority: 1 },
      { name: 'API Gateway', types: ['api', 'external'], priority: 2 },
      { name: 'Kusto Analytics Engine', types: ['kusto', 'analytics'], priority: 1 }
    ];

    // Special Parquet-to-Kusto Staging Pipeline (Interview Scenario #1)
    // This demonstrates the technical solution discussed in the interview:
    // How to manage specific JSON field extraction from Parquet files with thousands of files per hour
    const parquetToKustoStaging: LineageNode = {
      id: 'parquet-staging-pipeline',
      name: 'Parquet Field Extraction Staging',
            type: 'transformation',
      x: 500,
      y: 780, // Position below main pipeline flow (after 10 sources + spacing)
      status: 'healthy',
      recordsPerSecond: 2340,
      avgProcessingTime: 450,
      connections: [],
      description: 'Staging table for selective JSON field extraction from high-volume Parquet ingestion',
      lastUpdate: new Date().toISOString(),
      dataQuality: 98,
      technology: 'Azure Data Factory + Delta Lake + Kusto',
      resourceGroup: 'rg-mstic-staging-prod-eastus2',
      subscriptionId: 'mstic-prod-subscription',
      region: 'East US 2',
      computeType: 'Azure Data Factory Integration Runtime',
      partitionCount: 64,
      retentionDays: 7,
      protocols: ['HTTPS', 'Delta Lake', 'KQL'],
      authentication: 'Managed Identity + Service Principal',
      monitoring: {
        applicationInsights: 'ai-mstic-staging-prod',
        logAnalyticsWorkspace: 'law-mstic-prod-eastus2',
        kustoCluster: 'msticdata.eastus2.kusto.windows.net',
        alertRules: ['parquet_staging_failure', 'parquet_field_extraction_delay', 'staging_table_capacity']
      },
      dependencies: {
        keyVault: 'kv-mstic-secrets-prod',
        serviceAccounts: ['sa-parquet-staging'],
        externalApis: [],
        networkConnections: ['Private Link to Kusto', 'ADLS Private Endpoint']
      },
      // Processing and Data Movement Details for Interview Scenario
      processingMode: 'batch' as 'batch',
      dataMovementTool: 'Azure Data Factory + Delta Lake Engine',
      batchFrequency: 'Triggered by file arrival (Event Grid)',
      streamingLatency: 'N/A (Batch Processing)',
      dataFormat: ['Parquet', 'JSON', 'Delta'],
      compressionType: 'Snappy (Parquet native)',
      slaMetrics: {
        uptime: 99.8,
        targetUptime: 99.9,
        mttr: 12,
        mtbf: 168
      },
      operationalInfo: {
        owner: 'MSTIC Data Platform Team',
        escalationPath: ['On-call Engineer', 'Senior Data Engineer', 'Principal Engineer'],
        maintenanceWindow: 'Saturdays 02:00-04:00 UTC',
        criticalityLevel: 'high',
        dataClassification: 'internal',
        complianceRequirements: ['GDPR', 'ISO 27001']
      },
      performanceMetrics: {
        avgLatency: 450,
        p95Latency: 850,
        errorRate: 0.8,
        throughputMbps: 320,
        cpuUtilization: 45,
        memoryUtilization: 60
      },
      troubleshooting: {
        commonIssues: [
          'JSON field extraction timeout',
          'Parquet schema evolution issues',
          'Kusto ingestion capacity limits',
          'Delta Lake table optimization needed'
        ],
        runbookUrls: [
          'https://mstic.wiki/runbooks/parquet-staging-troubleshooting',
          'https://mstic.wiki/kusto/field-extraction-optimization'
        ],
        logQuerySamples: [
          'ParquetStagingPipeline_CL | where TimeGenerated > ago(1h) | where Level == "Error"',
          'ParquetFieldExtraction_CL | summarize avg(ProcessingTimeMs) by bin(TimeGenerated, 5m)'
        ],
        healthCheckEndpoints: [
          'https://mstic-monitoring.azurewebsites.net/health/parquet-staging',
          'https://mstic-staging.azurewebsites.net/status/field-extraction'
        ]
      },
      // Interview scenario details (custom properties for demo)
      scenarioDetails: {
        problem: 'Extract specific JSON fields from thousands of Parquet files per hour',
        solution: 'Staging table with conditional ingestion trigger',
        sourceFormat: 'Parquet files (Azure Data Lake)',
        targetSystem: 'Azure Data Explorer (Kusto)',
        volumePerHour: '~3,000 files',
        fieldFilter: 'user_activity.threat_indicators',
        triggerCondition: 'IF field_exists AND field_not_null'
      },
      stagingDetails: {
        tableName: 'threat_indicators_staging',
        partitionStrategy: 'BY (date_hour, source_system)',
        retentionPolicy: '7 days (staging only)',
        compressionRatio: '85%',
        indexStrategy: 'Clustered on timestamp, source_ip'
      }
    };

    destinations.forEach((dest, index) => {
      const statusSeed = seededRandom(`${dest.name}-status`);
      const statusOptions: PipelineStatus[] = ['healthy', 'warning'];
      const status = statusOptions[Math.floor(statusSeed * statusOptions.length)];
      
      nodes.push({
        id: `dest-${dest.name}`,
        name: dest.name,
        type: 'destination',
        x: 1250,
        y: 80 + index * 70,
        status,
        recordsPerSecond: Math.floor(seededRandom(`${dest.name}-records`) * 500) + 50,
        avgProcessingTime: Math.floor(seededRandom(`${dest.name}-time`) * 100) + 20,
        connections: [],
        description: `Data destination: ${dest.name}`,
        lastUpdate: new Date(Date.now() - seededRandom(`${dest.name}-update`) * 1800000).toISOString(),
        dataQuality: Math.floor(seededRandom(`${dest.name}-quality`) * 10) + 90,
        destinationTypes: dest.types,
        priority: dest.priority,
        // Microsoft Technology Stack Details for Destinations
        technology: dest.name.includes('Data Lake') ? 'Azure Data Lake Storage Gen2 (ADLS)' :
                   dest.name.includes('DB') || dest.name.includes('Database') ? 'Azure SQL Database (Premium)' :
                   dest.name.includes('Analytics') ? 'Azure Synapse Analytics (SQL Pool)' :
                   dest.name.includes('Alert') ? 'Azure Logic Apps + Service Bus' :
                   dest.name.includes('ML') ? 'Azure Machine Learning Studio' :
                   dest.name.includes('Compliance') ? 'Azure Purview + Archive Storage' :
                   dest.name.includes('Dashboard') ? 'Power BI Premium + Azure SignalR' :
                   'Azure API Management + Application Gateway',
        resourceGroup: `rg-mstic-storage-prod-eastus2`,
        subscriptionId: 'mstic-prod-subscription',
        region: 'East US 2',
        storageType: dest.name.includes('Data Lake') ? 'Hot (Standard LRS) + Cool Archive' :
                    dest.name.includes('Analytics') ? 'Premium SSD + Columnstore Index' :
                    dest.name.includes('ML') ? 'Standard SSD + Blob Storage' :
                    dest.name.includes('Compliance') ? 'Archive Storage (GRS)' :
                    'Standard Storage (ZRS)',
        partitionCount: dest.name.includes('Data Lake') ? 128 :
                       dest.name.includes('Analytics') ? 256 :
                       dest.name.includes('Alert') ? 64 : 32,
        retentionDays: dest.name.includes('Compliance') ? 2555 : // 7 years
                      dest.name.includes('Archive') ? 365 :
                      dest.name.includes('ML') ? 180 :
                      90,
        protocols: dest.name.includes('Data Lake') ? ['HTTPS', 'REST API', 'ABFS'] :
                  dest.name.includes('DB') ? ['TDS', 'HTTPS', 'ODBC'] :
                  dest.name.includes('Alert') ? ['HTTPS', 'AMQP', 'Service Bus'] :
                  dest.name.includes('API') ? ['HTTPS', 'OAuth 2.0', 'OpenAPI'] :
                  ['HTTPS', 'WebSocket', 'REST API'],
        authentication: dest.name.includes('Data Lake') ? 'Managed Identity + ACLs + RBAC' :
                       dest.name.includes('DB') ? 'Managed Identity + SQL Authentication' :
                       dest.name.includes('ML') ? 'Service Principal + Workspace MSI' :
                       'Managed Identity + Key Vault',
        monitoring: {
          applicationInsights: `ai-mstic-destinations-prod`,
          logAnalyticsWorkspace: 'law-mstic-prod-eastus2',
          kustoCluster: 'msticdata.eastus2.kusto.windows.net',
          alertRules: [`${dest.name.replace(/\s+/g, '_').toLowerCase()}_capacity`, 
                      `${dest.name.replace(/\s+/g, '_').toLowerCase()}_latency`,
                      `${dest.name.replace(/\s+/g, '_').toLowerCase()}_availability`]
        },
        dependencies: {
          keyVault: 'kv-mstic-secrets-prod',
          serviceAccounts: [`sa-${dest.name.replace(/\s+/g, '-').toLowerCase()}`],
          externalApis: dest.name.includes('API') ? ['partner-apis.microsoft.com'] : [],
          networkConnections: ['Private Endpoints', 'VNet Integration', 'Service Endpoints']
        },
        // Enhanced operational information for destination nodes
        slaMetrics: {
          uptime: Math.max(98, 100 - seededRandom(`${dest.name}-uptime`) * 2),
          targetUptime: dest.name.includes('Data Lake') || dest.name.includes('Alert') ? 99.99 : 99.9,
          mttr: Math.floor(seededRandom(`${dest.name}-mttr`) * 15) + 5,
          mtbf: Math.floor(seededRandom(`${dest.name}-mtbf`) * 200) + 100
        },
        operationalInfo: {
          owner: dest.name.includes('Data Lake') || dest.name.includes('Analytics') ? 'MSTIC Data Platform Team' :
                 dest.name.includes('Alert') || dest.name.includes('Dashboard') ? 'MSTIC Operations Team' :
                 dest.name.includes('ML') ? 'MSTIC ML Engineering Team' :
                 dest.name.includes('Compliance') ? 'MSTIC Compliance Team' :
                 'MSTIC Infrastructure Team',
          escalationPath: ['On-call Engineer', 'Senior Engineer', 'Team Lead', 'Engineering Manager'],
          maintenanceWindow: dest.name.includes('Alert') ? 'None (24/7 Operations)' : 'Sundays 01:00-03:00 UTC',
          criticalityLevel: (dest.name.includes('Alert') || dest.name.includes('Data Lake') ? 'critical' :
                           dest.name.includes('Dashboard') || dest.name.includes('Analytics') ? 'high' :
                           'medium') as 'low' | 'medium' | 'high' | 'critical',
          dataClassification: (dest.name.includes('Compliance') ? 'confidential' : 'internal') as 'public' | 'internal' | 'confidential' | 'restricted',
          complianceRequirements: dest.name.includes('Compliance') ? 
            ['GDPR', 'SOX', 'ISO 27001', 'FedRAMP', 'HIPAA'] : 
            ['GDPR', 'ISO 27001', 'SOC 2']
        },
        performanceMetrics: {
          avgLatency: dest.name.includes('Data Lake') ? Math.floor(seededRandom(`${dest.name}-lat1`) * 50) + 10 :
                     dest.name.includes('Alert') ? Math.floor(seededRandom(`${dest.name}-lat2`) * 100) + 50 :
                     dest.name.includes('Analytics') ? Math.floor(seededRandom(`${dest.name}-lat3`) * 200) + 100 :
                     Math.floor(seededRandom(`${dest.name}-lat4`) * 150) + 75,
          p95Latency: dest.name.includes('Data Lake') ? Math.floor(seededRandom(`${dest.name}-p95-1`) * 100) + 25 :
                     dest.name.includes('Alert') ? Math.floor(seededRandom(`${dest.name}-p95-2`) * 200) + 100 :
                     dest.name.includes('Analytics') ? Math.floor(seededRandom(`${dest.name}-p95-3`) * 500) + 250 :
                     Math.floor(seededRandom(`${dest.name}-p95-4`) * 300) + 150,
          errorRate: Math.round(seededRandom(`${dest.name}-errors`) * 1 * 100) / 100, // Lower error rates for destinations
          throughputMbps: dest.name.includes('Data Lake') ? Math.floor(seededRandom(`${dest.name}-through1`) * 500) + 100 :
                         dest.name.includes('Analytics') ? Math.floor(seededRandom(`${dest.name}-through2`) * 300) + 50 :
                         Math.floor(seededRandom(`${dest.name}-through3`) * 200) + 25,
          cpuUtilization: Math.floor(seededRandom(`${dest.name}-cpu`) * 25) + 15, // Lower for storage systems
          memoryUtilization: Math.floor(seededRandom(`${dest.name}-memory`) * 35) + 20
        },
        troubleshooting: {
          commonIssues: [
            `${dest.name} capacity management`,
            'Query performance optimization',
            'Connection pool exhaustion',
            'Storage tier optimization'
          ],
          runbookUrls: [
            `https://mstic.wiki/runbooks/${dest.name.replace(/\s+/g, '-').toLowerCase()}-maintenance`,
            `https://mstic.wiki/troubleshooting/${dest.name.replace(/\s+/g, '-').toLowerCase()}-performance`
          ],
          logQuerySamples: [
            `${dest.name.replace(/\s+/g, '')}Logs_CL | where TimeGenerated > ago(1h) | where Level == "Error"`,
            `${dest.name.replace(/\s+/g, '')}Metrics_CL | summarize avg(ResponseTimeMs) by bin(TimeGenerated, 5m)`
          ],
          healthCheckEndpoints: [
            `https://mstic-monitoring.azurewebsites.net/health/${dest.name.replace(/\s+/g, '-').toLowerCase()}`,
            `https://mstic-storage.azurewebsites.net/status/${dest.name.replace(/\s+/g, '-').toLowerCase()}`
          ]
        },
        // Processing and Data Movement Details for Destinations
        processingMode: dest.name.includes('Real-time') || dest.name.includes('Alert') ? 'streaming' as 'streaming' : 'batch' as 'batch',
        dataMovementTool: dest.name.includes('Data Lake') ? 'PolyBase + COPY INTO (T-SQL)' :
                         dest.name.includes('Analytics') ? 'Azure Synapse Pipelines + SQL Pools' :
                         dest.name.includes('Alert') ? 'Azure Logic Apps + Service Bus' :
                         dest.name.includes('ML') ? 'Azure ML Pipelines + AutoML' :
                         dest.name.includes('API') ? 'Azure API Management + Application Gateway' :
                         'Azure Data Factory + REST API',
        batchFrequency: dest.name.includes('Real-time') || dest.name.includes('Alert') ? 
                       'N/A (Streaming)' : 
                       dest.name.includes('Compliance') ? 'Daily at 02:00 UTC' :
                       'Hourly (00:30, 01:30, etc.)',
        streamingLatency: dest.name.includes('Real-time') || dest.name.includes('Alert') ? 
                         '< 5 seconds' : 'N/A (Batch)',
        dataFormat: dest.name.includes('Data Lake') ? ['Parquet', 'Delta', 'JSON'] :
                   dest.name.includes('Analytics') ? ['Parquet', 'ORC', 'Columnstore'] :
                   dest.name.includes('ML') ? ['Parquet', 'CSV', 'JSON'] :
                   ['JSON', 'Avro'],
        compressionType: dest.name.includes('Data Lake') ? 'Snappy' :
                        dest.name.includes('Analytics') ? 'GZIP' :
                        'LZ4'
      });
    });

    // Add the Parquet-to-Kusto staging pipeline node
    nodes.push(parquetToKustoStaging);

    // Add source node for Parquet files (ADLS)
    nodes.push({
      id: 'parquet-source-adls',
      name: 'Azure Data Lake (Parquet)',
      type: 'source',
      source: 'AzureAD' as PipelineSource, // Using AzureAD as representative source
            x: 50,
      y: 780, // Position below main sources (after 10 sources + spacing)
      status: 'healthy' as PipelineStatus,
      recordsPerSecond: 4500,
      avgProcessingTime: 120,
      connections: [],
      description: 'High-volume Parquet file ingestion from ADLS Gen2',
      lastUpdate: new Date().toISOString(),
      dataQuality: 96,
      technology: 'Azure Data Lake Storage Gen2',
      resourceGroup: 'rg-mstic-datalake-prod-eastus2',
      subscriptionId: 'mstic-prod-subscription',
      region: 'East US 2',
      throughputUnits: 50,
      partitionCount: 128,
      retentionDays: 30,
      protocols: ['HTTPS', 'ABFS', 'REST API'],
      authentication: 'Managed Identity + ACLs',
      monitoring: {
        applicationInsights: 'ai-mstic-datalake-prod',
        logAnalyticsWorkspace: 'law-mstic-prod-eastus2',
        kustoCluster: 'msticdata.eastus2.kusto.windows.net',
        alertRules: ['parquet_ingestion_failure', 'parquet_throughput_low', 'parquet_storage_capacity']
      },
      dependencies: {
        keyVault: 'kv-mstic-secrets-prod',
        serviceAccounts: ['sa-adls-parquet-reader'],
        externalApis: [],
        networkConnections: ['Private Endpoints', 'VNet Integration']
      },
      slaMetrics: {
        uptime: 99.95,
        targetUptime: 99.99,
        mttr: 5,
        mtbf: 720
      },
      operationalInfo: {
        owner: 'MSTIC Data Platform Team',
        escalationPath: ['On-call Engineer', 'Storage Lead', 'Principal Engineer', 'Engineering Manager'],
        maintenanceWindow: 'Sundays 01:00-02:00 UTC',
        criticalityLevel: 'critical',
        dataClassification: 'internal',
        complianceRequirements: ['GDPR', 'ISO 27001', 'SOC 2']
      },
      performanceMetrics: {
        avgLatency: 45,
        p95Latency: 120,
        errorRate: 0.05,
        throughputMbps: 850,
        cpuUtilization: 15,
        memoryUtilization: 25
      },
      troubleshooting: {
        commonIssues: [
          'Parquet file format validation errors',
          'Storage tier access delays',
          'Network connectivity to ADLS',
          'Authentication token expiration'
        ],
        runbookUrls: [
          'https://mstic.wiki/runbooks/adls-parquet-troubleshooting',
          'https://mstic.wiki/storage/adls-performance-optimization'
        ],
        logQuerySamples: [
          'ADLSParquetIngestion_CL | where TimeGenerated > ago(1h) | where Level == "Error"',
          'ADLSMetrics_CL | summarize avg(ThroughputMbps) by bin(TimeGenerated, 5m)'
        ],
        healthCheckEndpoints: [
          'https://mstic-monitoring.azurewebsites.net/health/adls-parquet',
          'https://mstic-datalake.azurewebsites.net/status/parquet-ingestion'
        ]
      },
      actualPipeline: null,
      hasErrors: false,
      errorCount: 0,
      // Processing and Data Movement Details
      processingMode: 'batch' as 'batch',
      dataMovementTool: 'ADLS Gen2 REST API + Azure Storage Explorer',
      batchFrequency: 'Continuous (new files every 2-3 minutes)',
      streamingLatency: 'N/A (File-based ingestion)',
      dataFormat: ['Parquet', 'JSON', 'Avro'],
      compressionType: 'Snappy (default for Parquet)'
    });

    // Generate connections with realistic data flow and failure handling
    nodes.forEach(node => {
      if (node.type === 'source') {
        // Sources connect to ingestion pipelines of the same source
        const ingestionNodes = nodes.filter(n => n.type === 'ingestion' && n.source === node.source);
        ingestionNodes.forEach(ingestionNode => {
          const connectionId = `${node.id}-${ingestionNode.id}`;
          const volumeSeed = seededRandom(`${connectionId}-volume`);
          const volumeOptions: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
          const volume = volumeOptions[Math.floor(volumeSeed * volumeOptions.length)];
          
          connections.push({
            id: connectionId,
            from: node.id,
            to: ingestionNode.id,
            volume,
            health: node.status === 'failed' ? 'error' : node.status === 'warning' ? 'warning' : 'healthy',
            animated: node.status !== 'failed' // No animation if source is failed
          });
          node.connections.push(ingestionNode.id);
          ingestionNode.connections.push(node.id);
        });
      } else if (node.type === 'ingestion') {
        // Only connect if the source is not failed
        const sourceNode = nodes.find(n => n.type === 'source' && n.source === node.source);
        if (sourceNode?.status !== 'failed') {
          const transformationNodes = nodes.filter(n => n.type === 'transformation' && n.source === node.source).slice(0, 2);
          transformationNodes.forEach(transformNode => {
            const connectionId = `${node.id}-${transformNode.id}`;
            const volumeSeed = seededRandom(`${connectionId}-volume`);
            const volumeOptions: ('medium' | 'high')[] = ['medium', 'high'];
            const volume = volumeOptions[Math.floor(volumeSeed * volumeOptions.length)];
            
            connections.push({
              id: connectionId,
              from: node.id,
              to: transformNode.id,
              volume,
              health: node.status === 'failed' ? 'error' : node.status === 'warning' ? 'warning' : 'healthy',
              animated: node.status !== 'failed'
            });
            node.connections.push(transformNode.id);
            transformNode.connections.push(node.id);
          });
        }
      } else if (node.type === 'transformation') {
        // Only connect if upstream is healthy
        const ingestionNode = nodes.find(n => n.type === 'ingestion' && n.source === node.source);
        const sourceNode = nodes.find(n => n.type === 'source' && n.source === node.source);
        if (sourceNode?.status !== 'failed' && ingestionNode?.status !== 'failed') {
          const enrichmentNodes = nodes.filter(n => n.type === 'enrichment' && n.source === node.source).slice(0, 2);
          enrichmentNodes.forEach(enrichNode => {
            const connectionId = `${node.id}-${enrichNode.id}`;
            connections.push({
              id: connectionId,
              from: node.id,
              to: enrichNode.id,
              volume: 'high',
              health: node.status === 'failed' ? 'error' : node.status === 'warning' ? 'warning' : 'healthy',
              animated: node.status !== 'failed'
            });
            node.connections.push(enrichNode.id);
            enrichNode.connections.push(node.id);
          });
        }
      } else if (node.type === 'enrichment') {
        // Smart destination routing based on source type and pipeline health
        const sourceNode = nodes.find(n => n.type === 'source' && n.source === node.source);
        const ingestionNode = nodes.find(n => n.type === 'ingestion' && n.source === node.source);
        const transformationNode = nodes.find(n => n.type === 'transformation' && n.source === node.source);
        
        // Only connect if entire pipeline upstream is healthy
        if (sourceNode?.status !== 'failed' && ingestionNode?.status !== 'failed' && transformationNode?.status !== 'failed') {
          // Smart routing based on data source type
          const destinationMappings = {
            'LinkedIn': ['Threat Intelligence DB', 'MSTIC Data Lake', 'ML Training Data'],
            'Twitter': ['Real-time Dashboard', 'Alert System', 'Security Analytics Store'],
            'Office365': ['Compliance Archive', 'Security Analytics Store', 'Alert System'],
            'AzureAD': ['Security Analytics Store', 'Alert System', 'Threat Intelligence DB'],
            'GitHub': ['Threat Intelligence DB', 'Security Analytics Store', 'API Gateway'],
            'ThreatIntel': ['Alert System', 'Threat Intelligence DB', 'Real-time Dashboard'],
            'Exchange': ['Compliance Archive', 'Security Analytics Store', 'Alert System'],
            'Teams': ['Compliance Archive', 'Real-time Dashboard', 'Security Analytics Store'],
            'SharePoint': ['Compliance Archive', 'MSTIC Data Lake', 'Security Analytics Store'],
            'PowerBI': ['Real-time Dashboard', 'Security Analytics Store', 'API Gateway']
          };
          
          const targetDestinations = destinationMappings[node.source as keyof typeof destinationMappings] || 
                                   ['MSTIC Data Lake', 'Security Analytics Store', 'Alert System'];
          
          const destNodes = nodes.filter(n => 
            n.type === 'destination' && targetDestinations.includes(n.name)
          );
          
          destNodes.forEach(destNode => {
            const connectionId = `${node.id}-${destNode.id}`;
            connections.push({
              id: connectionId,
              from: node.id,
              to: destNode.id,
              volume: 'high',
              health: node.status === 'failed' ? 'error' : node.status === 'warning' ? 'warning' : 'healthy',
              animated: node.status !== 'failed'
            });
            node.connections.push(destNode.id);
            destNode.connections.push(node.id);
          });
        }
      }
    });

    // Add connections for the Parquet-to-Kusto staging pipeline (Interview Scenario #1)
    const parquetSource = nodes.find(n => n.id === 'parquet-source-adls');
    const stagingPipeline = nodes.find(n => n.id === 'parquet-staging-pipeline');
    const kustoDestination = nodes.find(n => n.name === 'Kusto Analytics Engine');

    if (parquetSource && stagingPipeline && kustoDestination) {
      // Parquet source -> Staging pipeline
      connections.push({
        id: 'parquet-to-staging',
        from: parquetSource.id,
        to: stagingPipeline.id,
        volume: 'high',
        health: 'healthy',
        animated: true
      });
      parquetSource.connections.push(stagingPipeline.id);
      stagingPipeline.connections.push(parquetSource.id);

      // Staging pipeline -> Kusto destination
      connections.push({
        id: 'staging-to-kusto',
        from: stagingPipeline.id,
        to: kustoDestination.id,
        volume: 'medium',
        health: 'healthy',
        animated: true
      });
      stagingPipeline.connections.push(kustoDestination.id);
      kustoDestination.connections.push(stagingPipeline.id);
    }

    return { nodes, connections };
  };

  // Use useMemo to prevent regeneration on every render, but regenerate all connections
  const { nodes: allNodes, connections: allConnections } = useMemo(() => {
    const result = generateLineageData();
    const nodesWithErrors = result.nodes.filter(n => n.hasErrors);
    console.log('Generated nodes:', {
      total: result.nodes.length,
      withErrors: nodesWithErrors.length,
      errorNodes: nodesWithErrors.map(n => ({ id: n.id, name: n.name, status: n.status, errorCount: n.errorCount }))
    });
    return result;
  }, []);

  // Filter connections based on selected source
  const filteredConnections = useMemo(() => {
    if (selectedSource === 'all') {
      return allConnections;
    }
    
    // Show all connections that are part of the selected source's data flow path
    return allConnections.filter(conn => {
      const fromNode = allNodes.find(n => n.id === conn.from);
      const toNode = allNodes.find(n => n.id === conn.to);
      
      // Direct connections involving the selected source
      if (fromNode?.source === selectedSource || toNode?.source === selectedSource) {
        return true;
      }
      
      // For destination connections, check if there's a path from the selected source
      if (toNode?.type === 'destination') {
        // Find if there's any pipeline in the enrichment stage that connects to this destination
        // and that pipeline is part of the selected source flow
        const enrichmentConnections = allConnections.filter(c => 
          c.to === toNode.id && allNodes.find(n => n.id === c.from)?.type === 'enrichment'
        );
        
        return enrichmentConnections.some(enrichConn => {
          const enrichNode = allNodes.find(n => n.id === enrichConn.from);
          return enrichNode?.source === selectedSource;
        });
      }
      
      return false;
    });
  }, [allNodes, allConnections, selectedSource]);

  // Use filtered data
  const nodes = allNodes;
  const connections = filteredConnections;

  // Clear highlighted path when source changes
  useEffect(() => {
    setHighlightedPath([]);
    setSelectedNode(null);
  }, [selectedSource]);

  // Handle window resize to reposition popup if needed
  useEffect(() => {
    const handleResize = () => {
      if (showNodePopup && selectedNode) {
        // Simple repositioning on resize - keep popup visible
        const popupWidth = 420;
        const popupHeight = 400;
        
        let x = popupPosition.x;
        let y = popupPosition.y;
        
        // Check if popup would go off right edge
        if (x + popupWidth > window.innerWidth - 20) {
          x = window.innerWidth - popupWidth - 20;
        }
        
        // Check if popup would go off bottom edge
        if (y + popupHeight > window.innerHeight - 20) {
          y = window.innerHeight - popupHeight - 20;
        }
        
        // Ensure popup doesn't go off edges
        if (x < 20) x = 20;
        if (y < 20) y = 20;
        
        setPopupPosition({ x, y });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showNodePopup, selectedNode, popupPosition]);

  // Filter nodes based on search
  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (node.source && node.source.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Highlight path from selected node
  const highlightPath = (nodeId: string) => {
    const visited = new Set<string>();
    const path: string[] = [];
    
    const traverse = (currentId: string) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);
      path.push(currentId);
      
      const node = nodes.find(n => n.id === currentId);
      if (node) {
        node.connections.forEach(connectedId => {
          if (!visited.has(connectedId)) {
            traverse(connectedId);
          }
        });
      }
    };
    
    traverse(nodeId);
    setHighlightedPath(path);
  };

  const handleNodeClick = (node: LineageNode, event: React.MouseEvent) => {
    // Reset popup expansion when clicking a new node
    setPopupExpanded(false);
    
    // Calculate popup dimensions based on expansion state
    const popupWidth = 420; // Compact width
    const popupHeight = 400; // Compact height
    
    // Get mouse position relative to viewport
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    // Calculate optimal position with smart positioning
    let x = mouseX + 15; // Default offset to the right
    let y = mouseY + 15; // Default offset below
    
    // Check if popup would go off right edge of screen
    if (x + popupWidth > window.innerWidth - 20) {
      x = mouseX - popupWidth - 15; // Position to the left of cursor
    }
    
    // Check if popup would go off bottom edge of screen
    if (y + popupHeight > window.innerHeight - 20) {
      y = mouseY - popupHeight - 15; // Position above cursor
    }
    
    // Ensure popup doesn't go off left edge
    if (x < 20) {
      x = 20;
    }
    
    // Ensure popup doesn't go off top edge
    if (y < 20) {
      y = 20;
    }
    
    // If popup is still too large for screen (edge case), center it
    if (popupWidth > window.innerWidth - 40) {
      x = 20;
    }
    if (popupHeight > window.innerHeight - 40) {
      y = 20;
    }
    
    setPopupPosition({ x, y });
    
    // Set the selected node and show popup
    setSelectedNode(node);
    setShowNodePopup(true);
    
    // If clicking on a source node, update the selectedSource filter
    if (node.type === 'source' && node.source) {
      setSelectedSource(node.source);
      // Clear any existing highlights to show the full source flow
      setHighlightedPath([]);
    } else {
      // For non-source nodes, highlight the path
      highlightPath(node.id);
    }
  };

  // Function to handle popup expansion and repositioning
  const handlePopupExpansion = () => {
    const newExpanded = !popupExpanded;
    setPopupExpanded(newExpanded);
    
    if (!selectedNode) return;
    
    // Recalculate position for expanded popup
    const popupWidth = newExpanded ? 800 : 420;
    const popupHeight = newExpanded ? 600 : 400;
    
    let x = popupPosition.x;
    let y = popupPosition.y;
    
    // Check if expanded popup would go off right edge
    if (x + popupWidth > window.innerWidth - 20) {
      x = window.innerWidth - popupWidth - 20;
    }
    
    // Check if expanded popup would go off bottom edge
    if (y + popupHeight > window.innerHeight - 20) {
      y = window.innerHeight - popupHeight - 20;
    }
    
    // Ensure popup doesn't go off left edge
    if (x < 20) {
      x = 20;
    }
    
    // Ensure popup doesn't go off top edge
    if (y < 20) {
      y = 20;
    }
    
    setPopupPosition({ x, y });
  };

  const handleNodeDoubleClick = (node: LineageNode) => {
    console.log('Node double-clicked:', {
      id: node.id,
      name: node.name,
      status: node.status,
      hasErrors: node.hasErrors,
      errorCount: node.errorCount,
      hasPipelineData: !!node.pipelineData,
      pipelineDataKeys: node.pipelineData ? Object.keys(node.pipelineData) : []
    });
    
    // Open error details modal on double-click for failed/warning nodes
    if ((node.status === 'failed' || node.status === 'warning') && node.pipelineData) {
      console.log('Opening error modal for node:', node.name);
      setSelectedNode(node);
      setShowErrorModal(true);
    } else {
      console.log('Not opening modal - conditions not met');
    }
  };

  const getNodeColor = (node: LineageNode) => {
    // If there's a highlighted path and this node is not in it, dim it
    if (highlightedPath.length > 0 && !highlightedPath.includes(node.id)) {
      return '#444';
    }
    
    // If a specific source is selected, apply source filtering
    if (selectedSource !== 'all') {
      // Highlight the selected source
      if (node.type === 'source' && node.source === selectedSource) {
        return '#0078d4'; // Bright blue for selected source
      }
      // Dim other sources when a specific source is selected
      if (node.type === 'source' && node.source !== selectedSource) {
        return '#333'; // Dimmed color for non-selected sources
      }
      // For pipeline nodes, check if they belong to the selected source
      if (node.type !== 'source' && node.type !== 'destination') {
        if (node.source === selectedSource) {
          // Normal colors for pipeline nodes of the selected source
          switch (node.type) {
            case 'ingestion': return '#52c41a';
            case 'transformation': return '#faad14';
            case 'enrichment': return '#8b5cf6';
            default: return '#888';
          }
        } else {
          return '#333'; // Dim pipeline nodes from other sources
        }
      }
      // Destinations: check if they have connections in current filtered set
      if (node.type === 'destination') {
        const hasConnections = connections.some(conn => conn.to === node.id);
        return hasConnections ? '#ef4444' : '#333';
      }
    }
    
    // Default colors when no source is selected
    switch (node.type) {
      case 'source': return '#0078d4';
      case 'ingestion': return '#52c41a';
      case 'transformation': return '#faad14';
      case 'enrichment': return '#8b5cf6';
      case 'destination': return '#ef4444';
      default: return '#888';
    }
  };

  const getConnectionStyle = (connection: DataConnection) => {
    const isHighlighted = highlightedPath.includes(connection.from) && highlightedPath.includes(connection.to);
    
    const baseStyle = {
      strokeWidth: connection.volume === 'high' ? '3' : connection.volume === 'medium' ? '2' : '1',
      stroke: connection.health === 'error' ? '#ef4444' :
              connection.health === 'warning' ? '#faad14' : '#52c41a',
      opacity: highlightedPath.length > 0 ? (isHighlighted ? '1' : '0.2') : '0.8',
      strokeDasharray: connection.volume === 'low' ? '5,5' : 'none',
      markerEnd: connection.health === 'error' ? 'url(#arrowhead-error)' :
                 connection.health === 'warning' ? 'url(#arrowhead-warning)' : 
                 'url(#arrowhead-healthy)'
    };
    
    return baseStyle;
  };

  const getStatusIcon = (status: PipelineStatus) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} className={styles.statusHealthy} />;
      case 'warning': return <AlertTriangle size={16} className={styles.statusWarning} />;
      case 'failed': return <XCircle size={16} className={styles.statusFailed} />;
      case 'processing': return <Activity size={16} className={styles.statusProcessing} />;
      default: return null;
    }
  };

  const uniqueSources = [...new Set(mockPipelines.map(p => p.source))];

  return (
    <div className={styles.dataLineage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              Interactive Data Lineage
              <button 
                className={styles.infoButton}
                onClick={() => setShowHowItWorks(true)}
                title="How does this system work?"
              >
                <HelpCircle size={18} />
              </button>
              <button 
                className={`${styles.infoButton} ${styles.challengesButton}`}
                onClick={() => setShowChallenges(true)}
                title="Implementation Challenges"
              >
                <Shield size={18} />
              </button>
            </h1>
            <p className={styles.subtitle}>Visualize and explore data flow through your threat intelligence pipelines</p>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search nodes and pipelines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as PipelineSource | 'all')}
            className={styles.filterSelect}
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          <button 
            className={styles.clearButton}
            onClick={() => {
              setSelectedNode(null);
              setHighlightedPath([]);
              setSelectedSource('all');
            }}
          >
            Clear Selection
          </button>
          <button 
            className={styles.clearButton}
            onClick={() => {
              // Find a node with errors for testing
              const errorNode = allNodes.find(n => n.hasErrors && n.pipelineData);
              if (errorNode) {
                console.log('Test: Opening modal for', errorNode.name);
                setSelectedNode(errorNode);
                setShowErrorModal(true);
              } else {
                console.log('Test: No error nodes found');
              }
            }}
            style={{ background: '#dc3545' }}
          >
            Test Error Modal
          </button>
        </div>

        {/* Selected Source Indicator */}
        {selectedSource !== 'all' && (
          <div className={styles.filterIndicator}>
            <span>Showing data flow for: <strong>{selectedSource}</strong></span>
            <button 
              className={styles.clearFilterButton}
              onClick={() => setSelectedSource('all')}
              title="Show all sources"
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.contentGrid}>
          {/* Main Visualization */}
          <div className={styles.visualizationPanel}>
            {/* Legend */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.source}`}></div>
                <span>Data Sources</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.ingestion}`}></div>
                <span>Ingestion</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.transformation}`}></div>
                <span>Transformation</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.enrichment}`}></div>
                <span>Enrichment</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendDot} ${styles.destination}`}></div>
                <span>Destinations</span>
              </div>
              <div className={styles.legendSeparator}></div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendProcessingBadge} ${styles.streaming}`}>STRM</div>
                <span>Streaming</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendProcessingBadge} ${styles.microBatch}`}>μBTCH</div>
                <span>Micro-batch</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendProcessingBadge} ${styles.batch}`}>BTCH</div>
                <span>Batch</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendProcessingBadge} ${styles.hybrid}`}>HYB</div>
                <span>Hybrid</span>
              </div>
            </div>

            {/* SVG Visualization */}
            <div className={styles.lineageContainer}>
              <svg 
                ref={svgRef}
                className={styles.lineageSvg}
                viewBox="0 0 1600 900"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Animated gradient definitions */}
                <defs>
                  <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(82, 196, 26, 0.1)" />
                    <stop offset="50%" stopColor="rgba(82, 196, 26, 0.8)" />
                    <stop offset="100%" stopColor="rgba(82, 196, 26, 0.1)" />
                    <animateTransform
                      attributeName="gradientTransform"
                      attributeType="XML"
                      type="translate"
                      values="-100 0; 200 0; -100 0"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </linearGradient>
                  
                  {/* Dynamic arrow markers for different connection colors */}
                  <marker
                    id="arrowhead-healthy"
                    markerWidth="6"
                    markerHeight="4"
                    refX="5"
                    refY="2"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 2, 0 4" fill="#52c41a" />
                  </marker>
                  
                  <marker
                    id="arrowhead-warning"
                    markerWidth="6"
                    markerHeight="4"
                    refX="5"
                    refY="2"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 2, 0 4" fill="#faad14" />
                  </marker>
                  
                  <marker
                    id="arrowhead-error"
                    markerWidth="6"
                    markerHeight="4"
                    refX="5"
                    refY="2"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 2, 0 4" fill="#ef4444" />
                  </marker>
                  
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Section labels */}
                <text x="120" y="50" className={styles.sectionLabel}>Data Sources</text>
                <text x="420" y="50" className={styles.sectionLabel}>Ingestion</text>
                <text x="720" y="50" className={styles.sectionLabel}>Transformation</text>
                <text x="1020" y="50" className={styles.sectionLabel}>Enrichment</text>
                <text x="1320" y="50" className={styles.sectionLabel}>Destinations</text>

                {/* Render connections */}
                {connections
                  .filter(conn => {
                    const fromNode = filteredNodes.find(n => n.id === conn.from);
                    const toNode = filteredNodes.find(n => n.id === conn.to);
                    return fromNode && toNode;
                  })
                  .map((conn) => {
                    const fromNode = filteredNodes.find(n => n.id === conn.from)!;
                    const toNode = filteredNodes.find(n => n.id === conn.to)!;
                    const style = getConnectionStyle(conn);
                    
                    return (
                      <g key={conn.id}>
                        <line
                          x1={fromNode.x + 180}
                          y1={fromNode.y + 22}
                          x2={toNode.x - 20}
                          y2={toNode.y + 22}
                          stroke={style.stroke}
                          strokeWidth={style.strokeWidth}
                          opacity={style.opacity}
                          strokeDasharray={style.strokeDasharray}
                          markerEnd={style.markerEnd}
                          className={styles.connectionLine}
                        />
                        {conn.animated && (
                          <circle
                            r="3"
                            fill={style.stroke}
                            className={styles.flowDot}
                          >
                            <animateMotion
                              dur="3s"
                              repeatCount="indefinite"
                              path={`M${fromNode.x + 180},${fromNode.y + 22} L${toNode.x - 20},${toNode.y + 22}`}
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                {/* Render nodes */}
                {filteredNodes.map(node => {
                  const isSelectedSource = node.type === 'source' && selectedSource !== 'all' && node.source === selectedSource;
                  
                  return (
                  <g 
                    key={node.id}
                    className={styles.nodeGroup}
                    onClick={(e) => handleNodeClick(node, e)}
                    onDoubleClick={() => handleNodeDoubleClick(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect
                      x={node.x}
                      y={node.y}
                      width="180"
                      height="45"
                      fill={getNodeColor(node)}
                      rx="6"
                      className={`${styles.nodeRect} ${selectedNode?.id === node.id ? styles.selectedNode : ''}`}
                      filter={selectedNode?.id === node.id || isSelectedSource ? "url(#glow)" : "none"}
                      stroke={isSelectedSource ? "#ffffff" : "transparent"}
                      strokeWidth={isSelectedSource ? "2" : "0"}
                    />
                    <text
                      x={node.x + 90}
                      y={node.y + 18}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="600"
                      className={styles.nodeText}
                    >
                      {node.name.length > 20 ? `${node.name.substring(0, 17)}...` : node.name}
                    </text>
                    
                    {/* Microsoft Technology Label */}
                    <text
                      x={node.x + 90}
                      y={node.y + 30}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="500"
                    >
                      {node.technology.length > 30 ? 
                        node.technology.split(' ')[0] + (node.technology.includes('Azure') ? ' ' + node.technology.split(' ')[1] : '') :
                        node.technology
                      }
                    </text>
                    
                    {/* Processing Mode Badge */}
                    <rect
                      x={node.x + 5}
                      y={node.y + 5}
                      width="28"
                      height="12"
                      fill={node.processingMode === 'streaming' ? '#52c41a' :
                            node.processingMode === 'micro-batch' ? '#faad14' :
                            node.processingMode === 'hybrid' ? '#8b5cf6' :
                            '#0078d4'}
                      rx="2"
                    />
                    <text
                      x={node.x + 19}
                      y={node.y + 13}
                      textAnchor="middle"
                      fill="white"
                      fontSize="6"
                      fontWeight="700"
                    >
                      {node.processingMode === 'streaming' ? 'STRM' :
                       node.processingMode === 'micro-batch' ? 'μBTCH' :
                       node.processingMode === 'hybrid' ? 'HYB' :
                       'BTCH'}
                    </text>
                    
                    <text
                      x={node.x + 90}
                      y={node.y + 40}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.8)"
                      fontSize="9"
                      className={styles.nodeSubtext}
                    >
                      {node.recordsPerSecond}/s
                    </text>
                    
                    {/* Status indicator */}
                    <circle
                      cx={node.x + 160}
                      cy={node.y + 12}
                      r="5"
                      fill={node.status === 'healthy' ? '#52c41a' :
                            node.status === 'warning' ? '#faad14' :
                            node.status === 'failed' ? '#ef4444' : '#1890ff'}
                    />
                    
                    {/* ENHANCED Error count indicator - BIGGER and MORE VISIBLE */}
                    {node.hasErrors && node.errorCount && node.errorCount > 0 && (
                      <g>
                        <circle
                          cx={node.x + 170}
                          cy={node.y + 35}
                          r="12"
                          fill="#ef4444"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={node.x + 170}
                          y={node.y + 40}
                          textAnchor="middle"
                          fill="white"
                          fontSize="11"
                          fontWeight="700"
                        >
                          {node.errorCount > 9 ? '9+' : node.errorCount}
                        </text>
                      </g>
                    )}
                    
                    {/* Enhanced visual indicator for nodes with errors - THICKER BORDER */}
                    {node.hasErrors && (
                      <rect
                        x={node.x - 3}
                        y={node.y - 3}
                        width="186"
                        height="51"
                        fill="none"
                        stroke={node.status === 'failed' ? '#ef4444' : '#faad14'}
                        strokeWidth="3"
                        rx="8"
                        className={styles.errorBorder}
                      />
                    )}
                    
                    {/* Double-click hint for error nodes */}
                    {node.hasErrors && hoveredNode === node.id && (
                      <g>
                        <rect
                          x={node.x + 20}
                          y={node.y + 55}
                          width="140"
                          height="20"
                          fill="rgba(0, 0, 0, 0.8)"
                          rx="4"
                        />
                        <text
                          x={node.x + 90}
                          y={node.y + 68}
                          textAnchor="middle"
                          fill="#faad14"
                          fontSize="10"
                          fontWeight="600"
                        >
                          Double-click for error details
                        </text>
                      </g>
                    )}
                  </g>
                  );
                })}
                
                {/* Render tooltips separately to ensure they appear on top */}
                {hoveredNode && filteredNodes.map(node => {
                  if (hoveredNode !== node.id) return null;
                  
                  // Smart positioning: if node is too far right, show tooltip on the left
                  const tooltipX = node.x > 1000 ? node.x - 210 : node.x + 190;
                  const tooltipY = node.y - 10;
                  
                  return (
                    <g key={`tooltip-${node.id}`} className={styles.tooltip}>
                      <rect
                        x={tooltipX}
                        y={tooltipY}
                        width="240"
                        height="110"
                        fill="rgba(0,0,0,0.95)"
                        rx="6"
                        stroke="#555"
                        strokeWidth="1"
                      />
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 15}
                        fill="white"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {node.name}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 28}
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="500"
                      >
                        {node.technology}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 40}
                        fill="#ccc"
                        fontSize="9"
                      >
                        Processing: {node.processingMode?.toUpperCase()} | {node.dataMovementTool}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 52}
                        fill="#ccc"
                        fontSize="9"
                      >
                        Records/sec: {node.recordsPerSecond} | Avg Time: {node.avgProcessingTime}ms
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 64}
                        fill="#ccc"
                        fontSize="9"
                      >
                        {node.processingMode === 'streaming' ? `Latency: ${node.streamingLatency}` : 
                         node.processingMode === 'batch' ? `Frequency: ${node.batchFrequency}` :
                         'Mode: Hybrid Processing'}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 76}
                        fill="#ccc"
                        fontSize="9"
                      >
                        Format: {node.dataFormat} | Quality: {node.dataQuality}%
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 88}
                        fill="#ccc"
                        fontSize="9"
                      >
                        RG: {node.resourceGroup.split('-').slice(-2).join('-')}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 100}
                        fill="#52c41a"
                        fontSize="8"
                      >
                        Click for detailed tech specs →
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Side Panel */}
        </div>

        {/* Node Details Popup */}
        {showNodePopup && selectedNode && (
          <>
            <div className={styles.popupOverlay} onClick={() => setShowNodePopup(false)} />
            <div 
              className={`${styles.nodePopup} ${popupExpanded ? styles.nodePopupExpanded : ''}`}
              style={{
                left: `${popupPosition.x}px`,
                top: `${popupPosition.y}px`
              }}
            >
              <div className={styles.popupHeader}>
                <h3 className={styles.popupTitle}>
                  {selectedNode.type === 'source' && <Database size={18} />}
                  {selectedNode.type === 'ingestion' && <ArrowRight size={18} />}
                  {selectedNode.type === 'transformation' && <GitBranch size={18} />}
                  {selectedNode.type === 'enrichment' && <Zap size={18} />}
                  {selectedNode.type === 'destination' && <HardDrive size={18} />}
                  {selectedNode.name}
                </h3>
                <div className={styles.popupActions}>
                  <button 
                    className={styles.popupButton}
                    onClick={() => setShowNodePopup(false)}
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className={styles.popupContent}>
                {/* Quick Info Grid */}
                <div className={styles.quickInfo}>
                  <div className={styles.quickInfoItem}>
                    <span className={styles.quickInfoLabel}>Status</span>
                    <div className={styles.quickInfoValue}>
                      <span className={`${styles.statusBadge} ${styles[`status${selectedNode.status.charAt(0).toUpperCase() + selectedNode.status.slice(1)}`]}`}>
                        {getStatusIcon(selectedNode.status)}
                        {selectedNode.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.quickInfoItem}>
                    <span className={styles.quickInfoLabel}>Technology</span>
                    <div className={styles.quickInfoValue}>
                      <Server size={14} />
                      {selectedNode.technology}
                    </div>
                  </div>
                  
                  <div className={styles.quickInfoItem}>
                    <span className={styles.quickInfoLabel}>Throughput</span>
                    <div className={styles.quickInfoValue}>
                      <Activity size={14} />
                      {selectedNode.recordsPerSecond}/s
                    </div>
                  </div>
                  
                  <div className={styles.quickInfoItem}>
                    <span className={styles.quickInfoLabel}>Processing Time</span>
                    <div className={styles.quickInfoValue}>
                      <Clock size={14} />
                      {selectedNode.avgProcessingTime}ms
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className={styles.metricGrid}>
                  <div className={styles.metricItem}>
                    <p className={styles.metricValue}>{selectedNode.dataQuality}%</p>
                    <p className={styles.metricLabel}>Data Quality</p>
                  </div>
                  <div className={styles.metricItem}>
                    <p className={styles.metricValue}>{selectedNode.connections.length}</p>
                    <p className={styles.metricLabel}>Connections</p>
                  </div>
                  <div className={styles.metricItem}>
                    <p className={styles.metricValue}>{selectedNode.region}</p>
                    <p className={styles.metricLabel}>Region</p>
                  </div>
                </div>

                {/* Expand Button */}
                <div className={styles.expandButtonContainer}>
                  <button 
                    className={styles.expandButton}
                    onClick={handlePopupExpansion}
                    title={popupExpanded ? "Show less details" : "Show more details"}
                  >
                    {popupExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    {popupExpanded ? "Less Details" : "More Details"}
                  </button>
                </div>

                {/* Detailed Information - Conditional */}
                {popupExpanded && (
                <div className={styles.expandedContent}>
                  <div className={styles.expandedSection}>
                    <h4 className={styles.expandedSectionTitle}>
                      <Shield size={16} />
                      Security & Authentication
                    </h4>
                    <div className={styles.expandedSectionContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Authentication:</span>
                        <span className={styles.detailValue}>{selectedNode.authentication}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Protocols:</span>
                        <div className={styles.tagList}>
                          {selectedNode.protocols?.slice(0, 3).map((protocol, idx) => (
                            <span key={idx} className={styles.tag}>{protocol}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.expandedSection}>
                    <h4 className={styles.expandedSectionTitle}>
                      <Cpu size={16} />
                      Infrastructure
                    </h4>
                    <div className={styles.expandedSectionContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Resource Group:</span>
                        <span className={styles.detailValue}>{selectedNode.resourceGroup}</span>
                      </div>
                      {selectedNode.computeType && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Compute:</span>
                          <span className={styles.detailValue}>{selectedNode.computeType}</span>
                        </div>
                      )}
                      {selectedNode.storageType && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>Storage:</span>
                          <span className={styles.detailValue}>{selectedNode.storageType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.expandedSection}>
                    <h4 className={styles.expandedSectionTitle}>
                      <BarChart3 size={16} />
                      Monitoring
                    </h4>
                    <div className={styles.expandedSectionContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>App Insights:</span>
                        <span className={styles.detailValue}>{selectedNode.monitoring?.applicationInsights}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Log Analytics:</span>
                        <span className={styles.detailValue}>{selectedNode.monitoring?.logAnalyticsWorkspace}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.expandedSection}>
                    <h4 className={styles.expandedSectionTitle}>
                      <AlertTriangle size={16} />
                      Dependencies
                    </h4>
                    <div className={styles.expandedSectionContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Key Vault:</span>
                        <span className={styles.detailValue}>{selectedNode.dependencies?.keyVault}</span>
                      </div>
                      {selectedNode.dependencies?.externalApis && selectedNode.dependencies.externalApis.length > 0 && (
                        <div className={styles.detailItem}>
                          <span className={styles.detailLabel}>External APIs:</span>
                          <div className={styles.tagList}>
                            {selectedNode.dependencies.externalApis.slice(0, 2).map((api, idx) => (
                              <span key={idx} className={styles.tag}>{api}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Information Section */}
                  <div className={styles.expandedSection}>
                    <h4 className={styles.expandedSectionTitle}>
                      <Cpu size={16} />
                      Operational Information
                    </h4>
                    <div className={styles.expandedSectionContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Owner:</span>
                        <span className={styles.detailValue}>{selectedNode.operationalInfo?.owner}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Escalation Path:</span>
                        <div className={styles.tagList}>
                          {selectedNode.operationalInfo?.escalationPath?.map((contact, idx) => (
                            <span key={idx} className={styles.tag}>{contact}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Maintenance Window:</span>
                        <span className={styles.detailValue}>{selectedNode.operationalInfo?.maintenanceWindow}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Criticality Level:</span>
                        <span className={styles.detailValue}>{selectedNode.operationalInfo?.criticalityLevel}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Data Classification:</span>
                        <span className={styles.detailValue}>{selectedNode.operationalInfo?.dataClassification}</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Compliance Requirements:</span>
                        <div className={styles.tagList}>
                          {selectedNode.operationalInfo?.complianceRequirements?.map((req, idx) => (
                            <span key={idx} className={styles.tag}>{req}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SLA Metrics Section */}
                  <div className={styles.expandedSection}>
                    <h4 className={styles.expandedSectionTitle}>
                      <Clock size={16} />
                      SLA Metrics
                    </h4>
                    <div className={styles.expandedSectionContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Uptime:</span>
                        <span className={styles.detailValue}>{selectedNode.slaMetrics?.uptime}%</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Target Uptime:</span>
                        <span className={styles.detailValue}>{selectedNode.slaMetrics?.targetUptime}%</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>MTTR:</span>
                        <span className={styles.detailValue}>{selectedNode.slaMetrics?.mttr} minutes</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>MTBF:</span>
                        <span className={styles.detailValue}>{selectedNode.slaMetrics?.mtbf} hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics Section */}
                  <div className={styles.expandedSection}>
                    <h4 className={styles.expandedSectionTitle}>
                      <BarChart3 size={16} />
                      Performance Metrics
                    </h4>
                    <div className={styles.expandedSectionContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Avg Latency:</span>
                        <span className={styles.detailValue}>{selectedNode.performanceMetrics?.avgLatency}ms</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>P95 Latency:</span>
                        <span className={styles.detailValue}>{selectedNode.performanceMetrics?.p95Latency}ms</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Error Rate:</span>
                        <span className={styles.detailValue}>{selectedNode.performanceMetrics?.errorRate}%</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Throughput:</span>
                        <span className={styles.detailValue}>{selectedNode.performanceMetrics?.throughputMbps} Mbps</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>CPU Utilization:</span>
                        <span className={styles.detailValue}>{selectedNode.performanceMetrics?.cpuUtilization}%</span>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Memory Utilization:</span>
                        <span className={styles.detailValue}>{selectedNode.performanceMetrics?.memoryUtilization}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Troubleshooting Section */}
                  <div className={styles.expandedSection}>
                    <h4 className={styles.expandedSectionTitle}>
                      <HelpCircle size={16} />
                      Troubleshooting Resources
                    </h4>
                    <div className={styles.expandedSectionContent}>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Common Issues:</span>
                        <div className={styles.tagList}>
                          {selectedNode.troubleshooting?.commonIssues?.slice(0, 2).map((issue, idx) => (
                            <span key={idx} className={styles.tag}>{issue}</span>
                          ))}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Runbook URLs:</span>
                        <div className={styles.linkList}>
                          {selectedNode.troubleshooting?.runbookUrls?.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                              Runbook {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Health Check Endpoints:</span>
                        <div className={styles.linkList}>
                          {selectedNode.troubleshooting?.healthCheckEndpoints?.map((endpoint, idx) => (
                            <a key={idx} href={endpoint} target="_blank" rel="noopener noreferrer" className={styles.link}>
                              Health Check {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Sample Log Queries:</span>
                        <div className={styles.codeSnippets}>
                          {selectedNode.troubleshooting?.logQuerySamples?.map((query, idx) => (
                            <code key={idx} className={styles.codeSnippet}>
                              {query}
                            </code>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Error Status & Actions */}
                {(selectedNode.hasErrors || selectedNode.status === 'failed' || selectedNode.status === 'warning') && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                      <span style={{ fontWeight: '600', color: '#ef4444' }}>
                        {selectedNode.errorCount ? `${selectedNode.errorCount} Active Errors` : 'System Issues Detected'}
                      </span>
                    </div>
                    
                    {selectedNode.pipelineData?.currentError && (
                      <p style={{ fontSize: '0.85rem', color: '#cccccc', margin: '0 0 0.75rem 0' }}>
                        {selectedNode.pipelineData.currentError.errorMessage.slice(0, 100)}...
                      </p>
                    )}
                    
                    <button 
                      onClick={() => {
                        setShowErrorModal(true);
                        setShowNodePopup(false);
                      }}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <AlertTriangle size={14} />
                      View Error Details
                    </button>
                  </div>
                )}

                {/* Last Updated */}
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#888', textAlign: 'center' }}>
                  Last updated: {new Date(selectedNode.lastUpdate).toLocaleString()}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Error Details Modal */}
        {showErrorModal && selectedNode && selectedNode.pipelineData && (
          <ErrorDetailsModal
            isOpen={showErrorModal}
            onClose={() => setShowErrorModal(false)}
            pipelineName={selectedNode.name}
            currentError={selectedNode.pipelineData.currentError}
            errorHistory={selectedNode.pipelineData.errorHistory || []}
            logReferences={selectedNode.pipelineData.logs || []}
            metricsHistory={selectedNode.pipelineData.metrics || []}
            impactAnalysis={selectedNode.pipelineData.impact}
            runbooks={selectedNode.pipelineData.runbooks || []}
            oncallTeam={selectedNode.operationalInfo?.owner || 'MSTIC Data Engineering Team'}
            slackChannel="#mstic-incidents"
            teamsChannel="MSTIC Operations"
            operationalData={{
              slaMetrics: selectedNode.slaMetrics,
              operationalInfo: selectedNode.operationalInfo,
              performanceMetrics: selectedNode.performanceMetrics,
              troubleshooting: selectedNode.troubleshooting,
              contactInfo: {
                primaryTeam: selectedNode.operationalInfo?.owner || 'MSTIC Data Engineering Team',
                secondaryTeam: 'MSTIC Platform Team',
                escalationContacts: [
                  {
                    name: 'On-call Engineer',
                    role: 'Level 1 Support',
                    email: 'mstic-oncall@microsoft.com',
                    phone: '+1-425-882-8080',
                    slackHandle: '@mstic-oncall'
                  },
                  {
                    name: 'Senior Engineer',
                    role: 'Level 2 Support',
                    email: 'mstic-senior@microsoft.com',
                    phone: '+1-425-882-8081',
                    slackHandle: '@mstic-senior'
                  },
                  {
                    name: 'Engineering Manager',
                    role: 'Level 3 Escalation',
                    email: 'mstic-manager@microsoft.com',
                    phone: '+1-425-882-8082',
                    slackHandle: '@mstic-manager'
                  }
                ]
              },
              technology: {
                stack: selectedNode.technology,
                resourceGroup: selectedNode.resourceGroup,
                subscriptionId: selectedNode.subscriptionId,
                region: selectedNode.region
              }
            }}
          />
        )}

        {/* Summary Stats */}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <Database size={24} />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{nodes.filter(n => n.type === 'source').length}</div>
              <div className={styles.summaryLabel}>Data Sources</div>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <GitBranch size={24} />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>
                {nodes.filter(n => ['ingestion', 'transformation', 'enrichment'].includes(n.type)).length}
              </div>
              <div className={styles.summaryLabel}>Processing Pipelines</div>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <ArrowRight size={24} />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{connections.length}</div>
              <div className={styles.summaryLabel}>Data Flows</div>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <HardDrive size={24} />
            </div>
            <div className={styles.summaryContent}>
              <div className={styles.summaryValue}>{nodes.filter(n => n.type === 'destination').length}</div>
              <div className={styles.summaryLabel}>Destinations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Details Modal */}
      {showErrorModal && selectedNode && selectedNode.pipelineData && (
        <ErrorDetailsModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          pipelineName={selectedNode.pipelineData.name}
          currentError={selectedNode.pipelineData.currentError}
          errorHistory={selectedNode.pipelineData.errorHistory || []}
          logReferences={selectedNode.pipelineData.logReferences || []}
          metricsHistory={selectedNode.pipelineData.metricsHistory || []}
          impactAnalysis={selectedNode.pipelineData.impactAnalysis}
          runbooks={selectedNode.pipelineData.runbooks || []}
          oncallTeam={selectedNode.pipelineData.oncallTeam || 'MSTIC Data Engineering'}
          slackChannel={selectedNode.pipelineData.slackChannel}
          teamsChannel={selectedNode.pipelineData.teamsChannel}
          dashboardUrl={selectedNode.pipelineData.dashboardUrl}
          grafanaUrl={selectedNode.pipelineData.grafanaUrl}
          healthCheckUrl={selectedNode.pipelineData.healthCheckUrl}
          operationalData={{
            slaMetrics: selectedNode.slaMetrics,
            operationalInfo: selectedNode.operationalInfo,
            performanceMetrics: selectedNode.performanceMetrics,
            troubleshooting: selectedNode.troubleshooting,
            technology: {
              stack: selectedNode.technology,
              resourceGroup: selectedNode.resourceGroup,
              region: selectedNode.region,
              subscriptionId: selectedNode.subscriptionId
            },
            contactInfo: {
              primaryTeam: selectedNode.operationalInfo?.owner || 'MSTIC Data Engineering',
              escalationContacts: selectedNode.operationalInfo?.escalationPath?.map((role, index) => ({
                name: `${role} Contact`,
                role: role,
                email: `${role.toLowerCase().replace(/\s+/g, '.')}@microsoft.com`,
                phone: index === 0 ? '+1-555-0123' : undefined,
                slackHandle: `@${role.toLowerCase().replace(/\s+/g, '')}`
              })) || []
            }
          }}
        />
      )}
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="dataLineage"
      />
      
      <ChallengesModal
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
        section="dataLineage"
      />
    </div>
  );
});

DataLineage.displayName = 'DataLineage';

export default DataLineage;