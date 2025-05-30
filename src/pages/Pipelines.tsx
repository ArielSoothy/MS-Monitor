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
  AlertCircle
} from 'lucide-react';
import { mockPipelines } from '../data/mockData';
import type { Pipeline, PipelineStatus, PipelineSource } from '../types';
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
                  </span>
                  <span className={styles.metadataItem}>
                    <span className={styles.metadataLabel}>Region:</span> {pipeline.region}
                  </span>
                  <span className={`${styles.metadataItem} ${styles.classification} ${styles[pipeline.dataClassification.toLowerCase()]}`}>
                    {pipeline.dataClassification}
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
                {pipeline.status === 'processing' ? (
                  <button className={styles.actionButton} title="Pause Pipeline">
                    <Pause size={16} />
                  </button>
                ) : (
                  <button className={styles.actionButton} title="Run Pipeline">
                    <Play size={16} />
                  </button>
                )}
                <button className={styles.actionButton} title="Configure Pipeline">
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
        <h1 className={styles.title}>Pipeline Management</h1>
        <p className={styles.subtitle}>Monitor and manage your threat intelligence data pipelines</p>
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
        </div>
        
        <button 
          className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          Filters
          <ChevronDown className={`${styles.toggleIcon} ${showFilters ? styles.rotated : ''}`} />
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
            <label className={styles.filterLabel}>Status:</label>
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
            <label className={styles.filterLabel}>Source System:</label>
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
            <label className={styles.filterLabel}>Owner Team:</label>
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
            <label className={styles.filterLabel}>Classification:</label>
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
          <div className={styles.headerCell}>Status</div>
          <div className={styles.headerCell}>Last Run</div>
          <div className={styles.headerCell}>Avg Time</div>
          <div className={styles.headerCell}>Records/Hour</div>
          <div className={styles.headerCell}>Failure</div>
          <div className={styles.headerCell}>Actions</div>
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
              const expandedHeight = 480;  // Height for expanded row with all details
              return isExpanded ? expandedHeight : collapsedHeight;
            }}
            className={styles.virtualList}
            key={`${expandedRows.size}-${Array.from(expandedRows).join(',')}`} // More specific key for re-renders
          >
            {PipelineRow}
          </List>
        </div>
      </div>
    </div>
  );
});

Pipelines.displayName = 'Pipelines';

export default Pipelines;
