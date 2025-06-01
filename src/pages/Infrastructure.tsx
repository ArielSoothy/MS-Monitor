import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Zap,
  Timer,
  RefreshCw
} from 'lucide-react';
import styles from './Infrastructure.module.css';

interface NodeHealth {
  nodeId: string;
  region: string;
  status: 'healthy' | 'warning' | 'critical' | 'maintenance';
  uptime: number; // hours
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  queriesPerSecond: number;
  cacheHitRate: number;
  lastHeartbeat: Date;
}

interface SecurityMetrics {
  authenticationRate: number;
  failedLogins: number;
  blockedRequests: number;
  activeThreats: number;
  securityEvents: number;
  complianceScore: number;
  dataEncryptionStatus: 'enabled' | 'partial' | 'disabled';
  accessControlStatus: 'compliant' | 'warning' | 'critical';
}

interface ScalingMetrics {
  currentCapacity: number;
  maxCapacity: number;
  autoScalingEnabled: boolean;
  scaleEvents: Array<{
    timestamp: Date;
    action: 'scale_up' | 'scale_down';
    reason: string;
    nodes: number;
  }>;
  resourcePrediction: {
    nextHour: number;
    next24Hours: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  };
}

interface CostOptimization {
  currentMonthlyCost: number;
  projectedMonthlyCost: number;
  costPerQuery: number;
  resourceUtilization: number;
  optimizationSuggestions: Array<{
    type: 'compute' | 'storage' | 'network';
    description: string;
    potentialSavings: number;
    complexity: 'low' | 'medium' | 'high';
  }>;
}

