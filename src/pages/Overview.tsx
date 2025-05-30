import { useState, useEffect, useMemo, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Activity, AlertTriangle, TrendingUp, Server, RefreshCw } from 'lucide-react';
import { mockPipelines, mockAlerts } from '../data/mockData';
import type { Pipeline } from '../types';
import styles from './Overview.module.css';

const Overview = memo(() => {
  const [pipelines] = useState<Pipeline[]>(mockPipelines);
  const [alerts] = useState(mockAlerts);
  const [currentIngestionRate, setCurrentIngestionRate] = useState(1247);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Generate mock ingestion rate data for the last 24 hours
  const [ingestionData] = useState(() => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        rate: Math.floor(Math.random() * 500) + 800 // Random rate between 800-1300
      });
    }
    return data;
  });

  // Auto-refresh simulation every 5 seconds
  useEffect(() => {
    setIsLoading(false);
    
    const interval = setInterval(() => {
      // Fluctuate ingestion rate slightly
      setCurrentIngestionRate(prev => {
        const change = (Math.random() - 0.5) * 100; // ±50 change
        const newRate = Math.max(800, Math.min(1500, prev + change));
        return Math.floor(newRate);
      });
      setLastRefresh(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate metrics using useMemo for performance
  const metrics = useMemo(() => ({
    totalPipelines: pipelines.length,
    healthyPipelines: pipelines.filter(p => p.status === 'healthy').length,
    warningPipelines: pipelines.filter(p => p.status === 'warning').length,
    failedPipelines: pipelines.filter(p => p.status === 'failed').length,
    processingPipelines: pipelines.filter(p => p.status === 'processing').length,
  }), [pipelines]);

  const { totalPipelines, healthyPipelines, warningPipelines, failedPipelines, processingPipelines } = metrics;
  
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;
  const criticalAlerts = alerts.filter(a => !a.resolved && a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => !a.resolved && (a.severity === 'high' || a.severity === 'medium')).length;

  // Calculate system health score (0-100)
  const systemHealthScore = Math.round(
    (healthyPipelines * 100 + warningPipelines * 70 + processingPipelines * 85) / totalPipelines
  );

  // Status distribution data for donut chart
  const statusData = [
    { name: 'Healthy', value: healthyPipelines, color: '#52c41a' },
    { name: 'Warning', value: warningPipelines, color: '#faad14' },
    { name: 'Failed', value: failedPipelines, color: '#f5222d' },
    { name: 'Processing', value: processingPipelines, color: '#1890ff' }
  ];

  // Get top 5 failing pipelines
  const failingPipelines = pipelines
    .filter(p => p.status === 'failed' || p.status === 'warning')
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, 5);

  // Source system health data
  const sourceHealthData = pipelines.reduce((acc, pipeline) => {
    const existing = acc.find(item => item.source === pipeline.source);
    if (existing) {
      existing.total++;
      if (pipeline.status === 'healthy') existing.healthy++;
    } else {
      acc.push({
        source: pipeline.source,
        total: 1,
        healthy: pipeline.status === 'healthy' ? 1 : 0
      });
    }
    return acc;
  }, [] as any[]).map(item => ({
    ...item,
    healthPercentage: Math.round((item.healthy / item.total) * 100)
  }));

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 75) return '#faad14';
    if (score >= 60) return '#ff7a45';
    return '#f5222d';
  };

  if (isLoading) {
    return (
      <div className={styles.overview}>
        <div className={styles.loadingContainer}>
          <RefreshCw className={styles.loadingIcon} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overview}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Threat Intelligence Pipeline Dashboard</h1>
            <p className={styles.subtitle}>Real-time monitoring and analytics</p>
          </div>
          <div className={styles.refreshInfo}>
            <RefreshCw className={styles.refreshIcon} />
            <span className={styles.refreshText}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Metrics Header */}
      <div className={styles.metricsHeader}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Server className={styles.metricIcon} />
            <span className={styles.metricTitle}>Total Pipelines</span>
          </div>
          <div className={styles.metricValue}>{totalPipelines}</div>
          <div className={styles.metricBreakdown}>
            <span className={styles.statusBadge} style={{ backgroundColor: '#52c41a' }}>
              {healthyPipelines} Healthy
            </span>
            <span className={styles.statusBadge} style={{ backgroundColor: '#faad14' }}>
              {warningPipelines} Warning
            </span>
            <span className={styles.statusBadge} style={{ backgroundColor: '#f5222d' }}>
              {failedPipelines} Failed
            </span>
            <span className={styles.statusBadge} style={{ backgroundColor: '#1890ff' }}>
              {processingPipelines} Processing
            </span>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <TrendingUp className={styles.metricIcon} />
            <span className={styles.metricTitle}>Ingestion Rate</span>
          </div>
          <div className={styles.metricValue}>{currentIngestionRate.toLocaleString()}</div>
          <div className={styles.metricSubtext}>files/hour</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <AlertTriangle className={`${styles.metricIcon} ${styles.warning}`} />
            <span className={styles.metricTitle}>Active Alerts</span>
          </div>
          <div className={styles.metricValue}>{unresolvedAlerts}</div>
          <div className={styles.metricSubtext}>
            {criticalAlerts} critical, {warningAlerts} warnings
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Activity className={styles.metricIcon} />
            <span className={styles.metricTitle}>System Health</span>
          </div>
          <div 
            className={styles.metricValue} 
            style={{ color: getHealthScoreColor(systemHealthScore) }}
          >
            {systemHealthScore}%
          </div>
          <div className={styles.metricSubtext}>Overall system health</div>
        </div>
      </div>

      {/* Main Dashboard Grid (2x2) */}
      <div className={styles.dashboardGrid}>
        {/* Pipeline Status Donut Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Pipeline Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [`${value} pipelines`, name]}
                contentStyle={{ 
                  backgroundColor: '#252526', 
                  border: '1px solid #333',
                  borderRadius: '6px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.chartLegend}>
            {statusData.map((entry, index) => (
              <div key={index} className={styles.legendItem}>
                <div 
                  className={styles.legendColor} 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ingestion Rate Line Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Ingestion Rate (Last 24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ingestionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#ccc', fontSize: 11 }}
                interval={2}
              />
              <YAxis 
                tick={{ fill: '#ccc' }}
                domain={['dataMin - 50', 'dataMax + 50']}
              />
              <Tooltip 
                labelFormatter={(label) => `Time: ${label}`}
                formatter={(value) => [`${value} files/hour`, 'Ingestion Rate']}
                contentStyle={{ 
                  backgroundColor: '#252526', 
                  border: '1px solid #333',
                  borderRadius: '6px'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#1890ff" 
                strokeWidth={2}
                dot={{ fill: '#1890ff', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, stroke: '#1890ff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Failing Pipelines */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Top Failing Pipelines</h3>
          <div className={styles.failingPipelinesTable}>
            <div className={styles.tableHeader}>
              <span>Pipeline</span>
              <span>Status</span>
              <span>Failure Rate</span>
              <span>Last Run</span>
            </div>
            {failingPipelines.map((pipeline) => (
              <div key={pipeline.id} className={styles.tableRow}>
                <div className={styles.pipelineName}>
                  <span className={styles.name}>{pipeline.name}</span>
                  <span className={styles.source}>{pipeline.source}</span>
                </div>
                <span className={`${styles.status} ${styles[pipeline.status]}`}>
                  {pipeline.status}
                </span>
                <span className={styles.failureRate}>
                  {pipeline.failureRate.toFixed(1)}%
                </span>
                <span className={styles.lastRun}>
                  {pipeline.lastRun.toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Source System Health */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Source System Health</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourceHealthData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                type="number" 
                tick={{ fill: '#ccc' }}
                domain={[0, 100]}
              />
              <YAxis 
                type="category" 
                dataKey="source" 
                tick={{ fill: '#ccc', fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Health Score']}
                contentStyle={{ 
                  backgroundColor: '#252526', 
                  border: '1px solid #333',
                  borderRadius: '6px'
                }} 
              />
              <Bar 
                dataKey="healthPercentage" 
                            fill="#1890ff"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

Overview.displayName = 'Overview';

export default Overview;
