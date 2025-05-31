import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Activity, AlertTriangle, CheckCircle, Clock, Zap, Search, FileText, TrendingUp, Users, Settings, HelpCircle } from 'lucide-react';
import type { AgentState, Investigation, AgentTrigger } from '../types';
import { mockPipelines, mockAlerts } from '../data/mockData';
import { aiService } from '../utils/aiService';
import HowItWorksModal from './HowItWorksModal';
import styles from './AutonomousAgent.module.css';

// Mock AI Agent data with realistic investigation scenarios
const createMockInvestigation = (id: string, trigger: AgentTrigger): Investigation => {
  const now = new Date();
  const startTime = new Date(now.getTime() - Math.random() * 30 * 60 * 1000); // Last 30 minutes
  
  const investigations: Record<string, Partial<Investigation>> = {
    'linkedin-auth-cascade': {
      trigger: {
        ...trigger,
        name: 'LinkedIn Authentication Cascade Failure',
        conditions: { failureThreshold: 5, timeWindow: 15, patternType: 'cascade_failures' }
      },
      findings: [
        {
          id: 'auth-pattern-001',
          timestamp: new Date(startTime.getTime() + 2 * 60 * 1000),
          type: 'pattern',
          title: 'LinkedIn OAuth Token Expiration Pattern',
          description: 'Detected systematic 401 authentication errors across 12 LinkedIn pipelines starting at 14:23 UTC',
          confidence: 95,
          severity: 'high',
          affectedPipelines: mockPipelines.filter(p => p.name.includes('LinkedIn')).slice(0, 12).map(p => p.id),
          evidence: [
            'All failures show HTTP 401 Unauthorized',
            'Pattern matches LinkedIn API auth token lifecycle (72 hours)',
            'Similar incident occurred 2024-11-15 with identical signature'
          ],
          suggestedActions: [
            'Check OAuth token refresh service',
            'Verify LinkedIn API key rotation schedule',
            'Review authentication service logs'
          ]
        },
        {
          id: 'correlation-001',
          timestamp: new Date(startTime.getTime() + 5 * 60 * 1000),
          type: 'correlation',
          title: 'Regional Impact Analysis',
          description: 'EU region shows 3x higher failure rate than US region for LinkedIn pipelines',
          confidence: 87,
          severity: 'medium',
          affectedPipelines: [],
          evidence: [
            'EU LinkedIn pipelines: 89% failure rate',
            'US LinkedIn pipelines: 12% failure rate',
            'Token refresh service deployed to US-East-1 only'
          ],
          suggestedActions: [
            'Deploy token refresh fix to EU regions',
            'Implement regional failover for authentication'
          ]
        }
      ],
      summary: `Investigation Summary: LinkedIn authentication cascade failure affecting 12 pipelines starting 14:23 UTC. 
Root cause identified as OAuth token expiration with regional deployment gap. 
EU region lacks updated token refresh service deployed to US region.
Estimated resolution time: 15 minutes with regional deployment.
Historical precedent: Similar pattern on 2024-11-15 resolved in 18 minutes.`,
      recommendations: [
        'Deploy authentication service to EU region immediately',
        'Implement automated token refresh monitoring',
        'Add regional authentication redundancy',
        'Create alert for token expiration warnings (24h advance notice)'
      ]
    },
    'twitter-rate-limit-anomaly': {
      trigger: {
        ...trigger,
        name: 'Twitter Rate Limit Anomaly',
        conditions: { patternType: 'unusual_patterns' }
      },
      findings: [
        {
          id: 'rate-limit-001',
          timestamp: new Date(startTime.getTime() + 3 * 60 * 1000),
          type: 'anomaly',
          title: 'Twitter API Rate Limit Exceeded at 3x Normal Rate',
          description: 'Twitter pipelines hitting rate limits 300% faster than baseline, indicating possible API quota changes',
          confidence: 92,
          severity: 'high',
          affectedPipelines: mockPipelines.filter(p => p.name.includes('Twitter')).map(p => p.id),
          evidence: [
            'Rate limit hit after 1,200 calls vs normal 3,600',
            'Twitter API documentation updated 2 days ago',
            'Similar pattern across all Twitter data collection pipelines'
          ],
          suggestedActions: [
            'Review Twitter API tier and quotas',
            'Implement dynamic rate limiting',
            'Contact Twitter API support'
          ]
        }
      ],
      summary: `Twitter API rate limiting anomaly detected. Rate limits reduced by ~67% from previous quotas.
Likely due to Twitter API tier changes announced this week.
Recommend immediate quota review and pipeline throttling adjustments.`
    }
  };

  const baseInvestigation = investigations[id] || {};
  
  return {
    id,
    startTime,
    status: 'active',
    trigger,
    triggerData: { failedPipelines: Math.floor(Math.random() * 10) + 5 },
    steps: [
      {
        id: 'step-1',
        timestamp: new Date(startTime.getTime() + 30 * 1000),
        action: 'Triggered by cascade failure detection',
        details: `Detected ${baseInvestigation.trigger?.conditions?.failureThreshold || 5} related failures within ${baseInvestigation.trigger?.conditions?.timeWindow || 15} minutes`,
        status: 'completed'
      },
      {
        id: 'step-2',
        timestamp: new Date(startTime.getTime() + 60 * 1000),
        action: 'Analyzing failure patterns',
        details: 'Examining error codes, timestamps, and affected pipeline characteristics',
        status: 'completed'
      },
      {
        id: 'step-3',
        timestamp: new Date(startTime.getTime() + 120 * 1000),
        action: 'Correlating with historical data',
        details: 'Checking last 30 days for similar patterns and resolutions',
        status: 'completed'
      },
      {
        id: 'step-4',
        timestamp: new Date(startTime.getTime() + 180 * 1000),
        action: 'Generating investigation report',
        details: 'Compiling findings and recommended actions',
        status: 'in_progress'
      }
    ],
    findings: baseInvestigation.findings || [],
    summary: baseInvestigation.summary,
    recommendations: baseInvestigation.recommendations || [],
    affectedPipelines: baseInvestigation.findings?.[0]?.affectedPipelines || [],
    estimatedImpact: {
      severity: 'high',
      affectedSources: ['LinkedIn', 'Twitter'],
      estimatedDowntime: 25
    },
    ...baseInvestigation
  };
};

