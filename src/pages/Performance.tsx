import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  Database,
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  Timer,
  BarChart3,
  Zap,
  HelpCircle,
  Shield
} from 'lucide-react';
import HowItWorksModal from '../components/HowItWorksModal';
import ChallengesModal from '../components/ChallengesModal';
import styles from './Performance.module.css';

interface QueryPerformanceMetric {
  queryId: string;
  query: string;
  executionTime: number;
  resourceUsage: {
    cpuTime: number;
    memoryUsage: number;
    networkIO: number;
  };
  recordsScanned: number;
  recordsReturned: number;
  scanEfficiency: number;
  cacheHitRate: number;
  status: 'optimized' | 'warning' | 'critical';
  suggestions: string[];
}

interface SystemHealth {
  clusterHealth: {
    nodeCount: number;
    activeNodes: number;
    avgCpuUsage: number;
    avgMemoryUsage: number;
    avgDiskUsage: number;
  };
  ingestionHealth: {
    throughput: number;
    latency: number;
    errorRate: number;
    queueSize: number;
  };
  queryHealth: {
    avgExecutionTime: number;
    concurrentQueries: number;
    cacheHitRate: number;
    timeoutRate: number;
  };
}

const Performance: React.FC = () => {
  const [queryMetrics, setQueryMetrics] = useState<QueryPerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<QueryPerformanceMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);

  useEffect(() => {
    loadPerformanceData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, these would be actual Azure Data Explorer queries
      // For demo purposes, we're generating realistic performance data
      const mockMetrics: QueryPerformanceMetric[] = [
        {
          queryId: 'threat-overview-001',
          query: 'SecurityEvents | summarize TotalEvents = count(), HighRiskEvents = countif(ThreatLevel == "Critical")',
          executionTime: 1247,
          resourceUsage: {
            cpuTime: 0.8,
            memoryUsage: 156.7,
            networkIO: 23.4
          },
          recordsScanned: 2847592,
          recordsReturned: 1,
          scanEfficiency: 99.97,
          cacheHitRate: 87.3,
          status: 'optimized',
          suggestions: ['Consider adding time filters to reduce scan scope']
        },
        {
          queryId: 'geo-threats-002',
          query: 'SecurityEvents | where ThreatLevel in ("High", "Critical") | summarize by Country, City',
          executionTime: 3421,
          resourceUsage: {
            cpuTime: 2.1,
            memoryUsage: 445.2,
            networkIO: 67.8
          },
          recordsScanned: 5847293,
          recordsReturned: 847,
          scanEfficiency: 85.4,
          cacheHitRate: 23.1,
          status: 'warning',
          suggestions: [
            'Add indexed column for ThreatLevel',
            'Consider partitioning by Country',
            'Use materialized view for frequent geo queries'
          ]
        },
        {
          queryId: 'correlation-003',
          query: 'SecurityEvents | join ThreatIndicators on $left.SourceIP == $right.IP',
          executionTime: 7834,
          resourceUsage: {
            cpuTime: 5.7,
            memoryUsage: 1205.3,
            networkIO: 234.7
          },
          recordsScanned: 12847592,
          recordsReturned: 23456,
          scanEfficiency: 62.8,
          cacheHitRate: 12.7,
          status: 'critical',
          suggestions: [
            'Optimize join strategy using broadcast hint',
            'Create lookup table for threat indicators',
            'Implement incremental processing',
            'Add time-based partitioning for both tables'
          ]
        },
        {
          queryId: 'pipeline-health-004',
          query: 'PipelineMetrics | summarize AvgLatency = avg(Latency), TotalThreats = sum(Threats)',
          executionTime: 892,
          resourceUsage: {
            cpuTime: 0.3,
            memoryUsage: 78.4,
            networkIO: 12.1
          },
          recordsScanned: 456789,
          recordsReturned: 12,
          scanEfficiency: 95.2,
          cacheHitRate: 94.6,
          status: 'optimized',
          suggestions: ['Query is well-optimized for current workload']
        }
      ];

      const mockSystemHealth: SystemHealth = {
        clusterHealth: {
          nodeCount: 6,
          activeNodes: 6,
          avgCpuUsage: 34.7,
          avgMemoryUsage: 67.2,
          avgDiskUsage: 23.8
        },
        ingestionHealth: {
          throughput: 847.3, // MB/s
          latency: 2.4, // seconds
          errorRate: 0.02, // percentage
          queueSize: 156
        },
        queryHealth: {
          avgExecutionTime: 2156, // ms
          concurrentQueries: 23,
          cacheHitRate: 67.8,
          timeoutRate: 0.1
        }
      };

      setQueryMetrics(mockMetrics);
      setSystemHealth(mockSystemHealth);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimized': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimized': return <CheckCircle size={16} />;
      case 'warning': return <AlertTriangle size={16} />;
      case 'critical': return <AlertTriangle size={16} />;
      default: return <Activity size={16} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Activity className={styles.loadingIcon} />
        <span>Loading performance metrics...</span>
      </div>
    );
  }

  return (
    <div className={styles.performancePage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <BarChart3 className={styles.titleIcon} />
          <div>
            <h1>Performance & Optimization
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
            <p>Real-time query performance, system health, and optimization insights</p>
          </div>
        </div>
        <div className={styles.refreshIndicator}>
          <Zap size={16} />
          <span>Auto-refresh: 30s</span>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <div className={styles.systemHealthGrid}>
          <div className={styles.healthCard}>
            <div className={styles.cardHeader}>
              <Cpu className={styles.cardIcon} />
              <h3>Cluster Health</h3>
            </div>
            <div className={styles.healthMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Active Nodes</span>
                <span className={styles.metricValue}>
                  {systemHealth.clusterHealth.activeNodes}/{systemHealth.clusterHealth.nodeCount}
                </span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>CPU Usage</span>
                <span className={styles.metricValue}>{systemHealth.clusterHealth.avgCpuUsage}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Memory Usage</span>
                <span className={styles.metricValue}>{systemHealth.clusterHealth.avgMemoryUsage}%</span>
              </div>
            </div>
          </div>

          <div className={styles.healthCard}>
            <div className={styles.cardHeader}>
              <Database className={styles.cardIcon} />
              <h3>Ingestion Health</h3>
            </div>
            <div className={styles.healthMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Throughput</span>
                <span className={styles.metricValue}>{systemHealth.ingestionHealth.throughput} MB/s</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Latency</span>
                <span className={styles.metricValue}>{systemHealth.ingestionHealth.latency}s</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Error Rate</span>
                <span className={styles.metricValue}>{systemHealth.ingestionHealth.errorRate}%</span>
              </div>
            </div>
          </div>

          <div className={styles.healthCard}>
            <div className={styles.cardHeader}>
              <Activity className={styles.cardIcon} />
              <h3>Query Performance</h3>
            </div>
            <div className={styles.healthMetrics}>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Avg Execution</span>
                <span className={styles.metricValue}>{systemHealth.queryHealth.avgExecutionTime}ms</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Cache Hit Rate</span>
                <span className={styles.metricValue}>{systemHealth.queryHealth.cacheHitRate}%</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricLabel}>Concurrent</span>
                <span className={styles.metricValue}>{systemHealth.queryHealth.concurrentQueries}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Query Performance Metrics */}
      <div className={styles.queryMetricsSection}>
        <h2>Query Performance Analysis</h2>
        <div className={styles.metricsGrid}>
          {queryMetrics.map((metric) => (
            <div
              key={metric.queryId}
              className={`${styles.metricCard} ${selectedMetric?.queryId === metric.queryId ? styles.selected : ''}`}
              onClick={() => setSelectedMetric(metric)}
            >
              <div className={styles.metricHeader}>
                <div className={styles.statusIndicator} style={{ color: getStatusColor(metric.status) }}>
                  {getStatusIcon(metric.status)}
                  <span className={styles.statusText}>{metric.status}</span>
                </div>
                <span className={styles.metricId}>{metric.queryId}</span>
              </div>
              
              <div className={styles.metricQuery}>
                <code>{metric.query.substring(0, 100)}...</code>
              </div>

              <div className={styles.metricStats}>
                <div className={styles.stat}>
                  <Timer size={14} />
                  <span>{metric.executionTime}ms</span>
                </div>
                <div className={styles.stat}>
                  <TrendingUp size={14} />
                  <span>{metric.scanEfficiency.toFixed(1)}% efficient</span>
                </div>
                <div className={styles.stat}>
                  <MemoryStick size={14} />
                  <span>{metric.resourceUsage.memoryUsage.toFixed(1)} MB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed View */}
      {selectedMetric && (
        <div className={styles.detailView}>
          <h3>Query Analysis: {selectedMetric.queryId}</h3>
          
          <div className={styles.detailGrid}>
            <div className={styles.detailCard}>
              <h4>Execution Metrics</h4>
              <div className={styles.detailMetrics}>
                <div className={styles.detailMetric}>
                  <span>Execution Time</span>
                  <span>{selectedMetric.executionTime}ms</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Records Scanned</span>
                  <span>{selectedMetric.recordsScanned.toLocaleString()}</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Records Returned</span>
                  <span>{selectedMetric.recordsReturned.toLocaleString()}</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Scan Efficiency</span>
                  <span>{selectedMetric.scanEfficiency.toFixed(2)}%</span>
                </div>
              </div>
            </div>

            <div className={styles.detailCard}>
              <h4>Resource Usage</h4>
              <div className={styles.detailMetrics}>
                <div className={styles.detailMetric}>
                  <span>CPU Time</span>
                  <span>{selectedMetric.resourceUsage.cpuTime}s</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Memory Usage</span>
                  <span>{selectedMetric.resourceUsage.memoryUsage.toFixed(1)} MB</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Network I/O</span>
                  <span>{selectedMetric.resourceUsage.networkIO.toFixed(1)} MB</span>
                </div>
                <div className={styles.detailMetric}>
                  <span>Cache Hit Rate</span>
                  <span>{selectedMetric.cacheHitRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className={styles.detailCard}>
              <h4>Optimization Suggestions</h4>
              <div className={styles.suggestions}>
                {selectedMetric.suggestions.map((suggestion, index) => (
                  <div key={index} className={styles.suggestion}>
                    <CheckCircle size={14} />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.queryCode}>
            <h4>Full Query</h4>
            <pre><code>{selectedMetric.query}</code></pre>
          </div>
        </div>
      )}
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="performance"
      />
      
      <ChallengesModal
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
        section="performance"
      />
    </div>
  );
};

export default Performance;
