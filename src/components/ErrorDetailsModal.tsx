import { useState } from 'react';
import {
  AlertTriangle,
  XCircle,
  ExternalLink,
  Clock,
  TrendingDown,
  FileText,
  Users,
  MessageSquare,
  Activity,
  AlertCircle,
  CheckCircle,
  Copy,
  Zap,
  Shield,
  Settings,
  Phone,
  Mail,
  Gauge,
  Server,
  BarChart3
} from 'lucide-react';
import type { ErrorDetails, LogReference, MetricHistory, ImpactAnalysis, RunbookReference } from '../types';
import styles from './ErrorDetailsModal.module.css';

// Operational Information Interface (from DataLineage popup data)
interface OperationalInfo {
  slaMetrics?: {
    uptime: number;
    targetUptime: number;
    mttr: number; // Mean Time To Recovery in minutes
    mtbf: number; // Mean Time Between Failures in hours
  };
  operationalInfo?: {
    owner: string;
    escalationPath: string[];
    maintenanceWindow: string;
    criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    complianceRequirements: string[];
  };
  performanceMetrics?: {
    avgLatency: number;
    p95Latency: number;
    errorRate: number;
    throughputMbps: number;
    cpuUtilization: number;
    memoryUtilization: number;
  };
  troubleshooting?: {
    commonIssues: string[];
    runbookUrls: string[];
    logQuerySamples: string[];
    healthCheckEndpoints: string[];
  };
  technology?: {
    stack: string;
    resourceGroup: string;
    region: string;
    subscriptionId: string;
  };
  contactInfo?: {
    primaryTeam: string;
    secondaryTeam?: string;
    escalationContacts: Array<{
      name: string;
      role: string;
      email: string;
      phone?: string;
      slackHandle?: string;
    }>;
  };
}

interface ErrorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineName: string;
  currentError?: ErrorDetails;
  errorHistory: ErrorDetails[];
  logReferences: LogReference[];
  metricsHistory: MetricHistory[];
  impactAnalysis?: ImpactAnalysis;
  runbooks: RunbookReference[];
  oncallTeam: string;
  slackChannel?: string;
  teamsChannel?: string;
  dashboardUrl?: string;
  grafanaUrl?: string;
  healthCheckUrl?: string;
  // New operational information from popup data
  operationalData?: OperationalInfo;
}

