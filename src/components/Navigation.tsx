import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Database, AlertTriangle, Activity, Shield, Info, Keyboard, Zap } from 'lucide-react';
import { mockAlerts } from '../data/mockData';
import AboutModal from './AboutModal';
import KeyboardHelpModal from './KeyboardHelpModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import styles from './Navigation.module.css';

const Navigation = () => {
  const [showAbout, setShowAbout] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Calculate active alerts count
  const activeAlertsCount = mockAlerts.filter(alert => !alert.resolved).length;

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: '?',
        description: 'Show keyboard shortcuts',
        action: () => setShowKeyboardHelp(true)
      },
      {
        key: 'Escape',
        description: 'Close modals',
        action: () => {
          setShowAbout(false);
          setShowKeyboardHelp(false);
        }
      }
    ]
  });

  const keyboardShortcuts = [
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Escape', description: 'Close modals' },
    { key: '/', description: 'Focus search (when available)' },
    { key: '1', description: 'Go to Overview', altKey: true },
    { key: '2', description: 'Go to Pipelines', altKey: true },
    { key: '3', description: 'Go to Data Lineage', altKey: true },
    { key: '4', description: 'Go to Predictive Insights', altKey: true },
    { key: '5', description: 'Go to AI Agent', altKey: true },
    { key: '6', description: 'Go to Alerts', altKey: true },
  ];

  return (
    <>
      <nav className={styles.navigation}>
        <div className={styles.brand}>
          <Shield className={styles.brandIcon} />
          <span className={styles.brandText}>MSTIC Monitor</span>
        </div>
        
        <ul className={styles.navList}>
          <li>
            <NavLink 
              to="/overview" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <BarChart3 className={styles.navIcon} />
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/pipelines" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Activity className={styles.navIcon} />
              Pipelines
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/data-lineage" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Database className={styles.navIcon} />
              Data Lineage
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/predictive-insights" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Shield className={styles.navIcon} />
              Threat Prediction
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/ai-agent" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <Zap className={styles.navIcon} />
              AI Agent
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/alerts" 
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <div className={styles.navLinkContent}>
                <AlertTriangle className={styles.navIcon} />
                Alerts
                {activeAlertsCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {activeAlertsCount > 99 ? '99+' : activeAlertsCount}
                  </span>
                )}
              </div>
            </NavLink>
          </li>
        </ul>

        <div className={styles.navActions}>
          <button 
            className={styles.actionButton}
            onClick={() => setShowKeyboardHelp(true)}
            title="Keyboard shortcuts (Press ? for help)"
          >
            <Keyboard size={18} />
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => setShowAbout(true)}
            title="About MSTIC Monitor"
          >
            <Info size={18} />
          </button>
        </div>
      </nav>

      <AboutModal 
        isOpen={showAbout} 
        onClose={() => setShowAbout(false)} 
      />
      
      <KeyboardHelpModal 
        isOpen={showKeyboardHelp} 
        onClose={() => setShowKeyboardHelp(false)}
        shortcuts={keyboardShortcuts}
      />
    </>
  );
};

export default Navigation;