const mockAgentTriggers: AgentTrigger[] = [
  {
    id: 'multi-failure',
    name: 'Multiple Related Failures',
    description: 'Triggers when multiple pipelines from the same source fail within 15 minutes',
    enabled: true,
    conditions: {
      failureThreshold: 3,
      timeWindow: 15,
      patternType: 'multiple_failures'
    }
  },
  {
    id: 'unusual-patterns',
    name: 'Unusual Patterns',
    description: 'Detects abnormal failure patterns across data sources',
    enabled: true,
    conditions: {
      patternType: 'unusual_patterns'
    }
  },
  {
    id: 'cascade-failures',
    name: 'Cascade Failures',
    description: 'Identifies cascading failures across dependent pipelines',
    enabled: true,
    conditions: {
      patternType: 'cascade_failures'
    }
  },
  {
    id: 'performance-degradation',
    name: 'Performance Degradation',
    description: 'Monitors for gradual performance degradation patterns',
    enabled: true,
    conditions: {
      patternType: 'performance_degradation'
    }
  }
];

const initialAgentState: AgentState = {
  status: 'investigating',
  currentInvestigation: createMockInvestigation('linkedin-auth-cascade', mockAgentTriggers[2]),
  recentInvestigations: [
    createMockInvestigation('twitter-rate-limit-anomaly', mockAgentTriggers[1])
  ],
  triggers: mockAgentTriggers,
  findings: [],
  activityLog: [],
  lastActivity: new Date(),
  investigationsToday: 3,
  meanTimeToResolution: 18.5
};

