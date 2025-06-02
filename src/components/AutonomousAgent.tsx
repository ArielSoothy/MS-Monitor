import React, { useState, useEffect } from 'react';
import { Brain, Activity, Search, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AgentState, Investigation, AgentTrigger } from '../types';
import { mockPipelines } from '../data/mockData';
import styles from './AutonomousAgent.module.css';

const createMockInvestigation = (id: string, trigger: AgentTrigger): Investigation => {
  const now = new Date();
  const startTime = new Date(now.getTime() - Math.random() * 30 * 60 * 1000);
  
  return {
    id,
    startTime,
    endTime: new Date(startTime.getTime() + 25 * 60 * 1000),
    status: 'completed',
    trigger,
    triggerData: { source: 'linkedin', failureCount: 12 },
    steps: [
      {
        id: 'step-1',
        timestamp: startTime,
        action: 'Analyze authentication patterns',
        details: 'Detected OAuth token failures across LinkedIn pipelines',
        status: 'completed'
      }
    ],
    findings: [
      {
        id: 'auth-pattern-001',
        timestamp: new Date(startTime.getTime() + 2 * 60 * 1000),
        type: 'pattern',
        title: 'OAuth Token Rotation Failure - MSTIC Data Collection Impact',
        description: 'Critical: LinkedIn threat intelligence collection stopped. OAuth tokens expired across 12 data pipelines.',
        confidence: 95,
        severity: 'high',
        affectedPipelines: mockPipelines.filter(p => p.name.includes('LinkedIn')).slice(0, 12).map(p => p.id),
        evidence: [
          'HTTP 401 errors started 14:23 UTC across all LinkedIn TI pipelines',
          'Token expiry aligns with 72-hour LinkedIn API lifecycle'
        ],
        suggestedActions: [
          'IMMEDIATE: Deploy backup OAuth credentials to restore TI collection',
          'Validate token refresh automation in auth-service-v2.1'
        ]
      }
    ],
    recommendations: [
      'Implement automated token refresh for LinkedIn API',
      'Set up monitoring for authentication failures',
      'Create backup authentication mechanisms'
    ],
    affectedPipelines: mockPipelines.filter(p => p.name.includes('LinkedIn')).slice(0, 12).map(p => p.id),
    estimatedImpact: {
      severity: 'high',
      affectedSources: ['LinkedIn'],
      estimatedDowntime: 15
    }
  } as Investigation;
};

const realtimeSimulationScenarios = [
  {
    id: 'azure-ad-anomaly',
    name: 'Azure AD Authentication Anomaly Detection',
    description: 'Detects unusual authentication patterns and potential compromise',
    severity: 'high'
  },
  {
    id: 'data-exfiltration',
    name: 'Suspicious Data Transfer Pattern',
    description: 'Unusual data transfer volumes detected in threat intelligence pipelines',
    severity: 'critical'
  }
];

