import React, { useState, useMemo, memo, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Search, 
  ChevronDown, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Filter,
  ChevronUp,
  Settings,
  Activity,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Copy,
  FileText,
  Shield
} from 'lucide-react';
import { mockPipelines } from '../data/mockData';
import type { Pipeline, PipelineStatus, PipelineSource } from '../types';
import HowItWorksModal from '../components/HowItWorksModal';
import ChallengesModal from '../components/ChallengesModal';
import InfoTooltip from '../components/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import styles from './Pipelines.module.css';

const Pipelines = memo(() => {
  const [pipelines] = useState<Pipeline[]>(mockPipelines);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<PipelineStatus>>(new Set());
  const [sourceFilter, setSourceFilter] = useState<PipelineSource | 'all'>('all');
  const [teamFilter, setTeamFilter] = useState<string | 'all'>('all');
  const [classificationFilter, setClassificationFilter] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastRun' | 'status' | 'source' | 'failureRate'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [runningPipelines, setRunningPipelines] = useState<Set<string>>(new Set());
  const [showActionFeedback, setShowActionFeedback] = useState<{id: string, action: string, show: boolean}>({id: '', action: '', show: false});
  const listRef = useRef<List>(null);

  // Generate mock 24-hour processing time data for each pipeline
  const generateProcessingTimeData = () => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      // Base processing time with some variance
      const baseTime = 45 + Math.sin(i * 0.5) * 15 + Math.random() * 20;
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        processingTime: Math.max(10, Math.floor(baseTime))
      });
    }
    return data;
  };

  // Enhanced error messages using actual pipeline failure data
  const getRecentErrors = (pipeline: Pipeline) => {
    const errors = [];
    
    if (pipeline.status === 'failed' && pipeline.lastFailureReason) {
      errors.push({
        timestamp: new Date(pipeline.lastRun.getTime() + Math.random() * 60 * 60 * 1000),
        message: pipeline.lastFailureReason,
        level: 'error' as const
      });
    }
    
    if (pipeline.status === 'warning') {
      if (pipeline.lastFailureReason) {
        errors.push({
          timestamp: new Date(Date.now() - Math.random() * 1 * 60 * 60 * 1000),
          message: pipeline.lastFailureReason,
          level: 'warning' as const
        });
      } else {
        errors.push({
          timestamp: new Date(Date.now() - Math.random() * 1 * 60 * 60 * 1000),
          message: `Performance degradation detected - ${pipeline.failureRate}% failure rate`,
          level: 'warning' as const
        });
      }
    }
    
    // Add SLA breach warnings
    if (pipeline.avgProcessingTime > pipeline.slaRequirement) {
      errors.push({
        timestamp: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000),
        message: `SLA breach: Processing time (${pipeline.avgProcessingTime}min) exceeds requirement (${pipeline.slaRequirement}min)`,
        level: 'warning' as const
      });
    }
    return errors;
  };

  // Enhanced configuration details using actual pipeline metadata
  const getConfigDetails = (pipeline: Pipeline) => ({
    ownerTeam: pipeline.ownerTeam,
    dataClassification: pipeline.dataClassification,
    region: pipeline.region,
    slaRequirement: `${pipeline.slaRequirement} minutes`,
    dataType: pipeline.dataType,
    process: pipeline.process,
    maintenanceWindow: pipeline.maintenanceWindow || 'Not scheduled',
    avgProcessingTime: `${pipeline.avgProcessingTime} minutes`,
    recordsProcessed: pipeline.recordsProcessed.toLocaleString(),
    failureRate: `${pipeline.failureRate}%`
  });

  // Get actual pipeline dependencies
  const getDependencies = (pipeline: Pipeline) => {
    if (!pipeline.dependsOn || pipeline.dependsOn.length === 0) {
      return [];
    }
    
    return pipeline.dependsOn.map(depId => {
      const dependentPipeline = mockPipelines.find(p => p.id === depId);
      return dependentPipeline ? {
        id: dependentPipeline.id,
        name: dependentPipeline.name,
        status: dependentPipeline.status
      } : null;
    }).filter(Boolean) as Array<{ id: string; name: string; status: PipelineStatus }>;
  };

  // Filter and sort pipelines
  const filteredPipelines = useMemo(() => {
    return pipelines
      .filter(pipeline => {
        const matchesSearch = pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            pipeline.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            pipeline.ownerTeam.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilters.size === 0 || statusFilters.has(pipeline.status);
        const matchesSource = sourceFilter === 'all' || pipeline.source === sourceFilter;
        const matchesTeam = teamFilter === 'all' || pipeline.ownerTeam === teamFilter;
        const matchesClassification = classificationFilter === 'all' || pipeline.dataClassification === classificationFilter;
        return matchesSearch && matchesStatus && matchesSource && matchesTeam && matchesClassification;
      })
      .sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'lastRun':
            aValue = a.lastRun.getTime();
            bValue = b.lastRun.getTime();
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'source':
            aValue = a.source;
            bValue = b.source;
            break;
          case 'failureRate':
            aValue = a.failureRate;
            bValue = b.failureRate;
            break;
          default:
            return 0;
        }
        
        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
  }, [pipelines, searchTerm, statusFilters, sourceFilter, teamFilter, classificationFilter, sortBy, sortOrder]);

  const uniqueTeams = [...new Set(pipelines.map(p => p.ownerTeam))];
  const uniqueClassifications = [...new Set(pipelines.map(p => p.dataClassification))];

  const toggleStatusFilter = (status: PipelineStatus) => {
    const newFilters = new Set(statusFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setStatusFilters(newFilters);
  };

  const toggleExpanded = useCallback((pipelineId: string) => {
    console.log('Toggling pipeline:', pipelineId);
    
    setExpandedRows(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(pipelineId)) {
        newExpanded.delete(pipelineId);
      } else {
        newExpanded.add(pipelineId);
      }
      
      // Immediate reset for virtual list height recalculation
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.resetAfterIndex(0);
        }
      }, 0);
      
      // Secondary reset for reliability
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.resetAfterIndex(0);
        }
      }, 50);
      
      return newExpanded;
    });
  }, []);

  const handlePipelineAction = async (pipelineId: string, action: 'run' | 'pause' | 'configure', e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`${action} pipeline:`, pipelineId);
    
    if (action === 'run') {
      setRunningPipelines(prev => new Set([...prev, pipelineId]));
      setShowActionFeedback({id: pipelineId, action: 'Starting pipeline...', show: true});
      
      // Simulate pipeline starting
      setTimeout(() => {
        setRunningPipelines(prev => {
          const newSet = new Set(prev);
          newSet.delete(pipelineId);
          return newSet;
        });
        setShowActionFeedback({id: pipelineId, action: '✅ Pipeline started successfully', show: true});
        setTimeout(() => setShowActionFeedback({id: '', action: '', show: false}), 3000);
      }, 2000);
    } else if (action === 'pause') {
      setShowActionFeedback({id: pipelineId, action: 'Pausing pipeline...', show: true});
      setTimeout(() => {
        setShowActionFeedback({id: pipelineId, action: '⏸️ Pipeline paused', show: true});
        setTimeout(() => setShowActionFeedback({id: '', action: '', show: false}), 3000);
      }, 1000);
    } else if (action === 'configure') {
      setShowActionFeedback({id: pipelineId, action: '⚙️ Opening configuration...', show: true});
      setTimeout(() => setShowActionFeedback({id: '', action: '', show: false}), 2000);
    }
  };

  // Generate diagnostic queries for the pipeline
  const getDiagnosticQueries = (pipeline: Pipeline) => {
    const queries = [
      {
        name: 'Recent Executions',
        query: `// Query to analyze recent pipeline executions
PipelineExecutions
| where PipelineName == "${pipeline.name}"
| where TimeGenerated > ago(24h)
| summarize 
    TotalRuns = count(),
    SuccessfulRuns = countif(Status == "Success"),
    FailedRuns = countif(Status == "Failed"),
    AvgDuration = avg(DurationMinutes)
by bin(TimeGenerated, 1h)
| order by TimeGenerated desc`
      },
      {
        name: 'Error Analysis',
        query: `// Query to analyze pipeline errors and failures
PipelineErrors
| where PipelineName == "${pipeline.name}"
| where TimeGenerated > ago(7d)
| summarize ErrorCount = count() by ErrorType, bin(TimeGenerated, 1d)
| order by TimeGenerated desc, ErrorCount desc`
      },
      {
        name: 'Performance Metrics',
        query: `// Query to analyze pipeline performance metrics
PipelineMetrics
| where PipelineName == "${pipeline.name}"
| where TimeGenerated > ago(30d)
| extend ProcessingTimeCategory = case(
    DurationMinutes <= ${pipeline.slaRequirement * 0.7}, "Fast",
    DurationMinutes <= ${pipeline.slaRequirement}, "Normal",
    "Slow"
)
| summarize 
    Count = count(),
    AvgDuration = avg(DurationMinutes),
    P95Duration = percentile(DurationMinutes, 95)
by ProcessingTimeCategory
| order by AvgDuration asc`
      }
    ];
    return queries;
  };

  // Generate log references with actual links
  const getLogReferences = (pipeline: Pipeline) => {
    const baseLogUrl = "https://portal.azure.com/#@microsoft.onmicrosoft.com/logs";
    const workspaceId = "12345678-1234-1234-1234-123456789012"; // Mock workspace ID
    
    return [
      {
        system: 'Azure Monitor Logs',
        description: 'View detailed execution logs and metrics',
        queryId: `pipeline-${pipeline.id}-logs`,
        logUrl: `${baseLogUrl}?workspaceId=${workspaceId}&query=PipelineExecutions | where PipelineName == "${pipeline.name}"`,
        timestamp: new Date(pipeline.lastRun.getTime() - Math.random() * 60 * 60 * 1000),
        logLevel: 'INFO',
        source: 'Azure Data Factory'
      },
      {
        system: 'Application Insights',
        description: 'Performance and dependency tracking',
        queryId: `pipeline-${pipeline.id}-insights`,
        logUrl: `https://portal.azure.com/#@microsoft.onmicrosoft.com/resource/appInsights`,
        timestamp: new Date(pipeline.lastRun.getTime() - Math.random() * 30 * 60 * 1000),
        logLevel: pipeline.status === 'failed' ? 'ERROR' : 'INFO',
        source: 'Application Insights'
      },
      {
        system: 'Azure Storage Logs',
        description: 'Data movement and storage operations',
        queryId: `pipeline-${pipeline.id}-storage`,
        logUrl: `${baseLogUrl}?workspaceId=${workspaceId}&query=StorageLogs | where OperationName contains "${pipeline.name}"`,
        timestamp: new Date(pipeline.lastRun.getTime() - Math.random() * 45 * 60 * 1000),
        logLevel: 'INFO',
        source: 'Azure Storage'
      }
    ];
  };

  // Generate runbook links
  const getRunbooks = (pipeline: Pipeline) => {
    return [
      {
        title: 'Pipeline Troubleshooting Guide',
        description: 'Step-by-step troubleshooting for common pipeline issues',
        url: `https://docs.microsoft.com/runbooks/${pipeline.source.toLowerCase()}-pipeline-troubleshooting`,
        category: 'Troubleshooting'
      },
      {
        title: 'Data Quality Validation',
        description: 'Procedures for validating data quality and integrity',
        url: `https://docs.microsoft.com/runbooks/data-quality-${pipeline.dataClassification.toLowerCase()}`,
        category: 'Quality Assurance'
      },
      {
        title: 'Performance Optimization',
        description: 'Guidelines for optimizing pipeline performance',
        url: `https://docs.microsoft.com/runbooks/pipeline-optimization-${pipeline.process}`,
        category: 'Optimization'
      }
    ];
  };

  // Enhanced copy functionality
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowActionFeedback({id: '', action: `${type} copied to clipboard!`, show: true});
      setTimeout(() => setShowActionFeedback({id: '', action: '', show: false}), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setShowActionFeedback({id: '', action: 'Failed to copy', show: true});
      setTimeout(() => setShowActionFeedback({id: '', action: '', show: false}), 2000);
    }
  };

  const getStatusIcon = (status: PipelineStatus) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className={`${styles.statusIcon} ${styles.healthy}`} />;
      case 'warning':
        return <AlertTriangle className={`${styles.statusIcon} ${styles.warning}`} />;
      case 'failed':
        return <XCircle className={`${styles.statusIcon} ${styles.failed}`} />;
      case 'processing':
        return <Clock className={`${styles.statusIcon} ${styles.processing}`} />;
    }
  };

  const formatLastRun = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const formatRecordsPerHour = (recordsProcessed: number, avgProcessingTime: number) => {
    // Calculate approximate records per hour based on processing time
    const recordsPerHour = Math.floor((recordsProcessed * 60) / avgProcessingTime);
    return recordsPerHour.toLocaleString();
  };

  const uniqueSources = [...new Set(pipelines.map(p => p.source))];

  // Row component for virtual scrolling
  const PipelineRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const pipeline = filteredPipelines[index];
    const isExpanded = expandedRows.has(pipeline.id);

    const handleRowClick = (e: React.MouseEvent) => {
      // Prevent click if clicking on action buttons
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.actionButton')) {
        return;
      }
      console.log('Pipeline clicked:', pipeline.name);
      toggleExpanded(pipeline.id);
    };

    return (
      <div style={style} className={styles.virtualRow}>
        <div 
          className={`${styles.pipelineRow} ${isExpanded ? styles.expanded : ''}`}
          onClick={handleRowClick}
          data-pipeline-id={pipeline.id}
        >
          <div className={styles.rowContent}>
            <div className={styles.pipelineInfo}>
              <div className={styles.pipelineName}>
                <span className={styles.name}>{pipeline.name}</span>
                <span className={styles.source}>{pipeline.source}</span>
                <div className={styles.pipelineMetadata}>
                  <span className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Team:</span> {pipeline.ownerTeam}
                    {getTooltipContent('ownerTeamFilter') && (
                      <InfoTooltip 
                        {...getTooltipContent('ownerTeamFilter')!} 
                        position="top"
                        size="small"
                      />
                    )}
                  </span>
                  <span className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Region:</span> {pipeline.region}
                    {getTooltipContent('pipelineRegion') && (
                      <InfoTooltip 
                        {...getTooltipContent('pipelineRegion')!} 
                        position="top"
                        size="small"
                      />
                    )}
                  </span>
                  <span className={`${styles.metadataItem} ${styles.classification} ${styles[pipeline.dataClassification.toLowerCase()]}`}>
                    {pipeline.dataClassification}
                    {getTooltipContent('dataClassificationFilter') && (
                      <InfoTooltip 
                        {...getTooltipContent('dataClassificationFilter')!} 
                        position="top"
                        size="small"
                      />
                    )}
                  </span>
                </div>
              </div>
              
              <div className={styles.statusCell}>
                {getStatusIcon(pipeline.status)}
                <span className={`${styles.statusText} ${styles[pipeline.status]}`}>
                  {pipeline.status.charAt(0).toUpperCase() + pipeline.status.slice(1)}
                </span>
              </div>
              
              <div className={styles.metricCell}>
                <span className={styles.metricValue}>{formatLastRun(pipeline.lastRun)}</span>
                <span className={styles.metricLabel}>Last Run</span>
              </div>
              
              <div className={styles.metricCell}>
                <span className={styles.metricValue}>{pipeline.avgProcessingTime}m</span>
                <span className={styles.metricLabel}>Avg Time</span>
              </div>
              
              <div className={styles.metricCell}>
                <span className={styles.metricValue}>
                  {formatRecordsPerHour(pipeline.recordsProcessed, pipeline.avgProcessingTime)}
                </span>
                <span className={styles.metricLabel}>Records/Hour</span>
              </div>
              
              <div className={styles.metricCell}>
                <span className={`${styles.failureRate} ${pipeline.failureRate > 5 ? styles.high : styles.low}`}>
                  {pipeline.failureRate}%
                </span>
                <span className={styles.metricLabel}>Failure Rate</span>
              </div>
              
              <div className={styles.actions}>
                {pipeline.status === 'processing' || runningPipelines.has(pipeline.id) ? (
                  <button 
                    className={`${styles.actionButton} ${styles.pauseButton}`} 
                    title={runningPipelines.has(pipeline.id) ? "Starting..." : "Pause Pipeline"}
                    onClick={(e) => handlePipelineAction(pipeline.id, 'pause', e)}
                    disabled={runningPipelines.has(pipeline.id)}
                  >
                    {runningPipelines.has(pipeline.id) ? <Clock size={16} className={styles.spinning} /> : <Pause size={16} />}
                  </button>
                ) : (
                  <button 
                    className={`${styles.actionButton} ${styles.runButton}`} 
                    title="Run Pipeline"
                    onClick={(e) => handlePipelineAction(pipeline.id, 'run', e)}
                  >
                    <Play size={16} />
                  </button>
                )}
                <button 
                  className={`${styles.actionButton} ${styles.configButton}`} 
                  title="Configure Pipeline"
                  onClick={(e) => handlePipelineAction(pipeline.id, 'configure', e)}
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
            
            <div className={styles.expandIcon}>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </div>
          
          {isExpanded && (
            <div className={styles.expandedContent}>
              <div className={styles.expandedGrid}>
                {/* Processing Time Chart */}
                <div className={styles.chartSection}>
                  <h4 className={styles.sectionTitle}>
                    <Activity className={styles.sectionIcon} />
                    24-Hour Processing Time Trend
                    {getTooltipContent('processingTimeTrend') && (
                      <InfoTooltip 
                        {...getTooltipContent('processingTimeTrend')!} 
                        position="right"
                        size="medium"
                      />
                    )}
                  </h4>
                  <div className={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={generateProcessingTimeData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fill: '#ccc', fontSize: 11 }}
                          interval={2}
                        />
                        <YAxis 
                          tick={{ fill: '#ccc' }}
                          label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          labelFormatter={(label) => `Time: ${label}`}
                          formatter={(value) => [`${value} min`, 'Processing Time']}
                          contentStyle={{ 
                            backgroundColor: '#252526', 
                            border: '1px solid #333',
                            borderRadius: '6px'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="processingTime" 
                          stroke="#1890ff" 
                          strokeWidth={2}
                          dot={{ fill: '#1890ff', strokeWidth: 0, r: 2 }}
                          activeDot={{ r: 4, stroke: '#1890ff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Errors */}
                <div className={styles.errorsSection}>
                  <h4 className={styles.sectionTitle}>
                    <AlertCircle className={styles.sectionIcon} />
                    Recent Issues
                    {getTooltipContent('recentIssues') && (
                      <InfoTooltip 
                        {...getTooltipContent('recentIssues')!} 
                        position="right"
                        size="medium"
                      />
                    )}
                  </h4>
                  <div className={styles.errorsList}>
                    {getRecentErrors(pipeline).length > 0 ? (
                      getRecentErrors(pipeline).map((error, idx) => (
                        <div key={idx} className={`${styles.errorItem} ${styles[error.level]}`}>
                          <div className={styles.errorTime}>
                            {error.timestamp.toLocaleTimeString()}
                          </div>
                          <div className={styles.errorMessage}>{error.message}</div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noErrors}>No recent issues</div>
                    )}
                  </div>
                </div>

                {/* Configuration */}
                <div className={styles.configSection}>
                  <h4 className={styles.sectionTitle}>
                    <Settings className={styles.sectionIcon} />
                    Configuration
                    {getTooltipContent('pipelineConfiguration') && (
                      <InfoTooltip 
                        {...getTooltipContent('pipelineConfiguration')!} 
                        position="right"
                        size="medium"
                      />
                    )}
                  </h4>
                  <div className={styles.configGrid}>
                    {Object.entries(getConfigDetails(pipeline)).map(([key, value]) => (
                      <div key={key} className={styles.configItem}>
                        <span className={styles.configKey}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span className={styles.configValue}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                <div className={styles.dependenciesSection}>
                  <h4 className={styles.sectionTitle}>
                    <Activity className={styles.sectionIcon} />
                    Dependencies
                    {getTooltipContent('pipelineDependencies') && (
                      <InfoTooltip 
                        {...getTooltipContent('pipelineDependencies')!} 
                        position="right"
                        size="medium"
                      />
                    )}
                  </h4>
                  <div className={styles.dependenciesList}>
                    {getDependencies(pipeline).length > 0 ? (
                      getDependencies(pipeline).map((dep) => (
                        <div key={dep.id} className={styles.dependencyItem}>
                          {getStatusIcon(dep.status)}
                          <span className={styles.dependencyName}>{dep.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className={styles.noDependencies}>No dependencies</div>
                    )}
                  </div>
                </div>

                {/* Logs and Diagnostics */}
                <div className={styles.logsSection}>
                  <h4 className={styles.sectionTitle}>
                    <FileText className={styles.sectionIcon} />
                    Logs and Diagnostics
                    {getTooltipContent('pipelineLogsDiagnostics') && (
                      <InfoTooltip 
                        {...getTooltipContent('pipelineLogsDiagnostics')!} 
                        position="right"
                        size="medium"
                      />
                    )}
                  </h4>
                  <div className={styles.logsContent}>
                    <div className={styles.logQueries}>
                      <h5 className={styles.subTitle}>Diagnostic Queries</h5>
                      {getDiagnosticQueries(pipeline).map((query, idx) => (
                        <div key={idx} className={styles.queryItem}>
                          <div className={styles.queryHeader}>
                            <span className={styles.queryName}>{query.name}</span>
                            <button 
                              className={styles.copyButton} 
                              onClick={() => copyToClipboard(query.query, 'Query')}
                              title="Copy query to clipboard"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className={styles.queryBody}>
                            <pre className={styles.queryText}>{query.query}</pre>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.logReferences}>
                      <h5 className={styles.subTitle}>Log References</h5>
                      {getLogReferences(pipeline).map((log, idx) => (
                        <div key={idx} className={styles.logItem}>
                          <div className={styles.logHeader}>
                            <span className={styles.logSystem}>{log.system}</span>
                            <span className={styles.logLevel}>{log.logLevel}</span>
                          </div>
                          <div className={styles.logBody}>
                            <div className={styles.logDescription}>{log.description}</div>
                            <a href={log.logUrl} target="_blank" rel="noopener noreferrer" className={styles.logLink}>
                              View Logs
                              <ExternalLink size={14} className={styles.linkIcon} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.runbooks}>
                      <h5 className={styles.subTitle}>Runbook Links</h5>
                      {getRunbooks(pipeline).map((runbook, idx) => (
                        <div key={idx} className={styles.runbookItem}>
                          <div className={styles.runbookHeader}>
                            <span className={styles.runbookTitle}>{runbook.title}</span>
                            <span className={styles.runbookCategory}>{runbook.category}</span>
                          </div>
                          <div className={styles.runbookBody}>
                            <div className={styles.runbookDescription}>{runbook.description}</div>
                            <a href={runbook.url} target="_blank" rel="noopener noreferrer" className={styles.runbookLink}>
                              View Runbook
                              <ExternalLink size={14} className={styles.linkIcon} />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pipelines}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              Pipeline Management
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
            <p className={styles.subtitle}>Monitor and manage your threat intelligence data pipelines</p>
          </div>
        </div>
        {/* Debug: Show expanded count */}
        <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '10px' }}>
          Expanded pipelines: {expandedRows.size} | 
          Expanded IDs: [{Array.from(expandedRows).join(', ')}] |
          <button 
            onClick={() => {
              console.log('Test toggle first pipeline');
              if (filteredPipelines.length > 0) {
                toggleExpanded(filteredPipelines[0].id);
              }
            }}
            style={{ marginLeft: '10px', padding: '4px 8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
          >
            Test Toggle First Pipeline
          </button>
          <button 
            onClick={() => {
              console.log('Clear all expanded');
              setExpandedRows(new Set());
            }}
            style={{ marginLeft: '10px', padding: '4px 8px', background: '#333', color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search pipelines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {getTooltipContent('pipelineSearch') && (
            <InfoTooltip 
              {...getTooltipContent('pipelineSearch')!} 
              position="bottom"
              size="medium"
              className={styles.searchTooltip}
            />
          )}
        </div>
        
        <button 
          className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          Filters
          <ChevronDown className={`${styles.toggleIcon} ${showFilters ? styles.rotated : ''}`} />
          {getTooltipContent('pipelineStatusFilter') && (
            <InfoTooltip 
              {...getTooltipContent('pipelineStatusFilter')!} 
              position="bottom"
              size="medium"
            />
          )}
        </button>
        
        <div className={styles.sortControls}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value="name">Sort by Name</option>
            <option value="lastRun">Sort by Last Run</option>
            <option value="status">Sort by Status</option>
            <option value="source">Sort by Source</option>
            <option value="failureRate">Sort by Failure Rate</option>
          </select>
          {getTooltipContent('pipelineSorting') && (
            <InfoTooltip 
              {...getTooltipContent('pipelineSorting')!} 
              position="bottom"
              size="medium"
            />
          )}
          
          <button
            className={styles.sortOrder}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expandable Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Status:
              {getTooltipContent('pipelineStatusFilter') && (
                <InfoTooltip 
                  {...getTooltipContent('pipelineStatusFilter')!} 
                  position="right"
                  size="small"
                />
              )}
            </label>
            <div className={styles.statusFilters}>
              {(['healthy', 'warning', 'failed', 'processing'] as PipelineStatus[]).map(status => (
                <button
                  key={status}
                  className={`${styles.statusFilter} ${statusFilters.has(status) ? styles.active : ''} ${styles[status]}`}
                  onClick={() => toggleStatusFilter(status)}
                >
                  {getStatusIcon(status)}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Source System:
              {getTooltipContent('sourceSystemFilter') && (
                <InfoTooltip 
                  {...getTooltipContent('sourceSystemFilter')!} 
                  position="right"
                  size="small"
                />
              )}
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as PipelineSource | 'all')}
              className={styles.sourceFilter}
            >
              <option value="all">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Owner Team:
              {getTooltipContent('ownerTeamFilter') && (
                <InfoTooltip 
                  {...getTooltipContent('ownerTeamFilter')!} 
                  position="right"
                  size="small"
                />
              )}
            </label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className={styles.teamFilter}
            >
              <option value="all">All Teams</option>
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              Classification:
              {getTooltipContent('dataClassificationFilter') && (
                <InfoTooltip 
                  {...getTooltipContent('dataClassificationFilter')!} 
                  position="right"
                  size="small"
                />
              )}
            </label>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className={styles.classificationFilter}
            >
              <option value="all">All Classifications</option>
              {uniqueClassifications.map(classification => (
                <option key={classification} value={classification}>{classification}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Virtual Scrolling Pipeline List */}
      <div className={styles.pipelinesList}>
        <div className={styles.listHeader}>
          <span className={styles.resultCount}>
            {filteredPipelines.length} of {pipelines.length} pipelines
          </span>
        </div>
        
        {/* Column Headers */}
        <div className={styles.columnHeaders}>
          <div className={styles.headerCell}>Pipeline</div>
          <div className={styles.headerCell}>
            Status
            {getTooltipContent('pipelineStatusFilter') && (
              <InfoTooltip 
                {...getTooltipContent('pipelineStatusFilter')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
          <div className={styles.headerCell}>
            Last Run
            {getTooltipContent('pipelineLastRun') && (
              <InfoTooltip 
                {...getTooltipContent('pipelineLastRun')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
          <div className={styles.headerCell}>
            Avg Time
            {getTooltipContent('avgProcessingTime') && (
              <InfoTooltip 
                {...getTooltipContent('avgProcessingTime')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
          <div className={styles.headerCell}>
            Records/Hour
            {getTooltipContent('recordsPerHour') && (
              <InfoTooltip 
                {...getTooltipContent('recordsPerHour')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
          <div className={styles.headerCell}>
            Failure
            {getTooltipContent('pipelineFailureRate') && (
              <InfoTooltip 
                {...getTooltipContent('pipelineFailureRate')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
          <div className={styles.headerCell}>
            Actions
            {getTooltipContent('pipelineActions') && (
              <InfoTooltip 
                {...getTooltipContent('pipelineActions')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
          <div className={styles.headerCell}></div>
        </div>
        
        <div className={styles.virtualContainer}>
          <List
            ref={listRef}
            height={600}
            width="100%"
            itemCount={filteredPipelines.length}
            itemSize={(index: number) => {
              const pipeline = filteredPipelines[index];
              const isExpanded = expandedRows.has(pipeline.id);
              // Increased heights with more consistent calculations
              const collapsedHeight = 100; // Base height for collapsed row
              const expandedHeight = 600;  // Height for expanded row with all details including logs
              return isExpanded ? expandedHeight : collapsedHeight;
            }}
            className={styles.virtualList}
            key={`${expandedRows.size}-${Array.from(expandedRows).join(',')}`} // More specific key for re-renders
          >
            {PipelineRow}
          </List>
        </div>
      </div>
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="pipelines"
      />
      
      <ChallengesModal 
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
        section="pipelines"
      />
      
      {/* Action Feedback Notification */}
      {showActionFeedback.show && (
        <div className={styles.feedbackNotification}>
          <span>{showActionFeedback.action}</span>
        </div>
      )}
    </div>
  );
});

Pipelines.displayName = 'Pipelines';

export default Pipelines;
