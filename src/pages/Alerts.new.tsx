import { useState, useEffect, memo } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Check,
  HelpCircle,
  Activity
} from 'lucide-react';
import { mockAlerts, mockPipelines } from '../data/mockData';
import type { Alert } from '../types';
import HowItWorksModal from '../components/HowItWorksModal';
import styles from './Alerts.module.css';

const Alerts = memo(() => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'rules' | 'history' | 'correlation'>('active');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);
  const [newAlertCount, setNewAlertCount] = useState(0);

  // Show notification when new alerts arrive
  useEffect(() => {
    if (newAlertCount > 0) {
      const timer = setTimeout(() => {
        setNewAlertCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [newAlertCount]);

  // Real-time alert simulation
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      const shouldGenerateAlert = Math.random() < 0.3;
      
      if (shouldGenerateAlert) {
        const alertMessages = [
          'Suspicious login detected from unknown IP address',
          'API rate limit exceeded for external threat feed',
          'ML model confidence dropped below threshold',
          'Data pipeline processing time exceeded SLA',
          'Unusual data export volume detected',
          'Geolocation anomaly in user access pattern'
        ];

        const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
        const categories = ['Infrastructure', 'Internal User Security', 'External Threat', 'AI/ML Anomaly', 'Data Access', 'Data Quality', 'Geopolitical Threat'];
        const pipelines = mockPipelines.slice(0, 10);

        const newAlert: Alert = {
          id: `alert-${Date.now()}`,
          pipelineId: pipelines[Math.floor(Math.random() * pipelines.length)].id,
          severity: severities[Math.floor(Math.random() * severities.length)],
          message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
          timestamp: new Date(),
          resolved: false,
          resolvedAt: undefined,
          acknowledgedBy: undefined,
          category: categories[Math.floor(Math.random() * categories.length)],
          logReferences: [{
            logSystem: 'azure_monitor' as const,
            logUrl: `https://portal.azure.com/logs/${Date.now()}`,
            correlationId: `corr-${Date.now()}`,
            timeRange: {
              start: new Date(Date.now() - 3600000),
              end: new Date()
            }
          }],
          pointOfContact: {
            team: 'MSTIC Data Engineering',
            primaryContact: 'John Doe',
            email: 'john.doe@microsoft.com',
            slackChannel: '#mstic-alerts',
            escalationPath: ['Team Lead', 'Manager', 'Director']
          },
          impactAssessment: {
            businessImpact: severities[Math.floor(Math.random() * severities.length)] as any,
            affectedSystems: ['Threat Intelligence Pipeline'],
            dataClassification: 'confidential' as const,
            customerImpact: Math.random() < 0.3
          },
          troubleshooting: {
            knownIssues: ['Known intermittent issue with external API'],
            diagnosticQueries: ['SELECT * FROM logs WHERE timestamp > NOW() - INTERVAL 1 HOUR'],
            relatedIncidents: [],
            runbooks: ['https://wiki.microsoft.com/incident-response']
          },
          alertContext: {
            alertRule: 'Real-time Anomaly Detection',
            triggerCondition: 'Threshold exceeded',
            threshold: 100,
            actualValue: Math.floor(Math.random() * 150) + 100,
            frequency: 1
          }
        };

        setAlerts(prev => [newAlert, ...prev]);
        setNewAlertCount(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeMode]);

  return (
    <div className={styles.alertsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Alert Management</h1>
          <p className={styles.pageSubtitle}>Monitor and manage threat intelligence pipeline alerts</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => setRealTimeMode(!realTimeMode)}
            className={`${styles.realTimeToggle} ${realTimeMode ? styles.active : ''}`}
            title={realTimeMode ? 'Disable real-time monitoring' : 'Enable real-time monitoring'}
          >
            <Activity size={16} />
            Real-time {realTimeMode ? 'ON' : 'OFF'}
            {newAlertCount > 0 && (
              <span className={styles.notificationBadge}>{newAlertCount}</span>
            )}
          </button>
          <button
            onClick={() => setShowHowItWorks(true)}
            className={styles.howItWorksBtn}
            title="Learn about alert correlation"
          >
            <HelpCircle size={16} />
            How It Works
          </button>
        </div>
      </div>

      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Alerts
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'rules' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Alert Rules
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'correlation' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('correlation')}
        >
          Correlation
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'active' && (
          <div className={styles.activeAlertsTab}>
            <div className={styles.summarySection}>
              <h2>Alert Summary</h2>
              <div className={styles.summaryCards}>
                <div className={styles.summaryCard}>
                  <AlertTriangle className={styles.critical} />
                  <span>Critical: {alerts.filter(a => !a.resolved && a.severity === 'critical').length}</span>
                </div>
                <div className={styles.summaryCard}>
                  <AlertTriangle className={styles.high} />
                  <span>High: {alerts.filter(a => !a.resolved && a.severity === 'high').length}</span>
                </div>
                <div className={styles.summaryCard}>
                  <AlertTriangle className={styles.medium} />
                  <span>Medium: {alerts.filter(a => !a.resolved && a.severity === 'medium').length}</span>
                </div>
                <div className={styles.summaryCard}>
                  <AlertTriangle className={styles.low} />
                  <span>Low: {alerts.filter(a => !a.resolved && a.severity === 'low').length}</span>
                </div>
              </div>
            </div>

            <div className={styles.alertsListSection}>
              <div className={styles.alertsHeader}>
                <h3>Active Alerts ({alerts.filter(a => !a.resolved).length})</h3>
                <div className={styles.searchContainer}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search alerts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.alertsList}>
                {alerts.filter(a => !a.resolved && 
                  a.message.toLowerCase().includes(searchTerm.toLowerCase())
                ).map(alert => (
                  <div key={alert.id} className={`${styles.alertRow} ${styles[alert.severity]}`}>
                    <div className={styles.alertContent}>
                      <AlertTriangle className={styles.severityIcon} />
                      <div className={styles.alertMessage}>
                        {alert.message}
                      </div>
                      <div className={styles.alertMeta}>
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className={styles.alertActions}>
                      <button
                        onClick={() => setAlerts(prev => prev.map(a => 
                          a.id === alert.id ? { ...a, resolved: true, resolvedAt: new Date() } : a
                        ))}
                        className={styles.resolveBtn}
                      >
                        <Check size={16} />
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'correlation' && (
          <div className={styles.correlationTab}>
            <h2>Alert Correlation Analysis</h2>
            <p>Advanced correlation analysis for threat intelligence alerts</p>
            
            <div className={styles.correlationInsights}>
              <div className={styles.insightCard}>
                <h3>Correlation Strength Distribution</h3>
                <div className={styles.strengthIndicators}>
                  <div className={styles.strengthItem}>
                    <span className={`${styles.strengthDot} ${styles.high}`}></span>
                    High Correlation: Same pipeline alerts
                  </div>
                  <div className={styles.strengthItem}>
                    <span className={`${styles.strengthDot} ${styles.medium}`}></span>
                    Medium Correlation: Same category alerts  
                  </div>
                  <div className={styles.strengthItem}>
                    <span className={`${styles.strengthDot} ${styles.low}`}></span>
                    Low Correlation: Time-based proximity
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showHowItWorks && (
        <HowItWorksModal 
          isOpen={showHowItWorks}
          section="alerts"
          onClose={() => setShowHowItWorks(false)} 
        />
      )}
    </div>
  );
});

export default Alerts;