const ErrorDetailsModal: React.FC<ErrorDetailsModalProps> = ({
  isOpen,
  onClose,
  pipelineName,
  currentError,
  errorHistory,
  logReferences,
  metricsHistory,
  impactAnalysis,
  runbooks,
  oncallTeam,
  slackChannel,
  teamsChannel,
  dashboardUrl,
  grafanaUrl,
  healthCheckUrl,
  operationalData
}) => {
  const [activeTab, setActiveTab] = useState<'error' | 'logs' | 'metrics' | 'impact' | 'runbooks' | 'operations'>('error');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getErrorIcon = (errorType: string) => {
    switch (errorType) {
      case 'connection': return <Zap className={styles.errorIcon} />;
      case 'data_quality': return <TrendingDown className={styles.errorIcon} />;
      case 'timeout': return <Clock className={styles.errorIcon} />;
      case 'authentication': return <Users className={styles.errorIcon} />;
      default: return <AlertTriangle className={styles.errorIcon} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Pipeline Error Details</h2>
            <p className={styles.pipelineName}>{pipelineName}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <XCircle size={24} />
          </button>
        </div>

        {/* Quick Actions Bar */}
        <div className={styles.quickActions}>
          <button 
            className={styles.actionButton}
            onClick={() => window.open(healthCheckUrl, '_blank')}
            disabled={!healthCheckUrl}
          >
            <Activity size={16} />
            Health Check
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => window.open(dashboardUrl, '_blank')}
            disabled={!dashboardUrl}
          >
            <ExternalLink size={16} />
            Dashboard
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => window.open(grafanaUrl, '_blank')}
            disabled={!grafanaUrl}
          >
            <TrendingDown size={16} />
            Metrics
          </button>
          {slackChannel && (
            <button 
              className={styles.actionButton}
              onClick={() => window.open(`slack://channel?team=T123&id=${slackChannel}`, '_blank')}
            >
              <MessageSquare size={16} />
              Slack
            </button>
          )}
          {teamsChannel && (
            <button 
              className={styles.actionButton}
              onClick={() => window.open(teamsChannel, '_blank')}
            >
              <Users size={16} />
              Teams
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabNav}>
          {['error', 'operations', 'logs', 'metrics', 'impact', 'runbooks'].map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab === 'operations' ? 'Operations' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'error' && currentError && (
                <span className={styles.errorBadge} style={{ backgroundColor: getSeverityColor(currentError.severity) }}>
                  {currentError.severity}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.modalContent}>
          {/* Error Details Tab */}
          {activeTab === 'error' && (
            <div className={styles.tabContent}>
              {currentError ? (
                <div className={styles.currentError}>
                  <div className={styles.errorHeader}>
                    <div className={styles.errorInfo}>
                      {getErrorIcon(currentError.errorType)}
                      <div>
                        <h3 className={styles.errorTitle}>{currentError.errorMessage}</h3>
                        <div className={styles.errorMeta}>
                          <span className={styles.errorCode}>Error Code: {currentError.errorCode}</span>
                          <span className={styles.errorTime}>
                            {new Date(currentError.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span 
                      className={styles.severityBadge}
                      style={{ backgroundColor: getSeverityColor(currentError.severity) }}
                    >
                      {currentError.severity}
                    </span>
                  </div>

                  {/* Stack Trace */}
                  {currentError.stackTrace && (
                    <div className={styles.stackTrace}>
                      <div className={styles.stackHeader}>
                        <h4>Stack Trace</h4>
                        <button
                          className={styles.copyButton}
                          onClick={() => copyToClipboard(currentError.stackTrace!, 'Stack Trace')}
                        >
                          <Copy size={14} />
                          {copiedText === 'Stack Trace' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className={styles.stackContent}>{currentError.stackTrace}</pre>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  <div className={styles.suggestedActions}>
                    <h4>Suggested Actions</h4>
                    <ul className={styles.actionsList}>
                      {currentError.suggestedActions.map((action, index) => (
                        <li key={index} className={styles.actionItem}>
                          <CheckCircle size={16} className={styles.actionIcon} />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Context */}
                  {currentError.context && Object.keys(currentError.context).length > 0 && (
                    <div className={styles.context}>
                      <h4>Error Context</h4>
                      <div className={styles.contextGrid}>
                        {Object.entries(currentError.context).map(([key, value]) => (
                          <div key={key} className={styles.contextItem}>
                            <span className={styles.contextKey}>{key}:</span>
                            <span className={styles.contextValue}>{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.noError}>
                  <CheckCircle size={48} className={styles.noErrorIcon} />
                  <h3>No Current Errors</h3>
                  <p>This pipeline is currently running without any detected errors.</p>
                </div>
              )}

              {/* Error History */}
              {errorHistory.length > 0 && (
                <div className={styles.errorHistory}>
                  <h4>Recent Error History</h4>
                  <div className={styles.historyList}>
                    {errorHistory.slice(0, 5).map((error, index) => (
                      <div key={index} className={styles.historyItem}>
                        <div className={styles.historyIcon}>
                          {getErrorIcon(error.errorType)}
                        </div>
                        <div className={styles.historyContent}>
                          <div className={styles.historyMessage}>{error.errorMessage}</div>
                          <div className={styles.historyMeta}>
                            <span>{error.errorCode}</span>
                            <span>{new Date(error.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                        <span 
                          className={styles.historySeverity}
                          style={{ backgroundColor: getSeverityColor(error.severity) }}
                        >
                          {error.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Operations Tab - Consolidated from popup data */}
          {activeTab === 'operations' && (
            <div className={styles.tabContent}>
              <div className={styles.operationsSection}>
                {/* Contact Information */}
                <div className={styles.contactSection}>
                  <h3>
                    <Users size={20} />
                    Contact Information
                  </h3>
                  <div className={styles.contactGrid}>
                    <div className={styles.contactCard}>
                      <h4>Primary Team</h4>
                      <div className={styles.teamInfo}>
                        <span className={styles.teamName}>
                          {operationalData?.operationalInfo?.owner || oncallTeam}
                        </span>
                        <div className={styles.contactMethods}>
                          {slackChannel && (
                            <button
                              className={styles.contactButton}
                              onClick={() => window.open(`slack://channel?team=T123&id=${slackChannel}`, '_blank')}
                            >
                              <MessageSquare size={14} />
                              #{slackChannel}
                            </button>
                          )}
                          {teamsChannel && (
                            <button
                              className={styles.contactButton}
                              onClick={() => window.open(teamsChannel, '_blank')}
                            >
                              <Users size={14} />
                              Teams Channel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.contactCard}>
                      <h4>Escalation Path</h4>
                      <div className={styles.escalationPath}>
                        {(operationalData?.operationalInfo?.escalationPath || 
                          ['On-call Engineer', 'Senior Engineer', 'Team Lead', 'Principal Engineer']).map((level, index) => (
                          <div key={index} className={styles.escalationLevel}>
                            <span className={styles.escalationOrder}>{index + 1}</span>
                            <span className={styles.escalationRole}>{level}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {operationalData?.contactInfo && (
                      <div className={styles.contactCard}>
                        <h4>Key Contacts</h4>
                        <div className={styles.keyContacts}>
                          {operationalData.contactInfo.escalationContacts.slice(0, 3).map((contact, index) => (
                            <div key={index} className={styles.contactPerson}>
                              <div className={styles.contactName}>{contact.name}</div>
                              <div className={styles.contactRole}>{contact.role}</div>
                              <div className={styles.contactDetails}>
                                <span className={styles.contactEmail}>
                                  <Mail size={12} />
                                  {contact.email}
                                </span>
                                {contact.phone && (
                                  <span className={styles.contactPhone}>
                                    <Phone size={12} />
                                    {contact.phone}
                                  </span>
                                )}
                                {contact.slackHandle && (
                                  <span className={styles.contactSlack}>
                                    <MessageSquare size={12} />
                                    @{contact.slackHandle}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SLA & Performance Metrics */}
                {operationalData?.slaMetrics && (
                  <div className={styles.slaSection}>
                    <h3>
                      <Gauge size={20} />
                      SLA Metrics
                    </h3>
                    <div className={styles.slaGrid}>
                      <div className={styles.slaCard}>
                        <div className={styles.slaLabel}>Current Uptime</div>
                        <div className={styles.slaValue}>
                          {operationalData.slaMetrics.uptime.toFixed(2)}%
                        </div>
                        <div className={styles.slaTarget}>
                          Target: {operationalData.slaMetrics.targetUptime}%
                        </div>
                      </div>
                      <div className={styles.slaCard}>
                        <div className={styles.slaLabel}>MTTR</div>
                        <div className={styles.slaValue}>
                          {operationalData.slaMetrics.mttr} min
                        </div>
                        <div className={styles.slaTarget}>Mean Time To Recovery</div>
                      </div>
                      <div className={styles.slaCard}>
                        <div className={styles.slaLabel}>MTBF</div>
                        <div className={styles.slaValue}>
                          {operationalData.slaMetrics.mtbf} hrs
                        </div>
                        <div className={styles.slaTarget}>Mean Time Between Failures</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technology Stack */}
                {operationalData?.technology && (
                  <div className={styles.techSection}>
                    <h3>
                      <Server size={20} />
                      Technology Stack
                    </h3>
                    <div className={styles.techGrid}>
                      <div className={styles.techCard}>
                        <div className={styles.techLabel}>Service</div>
                        <div className={styles.techValue}>{operationalData.technology.stack}</div>
                      </div>
                      <div className={styles.techCard}>
                        <div className={styles.techLabel}>Resource Group</div>
                        <div className={styles.techValue}>{operationalData.technology.resourceGroup}</div>
                      </div>
                      <div className={styles.techCard}>
                        <div className={styles.techLabel}>Region</div>
                        <div className={styles.techValue}>{operationalData.technology.region}</div>
                      </div>
                      <div className={styles.techCard}>
                        <div className={styles.techLabel}>Subscription</div>
                        <div className={styles.techValue}>{operationalData.technology.subscriptionId}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operational Configuration */}
                {operationalData?.operationalInfo && (
                  <div className={styles.configSection}>
                    <h3>
                      <Settings size={20} />
                      Operational Configuration
                    </h3>
                    <div className={styles.configGrid}>
                      <div className={styles.configCard}>
                        <div className={styles.configLabel}>Criticality Level</div>
                        <div className={`${styles.configValue} ${styles[`criticality-${operationalData.operationalInfo.criticalityLevel}`]}`}>
                          {operationalData.operationalInfo.criticalityLevel.toUpperCase()}
                        </div>
                      </div>
                      <div className={styles.configCard}>
                        <div className={styles.configLabel}>Data Classification</div>
                        <div className={`${styles.configValue} ${styles[`classification-${operationalData.operationalInfo.dataClassification}`]}`}>
                          <Shield size={14} />
                          {operationalData.operationalInfo.dataClassification.toUpperCase()}
                        </div>
                      </div>
                      <div className={styles.configCard}>
                        <div className={styles.configLabel}>Maintenance Window</div>
                        <div className={styles.configValue}>
                          <Clock size={14} />
                          {operationalData.operationalInfo.maintenanceWindow}
                        </div>
                      </div>
                      <div className={styles.configCard}>
                        <div className={styles.configLabel}>Compliance</div>
                        <div className={styles.complianceList}>
                          {operationalData.operationalInfo.complianceRequirements.map((req, index) => (
                            <span key={index} className={styles.complianceBadge}>{req}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {operationalData?.performanceMetrics && (
                  <div className={styles.perfSection}>
                    <h3>
                      <BarChart3 size={20} />
                      Real-time Performance
                    </h3>
                    <div className={styles.perfGrid}>
                      <div className={styles.perfCard}>
                        <div className={styles.perfLabel}>Average Latency</div>
                        <div className={styles.perfValue}>
                          {operationalData.performanceMetrics.avgLatency}ms
                        </div>
                      </div>
                      <div className={styles.perfCard}>
                        <div className={styles.perfLabel}>P95 Latency</div>
                        <div className={styles.perfValue}>
                          {operationalData.performanceMetrics.p95Latency}ms
                        </div>
                      </div>
                      <div className={styles.perfCard}>
                        <div className={styles.perfLabel}>Error Rate</div>
                        <div className={styles.perfValue}>
                          {operationalData.performanceMetrics.errorRate.toFixed(2)}%
                        </div>
                      </div>
                      <div className={styles.perfCard}>
                        <div className={styles.perfLabel}>Throughput</div>
                        <div className={styles.perfValue}>
                          {operationalData.performanceMetrics.throughputMbps} MB/s
                        </div>
                      </div>
                      <div className={styles.perfCard}>
                        <div className={styles.perfLabel}>CPU Usage</div>
                        <div className={styles.perfValue}>
                          {operationalData.performanceMetrics.cpuUtilization.toFixed(1)}%
                        </div>
                      </div>
                      <div className={styles.perfCard}>
                        <div className={styles.perfLabel}>Memory Usage</div>
                        <div className={styles.perfValue}>
                          {operationalData.performanceMetrics.memoryUtilization.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Troubleshooting Resources */}
                {operationalData?.troubleshooting && (
                  <div className={styles.troubleshootSection}>
                    <h3>
                      <FileText size={20} />
                      Troubleshooting Resources
                    </h3>
                    <div className={styles.troubleshootGrid}>
                      <div className={styles.troubleshootCard}>
                        <h4>Common Issues</h4>
                        <ul className={styles.issuesList}>
                          {operationalData.troubleshooting.commonIssues.map((issue, index) => (
                            <li key={index} className={styles.issueItem}>
                              <AlertCircle size={14} />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.troubleshootCard}>
                        <h4>Health Check Endpoints</h4>
                        <div className={styles.endpointsList}>
                          {operationalData.troubleshooting.healthCheckEndpoints.map((endpoint, index) => (
                            <button
                              key={index}
                              className={styles.endpointButton}
                              onClick={() => window.open(endpoint, '_blank')}
                            >
                              <Activity size={14} />
                              Health Check {index + 1}
                              <ExternalLink size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className={styles.troubleshootCard}>
                        <h4>Diagnostic Queries</h4>
                        <div className={styles.queriesList}>
                          {operationalData.troubleshooting.logQuerySamples.slice(0, 2).map((query, index) => (
                            <div key={index} className={styles.queryItem}>
                              <div className={styles.queryHeader}>
                                <span>Query {index + 1}</span>
                                <button
                                  className={styles.copyButton}
                                  onClick={() => copyToClipboard(query, `Query ${index + 1}`)}
                                >
                                  <Copy size={12} />
                                  {copiedText === `Query ${index + 1}` ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                              <code className={styles.queryCode}>{query}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className={styles.tabContent}>
              <div className={styles.logsSection}>
                <h3>Log References</h3>
                <div className={styles.logsList}>
                  {logReferences.map((log, index) => (
                    <div key={index} className={styles.logItem}>
                      <div className={styles.logHeader}>
                        <div className={styles.logSystem}>
                          <FileText size={16} />
                          {log.logSystem.toUpperCase()}
                        </div>
                        <button
                          className={styles.logButton}
                          onClick={() => window.open(log.logUrl, '_blank')}
                        >
                          <ExternalLink size={14} />
                          Open Logs
                        </button>
                      </div>
                      <div className={styles.logMeta}>
                        <span>Correlation ID: {log.correlationId}</span>
                        <span>
                          Time Range: {new Date(log.timeRange.start).toLocaleString()} - 
                          {new Date(log.timeRange.end).toLocaleString()}
                        </span>
                      </div>
                      {log.queryTemplate && (
                        <div className={styles.queryTemplate}>
                          <div className={styles.queryHeader}>
                            <span>Query Template:</span>
                            <button
                              className={styles.copyButton}
                              onClick={() => copyToClipboard(log.queryTemplate!, 'Query')}
                            >
                              <Copy size={12} />
                              {copiedText === 'Query' ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <code className={styles.queryCode}>{log.queryTemplate}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className={styles.tabContent}>
              <div className={styles.metricsSection}>
                <h3>Performance Metrics History</h3>
                {/* This would typically be a chart component */}
                <div className={styles.metricsPlaceholder}>
                  <Activity size={48} />
                  <p>Interactive metrics charts would be displayed here</p>
                  <p>Showing trends for: Records/sec, Processing Time, Error Rate, Data Quality</p>
                  {/* metricsHistory data would be used here for chart rendering */}
                  {metricsHistory.length > 0 && (
                    <p className={styles.metricsInfo}>
                      {metricsHistory.length} historical data points available
                    </p>
                  )}
                  {grafanaUrl && (
                    <button
                      className={styles.grafanaButton}
                      onClick={() => window.open(grafanaUrl, '_blank')}
                    >
                      <ExternalLink size={16} />
                      View in Grafana
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Impact Analysis Tab */}
          {activeTab === 'impact' && (
            <div className={styles.tabContent}>
              {impactAnalysis ? (
                <div className={styles.impactSection}>
                  <div className={styles.impactOverview}>
                    <h3>Impact Analysis</h3>
                    <div className={styles.impactLevel}>
                      <span 
                        className={styles.impactBadge}
                        style={{ backgroundColor: getSeverityColor(impactAnalysis.businessImpactLevel) }}
                      >
                        {impactAnalysis.businessImpactLevel.toUpperCase()} IMPACT
                      </span>
                    </div>
                  </div>

                  <div className={styles.impactGrid}>
                    <div className={styles.impactCard}>
                      <h4>Affected Downstream Pipelines</h4>
                      <div className={styles.affectedList}>
                        {impactAnalysis.affectedDownstreamPipelines.map((pipeline, index) => (
                          <div key={index} className={styles.affectedItem}>
                            <AlertCircle size={14} />
                            {pipeline}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.impactCard}>
                      <h4>Affected Destinations</h4>
                      <div className={styles.affectedList}>
                        {impactAnalysis.affectedDestinations.map((dest, index) => (
                          <div key={index} className={styles.affectedItem}>
                            <AlertCircle size={14} />
                            {dest}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.impactCard}>
                      <h4>Estimated Data Loss</h4>
                      <div className={styles.impactMetric}>
                        {impactAnalysis.estimatedDataLoss.toLocaleString()} records
                      </div>
                    </div>

                    <div className={styles.impactCard}>
                      <h4>Recovery Time Estimate</h4>
                      <div className={styles.impactMetric}>
                        {impactAnalysis.recoveryTimeEstimate} minutes
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.noImpact}>
                  <CheckCircle size={48} />
                  <h3>No Current Impact</h3>
                  <p>This pipeline failure is not currently impacting downstream systems.</p>
                </div>
              )}
            </div>
          )}

          {/* Runbooks Tab */}
          {activeTab === 'runbooks' && (
            <div className={styles.tabContent}>
              <div className={styles.runbooksSection}>
                <h3>Resolution Runbooks</h3>
                <div className={styles.runbooksList}>
                  {runbooks.map((runbook, index) => (
                    <div key={index} className={styles.runbookItem}>
                      <div className={styles.runbookHeader}>
                        <h4>{runbook.title}</h4>
                        <div className={styles.runbookMeta}>
                          <Clock size={14} />
                          ~{runbook.estimatedResolutionTime} min
                        </div>
                      </div>
                      <p className={styles.runbookDescription}>{runbook.description}</p>
                      <button
                        className={styles.runbookButton}
                        onClick={() => window.open(runbook.url, '_blank')}
                      >
                        <FileText size={16} />
                        Open Runbook
                      </button>
                    </div>
                  ))}
                </div>

                <div className={styles.oncallInfo}>
                  <h4>On-Call Team</h4>
                  <div className={styles.oncallDetails}>
                    <Users size={16} />
                    <span>{oncallTeam}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDetailsModal;
