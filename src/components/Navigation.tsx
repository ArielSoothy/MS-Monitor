import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Database, AlertTriangle, Activity, Shield, Info, Keyboard, Zap, TrendingUp, Cpu, GitBranch, Workflow, Code, Menu, X } from 'lucide-react';
import { mockAlerts } from '../data/mockData';
import AboutModal from './AboutModal';
import KeyboardHelpModal from './KeyboardHelpModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import styles from './Navigation.module.css';

const Navigation = () => {
  const [showAbout, setShowAbout] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          setIsMobileMenuOpen(false);
        }
      }
    ]
  });

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest(`.${styles.navigation}`)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  const keyboardShortcuts = [
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Escape', description: 'Close modals' },
    { key: '/', description: 'Focus search (when available)' },
    { key: '1', description: 'Go to Overview', altKey: true },
    { key: '2', description: 'Go to Pipelines', altKey: true },
    { key: '3', description: 'Go to Data Lineage', altKey: true },
    { key: '4', description: 'Go to Threat Prediction', altKey: true },
    { key: '5', description: 'Go to AI Agent', altKey: true },
    { key: '6', description: 'Go to Performance', altKey: true },
    { key: '7', description: 'Go to Infrastructure', altKey: true },
    { key: '8', description: 'Go to Data Engineering', altKey: true },
    { key: 'I', description: 'Go to Implementation Guide', altKey: true },
    { key: 'T', description: 'Go to Technical Challenges', altKey: true },
    { key: '0', description: 'Go to Alerts', altKey: true },
  ];

  return (
    <>
      <nav className={styles.navigation}>
        <div className={styles.brand}>
          <Shield className={styles.brandIcon} />
          <span className={styles.brandText}>MSTIC Monitor</span>
          <button 
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <div className={`${styles.navContent} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
          <ul className={styles.navList}>
            <li>
              <NavLink 
                to="/overview" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
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
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Zap className={styles.navIcon} />
                AI Agent
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/performance" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <TrendingUp className={styles.navIcon} />
                Performance
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/infrastructure" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Cpu className={styles.navIcon} />
                Infrastructure
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/data-engineering" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <GitBranch className={styles.navIcon} />
                Data Engineering
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/implementation-guide" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Workflow className={styles.navIcon} />
                Implementation Guide
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/technical-challenges" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Code className={styles.navIcon} />
                Technical Challenges
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/alerts" 
                className={({ isActive }) => 
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
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
              onClick={() => {
                setShowKeyboardHelp(true);
                setIsMobileMenuOpen(false);
              }}
              title="Keyboard shortcuts (Press ? for help)"
            >
              <Keyboard size={18} />
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => {
                setShowAbout(true);
                setIsMobileMenuOpen(false);
              }}
              title="About MSTIC Monitor"
            >
              <Info size={18} />
            </button>
          </div>
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
