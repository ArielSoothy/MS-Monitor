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
  HelpCircle
} from 'lucide-react';
import { mockPipelines } from '../data/mockData';
import type { PipelineSource, PipelineStatus } from '../types';
import ErrorDetailsModal from '../components/ErrorDetailsModal';
import HowItWorksModal from '../components/HowItWorksModal';
import InfoTooltip from '../components/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
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
        y: 80 + index * 80,
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
        }
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
        y: 80 + index * 80,
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
        // Microsoft Technology Stack Details for Processing Pipelines
        technology: type === 'ingestion' ? 'Azure Data Factory' :
                   type === 'transformation' ? 'Azure Synapse Analytics (Spark Pools)' :
                   'Azure Databricks + Azure Functions',
        resourceGroup: `rg-mstic-${type}-prod-eastus2`,
        subscriptionId: 'mstic-prod-subscription',
        region: 'East US 2',
        computeType: type === 'ingestion' ? 'Integration Runtime (Auto-resolve)' :
                    type === 'transformation' ? 'Spark Pool (Medium: 8-32 nodes)' :
                    'Databricks Cluster (Standard_DS3_v2)',
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
      { name: 'API Gateway', types: ['api', 'external'], priority: 2 }
    ];

    destinations.forEach((dest, index) => {
      const statusSeed = seededRandom(`${dest.name}-status`);
      const statusOptions: PipelineStatus[] = ['healthy', 'warning'];
      const status = statusOptions[Math.floor(statusSeed * statusOptions.length)];
      
      nodes.push({
        id: `dest-${dest.name}`,
        name: dest.name,
        type: 'destination',
        x: 1250,
        y: 80 + index * 80,
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
        }
      });
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

  const handleNodeClick = (node: LineageNode) => {
    // Always set the selected node first - this fixes the double-click issue
    setSelectedNode(node);
    
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
                    onClick={() => handleNodeClick(node)}
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
                      fill="#0078d4"
                      fontSize="8"
                      fontWeight="500"
                    >
                      {node.technology.length > 30 ? 
                        node.technology.split(' ')[0] + (node.technology.includes('Azure') ? ' ' + node.technology.split(' ')[1] : '') :
                        node.technology
                      }
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
                        width="220"
                        height="85"
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
                        fill="#0078d4"
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
                        Records/sec: {node.recordsPerSecond}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 52}
                        fill="#ccc"
                        fontSize="9"
                      >
                        Avg Time: {node.avgProcessingTime}ms
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 64}
                        fill="#ccc"
                        fontSize="9"
                      >
                        Quality: {node.dataQuality}% | RG: {node.resourceGroup.split('-').slice(-2).join('-')}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 76}
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
          {selectedNode && (
            <div className={styles.sidePanel}>
              <div className={styles.sidePanelHeader}>
                <h3 className={styles.sidePanelTitle}>{selectedNode.name}</h3>
                <div className={styles.statusBadge}>
                  {getStatusIcon(selectedNode.status)}
                  <span>{selectedNode.status}</span>
                </div>
              </div>
              <div className={styles.sidePanelContent}>
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>Overview</h4>
                  <p className={styles.detailDescription}>{selectedNode.description}</p>
                  
                  <div className={styles.metricGrid}>
                    <div className={styles.metric}>
                      <Activity size={16} />
                      <div>
                        <div className={styles.metricValue}>{selectedNode.recordsPerSecond}/s</div>
                        <div className={styles.metricLabel}>
                          Records per second
                          <InfoTooltip 
                            content={getTooltipContent('recordsPerSecond')?.content || "Current throughput rate"}
                            title={getTooltipContent('recordsPerSecond')?.title}
                            detailedContent={getTooltipContent('recordsPerSecond')?.detailedContent}
                            size="small"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.metric}>
                      <Clock size={16} />
                      <div>
                        <div className={styles.metricValue}>{selectedNode.avgProcessingTime}ms</div>
                        <div className={styles.metricLabel}>
                          Avg processing time
                          <InfoTooltip 
                            content={getTooltipContent('avgProcessingTime')?.content || "Mean processing time per record"}
                            title={getTooltipContent('avgProcessingTime')?.title}
                            detailedContent={getTooltipContent('avgProcessingTime')?.detailedContent}
                            size="small"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.metric}>
                      <BarChart3 size={16} />
                      <div>
                        <div className={styles.metricValue}>{selectedNode.dataQuality}%</div>
                        <div className={styles.metricLabel}>
                          Data quality
                          <InfoTooltip 
                            content={getTooltipContent('dataQuality')?.content || "Data completeness and accuracy score"}
                            title={getTooltipContent('dataQuality')?.title}
                            detailedContent={getTooltipContent('dataQuality')?.detailedContent}
                            size="small"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.metric}>
                      <Zap size={16} />
                      <div>
                        <div className={styles.metricValue}>{selectedNode.connections.length}</div>
                        <div className={styles.metricLabel}>
                          Connections
                          <InfoTooltip 
                            content={getTooltipContent('connections')?.content || "Number of connected pipeline components"}
                            title={getTooltipContent('connections')?.title}
                            detailedContent={getTooltipContent('connections')?.detailedContent}
                            size="small"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>Connected Pipelines</h4>
                  <div className={styles.connectionsList}>
                    {selectedNode.connections.slice(0, 5).map(connId => {
                      const connectedNode = nodes.find(n => n.id === connId);
                      return connectedNode ? (
                        <div key={connId} className={styles.connectionItem}>
                          <div 
                            className={styles.connectionDot}
                            style={{ backgroundColor: getNodeColor(connectedNode) }}
                          />
                          <span className={styles.connectionName}>{connectedNode.name}</span>
                          <span className={styles.connectionType}>{connectedNode.type}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>Recent Activity</h4>
                  <div className={styles.activityItem}>
                    <div className={styles.activityIcon}>
                      <CheckCircle size={14} />
                    </div>
                    <div>
                      <div className={styles.activityText}>Last updated</div>
                      <div className={styles.activityTime}>
                        {new Date(selectedNode.lastUpdate).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Microsoft Technology Stack Details */}
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>🏗️ Microsoft Technology Stack</h4>
                  <div className={styles.techDetails}>
                    <div className={styles.techItem}>
                      <strong>Service:</strong> {selectedNode.technology}
                      {selectedNode.technology.includes('Event Hub') && (
                        <InfoTooltip 
                          content={getTooltipContent('eventHubs')?.content || "Real-time data streaming platform"}
                          title={getTooltipContent('eventHubs')?.title}
                          detailedContent={getTooltipContent('eventHubs')?.detailedContent}
                          size="small"
                        />
                      )}
                      {selectedNode.technology.includes('Data Factory') && (
                        <InfoTooltip 
                          content={getTooltipContent('azureDataFactory')?.content || "Cloud-based data integration service"}
                          title={getTooltipContent('azureDataFactory')?.title}
                          detailedContent={getTooltipContent('azureDataFactory')?.detailedContent}
                          size="small"
                        />
                      )}
                      {selectedNode.technology.includes('Stream Analytics') && (
                        <InfoTooltip 
                          content={getTooltipContent('streamAnalytics')?.content || "Real-time analytics service"}
                          title={getTooltipContent('streamAnalytics')?.title}
                          detailedContent={getTooltipContent('streamAnalytics')?.detailedContent}
                          size="small"
                        />
                      )}
                      {selectedNode.technology.includes('Cosmos') && (
                        <InfoTooltip 
                          content={getTooltipContent('cosmosDB')?.content || "Globally distributed database service"}
                          title={getTooltipContent('cosmosDB')?.title}
                          detailedContent={getTooltipContent('cosmosDB')?.detailedContent}
                          size="small"
                        />
                      )}
                      {selectedNode.technology.includes('Data Lake') && (
                        <InfoTooltip 
                          content={getTooltipContent('dataLake')?.content || "Scalable data storage for big data"}
                          title={getTooltipContent('dataLake')?.title}
                          detailedContent={getTooltipContent('dataLake')?.detailedContent}
                          size="small"
                        />
                      )}
                    </div>
                    <div className={styles.techItem}>
                      <strong>Resource Group:</strong> {selectedNode.resourceGroup}
                    </div>
                    <div className={styles.techItem}>
                      <strong>Region:</strong> {selectedNode.region}
                    </div>
                    {selectedNode.computeType && (
                      <div className={styles.techItem}>
                        <strong>Compute:</strong> {selectedNode.computeType}
                      </div>
                    )}
                    {selectedNode.storageType && (
                      <div className={styles.techItem}>
                        <strong>Storage:</strong> {selectedNode.storageType}
                      </div>
                    )}
                    {selectedNode.throughputUnits && (
                      <div className={styles.techItem}>
                        <strong>Throughput Units:</strong> {selectedNode.throughputUnits}
                      </div>
                    )}
                    <div className={styles.techItem}>
                      <strong>Partitions:</strong> {selectedNode.partitionCount}
                    </div>
                    <div className={styles.techItem}>
                      <strong>Retention:</strong> {selectedNode.retentionDays} days
                    </div>
                  </div>
                </div>

                {/* Protocols & Authentication */}
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>🔐 Protocols & Security</h4>
                  <div className={styles.techDetails}>
                    <div className={styles.techItem}>
                      <strong>Protocols:</strong> 
                      <InfoTooltip 
                        content="Communication protocols used for data transfer and API access"
                        title="Communication Protocols"
                        detailedContent="Includes HTTPS for secure web communication, AMQP for messaging, and Kafka for streaming protocols."
                        size="small"
                      />
                      <div className={styles.tagList}>
                        {selectedNode.protocols?.map((protocol, idx) => (
                          <span key={idx} className={styles.protocolTag}>{protocol}</span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.techItem}>
                      <strong>Authentication:</strong> {selectedNode.authentication}
                      <InfoTooltip 
                        content={getTooltipContent('managedIdentity')?.content || "Azure's secure authentication solution"}
                        title={getTooltipContent('managedIdentity')?.title}
                        detailedContent={getTooltipContent('managedIdentity')?.detailedContent}
                        size="small"
                      />
                    </div>
                  </div>
                </div>

                {/* Monitoring & Observability */}
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>📊 Monitoring & Observability</h4>
                  <div className={styles.techDetails}>
                    <div className={styles.techItem}>
                      <strong>Application Insights:</strong> {selectedNode.monitoring?.applicationInsights}
                      <InfoTooltip 
                        content={getTooltipContent('applicationInsights')?.content || "Application performance monitoring service"}
                        title={getTooltipContent('applicationInsights')?.title}
                        detailedContent={getTooltipContent('applicationInsights')?.detailedContent}
                        size="small"
                      />
                    </div>
                    <div className={styles.techItem}>
                      <strong>Log Analytics:</strong> {selectedNode.monitoring?.logAnalyticsWorkspace}
                      <InfoTooltip 
                        content={getTooltipContent('logAnalytics')?.content || "Centralized logging service"}
                        title={getTooltipContent('logAnalytics')?.title}
                        detailedContent={getTooltipContent('logAnalytics')?.detailedContent}
                        size="small"
                      />
                    </div>
                    <div className={styles.techItem}>
                      <strong>Kusto Cluster:</strong> {selectedNode.monitoring?.kustoCluster}
                      <InfoTooltip 
                        content={getTooltipContent('kusto')?.content || "Fast data exploration service"}
                        title={getTooltipContent('kusto')?.title}
                        detailedContent={getTooltipContent('kusto')?.detailedContent}
                        size="small"
                      />
                    </div>
                    <div className={styles.techItem}>
                      <strong>Alert Rules:</strong>
                      <InfoTooltip 
                        content="Automated monitoring rules that trigger notifications based on system conditions"
                        title="Alert Rules"
                        detailedContent="Include performance thresholds, error rate monitoring, resource utilization alerts, and custom business logic triggers."
                        size="small"
                      />
                      <div className={styles.alertList}>
                        {selectedNode.monitoring?.alertRules?.map((rule, idx) => (
                          <span key={idx} className={styles.alertRule}>{rule}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dependencies & External Connections */}
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>🔗 Dependencies & External APIs</h4>
                  <div className={styles.techDetails}>
                    <div className={styles.techItem}>
                      <strong>Key Vault:</strong> {selectedNode.dependencies?.keyVault}
                    </div>
                    <div className={styles.techItem}>
                      <strong>Service Accounts:</strong>
                      <div className={styles.tagList}>
                        {selectedNode.dependencies?.serviceAccounts?.map((sa, idx) => (
                          <span key={idx} className={styles.serviceTag}>{sa}</span>
                        ))}
                      </div>
                    </div>
                    {selectedNode.dependencies?.externalApis && selectedNode.dependencies.externalApis.length > 0 && (
                      <div className={styles.techItem}>
                        <strong>External APIs:</strong>
                        <div className={styles.tagList}>
                          {selectedNode.dependencies.externalApis.map((api, idx) => (
                            <span key={idx} className={styles.apiTag}>{api}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={styles.techItem}>
                      <strong>Network:</strong>
                      <div className={styles.tagList}>
                        {selectedNode.dependencies?.networkConnections?.map((net, idx) => (
                          <span key={idx} className={styles.networkTag}>{net}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Information & Status */}
                {(selectedNode.hasErrors || selectedNode.status === 'failed' || selectedNode.status === 'warning') && (
                  <div className={styles.detailSection}>
                    <h4 className={styles.detailTitle}>
                      🚨 Error Information & Diagnostics
                      {selectedNode.errorCount && selectedNode.errorCount > 0 && (
                        <span className={styles.errorBadge}>{selectedNode.errorCount} errors</span>
                      )}
                    </h4>
                    
                    {selectedNode.pipelineData?.currentError && (
                      <div className={styles.errorDetails}>
                        <div className={styles.errorHeader}>
                          <AlertTriangle size={16} className={styles.errorIcon} />
                          <div>
                            <div className={styles.errorMessage}>
                              {selectedNode.pipelineData.currentError.errorMessage}
                            </div>
                            <div className={styles.errorMeta}>
                              <span className={styles.errorCode}>
                                {selectedNode.pipelineData.currentError.errorCode}
                              </span>
                              <span className={styles.errorTime}>
                                {new Date(selectedNode.pipelineData.currentError.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {selectedNode.pipelineData.currentError.suggestedActions && (
                          <div className={styles.suggestedActions}>
                            <strong>Quick Actions:</strong>
                            <ul>
                              {selectedNode.pipelineData.currentError.suggestedActions.slice(0, 3).map((action: string, idx: number) => (
                                <li key={idx}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <button 
                          className={styles.viewFullErrorButton}
                          onClick={() => setShowErrorModal(true)}
                        >
                          <AlertTriangle size={14} />
                          View Complete Error Details
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Logging & Monitoring Links */}
                <div className={styles.detailSection}>
                  <h4 className={styles.detailTitle}>📊 Logs & Monitoring</h4>
                  <div className={styles.monitoringLinks}>
                    {selectedNode.pipelineData?.logReferences?.slice(0, 3).map((log: any, idx: number) => (
                      <button 
                        key={idx}
                        className={styles.logLink}
                        onClick={() => window.open(log.logUrl, '_blank')}
                      >
                        <Database size={14} />
                        {log.logSystem.toUpperCase()} Logs
                      </button>
                    )) || (
                      <>
                        <button 
                          className={styles.logLink}
                          onClick={() => window.open(`https://portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/${selectedNode.subscriptionId}/resourceGroups/${selectedNode.resourceGroup}/providers/Microsoft.Insights/components/${selectedNode.monitoring?.applicationInsights}/logs`, '_blank')}
                        >
                          <Database size={14} />
                          Application Insights
                        </button>
                        <button 
                          className={styles.logLink}
                          onClick={() => window.open(`https://portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/${selectedNode.subscriptionId}/resourceGroups/${selectedNode.resourceGroup}/providers/Microsoft.OperationalInsights/workspaces/${selectedNode.monitoring?.logAnalyticsWorkspace}`, '_blank')}
                        >
                          <Database size={14} />
                          Log Analytics
                        </button>
                        <button 
                          className={styles.logLink}
                          onClick={() => window.open(`https://${selectedNode.monitoring?.kustoCluster}.kusto.windows.net`, '_blank')}
                        >
                          <Database size={14} />
                          Kusto Explorer
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Team Communication Links */}
                  <div className={styles.communicationLinks}>
                    {selectedNode.pipelineData?.slackChannel && (
                      <button 
                        className={styles.commLink}
                        onClick={() => window.open(`slack://channel?team=T123&id=${selectedNode.pipelineData.slackChannel}`, '_blank')}
                      >
                        <Database size={14} />
                        Slack: #{selectedNode.pipelineData.slackChannel}
                      </button>
                    )}
                    {selectedNode.pipelineData?.teamsChannel && (
                      <button 
                        className={styles.commLink}
                        onClick={() => window.open(selectedNode.pipelineData.teamsChannel, '_blank')}
                      >
                        <Database size={14} />
                        Teams Channel
                      </button>
                    )}
                    {selectedNode.pipelineData?.grafanaUrl && (
                      <button 
                        className={styles.commLink}
                        onClick={() => window.open(selectedNode.pipelineData.grafanaUrl, '_blank')}
                      >
                        <BarChart3 size={14} />
                        Grafana Dashboard
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
            <Database size={24} />
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryValue}>{nodes.filter(n => n.type === 'destination').length}</div>
            <div className={styles.summaryLabel}>Destinations</div>
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
        />
      )}
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="dataLineage"
      />
    </div>
  );
});

DataLineage.displayName = 'DataLineage';

export default DataLineage;