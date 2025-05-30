import React from 'react';
import { X, Shield, Activity, BarChart3, AlertTriangle } from 'lucide-react';
import styles from './AboutModal.module.css';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <Shield className={styles.icon} />
            <h2 className={styles.title}>About MSTIC Monitor</h2>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.description}>
            <p>
              <strong>Proof of concept</strong> created to demonstrate a comprehensive monitoring 
              approach for 160+ threat intelligence pipelines across multiple data sources.
            </p>
            
            <p>
              This dashboard showcases real-time monitoring, data lineage tracking, and 
              alert management capabilities for enterprise-scale threat intelligence operations.
            </p>
            
            <p>
              All data displayed is <em>mock data</em> that simulates realistic scenarios 
              at scale, demonstrating the system's ability to handle complex monitoring 
              requirements.
            </p>
          </div>

          <div className={styles.features}>
            <h3>Key Features</h3>
            <div className={styles.featureList}>
              <div className={styles.feature}>
                <BarChart3 className={styles.featureIcon} />
                <div>
                  <strong>Real-time Monitoring</strong>
                  <p>Live pipeline status and performance metrics</p>
                </div>
              </div>
              
              <div className={styles.feature}>
                <Activity className={styles.featureIcon} />
                <div>
                  <strong>Pipeline Management</strong>
                  <p>Comprehensive view of 160+ active pipelines</p>
                </div>
              </div>
              
              <div className={styles.feature}>
                <AlertTriangle className={styles.featureIcon} />
                <div>
                  <strong>Alert System</strong>
                  <p>Proactive monitoring with intelligent notifications</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tech}>
            <h3>Technology Stack</h3>
            <div className={styles.techStack}>
              <span className={styles.techItem}>React</span>
              <span className={styles.techItem}>TypeScript</span>
              <span className={styles.techItem}>Vite</span>
              <span className={styles.techItem}>Recharts</span>
              <span className={styles.techItem}>CSS Modules</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p>© 2025 Microsoft Security Threat Intelligence Center (MSTIC)</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AboutModal);
