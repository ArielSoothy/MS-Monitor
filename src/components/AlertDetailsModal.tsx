import { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  User, 
  Mail, 
  MessageSquare, 
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  Database,
  Users,
  BookOpen,
  Activity,
  Eye
} from 'lucide-react';
import type { Alert } from '../types';
import styles from './AlertDetailsModal.module.css';

interface AlertDetailsModalProps {
  alert: Alert;
  isOpen: boolean;
  onClose: () => void;
  onResolve: () => void;
  onAcknowledge: () => void;
}

const AlertDetailsModal = ({ alert, isOpen, onClose, onResolve, onAcknowledge }: AlertDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'troubleshooting' | 'contacts'>('overview');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 3000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ff4757';
      case 'high': return '#ff6348';
      case 'medium': return '#ffa502';
      case 'low': return '#26de81';
      default: return '#747d8c';
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(new Date(date));
  };

  return (
    <>
      {copiedText && (
        <div className={styles.copiedFeedback}>
          <CheckCircle size={16} />
          Copied {copiedText} to clipboard!
        </div>
      )}
      <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.alertSummary}>
            <AlertTriangle 
              size={24} 
              style={{ color: getSeverityColor(alert.severity) }}
            />
            <div className={styles.alertInfo}>
              <h2 className={styles.alertTitle}>Alert Details</h2>
              <div className={styles.alertMeta}>
                <span className={`${styles.severityBadge} ${styles[alert.severity]}`}>
                  {alert.severity.toUpperCase()}
                </span>
                <span className={styles.category}>{alert.category}</span>
                <span className={styles.timestamp}>
                  <Calendar size={14} />
                  {formatDateTime(alert.timestamp)}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.alertMessage}>
          <p>{alert.message}</p>
        </div>

        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Eye size={16} />
            Overview
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'logs' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <Database size={16} />
            Logs & Context
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'troubleshooting' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('troubleshooting')}
          >
            <BookOpen size={16} />
            Troubleshooting
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'contacts' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('contacts')}
          >
            <Users size={16} />
            Contacts & Escalation
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div className={styles.overviewTab}>
              <div className={styles.section}>
                <h3>Impact Assessment</h3>
                <div className={styles.impactGrid}>
                  <div className={styles.impactItem}>
                    <label>Business Impact:</label>
                    <span className={`${styles.impactBadge} ${styles[alert.impactAssessment.businessImpact]}`}>
                      {alert.impactAssessment.businessImpact.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.impactItem}>
                    <label>Data Classification:</label>
                    <span className={styles.classificationBadge}>
                      {alert.impactAssessment.dataClassification.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.impactItem}>
                    <label>Customer Impact:</label>
                    <span className={`${styles.booleanBadge} ${alert.impactAssessment.customerImpact ? styles.yes : styles.no}`}>
                      {alert.impactAssessment.customerImpact ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.affectedSystems}>
                  <label>Affected Systems:</label>
                  <div className={styles.systemsList}>
                    {alert.impactAssessment.affectedSystems.map((system, index) => (
                      <span key={index} className={styles.systemTag}>{system}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Alert Context</h3>
                <div className={styles.contextGrid}>
                  <div className={styles.contextItem}>
                    <label>Alert Rule:</label>
                    <span>{alert.alertContext.alertRule}</span>
                  </div>
                  <div className={styles.contextItem}>
                    <label>Trigger Condition:</label>
                    <span>{alert.alertContext.triggerCondition}</span>
                  </div>
                  <div className={styles.contextItem}>
                    <label>Threshold:</label>
                    <span>{alert.alertContext.threshold}</span>
                  </div>
                  <div className={styles.contextItem}>
                    <label>Actual Value:</label>
                    <span className={styles.actualValue}>{alert.alertContext.actualValue}</span>
                  </div>
                  <div className={styles.contextItem}>
                    <label>Frequency:</label>
                    <span>{alert.alertContext.frequency} occurrence(s)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className={styles.logsTab}>
              <div className={styles.section}>
                <h3>Log References</h3>
                {alert.logReferences.map((logRef, index) => (
                  <div key={index} className={styles.logReference}>
                    <div className={styles.logHeader}>
                      <div className={styles.logSystem}>
                        <Database size={16} />
                        <span>{logRef.logSystem.replace('_', ' ').toUpperCase()}</span>
                      </div>
                      <div className={styles.logActions}>
                        <button 
                          onClick={() => handleCopy(logRef.correlationId, 'Correlation ID')}
                          className={`${styles.copyButton} ${copiedText === 'Correlation ID' ? styles.copied : ''}`}
                          title="Copy Correlation ID"
                        >
                          <Copy size={14} />
                          {copiedText === 'Correlation ID' ? 'Copied!' : 'Copy ID'}
                        </button>
                        <a 
                          href={logRef.logUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.logLink}
                        >
                          <ExternalLink size={14} />
                          Open Logs
                        </a>
                      </div>
                    </div>
                    <div className={styles.logDetails}>
                      <div className={styles.logDetail}>
                        <label>Correlation ID:</label>
                        <code>{logRef.correlationId}</code>
                      </div>
                      <div className={styles.logDetail}>
                        <label>Time Range:</label>
                        <span>
                          {formatDateTime(logRef.timeRange.start)} - {formatDateTime(logRef.timeRange.end)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'troubleshooting' && (
            <div className={styles.troubleshootingTab}>
              <div className={styles.section}>
                <h3>Known Issues</h3>
                <div className={styles.knownIssues}>
                  {alert.troubleshooting.knownIssues.length > 0 ? (
                    alert.troubleshooting.knownIssues.map((issue, index) => (
                      <div key={index} className={styles.issueItem}>
                        <AlertTriangle size={16} />
                        <span>{issue}</span>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noData}>No known issues for this alert type.</p>
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <h3>Diagnostic Queries</h3>
                <div className={styles.diagnosticQueries}>
                  {alert.troubleshooting.diagnosticQueries.map((query, index) => (
                    <div key={index} className={styles.queryItem}>
                      <div className={styles.queryHeader}>
                        <span>Query {index + 1}</span>
                        <button 
                          onClick={() => handleCopy(query, `Query ${index + 1}`)}
                          className={`${styles.copyButton} ${copiedText === `Query ${index + 1}` ? styles.copied : ''}`}
                        >
                          <Copy size={14} />
                          {copiedText === `Query ${index + 1}` ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <code className={styles.queryCode}>{query}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <h3>Runbooks & Documentation</h3>
                <div className={styles.runbooks}>
                  {alert.troubleshooting.runbooks.map((runbook, index) => (
                    <a 
                      key={index}
                      href={runbook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.runbookLink}
                    >
                      <BookOpen size={16} />
                      <span>Incident Response Runbook {index + 1}</span>
                      <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className={styles.contactsTab}>
              <div className={styles.section}>
                <h3>Point of Contact</h3>
                <div className={styles.contactCard}>
                  <div className={styles.contactHeader}>
                    <User size={20} />
                    <div className={styles.contactInfo}>
                      <h4>{alert.pointOfContact.primaryContact}</h4>
                      <p>{alert.pointOfContact.team}</p>
                    </div>
                  </div>
                  <div className={styles.contactDetails}>
                    <div className={styles.contactItem}>
                      <Mail size={16} />
                      <a href={`mailto:${alert.pointOfContact.email}`}>
                        {alert.pointOfContact.email}
                      </a>
                    </div>
                    {alert.pointOfContact.slackChannel && (
                      <div className={styles.contactItem}>
                        <MessageSquare size={16} />
                        <span>{alert.pointOfContact.slackChannel}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <h3>Escalation Path</h3>
                <div className={styles.escalationPath}>
                  {alert.pointOfContact.escalationPath.map((role, index) => (
                    <div key={index} className={styles.escalationStep}>
                      <div className={styles.stepNumber}>{index + 1}</div>
                      <span>{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <div className={styles.statusInfo}>
            {alert.resolved ? (
              <div className={styles.resolvedStatus}>
                <CheckCircle size={16} />
                <span>Resolved at {alert.resolvedAt ? formatDateTime(alert.resolvedAt) : 'Unknown'}</span>
              </div>
            ) : (
              <div className={styles.activeStatus}>
                <Activity size={16} />
                <span>Active Alert</span>
              </div>
            )}
          </div>
          <div className={styles.actionButtons}>
            {!alert.resolved && (
              <>
                <button onClick={onAcknowledge} className={styles.acknowledgeButton}>
                  <Clock size={16} />
                  Acknowledge
                </button>
                <button onClick={onResolve} className={styles.resolveButton}>
                  <CheckCircle size={16} />
                  Resolve
                </button>
              </>
            )}
            <button onClick={onClose} className={styles.cancelButton}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AlertDetailsModal;
