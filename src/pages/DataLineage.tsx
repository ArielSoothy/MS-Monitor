import { useState, useRef, memo, useMemo } from 'react';
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
  Zap
} from 'lucide-react';
import { mockPipelines } from '../data/mockData';
import type { PipelineSource, PipelineStatus } from '../types';
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
      
      nodes.push({
        id: `source-${source}`,
        name: source,
        type: 'source',
        source,
        x: 100,
        y: 60 + index * 60,
        status,
        recordsPerSecond: Math.floor(seededRandom(`${source}-records`) * 1000) + 100,
        avgProcessingTime: Math.floor(seededRandom(`${source}-time`) * 500) + 50,
        connections: [],
        description: `Data ingestion from ${source} platform`,
        lastUpdate: new Date(Date.now() - seededRandom(`${source}-update`) * 3600000).toISOString(),
        dataQuality: Math.floor(seededRandom(`${source}-quality`) * 20) + 80
      });
    });

    // Processing pipelines (middle section)
    const pipelineTypes = [
      { type: 'ingestion', x: 300 },
      { type: 'transformation', x: 450 },
      { type: 'enrichment', x: 600 }
    ];

    pipelineTypes.forEach(({ type, x }) => {
      const filteredPipelines = mockPipelines.filter(p => selectedSource === 'all' || p.source === selectedSource);
      const typeNodes = filteredPipelines
        .slice(0, 8)
        .map((pipeline, index) => ({
          id: `${type}-${pipeline.id}`, // Make ID unique per type
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${pipeline.name.split(' ').slice(0, 3).join(' ')}`,
          type: type as 'ingestion' | 'transformation' | 'enrichment',
          source: pipeline.source,
          x,
          y: 60 + index * 60,
          status: pipeline.status,
          recordsPerSecond: Math.floor(pipeline.recordsProcessed / 60),
          avgProcessingTime: pipeline.avgProcessingTime,
          connections: [],
          description: `${type} pipeline: ${pipeline.name}`,
          lastUpdate: pipeline.lastRun.toISOString(),
          dataQuality: Math.floor(seededRandom(`${pipeline.id}-quality`) * 15) + 85,
          actualPipeline: pipeline // Store reference to actual pipeline for dependencies
        }));
        
      nodes.push(...typeNodes);
    });

    // Destinations (right side)
    const destinations = [
      'MSTIC Data Lake',
      'Threat Intelligence DB', 
      'Security Analytics Store',
      'Alert System',
      'ML Training Data',
      'Compliance Archive',
      'Real-time Dashboard',
      'API Gateway'
    ];

    destinations.forEach((dest, index) => {
      const statusSeed = seededRandom(`${dest}-status`);
      const statusOptions: PipelineStatus[] = ['healthy', 'warning'];
      const status = statusOptions[Math.floor(statusSeed * statusOptions.length)];
      
      nodes.push({
        id: `dest-${dest}`,
        name: dest,
        type: 'destination',
        x: 800,
        y: 60 + index * 60,
        status,
        recordsPerSecond: Math.floor(seededRandom(`${dest}-records`) * 500) + 50,
        avgProcessingTime: Math.floor(seededRandom(`${dest}-time`) * 100) + 20,
        connections: [],
        description: `Data destination: ${dest}`,
        lastUpdate: new Date(Date.now() - seededRandom(`${dest}-update`) * 1800000).toISOString(),
        dataQuality: Math.floor(seededRandom(`${dest}-quality`) * 10) + 90
      });
    });

    // Generate connections with realistic data flow based on source filtering
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
            animated: true
          });
          node.connections.push(ingestionNode.id);
          ingestionNode.connections.push(node.id);
        });
      } else if (node.type === 'ingestion') {
        // Ingestion connects to transformation pipelines of the same source
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
            health: node.status === 'failed' ? 'error' : 'healthy',
            animated: true
          });
          node.connections.push(transformNode.id);
          transformNode.connections.push(node.id);
        });
      } else if (node.type === 'transformation') {
        // Transformation connects to enrichment pipelines of the same source
        const enrichmentNodes = nodes.filter(n => n.type === 'enrichment' && n.source === node.source).slice(0, 2);
        enrichmentNodes.forEach(enrichNode => {
          const connectionId = `${node.id}-${enrichNode.id}`;
          connections.push({
            id: connectionId,
            from: node.id,
            to: enrichNode.id,
            volume: 'high',
            health: 'healthy',
            animated: true
          });
          node.connections.push(enrichNode.id);
          enrichNode.connections.push(node.id);
        });
      } else if (node.type === 'enrichment') {
        // Enrichment connects to destinations (cross-source connections allowed here)
        const destNodes = nodes.filter(n => n.type === 'destination').slice(0, 3);
        destNodes.forEach(destNode => {
          const connectionId = `${node.id}-${destNode.id}`;
          connections.push({
            id: connectionId,
            from: node.id,
            to: destNode.id,
            volume: 'high',
            health: 'healthy',
            animated: true
          });
          node.connections.push(destNode.id);
          destNode.connections.push(node.id);
        });
      }
    });

    return { nodes, connections };
  };

  // Use useMemo to prevent regeneration on every render, only when selectedSource changes
  const { nodes, connections } = useMemo(() => generateLineageData(), [selectedSource]);

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
    setSelectedNode(node);
    highlightPath(node.id);
  };

  const getNodeColor = (node: LineageNode) => {
    if (highlightedPath.length > 0 && !highlightedPath.includes(node.id)) {
      return '#444';
    }
    
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
      strokeDasharray: connection.volume === 'low' ? '5,5' : 'none'
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
        <h1 className={styles.title}>Interactive Data Lineage</h1>
        <p className={styles.subtitle}>Visualize and explore data flow through your threat intelligence pipelines</p>
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
            }}
          >
            Clear Selection
          </button>
        </div>

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
                viewBox="0 0 1000 800"
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
                  
                  <marker
                    id="arrowhead"
                    markerWidth="6"
                    markerHeight="4"
                    refX="5"
                    refY="2"
                    orient="auto"
                  >
                    <polygon points="0 0, 6 2, 0 4" fill="#52c41a" />
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
                <text x="170" y="30" className={styles.sectionLabel}>Data Sources</text>
                <text x="370" y="30" className={styles.sectionLabel}>Ingestion</text>
                <text x="520" y="30" className={styles.sectionLabel}>Transformation</text>
                <text x="670" y="30" className={styles.sectionLabel}>Enrichment</text>
                <text x="870" y="30" className={styles.sectionLabel}>Destinations</text>

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
                          x1={fromNode.x + 140}
                          y1={fromNode.y + 20}
                          x2={toNode.x}
                          y2={toNode.y + 20}
                          {...style}
                          markerEnd="url(#arrowhead)"
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
                              path={`M${fromNode.x + 140},${fromNode.y + 20} L${toNode.x},${toNode.y + 20}`}
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                {/* Render nodes */}
                {filteredNodes.map(node => (
                  <g 
                    key={node.id}
                    className={styles.nodeGroup}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect
                      x={node.x}
                      y={node.y}
                      width="140"
                      height="40"
                      fill={getNodeColor(node)}
                      rx="6"
                      className={`${styles.nodeRect} ${selectedNode?.id === node.id ? styles.selectedNode : ''}`}
                      filter={selectedNode?.id === node.id ? "url(#glow)" : "none"}
                    />
                    <text
                      x={node.x + 70}
                      y={node.y + 16}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                      className={styles.nodeText}
                    >
                      {node.name.length > 16 ? `${node.name.substring(0, 13)}...` : node.name}
                    </text>
                    <text
                      x={node.x + 70}
                      y={node.y + 30}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.8)"
                      fontSize="8"
                      className={styles.nodeSubtext}
                    >
                      {node.recordsPerSecond}/s
                    </text>
                    
                    {/* Status indicator */}
                    <circle
                      cx={node.x + 125}
                      cy={node.y + 10}
                      r="4"
                      fill={node.status === 'healthy' ? '#52c41a' :
                            node.status === 'warning' ? '#faad14' :
                            node.status === 'failed' ? '#ef4444' : '#1890ff'}
                    />
                  </g>
                ))}
                
                {/* Render tooltips separately to ensure they appear on top */}
                {hoveredNode && filteredNodes.map(node => {
                  if (hoveredNode !== node.id) return null;
                  
                  // Smart positioning: if node is too far right, show tooltip on the left
                  const tooltipX = node.x > 600 ? node.x - 210 : node.x + 150;
                  const tooltipY = node.y - 10;
                  
                  return (
                    <g key={`tooltip-${node.id}`} className={styles.tooltip}>
                      <rect
                        x={tooltipX}
                        y={tooltipY}
                        width="200"
                        height="60"
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
                        fill="#ccc"
                        fontSize="9"
                      >
                        Records/sec: {node.recordsPerSecond}
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 40}
                        fill="#ccc"
                        fontSize="9"
                      >
                        Avg Time: {node.avgProcessingTime}ms
                      </text>
                      <text
                        x={tooltipX + 10}
                        y={tooltipY + 52}
                        fill="#ccc"
                        fontSize="9"
                      >
                        Quality: {node.dataQuality}%
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
                        <div className={styles.metricLabel}>Records per second</div>
                      </div>
                    </div>
                    
                    <div className={styles.metric}>
                      <Clock size={16} />
                      <div>
                        <div className={styles.metricValue}>{selectedNode.avgProcessingTime}ms</div>
                        <div className={styles.metricLabel}>Avg processing time</div>
                      </div>
                    </div>
                    
                    <div className={styles.metric}>
                      <BarChart3 size={16} />
                      <div>
                        <div className={styles.metricValue}>{selectedNode.dataQuality}%</div>
                        <div className={styles.metricLabel}>Data quality</div>
                      </div>
                    </div>
                    
                    <div className={styles.metric}>
                      <Zap size={16} />
                      <div>
                        <div className={styles.metricValue}>{selectedNode.connections.length}</div>
                        <div className={styles.metricLabel}>Connections</div>
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
    </div>
  );
});

DataLineage.displayName = 'DataLineage';

export default DataLineage;