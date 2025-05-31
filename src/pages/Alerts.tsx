import { useState, useMemo, memo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Eye, 
  X, 
  Check,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Timer,
  HelpCircle,
  ExternalLink,
  Users,
  Database,
  Shield,
  FileText,
  MessageSquare,
  Mail
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { mockAlerts, mockPipelines, mockAlertRules, mockAlertTrends } from '../data/mockData';
import type { Alert, AlertRule } from '../types';
import HowItWorksModal from '../components/HowItWorksModal';
import InfoTooltip from '../components/InfoTooltip';
import { getTooltipContent } from '../utils/tooltipContent';
import styles from './Alerts.module.css';

const Alerts = memo(() => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'duration'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'rules' | 'history'>('active');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(alert => {
        const pipeline = mockPipelines.find(p => p.id === alert.pipelineId);
        const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (pipeline?.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
        return matchesSearch && matchesSeverity;
      })
      .sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'timestamp':
            aValue = a.timestamp.getTime();
            bValue = b.timestamp.getTime();
            break;
          case 'severity':
            const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
            aValue = severityOrder[a.severity];
            bValue = severityOrder[b.severity];
            break;
          case 'duration':
            const now = new Date();
            aValue = now.getTime() - a.timestamp.getTime();
            bValue = now.getTime() - b.timestamp.getTime();
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
  }, [alerts, searchTerm, severityFilter, sortBy, sortOrder]);

  // Alert statistics
  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
  const warningAlerts = activeAlerts.filter(a => a.severity === 'high');
  const infoAlerts = activeAlerts.filter(a => a.severity === 'medium' || a.severity === 'low');
  
  // Calculate mean time to resolution
  const resolvedAlerts = alerts.filter(a => a.resolved && a.resolvedAt);
  const mttr = resolvedAlerts.length > 0 
    ? resolvedAlerts.reduce((sum, alert) => {
        if (alert.resolvedAt) {
          return sum + (alert.resolvedAt.getTime() - alert.timestamp.getTime());
        }
        return sum;
      }, 0) / resolvedAlerts.length / (1000 * 60 * 60) // Convert to hours
    : 0;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className={`${styles.severityIcon} ${styles.critical}`} />;
      case 'high':
        return <AlertTriangle className={`${styles.severityIcon} ${styles.high}`} />;
      case 'medium':
        return <AlertTriangle className={`${styles.severityIcon} ${styles.medium}`} />;
      case 'low':
        return <AlertTriangle className={`${styles.severityIcon} ${styles.low}`} />;
      default:
        return <AlertTriangle className={styles.severityIcon} />;
    }
  };

  const formatDuration = (alert: Alert) => {
    const now = new Date();
    const start = alert.timestamp;
    const end = alert.resolved && alert.resolvedAt ? alert.resolvedAt : now;
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getPipelineName = (pipelineId: string) => {
    const pipeline = mockPipelines.find(p => p.id === pipelineId);
    return pipeline?.name || 'Unknown Pipeline';
  };

  const handleAlertAction = (alertId: string, action: 'acknowledge' | 'resolve' | 'dismiss') => {
    setAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        switch (action) {
          case 'acknowledge':
            return { ...alert, acknowledgedBy: 'current-user@microsoft.com' };
          case 'resolve':
            return { 
              ...alert, 
              resolved: true, 
              resolvedAt: new Date(),
              acknowledgedBy: 'current-user@microsoft.com'
            };
          case 'dismiss':
            return { ...alert, resolved: true, resolvedAt: new Date() };
          default:
            return alert;
        }
      }
      return alert;
    }));
  };

  const toggleAlertRule = (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const renderSummaryCards = () => (
    <div className={styles.summaryCards}>
      <div className={styles.summaryCard}>
        <div className={`${styles.cardIcon} ${styles.critical}`}>
          <AlertTriangle size={24} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardValue}>{criticalAlerts.length}</div>
          <div className={styles.cardLabel}>
            Critical Alerts
            {getTooltipContent('criticalAlerts') && (
              <InfoTooltip 
                {...getTooltipContent('criticalAlerts')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.summaryCard}>
        <div className={`${styles.cardIcon} ${styles.warning}`}>
          <AlertTriangle size={24} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardValue}>{warningAlerts.length}</div>
          <div className={styles.cardLabel}>
            Warning Alerts
            {getTooltipContent('warningAlerts') && (
              <InfoTooltip 
                {...getTooltipContent('warningAlerts')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.summaryCard}>
        <div className={`${styles.cardIcon} ${styles.info}`}>
          <AlertTriangle size={24} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardValue}>{infoAlerts.length}</div>
          <div className={styles.cardLabel}>
            Info Alerts
            {getTooltipContent('infoAlerts') && (
              <InfoTooltip 
                {...getTooltipContent('infoAlerts')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
        </div>
      </div>

      <div className={styles.summaryCard}>
        <div className={`${styles.cardIcon} ${styles.time}`}>
          <Timer size={24} />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.cardValue}>{mttr.toFixed(1)}h</div>
          <div className={styles.cardLabel}>
            Mean Time to Resolution
            {getTooltipContent('mttr') && (
              <InfoTooltip 
                {...getTooltipContent('mttr')!} 
                position="bottom"
                size="small"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrendChart = () => (
    <div className={styles.chartSection}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>
          Alert Trends (Last 7 Days)
          {getTooltipContent('alertTrends') && (
            <InfoTooltip 
              {...getTooltipContent('alertTrends')!} 
              position="bottom"
              size="medium"
            />
          )}
        </h3>
        <TrendingUp className={styles.chartIcon} />
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={mockAlertTrends} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#404040" 
              strokeOpacity={0.5}
            />
            <XAxis 
              dataKey="date" 
              stroke="#cccccc"
              fontSize={12}
              fontWeight={500}
              tick={{ fill: '#cccccc' }}
              axisLine={{ stroke: '#666666' }}
              tickLine={{ stroke: '#666666' }}
            />
            <YAxis 
              stroke="#cccccc"
              fontSize={12}
              fontWeight={500}
              tick={{ fill: '#cccccc' }}
              axisLine={{ stroke: '#666666' }}
              tickLine={{ stroke: '#666666' }}
              label={{ 
                value: 'Number of Alerts', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#cccccc', fontSize: '12px' }
              }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#2d2d2d', 
                border: '1px solid #555555',
                borderRadius: '8px',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              labelStyle={{ color: '#ffffff', fontWeight: '600' }}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px'
              }}
              iconType="rect"
              formatter={(value) => (
                <span style={{ color: '#cccccc', fontWeight: '500' }}>
                  {value}
                </span>
              )}
            />
            <Bar 
              dataKey="critical" 
              fill="#dc3545" 
              name="Critical" 
              radius={[3, 3, 0, 0]}
              animationDuration={800}
              animationBegin={0}
            />
            <Bar 
              dataKey="high" 
              fill="#fd7e14" 
              name="High" 
              radius={[3, 3, 0, 0]}
              animationDuration={800}
              animationBegin={100}
            />
            <Bar 
              dataKey="medium" 
              fill="#ffc107" 
              name="Medium" 
              radius={[3, 3, 0, 0]}
              animationDuration={800}
              animationBegin={200}
            />
            <Bar 
              dataKey="low" 
              fill="#28a745" 
              name="Low" 
              radius={[3, 3, 0, 0]}
              animationDuration={800}
              animationBegin={300}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderActiveAlerts = () => (
    <div className={styles.alertsSection}>
      <div className={styles.alertsHeader}>
        <h3 className={styles.sectionTitle}>
          Active Alerts ({activeAlerts.length})
        </h3>
        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {getTooltipContent('alertSearch') && (
              <InfoTooltip 
                {...getTooltipContent('alertSearch')!} 
                position="top"
                size="small"
              />
            )}
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className={styles.filterSelect}
            title="Filter by severity"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {getTooltipContent('alertSeverityFilter') && (
            <InfoTooltip 
              {...getTooltipContent('alertSeverityFilter')!} 
              position="top"
              size="small"
            />
          )}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as any);
              setSortOrder(order as any);
            }}
            className={styles.filterSelect}
            title="Sort alerts"
          >
            <option value="timestamp-desc">Newest First</option>
            <option value="timestamp-asc">Oldest First</option>
            <option value="severity-desc">Severity (High to Low)</option>
            <option value="severity-asc">Severity (Low to High)</option>
            <option value="duration-desc">Duration (Longest First)</option>
            <option value="duration-asc">Duration (Shortest First)</option>
          </select>
          {getTooltipContent('alertSorting') && (
            <InfoTooltip 
              {...getTooltipContent('alertSorting')!} 
              position="top"
              size="small"
            />
          )}
        </div>
      </div>

      <div className={styles.alertsList}>
        {filteredAlerts.filter(a => !a.resolved).map(alert => (
          <div
            key={alert.id}
            className={`${styles.alertRow} ${styles[alert.severity]} ${
              expandedAlert === alert.id ? styles.expanded : ''
            }`}
          >
            <div 
              className={styles.alertMain}
              onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
            >
              <div className={styles.alertExpander}>
                {expandedAlert === alert.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              <div className={styles.alertSeverity}>
                {getSeverityIcon(alert.severity)}
              </div>
              <div className={styles.alertContent}>
                <div className={styles.alertMessage}>{alert.message}</div>
                <div className={styles.alertMeta}>
                  <span className={styles.pipeline}>{getPipelineName(alert.pipelineId)}</span>
                  <span className={styles.timestamp}>{formatTimestamp(alert.timestamp)}</span>
                  <span className={styles.duration}>Duration: {formatDuration(alert)}</span>
                  {alert.acknowledgedBy && (
                    <span className={styles.acknowledged}>
                      <CheckCircle size={14} /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
              <div className={styles.alertActions}>
                {!alert.acknowledgedBy && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAlertAction(alert.id, 'acknowledge');
                    }}
                    className={`${styles.actionBtn} ${styles.acknowledge}`}
                    title="Acknowledge"
                  >
                    <Check size={16} />
                    {getTooltipContent('alertAcknowledge') && (
                      <InfoTooltip 
                        {...getTooltipContent('alertAcknowledge')!} 
                        position="top"
                        size="small"
                      />
                    )}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAlertAction(alert.id, 'resolve');
                  }}
                  className={`${styles.actionBtn} ${styles.resolve}`}
                  title="Resolve"
                >
                  <Eye size={16} />
                  {getTooltipContent('alertResolve') && (
                    <InfoTooltip 
                      {...getTooltipContent('alertResolve')!} 
                      position="top"
                      size="small"
                    />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAlertAction(alert.id, 'dismiss');
                  }}
                  className={`${styles.actionBtn} ${styles.dismiss}`}
                  title="Dismiss"
                >
                  <X size={16} />
                  {getTooltipContent('alertDismiss') && (
                    <InfoTooltip 
                      {...getTooltipContent('alertDismiss')!} 
                      position="top"
                      size="small"
                    />
                  )}
                </button>
              </div>
            </div>
            
            {expandedAlert === alert.id && (
              <div className={styles.alertDetails}>
                <div className={styles.detailsContent}>
                  {/* Basic Alert Information */}
                  <div className={styles.detailsSection}>
                    <h4>Alert Details</h4>
                    <p><strong>Description:</strong> {alert.description}</p>
                    <p><strong>Pipeline:</strong> {getPipelineName(alert.pipelineId)}</p>
                    <p><strong>Triggered:</strong> {alert.timestamp.toLocaleString()}</p>
                    <p><strong>Duration:</strong> {formatDuration(alert)}</p>
                    {alert.acknowledgedBy && (
                      <p><strong>Acknowledged by:</strong> {alert.acknowledgedBy}</p>
                    )}
                  </div>

                  {/* Point of Contact Section */}
                  <div className={styles.detailsSection}>
                    <h4>
                      <Users size={16} className={styles.sectionIcon} />
                      Point of Contact
                    </h4>
                    <div className={styles.contactInfo}>
                      <p><strong>Team:</strong> {alert.pointOfContact.team}</p>
                      <p><strong>Primary Contact:</strong> {alert.pointOfContact.primaryContact}</p>
                      <div className={styles.contactLinks}>
                        <a href={`mailto:${alert.pointOfContact.email}`} className={styles.contactLink}>
                          <Mail size={14} />
                          {alert.pointOfContact.email}
                        </a>
                        {alert.pointOfContact.slackChannel && (
                          <a href={`slack://channel?team=microsoft&id=${alert.pointOfContact.slackChannel}`} className={styles.contactLink}>
                            <MessageSquare size={14} />
                            {alert.pointOfContact.slackChannel}
                          </a>
                        )}
                      </div>
                      <div className={styles.escalationPath}>
                        <strong>Escalation Path:</strong>
                        <div className={styles.escalationSteps}>
                          {alert.pointOfContact.escalationPath.map((step, index) => (
                            <span key={index} className={styles.escalationStep}>
                              {index + 1}. {step}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Log References Section */}
                  <div className={styles.detailsSection}>
                    <h4>
                      <Database size={16} className={styles.sectionIcon} />
                      Log References
                    </h4>
                    <div className={styles.logReferences}>
                      {alert.logReferences.map((logRef, index) => (
                        <div key={index} className={styles.logReference}>
                          <div className={styles.logSystem}>
                            <strong>{logRef.logSystem.toUpperCase()}</strong>
                            <span className={styles.correlationId}>ID: {logRef.correlationId}</span>
                          </div>
                          <a 
                            href={logRef.logUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.logLink}
                          >
                            <ExternalLink size={14} />
                            View Logs
                          </a>
                          {logRef.queryTemplate && (
                            <div className={styles.queryTemplate}>
                              <strong>Query:</strong>
                              <code className={styles.queryCode}>{logRef.queryTemplate}</code>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Impact Assessment Section */}
                  <div className={styles.detailsSection}>
                    <h4>
                      <Shield size={16} className={styles.sectionIcon} />
                      Impact Assessment
                    </h4>
                    <div className={styles.impactGrid}>
                      <div className={styles.impactItem}>
                        <strong>Business Impact:</strong>
                        <span className={`${styles.impactBadge} ${styles[alert.impactAssessment.businessImpact]}`}>
                          {alert.impactAssessment.businessImpact.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.impactItem}>
                        <strong>Data Classification:</strong>
                        <span className={`${styles.classificationBadge} ${styles[alert.impactAssessment.dataClassification]}`}>
                          {alert.impactAssessment.dataClassification.toUpperCase()}
                        </span>
                      </div>
                      <div className={styles.impactItem}>
                        <strong>Customer Impact:</strong>
                        <span className={alert.impactAssessment.customerImpact ? styles.hasImpact : styles.noImpact}>
                          {alert.impactAssessment.customerImpact ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.affectedSystems}>
                      <strong>Affected Systems:</strong>
                      <div className={styles.systemsList}>
                        {alert.impactAssessment.affectedSystems.map((system, index) => (
                          <span key={index} className={styles.systemTag}>{system}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Troubleshooting Section */}
                  <div className={styles.detailsSection}>
                    <h4>
                      <FileText size={16} className={styles.sectionIcon} />
                      Troubleshooting Resources
                    </h4>
                    <div className={styles.troubleshootingGrid}>
                      <div className={styles.troubleshootingItem}>
                        <strong>Related Incidents:</strong>
                        <div className={styles.incidentList}>
                          {alert.troubleshooting.relatedIncidents.map((incident, index) => (
                            <a key={index} href={`#/incidents/${incident}`} className={styles.incidentLink}>
                              {incident}
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className={styles.troubleshootingItem}>
                        <strong>Runbooks:</strong>
                        <div className={styles.runbookList}>
                          {alert.troubleshooting.runbooks.map((runbook, index) => (
                            <a key={index} href={runbook} target="_blank" rel="noopener noreferrer" className={styles.runbookLink}>
                              <ExternalLink size={12} />
                              Runbook {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={styles.knownIssues}>
                      <strong>Known Issues:</strong>
                      <ul className={styles.issuesList}>
                        {alert.troubleshooting.knownIssues.map((issue, index) => (
                          <li key={index}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Alert Context Section */}
                  <div className={styles.detailsSection}>
                    <h4>Alert Context</h4>
                    <div className={styles.contextGrid}>
                      <div className={styles.contextItem}>
                        <strong>Rule:</strong> {alert.alertContext.alertRule}
                      </div>
                      <div className={styles.contextItem}>
                        <strong>Condition:</strong> {alert.alertContext.triggerCondition}
                      </div>
                      <div className={styles.contextItem}>
                        <strong>Threshold:</strong> {alert.alertContext.threshold}
                      </div>
                      <div className={styles.contextItem}>
                        <strong>Actual Value:</strong> {alert.alertContext.actualValue}
                      </div>
                      <div className={styles.contextItem}>
                        <strong>Frequency:</strong> {alert.alertContext.frequency} occurrences
                      </div>
                    </div>
                  </div>

                  {/* Original Recommended Actions */}
                  {alert.actions && alert.actions.length > 0 && (
                    <div className={styles.detailsSection}>
                      <h4>Recommended Actions</h4>
                      <ul className={styles.actionsList}>
                        {alert.actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAlerts.filter(a => !a.resolved).length === 0 && (
        <div className={styles.emptyState}>
          <CheckCircle size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No active alerts</h3>
          <p className={styles.emptySubtitle}>
            {searchTerm || severityFilter !== 'all'
              ? 'No alerts match your current filters.'
              : 'All systems are running smoothly.'}
          </p>
        </div>
      )}
    </div>
  );

  const renderAlertRules = () => (
    <div className={styles.rulesSection}>
      <div className={styles.rulesHeader}>
        <h3 className={styles.sectionTitle}>
          Alert Rules
          {getTooltipContent('alertRules') && (
            <InfoTooltip 
              {...getTooltipContent('alertRules')!} 
              position="bottom"
              size="medium"
            />
          )}
        </h3>
        <p className={styles.sectionSubtitle}>Configure threshold-based alert rules for your pipelines</p>
      </div>
      
      <div className={styles.rulesList}>
        {alertRules.map(rule => (
          <div key={rule.id} className={`${styles.ruleCard} ${!rule.enabled ? styles.disabled : ''}`}>
            <div className={styles.ruleHeader}>
              <div className={styles.ruleInfo}>
                <h4 className={styles.ruleName}>{rule.name}</h4>
                <p className={styles.ruleDescription}>{rule.description}</p>
              </div>
              <div className={styles.ruleToggle}>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleAlertRule(rule.id)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </div>
            <div className={styles.ruleDetails}>
              <div className={styles.ruleMetric}>
                <span className={styles.metricLabel}>Type:</span>
                <span className={styles.metricValue}>{rule.type}</span>
              </div>
              <div className={styles.ruleCondition}>
                <span className={styles.conditionLabel}>Threshold:</span>
                <span className={styles.conditionValue}>
                  {rule.threshold ? `${rule.threshold}` : 'N/A'}
                  {rule.timeWindow ? ` (${rule.timeWindow}min window)` : ''}
                </span>
              </div>
              <div className={styles.ruleSeverity}>
                <span className={styles.severityLabel}>Severity:</span>
                <span className={`${styles.severityBadge} ${styles[rule.severity]}`}>
                  {rule.severity.charAt(0).toUpperCase() + rule.severity.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAlertHistory = () => (
    <div className={styles.historySection}>
      <div className={styles.historyHeader}>
        <h3 className={styles.sectionTitle}>
          Alert History
          {getTooltipContent('alertHistory') && (
            <InfoTooltip 
              {...getTooltipContent('alertHistory')!} 
              position="bottom"
              size="medium"
            />
          )}
        </h3>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search resolved alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {getTooltipContent('alertSearch') && (
            <InfoTooltip 
              {...getTooltipContent('alertSearch')!} 
              position="top"
              size="small"
            />
          )}
        </div>
      </div>
      
      <div className={styles.historyList}>
        {filteredAlerts.filter(a => a.resolved).map(alert => (
          <div key={alert.id} className={`${styles.historyItem} ${styles[alert.severity]}`}>
            <div className={styles.historySeverity}>
              {getSeverityIcon(alert.severity)}
            </div>
            <div className={styles.historyContent}>
              <div className={styles.historyMessage}>{alert.message}</div>
              <div className={styles.historyMeta}>
                <span className={styles.pipeline}>{getPipelineName(alert.pipelineId)}</span>
                <span className={styles.timestamp}>
                  Triggered: {formatTimestamp(alert.timestamp)}
                </span>
                {alert.resolvedAt && (
                  <span className={styles.resolution}>
                    Resolved: {formatTimestamp(alert.resolvedAt)}
                  </span>
                )}
                <span>Resolution Time: {formatDuration(alert)}</span>
              </div>
            </div>
            <div className={styles.historyStatus}>
              <CheckCircle size={16} className={styles.resolvedIcon} />
              <span>Resolved</span>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.filter(a => a.resolved).length === 0 && (
        <div className={styles.emptyState}>
          <Clock size={48} className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No resolved alerts found</h3>
          <p className={styles.emptySubtitle}>
            Resolved alerts will appear here for historical reference.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.alerts}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              Alert Management
              <button 
                className={styles.infoButton}
                onClick={() => setShowHowItWorks(true)}
                title="How does this system work?"
              >
                <HelpCircle size={18} />
              </button>
            </h1>
            <p className={styles.subtitle}>Monitor and manage security alerts from your threat intelligence pipelines</p>
          </div>
        </div>
      </div>

      {renderSummaryCards()}
      {renderTrendChart()}

      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Alerts ({activeAlerts.length})
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'rules' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            Alert Rules ({alertRules.filter(r => r.enabled).length} enabled)
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History ({alerts.filter(a => a.resolved).length} resolved)
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'active' && renderActiveAlerts()}
          {activeTab === 'rules' && renderAlertRules()}
          {activeTab === 'history' && renderAlertHistory()}
        </div>
      </div>
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="alerts"
      />
    </div>
  );
});

Alerts.displayName = 'Alerts';

export default Alerts;