const AutonomousAgent: React.FC = () => {
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'monitoring',
    currentInvestigation: undefined,
    recentInvestigations: [],
    triggers: [
      {
        id: 'auth-failure-pattern',
        name: 'Authentication Failure Pattern Detection',
        description: 'Monitors for cascading authentication failures across threat intelligence data sources',
        enabled: true,
        conditions: {
          failureThreshold: 5,
          timeWindow: 15,
          patternType: 'cascade_failures'
        }
      }
    ],
    findings: [],
    activityLog: [],
    lastActivity: new Date(),
    investigationsToday: 247,
    meanTimeToResolution: 8.5
  });

  const [isInvestigating, setIsInvestigating] = useState(false);
  const [selectedView, setSelectedView] = useState<'realtime' | 'status'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.1) {
        const randomTrigger = agentState.triggers[0];
        const investigation = createMockInvestigation('linkedin-auth-cascade', randomTrigger);
        
        setAgentState(prev => ({
          ...prev,
          recentInvestigations: [...prev.recentInvestigations, investigation].slice(-10),
          investigationsToday: prev.investigationsToday + 1,
          lastActivity: new Date()
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [agentState.triggers]);

  const runDemoInvestigation = async () => {
    setIsInvestigating(true);
    
    const investigation = createMockInvestigation('linkedin-auth-cascade', agentState.triggers[0]);
    
    setAgentState(prev => ({
      ...prev,
      currentInvestigation: investigation,
      status: 'investigating'
    }));

    setTimeout(() => {
      setIsInvestigating(false);
      setAgentState(prev => ({
        ...prev,
        currentInvestigation: undefined,
        recentInvestigations: [...prev.recentInvestigations, investigation].slice(-10),
        status: 'monitoring'
      }));
    }, 3000);
  };

  const getStatusIcon = () => {
    switch (agentState.status) {
      case 'monitoring':
        return <CheckCircle className={styles.statusIcon} />;
      case 'investigating':
        return <Activity className={`${styles.statusIcon} ${styles.investigating}`} />;
      case 'reporting':
        return <AlertTriangle className={`${styles.statusIcon} ${styles.alert}`} />;
      default:
        return <Brain className={styles.statusIcon} />;
    }
  };

  const renderRealtimeSimulation = () => (
    <div className={styles.realtimeSection}>
      <div className={styles.sectionHeader}>
        <Activity className={styles.sectionIcon} />
        <h3>Real-time Threat Investigation Simulation</h3>
      </div>
      
      <div className={styles.scenarioGrid}>
        {realtimeSimulationScenarios.map(scenario => (
          <div key={scenario.id} className={`${styles.scenarioCard} ${styles[scenario.severity]}`}>
            <h4>{scenario.name}</h4>
            <p>{scenario.description}</p>
            <button 
              className={styles.runButton}
              onClick={runDemoInvestigation}
              disabled={isInvestigating}
            >
              {isInvestigating ? 'Investigating...' : 'Run Investigation'}
            </button>
          </div>
        ))}
      </div>

      {agentState.currentInvestigation && (
        <div className={styles.activeInvestigations}>
          <h4>Active Investigation</h4>
          <div className={styles.investigationCard}>
            <div className={styles.investigationHeader}>
              <FileText className={styles.investigationIcon} />
              <span className={styles.investigationTitle}>
                {agentState.currentInvestigation.trigger.name}
              </span>
              <span className={styles.investigationTime}>
                {agentState.currentInvestigation.startTime.toLocaleTimeString()}
              </span>
            </div>
            <div className={styles.investigationProgress}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill}></div>
              </div>
              <span>Analyzing threat patterns...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStatusOverview = () => (
    <div className={styles.statusSection}>
      <div className={styles.agentStatus}>
        <div className={styles.statusHeader}>
          {getStatusIcon()}
          <div className={styles.statusInfo}>
            <h3>MSTIC Autonomous Agent</h3>
            <p className={styles.statusText}>
              Status: {agentState.status} | 
              Active Triggers: {agentState.triggers.filter(t => t.enabled).length} | 
              Current Investigation: {agentState.currentInvestigation ? '1' : '0'}
            </p>
          </div>
        </div>
        
        <div className={styles.metricsGrid}>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{agentState.investigationsToday}</span>
            <span className={styles.metricLabel}>Investigations Today</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{agentState.recentInvestigations.length}</span>
            <span className={styles.metricLabel}>Recent Investigations</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{agentState.meanTimeToResolution}min</span>
            <span className={styles.metricLabel}>Mean Resolution Time</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricValue}>{agentState.triggers.length}</span>
            <span className={styles.metricLabel}>Active Triggers</span>
          </div>
        </div>
      </div>

      <div className={styles.triggersSection}>
        <h4>Active Triggers</h4>
        {agentState.triggers.map(trigger => (
          <div key={trigger.id} className={styles.triggerCard}>
            <div className={styles.triggerHeader}>
              <h5>{trigger.name}</h5>
              <span className={`${styles.triggerStatus} ${trigger.enabled ? styles.active : styles.inactive}`}>
                {trigger.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p>{trigger.description}</p>
            <div className={styles.triggerConditions}>
              {trigger.conditions.failureThreshold && (
                <span>Threshold: {trigger.conditions.failureThreshold} failures</span>
              )}
              {trigger.conditions.timeWindow && (
                <span>Window: {trigger.conditions.timeWindow} minutes</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.autonomousAgent}>
      <div className={styles.header}>
        <Brain className={styles.headerIcon} />
        <div className={styles.headerContent}>
          <h2>Autonomous Threat Investigation Agent</h2>
          <p>AI-powered automated investigation and response for MSTIC threat intelligence pipelines</p>
        </div>
      </div>

      <div className={styles.viewTabs}>
        <button 
          className={`${styles.tab} ${selectedView === 'realtime' ? styles.active : ''}`}
          onClick={() => setSelectedView('realtime')}
        >
          <Activity className={styles.tabIcon} />
          Real-time Demo
        </button>
        <button 
          className={`${styles.tab} ${selectedView === 'status' ? styles.active : ''}`}
          onClick={() => setSelectedView('status')}
        >
          <Search className={styles.tabIcon} />
          Agent Status
        </button>
      </div>

      <div className={styles.content}>
        {selectedView === 'realtime' && renderRealtimeSimulation()}
        {selectedView === 'status' && renderStatusOverview()}
      </div>
    </div>
  );
};

export default AutonomousAgent;