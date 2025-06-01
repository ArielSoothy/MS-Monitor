import { useState } from 'react';
import { Database, Play, Copy, Check } from 'lucide-react';
import { useAzureData } from '../hooks/useAzureData';
import { AZURE_CONFIG } from '../config/azure';
import styles from './AzureQueryDemo.module.css';

interface AzureQueryDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

const AzureQueryDemo: React.FC<AzureQueryDemoProps> = ({ isOpen, onClose }) => {
  const azureData = useAzureData();
  const [selectedQuery, setSelectedQuery] = useState<string>('threatOverview');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<any>(null);

  const queryOptions = [
    { key: 'threatOverview', label: 'Executive Threat Overview', description: 'High-level security metrics for leadership' },
    { key: 'geographicThreats', label: 'Geographic Threat Analysis', description: 'Threat distribution by location' },
    { key: 'threatCorrelation', label: 'Real-time Threat Correlation', description: 'Live threat intelligence correlation' },
    { key: 'pipelineHealth', label: 'Pipeline Performance Metrics', description: 'Data pipeline health and performance' },
    { key: 'securityTimeline', label: 'Security Incident Timeline', description: 'Chronological security events' }
  ];

  const handleExecuteQuery = async () => {
    setIsExecuting(true);
    setQueryResult(null);

    try {
      // Simulate query execution delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (selectedQuery) {
        case 'threatOverview':
          setQueryResult(azureData.threatOverview);
          break;
        case 'geographicThreats':
          setQueryResult(azureData.geographicThreats.slice(0, 3));
          break;
        case 'threatCorrelation':
          setQueryResult(azureData.threatCorrelations.slice(0, 5));
          break;
        case 'pipelineHealth':
          setQueryResult(azureData.pipelineHealth.slice(0, 3));
          break;
        case 'securityTimeline':
          setQueryResult(azureData.securityTimeline.slice(0, 5));
          break;
      }
    } catch (error) {
      console.error('Query execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyQuery = async (queryKey: string) => {
    const query = AZURE_CONFIG.queries[queryKey as keyof typeof AZURE_CONFIG.queries];
    try {
      await navigator.clipboard.writeText(query);
      setCopiedQuery(queryKey);
      setTimeout(() => setCopiedQuery(null), 2000);
    } catch (error) {
      console.error('Failed to copy query:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Database className={styles.icon} />
            <span>Azure Data Explorer - Live KQL Demo</span>
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.statusSection}>
            <div className={styles.connectionStatus}>
              <div className={`${styles.statusDot} ${azureData.isConnected ? styles.connected : styles.disconnected}`}></div>
              <span>
                {azureData.isConnected 
                  ? `Connected to ${AZURE_CONFIG.cluster}` 
                  : 'Demo Mode - Azure Data Explorer unavailable'
                }
              </span>
            </div>
            {azureData.error && (
              <div className={styles.errorMessage}>
                Error: {azureData.error}
              </div>
            )}
          </div>

          <div className={styles.querySection}>
            <h3>Available MSTIC Queries</h3>
            <div className={styles.queryList}>
              {queryOptions.map((option) => (
                <div key={option.key} className={styles.queryOption}>
                  <label className={styles.queryLabel}>
                    <input
                      type="radio"
                      name="query"
                      value={option.key}
                      checked={selectedQuery === option.key}
                      onChange={(e) => setSelectedQuery(e.target.value)}
                      className={styles.queryRadio}
                    />
                    <div className={styles.queryInfo}>
                      <span className={styles.queryName}>{option.label}</span>
                      <span className={styles.queryDescription}>{option.description}</span>
                    </div>
                  </label>
                  <button
                    className={styles.copyButton}
                    onClick={() => handleCopyQuery(option.key)}
                    title="Copy KQL query"
                  >
                    {copiedQuery === option.key ? (
                      <Check size={16} className={styles.copySuccess} />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.queryPreview}>
            <h4>KQL Query:</h4>
            <pre className={styles.queryCode}>
              {AZURE_CONFIG.queries[selectedQuery as keyof typeof AZURE_CONFIG.queries]}
            </pre>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.executeButton}
              onClick={handleExecuteQuery}
              disabled={isExecuting || azureData.isLoading}
            >
              <Play size={16} />
              {isExecuting ? 'Executing...' : 'Execute Query'}
            </button>
          </div>

          {queryResult && (
            <div className={styles.results}>
              <h4>Query Results:</h4>
              <pre className={styles.resultCode}>
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AzureQueryDemo;