const AutonomousAgent: React.FC = () => {
  const [agentState, setAgentState] = useState<AgentState>(initialAgentState);
  const [selectedView, setSelectedView] = useState<'status' | 'investigation' | 'findings' | 'activity' | 'config'>('status');
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Trigger a new investigation using the AI service
  const triggerInvestigation = useCallback(async (trigger: AgentTrigger) => {
    setIsInvestigating(true);
    setAgentState(prev => ({ ...prev, status: 'investigating' }));

    try {
      const investigation = await aiService.investigateAnomalies(
        mockPipelines,
        mockAlerts,
        trigger.conditions.patternType || 'multiple_failures'
      );

      const newInvestigation: Investigation = {
        id: `investigation-${Date.now()}`,
        startTime: new Date(),
        status: 'active',
        trigger,
        triggerData: { failedPipelines: mockPipelines.filter(p => p.status === 'failed').length },
        steps: investigation.steps,
        findings: investigation.findings,
        summary: investigation.summary,
        recommendations: investigation.recommendations,
        affectedPipelines: investigation.findings.flatMap(f => f.affectedPipelines),
        estimatedImpact: {
          severity: 'high',
          affectedSources: [...new Set(mockPipelines.filter(p => p.status === 'failed').map(p => p.source))],
          estimatedDowntime: 25
        }
      };

      setAgentState(prev => ({
        ...prev,
        status: 'reporting',
        currentInvestigation: newInvestigation,
        recentInvestigations: [newInvestigation, ...prev.recentInvestigations.slice(0, 4)],
        investigationsToday: prev.investigationsToday + 1,
        lastActivity: new Date()
      }));

    } catch (error) {
      console.error('Investigation failed:', error);
      setAgentState(prev => ({ ...prev, status: 'idle' }));
    } finally {
      setIsInvestigating(false);
    }
  }, []);

  // Simulate autonomous triggering
  useEffect(() => {
    const checkForAnomalies = () => {
      const failedPipelines = mockPipelines.filter(p => p.status === 'failed');
      const enabledTriggers = agentState.triggers.filter(t => t.enabled);

      // Check if any triggers should fire
      for (const trigger of enabledTriggers) {
        if (trigger.conditions.failureThreshold && failedPipelines.length >= trigger.conditions.failureThreshold) {
          if (!agentState.currentInvestigation && !isInvestigating) {
            console.log(`Autonomous trigger activated: ${trigger.name}`);
            triggerInvestigation(trigger);
            break;
          }
        }
      }
    };

    const interval = setInterval(checkForAnomalies, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [agentState.triggers, agentState.currentInvestigation, isInvestigating, triggerInvestigation]);

  // Simulate real-time agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentState(prev => {
        if (prev.status === 'investigating' && prev.currentInvestigation) {
          // Simulate investigation progress
          const investigation = prev.currentInvestigation;
          const incompleteSteps = investigation.steps.filter(s => s.status === 'in_progress');
          
          if (incompleteSteps.length > 0) {
            const updatedSteps = investigation.steps.map(step => 
              step.status === 'in_progress' ? { ...step, status: 'completed' as const } : step
            );
            
            return {
              ...prev,
              currentInvestigation: {
                ...investigation,
                steps: updatedSteps
              },
              lastActivity: new Date()
            };
          }
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (agentState.status) {
      case 'idle': return <Clock className={styles.statusIcon} />;
      case 'investigating': return <Search className={styles.statusIcon} />;
      case 'reporting': return <FileText className={styles.statusIcon} />;
      case 'monitoring': return <Activity className={styles.statusIcon} />;
      default: return <Brain className={styles.statusIcon} />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const renderStatusOverview = () => (
    <div className={styles.statusOverview}>
      <div className={styles.statusHeader}>
        <div className={styles.agentStatus}>
          {getStatusIcon()}
          <span className={styles.statusText}>
            {agentState.status.charAt(0).toUpperCase() + agentState.status.slice(1)}
          </span>
        </div>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Investigations Today</span>
            <span className={styles.metricValue}>{agentState.investigationsToday}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Mean Resolution Time</span>
            <span className={styles.metricValue}>{agentState.meanTimeToResolution}m</span>
          </div>
        </div>
      </div>

      {agentState.currentInvestigation && (
        <div className={styles.currentInvestigation}>
          <h3>Current Investigation</h3>
          <div className={styles.investigationCard}>
            <div className={styles.investigationHeader}>
              <h4>{agentState.currentInvestigation.trigger.name}</h4>
              <span className={styles.investigationTime}>
                Started: {formatTime(agentState.currentInvestigation.startTime)}
              </span>
            </div>
            <div className={styles.investigationProgress}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ 
                    width: `${(agentState.currentInvestigation.steps.filter(s => s.status === 'completed').length / agentState.currentInvestigation.steps.length) * 100}%` 
                  }}
                />
              </div>
              <span className={styles.progressText}>
                {agentState.currentInvestigation.steps.filter(s => s.status === 'completed').length} / {agentState.currentInvestigation.steps.length} steps completed
              </span>
            </div>
            <div className={styles.affectedPipelines}>
              <AlertTriangle size={16} />
              <span>{agentState.currentInvestigation.affectedPipelines.length} pipelines affected</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.recentFindings}>
        <h3>Recent Findings</h3>
        {agentState.currentInvestigation?.findings.slice(0, 3).map(finding => (
          <div key={finding.id} className={styles.findingCard}>
            <div className={styles.findingHeader}>
              <span className={`${styles.findingType} ${styles[finding.type]}`}>
                {finding.type.toUpperCase()}
              </span>
              <span className={`${styles.severity} ${styles[finding.severity]}`}>
                {finding.severity.toUpperCase()}
              </span>
            </div>
            <h4>{finding.title}</h4>
            <p>{finding.description}</p>
            <div className={styles.confidence}>
              Confidence: {finding.confidence}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInvestigationDetails = () => (
    <div className={styles.investigationDetails}>
      {agentState.currentInvestigation ? (
        <>
          <div className={styles.investigationSummary}>
            <h3>Investigation Details</h3>
            <div className={styles.summaryCard}>
              <h4>{agentState.currentInvestigation.trigger.name}</h4>
              <p className={styles.summary}>{agentState.currentInvestigation.summary}</p>
              
              <div className={styles.recommendations}>
                <h5>Recommended Actions:</h5>
                <ul>
                  {agentState.currentInvestigation.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.investigationSteps}>
            <h3>Investigation Steps</h3>
            {agentState.currentInvestigation.steps.map(step => (
              <div key={step.id} className={`${styles.stepCard} ${styles[step.status]}`}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepTime}>{formatTime(step.timestamp)}</span>
                  <span className={styles.stepStatus}>
                    {step.status === 'completed' && <CheckCircle size={16} />}
                    {step.status === 'in_progress' && <Clock size={16} />}
                    {step.status === 'failed' && <AlertTriangle size={16} />}
                  </span>
                </div>
                <h4>{step.action}</h4>
                <p>{step.details}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.noInvestigation}>
          <Brain size={64} />
          <h3>No Active Investigation</h3>
          <p>Agent is monitoring for anomalies and patterns</p>
        </div>
      )}
    </div>
  );

  const renderFindings = () => (
    <div className={styles.findingsView}>
      <h3>Investigation Findings</h3>
      {agentState.currentInvestigation?.findings.map(finding => (
        <div key={finding.id} className={styles.detailedFinding}>
          <div className={styles.findingMeta}>
            <span className={`${styles.findingType} ${styles[finding.type]}`}>
              {finding.type.toUpperCase()}
            </span>
            <span className={`${styles.severity} ${styles[finding.severity]}`}>
              {finding.severity.toUpperCase()}
            </span>
            <span className={styles.confidence}>
              {finding.confidence}% confidence
            </span>
          </div>
          <h4>{finding.title}</h4>
          <p>{finding.description}</p>
          
          <div className={styles.evidence}>
            <h5>Evidence:</h5>
            <ul>
              {finding.evidence.map((evidence, idx) => (
                <li key={idx}>{evidence}</li>
              ))}
            </ul>
          </div>

          <div className={styles.suggestedActions}>
            <h5>Suggested Actions:</h5>
            <ul>
              {finding.suggestedActions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </div>

          <div className={styles.affectedCount}>
            <Users size={16} />
            <span>{finding.affectedPipelines.length} pipelines affected</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderActivityLog = () => (
    <div className={styles.activityLog}>
      <h3>Agent Activity Log</h3>
      <div className={styles.logEntries}>
        {agentState.currentInvestigation?.steps.map(step => (
          <div key={step.id} className={styles.logEntry}>
            <span className={styles.timestamp}>{formatTime(step.timestamp)}</span>
            <span className={styles.action}>{step.action}</span>
            <span className={`${styles.status} ${styles[step.status]}`}>
              {step.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className={styles.configuration}>
      <h3>Agent Configuration</h3>
      <div className={styles.triggers}>
        <h4>Investigation Triggers</h4>
        {agentState.triggers.map(trigger => (
          <div key={trigger.id} className={styles.triggerCard}>
            <div className={styles.triggerHeader}>
              <h5>{trigger.name}</h5>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={trigger.enabled}
                  onChange={() => {
                    setAgentState(prev => ({
                      ...prev,
                      triggers: prev.triggers.map(t => 
                        t.id === trigger.id ? { ...t, enabled: !t.enabled } : t
                      )
                    }));
                  }}
                />
                <span className={styles.slider}></span>
              </label>
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
        <div className={styles.titleSection}>
          <Brain className={styles.headerIcon} />
          <div>
            <h1>Autonomous Investigation Agent</h1>
            <p>AI-powered threat intelligence pipeline monitoring and investigation</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.howItWorksButton}
            onClick={() => setShowHowItWorks(true)}
            title="Learn how this system works"
          >
            <HelpCircle size={16} />
            How does it work?
          </button>
          <div className={styles.agentIndicator}>
            <div className={`${styles.statusDot} ${styles[agentState.status]}`}></div>
            <span>Last activity: {formatTime(agentState.lastActivity)}</span>
          </div>
        </div>
      </div>

      <div className={styles.navigation}>
        <button 
          className={selectedView === 'status' ? styles.active : ''}
          onClick={() => setSelectedView('status')}
        >
          <Activity size={16} />
          Status
        </button>
        <button 
          className={selectedView === 'investigation' ? styles.active : ''}
          onClick={() => setSelectedView('investigation')}
        >
          <Search size={16} />
          Investigation
        </button>
        <button 
          className={selectedView === 'findings' ? styles.active : ''}
          onClick={() => setSelectedView('findings')}
        >
          <TrendingUp size={16} />
          Findings
        </button>
        <button 
          className={selectedView === 'activity' ? styles.active : ''}
          onClick={() => setSelectedView('activity')}
        >
          <FileText size={16} />
          Activity Log
        </button>
        <button 
          className={selectedView === 'config' ? styles.active : ''}
          onClick={() => setSelectedView('config')}
        >
          <Settings size={16} />
          Configuration
        </button>
        
        {/* Manual Investigation Trigger */}
        <button 
          className={styles.triggerButton}
          onClick={() => triggerInvestigation(agentState.triggers[0])}
          disabled={isInvestigating || !!agentState.currentInvestigation}
        >
          <Zap size={16} />
          {isInvestigating ? 'Investigating...' : 'Trigger Investigation'}
        </button>
      </div>

      <div className={styles.content}>
        {selectedView === 'status' && renderStatusOverview()}
        {selectedView === 'investigation' && renderInvestigationDetails()}
        {selectedView === 'findings' && renderFindings()}
        {selectedView === 'activity' && renderActivityLog()}
        {selectedView === 'config' && renderConfiguration()}
      </div>
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="autonomousAgent"
      />
    </div>
  );
};

export default AutonomousAgent;
