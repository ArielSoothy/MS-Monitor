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

  // Team-based analytics
  const teamMetrics = pipelines.reduce((acc, pipeline) => {
    const team = pipeline.ownerTeam || 'Unknown';
    if (!acc[team]) {
      acc[team] = { total: 0, healthy: 0, failed: 0, warning: 0 };
    }
    acc[team].total++;
    acc[team][pipeline.status as keyof typeof acc[typeof team]]++;
    return acc;
  }, {} as Record<string, any>);

  const teamHealthData = Object.entries(teamMetrics).map(([team, metrics]) => ({
    team,
    healthPercentage: Math.round((metrics.healthy / metrics.total) * 100),
    total: metrics.total,
    healthy: metrics.healthy,
    failed: metrics.failed,
    warning: metrics.warning
  })).sort((a, b) => b.healthPercentage - a.healthPercentage);

  // Data classification insights
  const classificationData = pipelines.reduce((acc, pipeline) => {
    const classification = pipeline.dataClassification || 'Unknown';
    if (!acc[classification]) {
      acc[classification] = { total: 0, healthy: 0, failed: 0 };
    }
    acc[classification].total++;
    if (pipeline.status === 'healthy') acc[classification].healthy++;
    if (pipeline.status === 'failed') acc[classification].failed++;
    return acc;
  }, {} as Record<string, any>);

  const classificationChartData = Object.entries(classificationData).map(([name, data]) => ({
    name,
    total: data.total,
    healthy: data.healthy,
    failed: data.failed,
    healthPercentage: Math.round((data.healthy / data.total) * 100)
  }));

  // SLA compliance analysis
  const slaBreaches = pipelines.filter(p => {
    const slaMinutes = p.slaRequirement || 60;
    const lastRun = new Date(p.lastRun);
    const now = new Date();
    const minutesSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60);
    return minutesSinceLastRun > slaMinutes && p.status !== 'processing';
  });

  const slaComplianceRate = Math.round(((pipelines.length - slaBreaches.length) / pipelines.length) * 100);

  // Regional distribution
  const regionalData = pipelines.reduce((acc, pipeline) => {
    const region = pipeline.region || 'Unknown';
    if (!acc[region]) {
      acc[region] = { total: 0, healthy: 0, failed: 0 };
    }
    acc[region].total++;
    if (pipeline.status === 'healthy') acc[region].healthy++;
    if (pipeline.status === 'failed') acc[region].failed++;
    return acc;
  }, {} as Record<string, any>);

  const regionalChartData = Object.entries(regionalData).map(([region, data]) => ({
    region,
    total: data.total,
    healthy: data.healthy,
    failed: data.failed,
    healthPercentage: Math.round((data.healthy / data.total) * 100)
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

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Activity className={styles.metricIcon} />
            <span className={styles.metricTitle}>SLA Compliance</span>
          </div>
          <div 
            className={styles.metricValue} 
            style={{ color: getHealthScoreColor(slaComplianceRate) }}
          >
            {slaComplianceRate}%
          </div>
          <div className={styles.metricSubtext}>
            {slaBreaches.length} SLA breaches
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid (3x2) */}
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

        {/* Team Health Performance */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Team Health Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamHealthData.slice(0, 6)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                type="number" 
                tick={{ fill: '#ccc' }}
                domain={[0, 100]}
              />
              <YAxis 
                type="category" 
                dataKey="team" 
                tick={{ fill: '#ccc', fontSize: 11 }}
                width={100}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'healthPercentage') return [`${value}%`, 'Health Score'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Team: ${label}`}
                contentStyle={{ 
                  backgroundColor: '#252526', 
                  border: '1px solid #333',
                  borderRadius: '6px'
                }} 
              />
              <Bar 
                dataKey="healthPercentage" 
                fill="#52c41a"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data Classification Security */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Data Classification Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classificationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#ccc', fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#ccc' }} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'healthy') return [`${value} pipelines`, 'Healthy'];
                  if (name === 'failed') return [`${value} pipelines`, 'Failed'];
                  return [value, name];
                }}
                contentStyle={{ 
                  backgroundColor: '#252526', 
                  border: '1px solid #333',
                  borderRadius: '6px'
                }} 
              />
              <Bar dataKey="healthy" stackId="a" fill="#52c41a" />
              <Bar dataKey="failed" stackId="a" fill="#f5222d" />
            </BarChart>
          </ResponsiveContainer>
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

        {/* Regional Distribution */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Regional Pipeline Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regionalChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="total"
                label={({ region, total }) => `${region}: ${total}`}
              >
                {regionalChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'][index % 5]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, _, props) => [
                  `${value} pipelines (${props.payload.healthPercentage}% healthy)`, 
                  props.payload.region
                ]}
                contentStyle={{ 
                  backgroundColor: '#252526', 
                  border: '1px solid #333',
                  borderRadius: '6px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 Failing Pipelines */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Top Failing Pipelines</h3>
          <div className={styles.failingPipelinesTable}>
            <div className={styles.tableHeader}>
              <span>Pipeline</span>
              <span>Team</span>
              <span>Status</span>
              <span>Failure Rate</span>
              <span>SLA</span>
            </div>
            {failingPipelines.map((pipeline) => (
              <div key={pipeline.id} className={styles.tableRow}>
                <div className={styles.pipelineName}>
                  <span className={styles.name}>{pipeline.name}</span>
                  <span className={styles.source}>{pipeline.source}</span>
                </div>
                <span className={styles.team}>{pipeline.ownerTeam}</span>
                <span className={`${styles.status} ${styles[pipeline.status]}`}>
                  {pipeline.status}
                </span>
                <span className={styles.failureRate}>
                  {pipeline.failureRate.toFixed(1)}%
                </span>
                <span className={styles.sla}>
                  {pipeline.slaRequirement}m
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

Overview.displayName = 'Overview';

export default Overview;