const Infrastructure: React.FC = () => {
  const [nodeHealthData, setNodeHealthData] = useState<NodeHealth[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingMetrics | null>(null);
  const [costOptimization, setCostOptimization] = useState<CostOptimization | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadInfrastructureData();
    // Set up real-time updates every 15 seconds for infrastructure monitoring
    const interval = setInterval(() => {
      loadInfrastructureData();
      setLastRefresh(new Date());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadInfrastructureData = async () => {
    try {
      setLoading(true);

      // Mock realistic infrastructure data that would come from Azure Resource Manager APIs
      const mockNodes: NodeHealth[] = [
        {
          nodeId: 'adx-node-01-israelcentral',
          region: 'Israel Central',
          status: 'healthy',
          uptime: 168.7,
          cpuUsage: 34.2,
          memoryUsage: 67.8,
          diskUsage: 23.1,
          networkLatency: 2.3,
          activeConnections: 847,
          queriesPerSecond: 156.4,
          cacheHitRate: 87.3,
          lastHeartbeat: new Date(Date.now() - 1000)
        },
        {
          nodeId: 'adx-node-02-israelcentral',
          region: 'Israel Central',
          status: 'healthy',
          uptime: 168.7,
          cpuUsage: 42.1,
          memoryUsage: 71.2,
          diskUsage: 24.8,
          networkLatency: 1.9,
          activeConnections: 923,
          queriesPerSecond: 178.2,
          cacheHitRate: 89.1,
          lastHeartbeat: new Date(Date.now() - 2000)
        },
        {
          nodeId: 'adx-node-03-israelcentral',
          region: 'Israel Central',
          status: 'warning',
          uptime: 168.7,
          cpuUsage: 78.9,
          memoryUsage: 89.4,
          diskUsage: 82.3,
          networkLatency: 4.7,
          activeConnections: 1247,
          queriesPerSecond: 89.7,
          cacheHitRate: 67.2,
          lastHeartbeat: new Date(Date.now() - 3000)
        },
        {
          nodeId: 'adx-node-04-westeurope',
          region: 'West Europe',
          status: 'healthy',
          uptime: 72.3,
          cpuUsage: 28.7,
          memoryUsage: 55.1,
          diskUsage: 19.4,
          networkLatency: 12.4,
          activeConnections: 456,
          queriesPerSecond: 67.8,
          cacheHitRate: 91.7,
          lastHeartbeat: new Date(Date.now() - 1500)
        },
        {
          nodeId: 'adx-node-05-eastus',
          region: 'East US',
          status: 'maintenance',
          uptime: 0,
          cpuUsage: 0,
          memoryUsage: 0,
          diskUsage: 0,
          networkLatency: 0,
          activeConnections: 0,
          queriesPerSecond: 0,
          cacheHitRate: 0,
          lastHeartbeat: new Date(Date.now() - 300000)
        },
        {
          nodeId: 'adx-node-06-australiaeast',
          region: 'Australia East',
          status: 'critical',
          uptime: 2.1,
          cpuUsage: 95.7,
          memoryUsage: 98.2,
          diskUsage: 94.1,
          networkLatency: 45.7,
          activeConnections: 2847,
          queriesPerSecond: 12.3,
          cacheHitRate: 23.4,
          lastHeartbeat: new Date(Date.now() - 30000)
        }
      ];

      const mockSecurity: SecurityMetrics = {
        authenticationRate: 99.97,
        failedLogins: 247,
        blockedRequests: 1847,
        activeThreats: 3,
        securityEvents: 15672,
        complianceScore: 94.2,
        dataEncryptionStatus: 'enabled',
        accessControlStatus: 'compliant'
      };

      const mockScaling: ScalingMetrics = {
        currentCapacity: 6,
        maxCapacity: 12,
        autoScalingEnabled: true,
        scaleEvents: [
          {
            timestamp: new Date(Date.now() - 3600000),
            action: 'scale_up',
            reason: 'High CPU utilization (>80%) for 15 minutes',
            nodes: 1
          },
          {
            timestamp: new Date(Date.now() - 7200000),
            action: 'scale_down',
            reason: 'Low resource utilization (<30%) for 2 hours',
            nodes: 1
          }
        ],
        resourcePrediction: {
          nextHour: 78.4,
          next24Hours: 65.2,
          trend: 'increasing'
        }
      };

      const mockCostOptimization: CostOptimization = {
        currentMonthlyCost: 8947.32,
        projectedMonthlyCost: 9234.18,
        costPerQuery: 0.00234,
        resourceUtilization: 67.8,
        optimizationSuggestions: [
          {
            type: 'compute',
            description: 'Right-size compute instances based on actual usage patterns',
            potentialSavings: 1247.50,
            complexity: 'medium'
          },
          {
            type: 'storage',
            description: 'Implement data lifecycle policies for cold storage',
            potentialSavings: 892.30,
            complexity: 'low'
          },
          {
            type: 'network',
            description: 'Optimize cross-region data transfer patterns',
            potentialSavings: 456.20,
            complexity: 'high'
          }
        ]
      };

      setNodeHealthData(mockNodes);
      setSecurityMetrics(mockSecurity);
      setScalingMetrics(mockScaling);
      setCostOptimization(mockCostOptimization);
    } catch (error) {
      console.error('Failed to load infrastructure data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      case 'maintenance': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'critical': return <AlertTriangle size={16} />;
      case 'maintenance': return <Timer size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp size={16} style={{ color: '#ef4444' }} />;
      case 'decreasing': return <TrendingDown size={16} style={{ color: '#10b981' }} />;
      default: return <Activity size={16} style={{ color: '#6b7280' }} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw className={styles.loadingIcon} />
        <span>Loading infrastructure metrics...</span>
      </div>
    );
  }

  return (
    <div className={styles.infrastructurePage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Server className={styles.titleIcon} />
          <div>
            <h1>Infrastructure Monitoring</h1>
            <p>Real-time cluster health, security, scaling, and cost optimization</p>
          </div>
        </div>
        <div className={styles.refreshInfo}>
          <RefreshCw size={16} />
          <span>Last refresh: {lastRefresh.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Cluster Overview */}
      <div className={styles.clusterOverview}>
        <div className={styles.overviewCard}>
          <h3><Database size={20} /> Cluster Status</h3>
          <div className={styles.overviewStats}>
            <div className={styles.overviewStat}>
              <span className={styles.statValue}>{nodeHealthData.filter(n => n.status === 'healthy').length}</span>
              <span className={styles.statLabel}>Healthy Nodes</span>
            </div>
            <div className={styles.overviewStat}>
              <span className={styles.statValue}>{nodeHealthData.filter(n => n.status === 'warning').length}</span>
              <span className={styles.statLabel}>Warning</span>
            </div>
            <div className={styles.overviewStat}>
              <span className={styles.statValue}>{nodeHealthData.filter(n => n.status === 'critical').length}</span>
              <span className={styles.statLabel}>Critical</span>
            </div>
          </div>
        </div>

        {securityMetrics && (
          <div className={styles.overviewCard}>
            <h3><Shield size={20} /> Security</h3>
            <div className={styles.overviewStats}>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>{securityMetrics.complianceScore}%</span>
                <span className={styles.statLabel}>Compliance</span>
              </div>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>{securityMetrics.activeThreats}</span>
                <span className={styles.statLabel}>Active Threats</span>
              </div>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>{securityMetrics.authenticationRate}%</span>
                <span className={styles.statLabel}>Auth Success</span>
              </div>
            </div>
          </div>
        )}

        {scalingMetrics && (
          <div className={styles.overviewCard}>
            <h3><TrendingUp size={20} /> Auto-scaling</h3>
            <div className={styles.overviewStats}>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>{scalingMetrics.currentCapacity}/{scalingMetrics.maxCapacity}</span>
                <span className={styles.statLabel}>Capacity</span>
              </div>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>{scalingMetrics.resourcePrediction.nextHour}%</span>
                <span className={styles.statLabel}>Next Hour</span>
              </div>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>
                  {getTrendIcon(scalingMetrics.resourcePrediction.trend)}
                </span>
                <span className={styles.statLabel}>Trend</span>
              </div>
            </div>
          </div>
        )}

        {costOptimization && (
          <div className={styles.overviewCard}>
            <h3><Zap size={20} /> Cost</h3>
            <div className={styles.overviewStats}>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>${(costOptimization.currentMonthlyCost / 1000).toFixed(1)}K</span>
                <span className={styles.statLabel}>Monthly</span>
              </div>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>${costOptimization.costPerQuery.toFixed(4)}</span>
                <span className={styles.statLabel}>Per Query</span>
              </div>
              <div className={styles.overviewStat}>
                <span className={styles.statValue}>{costOptimization.resourceUtilization}%</span>
                <span className={styles.statLabel}>Utilization</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Node Health Grid */}
      <div className={styles.nodeHealthSection}>
        <h2>Node Health Status</h2>
        <div className={styles.nodeGrid}>
          {nodeHealthData.map((node) => (
            <div
              key={node.nodeId}
              className={`${styles.nodeCard} ${selectedNode?.nodeId === node.nodeId ? styles.selected : ''}`}
              onClick={() => setSelectedNode(node)}
            >
              <div className={styles.nodeHeader}>
                <div className={styles.nodeStatus} style={{ color: getStatusColor(node.status) }}>
                  {getStatusIcon(node.status)}
                  <span>{node.status}</span>
                </div>
                <span className={styles.nodeRegion}>{node.region}</span>
              </div>
              
              <div className={styles.nodeId}>{node.nodeId}</div>
              
              <div className={styles.nodeMetrics}>
                <div className={styles.nodeMetric}>
                  <Cpu size={14} />
                  <span>CPU: {node.cpuUsage.toFixed(1)}%</span>
                </div>
                <div className={styles.nodeMetric}>
                  <MemoryStick size={14} />
                  <span>Memory: {node.memoryUsage.toFixed(1)}%</span>
                </div>
                <div className={styles.nodeMetric}>
                  <HardDrive size={14} />
                  <span>Disk: {node.diskUsage.toFixed(1)}%</span>
                </div>
                <div className={styles.nodeMetric}>
                  <Network size={14} />
                  <span>Latency: {node.networkLatency}ms</span>
                </div>
              </div>

              <div className={styles.nodePerformance}>
                <div className={styles.perfMetric}>
                  <span>{node.queriesPerSecond.toFixed(1)} QPS</span>
                </div>
                <div className={styles.perfMetric}>
                  <span>{node.cacheHitRate.toFixed(1)}% Cache</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Node View */}
      {selectedNode && (
        <div className={styles.nodeDetailView}>
          <h3>Node Details: {selectedNode.nodeId}</h3>
          
          <div className={styles.nodeDetailGrid}>
            <div className={styles.detailCard}>
              <h4>Performance Metrics</h4>
              <div className={styles.detailMetrics}>
                <div className={styles.detailMetric}>
                  <span>Uptime</span>
                  <span>{selectedNode.uptime.toFixed(1)} hours</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Active Connections</span>
                  <span>{selectedNode.activeConnections.toLocaleString()}</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Queries per Second</span>
                  <span>{selectedNode.queriesPerSecond.toFixed(1)}</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Cache Hit Rate</span>
                  <span>{selectedNode.cacheHitRate.toFixed(1)}%</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Network Latency</span>
                  <span>{selectedNode.networkLatency}ms</span>
                </div>
              </div>
            </div>

            <div className={styles.detailCard}>
              <h4>Resource Utilization</h4>
              <div className={styles.resourceBars}>
                <div className={styles.resourceBar}>
                  <div className={styles.resourceLabel}>
                    <Cpu size={16} />
                    <span>CPU Usage</span>
                    <span>{selectedNode.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <div className={styles.resourceProgress}>
                    <div 
                      className={styles.resourceFill} 
                      style={{ 
                        width: `${selectedNode.cpuUsage}%`,
                        backgroundColor: selectedNode.cpuUsage > 80 ? '#ef4444' : selectedNode.cpuUsage > 60 ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </div>
                </div>

                <div className={styles.resourceBar}>
                  <div className={styles.resourceLabel}>
                    <MemoryStick size={16} />
                    <span>Memory Usage</span>
                    <span>{selectedNode.memoryUsage.toFixed(1)}%</span>
                  </div>
                  <div className={styles.resourceProgress}>
                    <div 
                      className={styles.resourceFill} 
                      style={{ 
                        width: `${selectedNode.memoryUsage}%`,
                        backgroundColor: selectedNode.memoryUsage > 80 ? '#ef4444' : selectedNode.memoryUsage > 60 ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </div>
                </div>

                <div className={styles.resourceBar}>
                  <div className={styles.resourceLabel}>
                    <HardDrive size={16} />
                    <span>Disk Usage</span>
                    <span>{selectedNode.diskUsage.toFixed(1)}%</span>
                  </div>
                  <div className={styles.resourceProgress}>
                    <div 
                      className={styles.resourceFill} 
                      style={{ 
                        width: `${selectedNode.diskUsage}%`,
                        backgroundColor: selectedNode.diskUsage > 80 ? '#ef4444' : selectedNode.diskUsage > 60 ? '#f59e0b' : '#10b981'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Optimization */}
      {costOptimization && (
        <div className={styles.costOptimizationSection}>
          <h2>Cost Optimization Insights</h2>
          <div className={styles.costGrid}>
            <div className={styles.costCard}>
              <h4>Monthly Cost Analysis</h4>
              <div className={styles.costMetrics}>
                <div className={styles.costMetric}>
                  <span>Current Month</span>
                  <span>${costOptimization.currentMonthlyCost.toLocaleString()}</span>
                </div>
                <div className={styles.costMetric}>
                  <span>Projected</span>
                  <span>${costOptimization.projectedMonthlyCost.toLocaleString()}</span>
                </div>
                <div className={styles.costMetric}>
                  <span>Resource Utilization</span>
                  <span>{costOptimization.resourceUtilization}%</span>
                </div>
              </div>
            </div>

            <div className={styles.optimizationSuggestions}>
              <h4>Optimization Recommendations</h4>
              {costOptimization.optimizationSuggestions.map((suggestion, index) => (
                <div key={index} className={styles.suggestion}>
                  <div className={styles.suggestionHeader}>
                    <span className={styles.suggestionType}>{suggestion.type}</span>
                    <span className={styles.suggestionSavings}>
                      ${suggestion.potentialSavings.toLocaleString()} savings
                    </span>
                  </div>
                  <p className={styles.suggestionDescription}>{suggestion.description}</p>
                  <div className={styles.suggestionComplexity}>
                    Complexity: <span className={styles.complexityBadge}>{suggestion.complexity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Infrastructure;
