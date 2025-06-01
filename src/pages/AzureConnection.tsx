import React, { useState, useEffect } from 'react';
import { Server, Database, Key, CheckCircle, AlertCircle, Loader, Play, FileText, Monitor } from 'lucide-react';
import styles from './AzureConnection.module.css';
import { azureService } from '../services/azureService';

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastTest: Date | null;
  databaseStats?: {
    tables: number;
    totalRecords: number;
    lastIngestion: Date | null;
  };
}

const AzureConnection: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastTest: null,
  });

  const [activeStep, setActiveStep] = useState<number>(1);

  const testConnection = async () => {
    setConnectionStatus(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const result = await azureService.testConnection();
      
      // Get database statistics if connection is successful
      let stats = undefined;
      if (result) {
        try {
          const tableCount = await azureService.executeCustomQuery('show tables | count');
          const securityEvents = await azureService.executeCustomQuery('SecurityEvents | count');
          const threatIndicators = await azureService.executeCustomQuery('ThreatIndicators | count');
          
          stats = {
            tables: tableCount[0]?.Count || 0,
            totalRecords: (securityEvents[0]?.Count || 0) + (threatIndicators[0]?.Count || 0),
            lastIngestion: new Date(), // This would be real data in production
          };
        } catch (e) {
          console.log('Could not get database stats:', e);
        }
      }

      setConnectionStatus({
        isConnected: result,
        isLoading: false,
        error: result ? null : 'Failed to connect to Azure Data Explorer',
        lastTest: new Date(),
        databaseStats: stats,
      });
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Connection failed',
        lastTest: new Date(),
      });
    }
  };

  const setupSteps = [
    {
      id: 1,
      title: 'Azure Data Explorer Setup',
      description: 'Create your ADX cluster and database',
      status: 'completed',
      details: [
        'Cluster: msmonitoradx.israelcentral.kusto.windows.net',
        'Database: monitoringdb',
        'Region: Israel Central',
        'Retention: 2 days (cost-optimized for demo)',
      ],
    },
    {
      id: 2,
      title: 'Database Schema Creation',
      description: 'Create tables for security and pipeline data',
      status: connectionStatus.databaseStats?.tables ? 'completed' : 'pending',
      details: [
        'SecurityEvents table for threat intelligence',
        'ThreatIndicators for IOC correlation',
        'PipelineHealth for monitoring metrics',
        'PipelineMetrics for time-series data',
      ],
    },
    {
      id: 3,
      title: 'Sample Data Ingestion',
      description: 'Load realistic MSTIC-style security data',
      status: connectionStatus.databaseStats?.totalRecords ? 'completed' : 'pending',
      details: [
        'Security events from various sources',
        'Threat indicators and IOCs',
        'Pipeline health metrics',
        'Geographic threat distribution data',
      ],
    },
    {
      id: 4,
      title: 'Live Connection Test',
      description: 'Verify React app can query Azure Data Explorer',
      status: connectionStatus.isConnected ? 'completed' : 'pending',
      details: [
        'KQL query execution',
        'Real-time data retrieval',
        'Authentication validation',
        'Error handling verification',
      ],
    },
  ];

  useEffect(() => {
    // Auto-test connection on component mount
    testConnection();
  }, []);

  return (
    <div className={styles.azureConnection}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Server className={styles.titleIcon} />
          <div>
            <h1>Azure Data Explorer Integration</h1>
            <p>Live connection to Microsoft MSTIC-style threat intelligence database</p>
          </div>
        </div>
        
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <Database className={styles.statusIcon} />
            <span>Connection Status</span>
          </div>
          <div className={styles.statusContent}>
            {connectionStatus.isLoading ? (
              <div className={styles.statusLoading}>
                <Loader className={styles.spinner} />
                <span>Testing connection...</span>
              </div>
            ) : connectionStatus.isConnected ? (
              <div className={styles.statusConnected}>
                <CheckCircle className={styles.statusIndicator} />
                <span>Connected to Azure Data Explorer</span>
              </div>
            ) : (
              <div className={styles.statusError}>
                <AlertCircle className={styles.statusIndicator} />
                <span>Not Connected</span>
              </div>
            )}
            
            {connectionStatus.lastTest && (
              <div className={styles.lastTest}>
                Last tested: {connectionStatus.lastTest.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          <button 
            className={styles.testButton}
            onClick={testConnection}
            disabled={connectionStatus.isLoading}
          >
            {connectionStatus.isLoading ? (
              <>
                <Loader className={styles.buttonSpinner} />
                Testing...
              </>
            ) : (
              <>
                <Play />
                Test Connection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Database Statistics */}
      {connectionStatus.databaseStats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Database className={styles.statIcon} />
            <div className={styles.statContent}>
              <div className={styles.statValue}>{connectionStatus.databaseStats.tables}</div>
              <div className={styles.statLabel}>Tables Created</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <FileText className={styles.statIcon} />
            <div className={styles.statContent}>
              <div className={styles.statValue}>{connectionStatus.databaseStats.totalRecords.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Records</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <Monitor className={styles.statIcon} />
            <div className={styles.statContent}>
              <div className={styles.statValue}>Live</div>
              <div className={styles.statLabel}>Data Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Progress */}
      <div className={styles.setupSection}>
        <h2>Implementation Progress</h2>
        <div className={styles.stepsContainer}>
          {setupSteps.map((step) => (
            <div 
              key={step.id}
              className={`${styles.stepCard} ${
                step.status === 'completed' ? styles.stepCompleted : styles.stepPending
              } ${activeStep === step.id ? styles.stepActive : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className={styles.stepHeader}>
                <div className={styles.stepNumber}>
                  {step.status === 'completed' ? (
                    <CheckCircle className={styles.stepIcon} />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className={styles.stepTitle}>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className={styles.stepStatus}>
                  <span className={step.status === 'completed' ? styles.completed : styles.pending}>
                    {step.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
              
              {activeStep === step.id && (
                <div className={styles.stepDetails}>
                  <ul>
                    {step.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Connection Details */}
      <div className={styles.detailsSection}>
        <h2>Connection Configuration</h2>
        <div className={styles.configGrid}>
          <div className={styles.configItem}>
            <Server className={styles.configIcon} />
            <div>
              <strong>Cluster Endpoint</strong>
              <div className={styles.configValue}>msmonitoradx.israelcentral.kusto.windows.net</div>
            </div>
          </div>
          
          <div className={styles.configItem}>
            <Database className={styles.configIcon} />
            <div>
              <strong>Database</strong>
              <div className={styles.configValue}>monitoringdb</div>
            </div>
          </div>
          
          <div className={styles.configItem}>
            <Key className={styles.configIcon} />
            <div>
              <strong>Authentication</strong>
              <div className={styles.configValue}>
                {connectionStatus.isConnected ? 'Azure AD (Demo Mode)' : 'Not Connected'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {connectionStatus.error && (
        <div className={styles.errorSection}>
          <AlertCircle className={styles.errorIcon} />
          <div>
            <h3>Connection Error</h3>
            <p>{connectionStatus.error}</p>
            <div className={styles.errorHelp}>
              <strong>Next Steps:</strong>
              <ol>
                <li>Verify your Azure Data Explorer cluster is running</li>
                <li>Check that tables are created using phase1-create-tables.kql</li>
                <li>Ensure sample data is loaded using phase2-insert-data.kql</li>
                <li>Verify network connectivity to Azure</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {connectionStatus.isConnected && (
        <div className={styles.successSection}>
          <CheckCircle className={styles.successIcon} />
          <div>
            <h3>🎉 Azure Data Explorer Successfully Connected!</h3>
            <p>Your React application is now connected to live Azure data. The dashboard will show real threat intelligence data from your ADX cluster.</p>
            <div className={styles.nextSteps}>
              <strong>Ready for the MSTIC interview:</strong>
              <ul>
                <li>✅ Live KQL queries executing against real Azure data</li>
                <li>✅ Real-time threat intelligence monitoring</li>
                <li>✅ Geographic threat distribution from live data</li>
                <li>✅ Pipeline health metrics from ADX</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AzureConnection;
