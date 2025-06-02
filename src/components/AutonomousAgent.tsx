import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Activity, AlertTriangle, CheckCircle, Clock, Search, FileText, TrendingUp, Users, HelpCircle, Shield } from 'lucide-react';
import type { AgentState, Investigation, AgentTrigger } from '../types';
import { mockPipelines, mockAlerts } from '../data/mockData';
import { aiService } from '../utils/aiService';
import HowItWorksModal from './HowItWorksModal';
import ChallengesModal from './ChallengesModal';
import styles from './AutonomousAgent.module.css';

// MSTIC-focused realistic investigation scenarios for Microsoft interview demo
const createMockInvestigation = (id: string, trigger: AgentTrigger): Investigation => {
  const now = new Date();
  const startTime = new Date(now.getTime() - Math.random() * 30 * 60 * 1000); // Last 30 minutes
  
  const investigations: Record<string, Partial<Investigation>> = {
    'linkedin-auth-cascade': {
      trigger: {
        ...trigger,
        name: 'LinkedIn TI Collection Authentication Failure',
        conditions: { failureThreshold: 5, timeWindow: 15, patternType: 'cascade_failures' }
      },
      findings: [
        {
          id: 'auth-pattern-001',
          timestamp: new Date(startTime.getTime() + 2 * 60 * 1000),
          type: 'pattern',
          title: 'OAuth Token Rotation Failure - MSTIC Data Collection Impact',
          description: 'Critical: LinkedIn threat intelligence collection stopped. OAuth tokens expired across 12 data pipelines, blocking threat actor profile monitoring and C2 infrastructure discovery.',
          confidence: 95,
          severity: 'high',
          affectedPipelines: mockPipelines.filter(p => p.name.includes('LinkedIn')).slice(0, 12).map(p => p.id),
          evidence: [
            'HTTP 401 errors started 14:23 UTC across all LinkedIn TI pipelines',
            'Token expiry aligns with 72-hour LinkedIn API lifecycle',
            'Key monitored threat actors: APT28, Lazarus Group profiles now inaccessible',
            'C2 domain discovery pipeline failed - 847 domains pending analysis'
          ],
          suggestedActions: [
            'IMMEDIATE: Deploy backup OAuth credentials to restore TI collection',
            'Validate token refresh automation in auth-service-v2.1',
            'Review LinkedIn API compliance for MSTIC use case',
            'Implement redundant authentication for critical TI sources'
          ]
        },
        {
          id: 'correlation-001',
          timestamp: new Date(startTime.getTime() + 5 * 60 * 1000),
          type: 'correlation',
          title: 'Geographic Data Collection Gap Analysis',
          description: 'EU-based threat intelligence collection shows 89% failure rate vs 12% in US region. Critical gap in Eastern European threat actor monitoring.',
          confidence: 87,
          severity: 'high',
          affectedPipelines: [],
          evidence: [
            'EU LinkedIn TI pipelines: 89% failure (affects APT28, FancyBear monitoring)',
            'US LinkedIn TI pipelines: 12% failure (minimal impact)',
            'Root cause: Auth service v2.1 deployed only to US-East-1',
            'Missing threat intelligence from 23 high-priority EU-based actors'
          ],
          suggestedActions: [
            'URGENT: Deploy auth-service-v2.1 to EU-West-1 and EU-Central-1',
            'Implement cross-region failover for critical TI collection',
            'Add geo-redundancy monitoring for threat actor surveillance'
          ]
        }
      ],
      summary: `CRITICAL MSTIC IMPACT: LinkedIn threat intelligence collection down 14:23 UTC affecting 12 pipelines.
ROOT CAUSE: OAuth token expiration + regional deployment gap (auth-service-v2.1 missing in EU).
BUSINESS IMPACT: 847 C2 domains unanalyzed, 23 EU threat actors unmonitored.
RESOLUTION: Deploy EU auth service + implement backup credentials.
ETA: 15 minutes | Historical precedent: 2024-11-15 (18min resolution)`,
      recommendations: [
        'IMMEDIATE: Deploy auth-service-v2.1 to EU regions',
        'Implement backup OAuth credential rotation for critical TI sources',
        'Add proactive token expiration monitoring (24h warning)',
        'Create cross-region authentication redundancy for high-priority threat actors',
        'Review LinkedIn API compliance for threat intelligence use cases'
      ]
    },
    'azure-ad-anomaly': {
      trigger: {
        ...trigger,
        name: 'Azure AD Threat Intelligence Pipeline Anomaly',
        conditions: { patternType: 'performance_degradation' }
      },
      findings: [
        {
          id: 'azuread-perf-001',
          timestamp: new Date(startTime.getTime() + 3 * 60 * 1000),
          type: 'anomaly',
          title: 'Azure AD Graph API Performance Degradation - 400% Latency Increase',
          description: 'Critical performance degradation in Azure AD threat intelligence pipelines. Sign-in log analysis for compromise detection experiencing 400% latency increase.',
          confidence: 94,
          severity: 'high',
          affectedPipelines: mockPipelines.filter(p => p.name.includes('Azure AD')).map(p => p.id),
          evidence: [
            'Average API response time: 2.3s (baseline: 0.6s)',
            'Graph API throttling events increased 800% in last hour',
            'Impossible travel detection pipeline backlog: 12,847 events',
            'Suspicious sign-in analysis delayed by 45 minutes',
            'Azure service health shows no reported issues'
          ],
          suggestedActions: [
            'IMMEDIATE: Implement request batching for Graph API calls',
            'Scale horizontal processing for sign-in log analysis',
            'Activate backup Office 365 audit log pipeline',
            'Contact Azure Support for premium API quota increase'
          ]
        },
        {
          id: 'threat-impact-001',
          timestamp: new Date(startTime.getTime() + 7 * 60 * 1000),
          type: 'correlation',
          title: 'Threat Detection Impact Assessment',
          description: 'Performance degradation causing critical delays in threat detection workflows. Multiple high-priority security scenarios affected.',
          confidence: 91,
          severity: 'high',
          affectedPipelines: [],
          evidence: [
            'Impossible travel alerts delayed by 45+ minutes',
            'Credential stuffing detection pipeline 67% behind',
            'Nation-state actor attribution delayed for 23 incidents',
            'MITRE ATT&CK mapping pipeline processing 3 hours behind',
            'SOC escalation queue growing: +156 unprocessed events'
          ],
          suggestedActions: [
            'Activate emergency processing mode (reduced fidelity)',
            'Prioritize high-confidence threat indicators',
            'Implement circuit breaker for Graph API calls',
            'Scale out Azure Functions for parallel processing'
          ]
        }
      ],
      summary: `CRITICAL MSTIC ALERT: Azure AD threat intelligence severely degraded due to 400% API latency increase.
THREAT IMPACT: 45min delay in impossible travel detection, 67% behind on credential stuffing analysis.
OPERATIONAL IMPACT: 12,847 sign-in events in backlog, SOC queue +156 unprocessed.
ROOT CAUSE: Graph API throttling (800% increase) - likely quota exhaustion or service degradation.
MITIGATION: Request batching + horizontal scaling + backup audit pipeline activation.`,
      recommendations: [
        'IMMEDIATE: Implement Graph API request batching and retry logic',
        'Scale Azure Functions horizontally for parallel sign-in analysis',
        'Activate Office 365 audit backup pipeline',
        'Request premium Graph API quota from Azure Support',
        'Implement circuit breaker pattern for API resilience',
        'Add predictive scaling based on sign-in volume patterns'
      ]
    },
    'github-threat-intel': {
      trigger: {
        ...trigger,
        name: 'GitHub Threat Intelligence Collection Failure',
        conditions: { patternType: 'multiple_failures' }
      },
      findings: [
        {
          id: 'github-malware-001',
          timestamp: new Date(startTime.getTime() + 4 * 60 * 1000),
          type: 'pattern',
          title: 'GitHub Malware Repository Monitoring Pipeline Failure',
          description: 'Critical failure in GitHub-based threat intelligence collection. Malware repository monitoring and IOC extraction pipelines down.',
          confidence: 96,
          severity: 'high',
          affectedPipelines: mockPipelines.filter(p => p.name.includes('GitHub')).map(p => p.id),
          evidence: [
            'GitHub API rate limit exhausted: 5000/5000 requests used',
            'Malware sample collection stopped at 11:47 UTC',
            'IOC extraction pipeline failed for 234 new repositories',
            'C2 framework detection pipeline 8 hours behind',
            'Missing coverage for 15 new malware families'
          ],
          suggestedActions: [
            'IMMEDIATE: Deploy backup GitHub Apps with fresh rate limits',
            'Implement intelligent sampling for malware repositories',
            'Activate secondary GitHub Enterprise monitoring',
            'Prioritize high-confidence malware family repositories'
          ]
        }
      ],
      summary: `GITHUB THREAT INTEL DOWN: Malware repository monitoring failed due to API rate exhaustion.
SECURITY IMPACT: 234 malware repos unanalyzed, 15 new families undetected, C2 detection 8h behind.
RESOLUTION: Deploy backup GitHub Apps + intelligent sampling + prioritization.`
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
    id: 'threat-intel-cascade',
    name: 'Threat Intelligence Collection Cascade Failure',
    description: 'Detects when multiple threat intelligence sources fail simultaneously, indicating authentication or API issues',
    enabled: true,
    conditions: {
      failureThreshold: 3,
      timeWindow: 15,
      patternType: 'cascade_failures'
    }
  },
  {
    id: 'security-api-degradation',
    name: 'Security API Performance Degradation',
    description: 'Monitors for performance issues affecting threat detection pipelines (Graph API, Office 365, etc.)',
    enabled: true,
    conditions: {
      patternType: 'performance_degradation'
    }
  },
  {
    id: 'malware-collection-failure',
    name: 'Malware Intelligence Collection Failure',
    description: 'Triggers when GitHub, VirusTotal, or other malware intelligence sources fail',
    enabled: true,
    conditions: {
      failureThreshold: 2,
      timeWindow: 10,
      patternType: 'multiple_failures'
    }
  },
  {
    id: 'authentication-anomaly',
    name: 'Cross-Platform Authentication Anomaly',
    description: 'Detects authentication failures across multiple external threat intelligence APIs',
    enabled: true,
    conditions: {
      patternType: 'unusual_patterns'
    }
  }
];

const initialAgentState: AgentState = {
  status: 'investigating',
  currentInvestigation: createMockInvestigation('azure-ad-anomaly', mockAgentTriggers[1]),
  recentInvestigations: [
    createMockInvestigation('linkedin-auth-cascade', mockAgentTriggers[0]),
    createMockInvestigation('github-threat-intel', mockAgentTriggers[2])
  ],
  triggers: mockAgentTriggers,
  findings: [],
  activityLog: [],
  lastActivity: new Date(),
  investigationsToday: 5,
  meanTimeToResolution: 12.3
};

// Real-time simulation scenarios for MSTIC demo
const realtimeSimulationScenarios = [
  {
    id: 'linkedin-oauth-failure',
    title: 'LinkedIn OAuth Token Cascade Failure',
    severity: 'critical' as const,
    steps: [
      {
        type: 'alert' as const,
        message: 'ALERT: LinkedIn TI Pipeline Authentication Failed',
        details: 'OAuth token expired affecting 12 threat intelligence pipelines',
        icon: '🚨',
        delay: 0
      },
      {
        type: 'investigation' as const,
        message: 'Agent investigating authentication patterns...',
        details: 'Analyzing OAuth token lifecycle and failure correlation',
        icon: '🔍',
        delay: 2000
      },
      {
        type: 'investigation' as const,
        message: 'Correlating with APT28 monitoring pipeline',
        details: 'Checking impact on Lazarus Group threat actor tracking',
        icon: '🔗',
        delay: 3500
      },
      {
        type: 'action' as const,
        message: 'Agent querying token management service',
        details: 'SELECT * FROM oauth_tokens WHERE provider="linkedin" AND status="expired"',
        icon: '💾',
        delay: 5000
      },
      {
        type: 'action' as const,
        message: 'Checking backup authentication credentials',
        details: 'Validating secondary OAuth apps for failover',
        icon: '🔑',
        delay: 6500
      },
      {
        type: 'action' as const,
        message: 'Agent sending Slack alert to MSTIC team',
        details: '#mstic-alerts: LinkedIn TI collection DOWN - OAuth cascade failure detected',
        icon: '💬',
        delay: 8000
      },
      {
        type: 'action' as const,
        message: 'Deploying backup OAuth credentials',
        details: 'Activating linkedin-backup-app-2 with fresh token rotation',
        icon: '⚡',
        delay: 9500
      },
      {
        type: 'resolution' as const,
        message: 'TI collection restored - 847 C2 domains now processing',
        details: 'APT28 and Lazarus Group monitoring resumed. ETA to full sync: 8 minutes',
        icon: '✅',
        delay: 11000
      }
    ]
  },
  {
    id: 'azure-ad-performance',
    title: 'Azure AD Graph API Performance Crisis',
    severity: 'critical' as const,
    steps: [
      {
        type: 'alert' as const,
        message: 'CRITICAL: Azure AD Graph API 400% latency spike',
        details: 'Sign-in analysis pipeline severely degraded - 12,847 events backlogged',
        icon: '🚨',
        delay: 0
      },
      {
        type: 'investigation' as const,
        message: 'Agent analyzing API response times...',
        details: 'Baseline: 0.6s → Current: 2.3s avg response time',
        icon: '📊',
        delay: 2500
      },
      {
        type: 'action' as const,
        message: 'Querying Azure Service Health API',
        details: 'GET /servicehealth/issues?service=AzureActiveDirectory',
        icon: '🌐',
        delay: 4000
      },
      {
        type: 'investigation' as const,
        message: 'Checking impossible travel detection pipeline',
        details: 'Nation-state attribution delayed by 45+ minutes',
        icon: '🛡️',
        delay: 5500
      },
      {
        type: 'action' as const,
        message: 'Implementing request batching optimization',
        details: 'Reducing API calls from 1,200/min to 300/min via batching',
        icon: '⚙️',
        delay: 7000
      },
      {
        type: 'action' as const,
        message: 'Scaling Azure Functions horizontally',
        details: 'Deploying 8 additional instances for parallel processing',
        icon: '🚀',
        delay: 8500
      },
      {
        type: 'action' as const,
        message: 'Activating backup Office 365 audit pipeline',
        details: 'Switching to O365 Management API for sign-in analysis',
        icon: '🔄',
        delay: 10000
      },
      {
        type: 'action' as const,
        message: 'Sending Teams notification to Azure Support',
        details: 'Escalating to Microsoft: Premium Graph API quota increase requested',
        icon: '📞',
        delay: 11500
      },
      {
        type: 'resolution' as const,
        message: 'Performance restored - Processing backlog cleared',
        details: 'Latency: 0.8s avg. Impossible travel detection back online.',
        icon: '✅',
        delay: 13000
      }
    ]
  },
  {
    id: 'github-malware-intel',
    title: 'GitHub Malware Collection Rate Limit Crisis',
    severity: 'warning' as const,
    steps: [
      {
        type: 'alert' as const,
        message: 'WARNING: GitHub API rate limit exhausted',
        details: 'Malware repository monitoring stopped - 234 repos pending analysis',
        icon: '⚠️',
        delay: 0
      },
      {
        type: 'investigation' as const,
        message: 'Agent checking GitHub API quota usage',
        details: 'Rate limit: 5000/5000 requests used in current hour',
        icon: '📈',
        delay: 2000
      },
      {
        type: 'action' as const,
        message: 'Querying malware repo database for priorities',
        details: 'SELECT repo_url FROM malware_repos WHERE confidence > 0.9 ORDER BY last_commit DESC',
        icon: '🗄️',
        delay: 3500
      },
      {
        type: 'investigation' as const,
        message: 'Analyzing 15 new malware families discovered',
        details: 'C2 framework detection pipeline 8 hours behind schedule',
        icon: '🔬',
        delay: 5000
      },
      {
        type: 'action' as const,
        message: 'Deploying backup GitHub Apps with fresh quotas',
        details: 'Activating github-malware-scanner-backup with 5000 requests',
        icon: '🔧',
        delay: 6500
      },
      {
        type: 'action' as const,
        message: 'Implementing intelligent sampling algorithm',
        details: 'Prioritizing high-confidence repos, deferring low-risk analysis',
        icon: '🧠',
        delay: 8000
      },
      {
        type: 'action' as const,
        message: 'Sending email alert to DevOps team',
        details: 'To: devops@mstic.microsoft.com - GitHub quota management review needed',
        icon: '📧',
        delay: 9500
      },
      {
        type: 'resolution' as const,
        message: 'Malware collection resumed with smart prioritization',
        details: 'High-priority repos processing. Next quota reset in 47 minutes.',
        icon: '✅',
        delay: 11000
      }
    ]
  },
  {
    id: 'cross-platform-auth',
    title: 'Multi-Platform Authentication Anomaly',
    severity: 'warning' as const,
    steps: [
      {
        type: 'alert' as const,
        message: 'ANOMALY: Cross-platform auth failures detected',
        details: 'Twitter, LinkedIn, GitHub APIs showing coordinated auth issues',
        icon: '🔐',
        delay: 0
      },
      {
        type: 'investigation' as const,
        message: 'Agent correlating failure patterns across platforms',
        details: 'Temporal correlation suggests shared infrastructure issue',
        icon: '🕸️',
        delay: 2000
      },
      {
        type: 'action' as const,
        message: 'Checking auth service logs',
        details: 'grep "authentication_failed" /var/log/auth-service/*.log | tail -100',
        icon: '📋',
        delay: 3500
      },
      {
        type: 'investigation' as const,
        message: 'Analyzing DNS resolution for API endpoints',
        details: 'Testing connectivity to api.twitter.com, api.linkedin.com, api.github.com',
        icon: '🌍',
        delay: 5000
      },
      {
        type: 'action' as const,
        message: 'Running network diagnostics',
        details: 'traceroute and latency tests to external API endpoints',
        icon: '🔌',
        delay: 6500
      },
      {
        type: 'action' as const,
        message: 'Deduplicating alerts to prevent noise',
        details: 'Grouping 47 related auth failures into single incident',
        icon: '🎯',
        delay: 8000
      },
      {
        type: 'resolution' as const,
        message: 'Network issue resolved - APIs responding normally',
        details: 'ISP routing fixed. All authentication services restored.',
        icon: '✅',
        delay: 9500
      }
    ]
  },
  {
    id: 'threat-actor-surge',
    title: 'Threat Actor Data Surge Overload',
    severity: 'warning' as const,
    steps: [
      {
        type: 'alert' as const,
        message: 'CAPACITY: Threat actor data surge detected',
        details: 'Processing pipeline 300% above normal - APT campaign suspected',
        icon: '📈',
        delay: 0
      },
      {
        type: 'investigation' as const,
        message: 'Agent analyzing data volume patterns',
        details: 'LinkedIn profiles: +2,847 suspicious accounts, GitHub: +156 malware repos',
        icon: '📊',
        delay: 2000
      },
      {
        type: 'action' as const,
        message: 'Scaling Kubernetes pods for data processing',
        details: 'kubectl scale deployment threat-processor --replicas=12',
        icon: '☸️',
        delay: 3500
      },
      {
        type: 'investigation' as const,
        message: 'Correlating with MITRE ATT&CK frameworks',
        details: 'Pattern matches T1566 (Phishing), T1583 (Acquire Infrastructure)',
        icon: '🎯',
        delay: 5000
      },
      {
        type: 'action' as const,
        message: 'Implementing data prioritization algorithm',
        details: 'Processing high-confidence threats first, deferring noise',
        icon: '🔢',
        delay: 6500
      },
      {
        type: 'action' as const,
        message: 'Alert SOC team via Microsoft Teams',
        details: 'Potential APT campaign detected - requesting analyst review',
        icon: '👥',
        delay: 8000
      },
      {
        type: 'resolution' as const,
        message: 'Surge processed - 23 high-confidence threats identified',
        details: 'APT campaign confirmed. Intel forwarded to threat hunting team.',
        icon: '✅',
        delay: 9500
      }
    ]
  }
];

const AutonomousAgent: React.FC = () => {
  const [agentState, setAgentState] = useState<AgentState>(initialAgentState);
  const [selectedView, setSelectedView] = useState<'status' | 'investigation' | 'findings' | 'activity' | 'config' | 'demo' | 'realtime'>('realtime');
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>('azure-ad-anomaly');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [simulationLogs, setSimulationLogs] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'alert' | 'investigation' | 'action' | 'resolution';
    message: string;
    details?: string;
    severity?: 'critical' | 'warning' | 'info' | 'success';
    icon?: string;
  }>>([]);

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

  // Real-time simulation functions
  const runRealtimeSimulation = useCallback((scenarioId: string) => {
    const scenario = realtimeSimulationScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    setSimulationRunning(true);
    setSimulationLogs([]);
    setCurrentStep(0);

    scenario.steps.forEach((step, index) => {
      setTimeout(() => {
        const logEntry = {
          id: `${scenario.id}-${index}`,
          timestamp: new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          }),
          type: step.type,
          message: step.message,
          details: step.details,
          severity: scenario.severity,
          icon: step.icon
        };

        setSimulationLogs(prev => [...prev, logEntry]);
        setCurrentStep(index + 1);

        // Mark simulation as complete when last step is reached
        if (index === scenario.steps.length - 1) {
          setTimeout(() => setSimulationRunning(false), 1000);
        }
      }, step.delay);
    });
  }, []);

  const clearSimulation = () => {
    setSimulationLogs([]);
    setSimulationRunning(false);
    setCurrentStep(0);
  };

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

  // Demo scenario handler
  const loadDemoScenario = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    const scenario = createMockInvestigation(scenarioId, mockAgentTriggers[0]);
    setAgentState(prev => ({
      ...prev,
      currentInvestigation: scenario,
      status: 'investigating'
    }));
  };

  const renderDemoScenarios = () => (
    <div className={styles.demoScenarios}>
      <div className={styles.demoHeader}>
        <h3>MSTIC Threat Intelligence Pipeline - Live Demo Scenarios</h3>
        <p>Interactive demonstration of autonomous agent handling real-world MSTIC alert scenarios</p>
      </div>
      
      <div className={styles.scenarioGrid}>
        <div 
          className={`${styles.scenarioCard} ${selectedScenario === 'azure-ad-anomaly' ? styles.active : ''}`}
          onClick={() => loadDemoScenario('azure-ad-anomaly')}
        >
          <div className={styles.scenarioHeader}>
            <AlertTriangle className={styles.scenarioIcon} />
            <h4>Azure AD Performance Crisis</h4>
            <span className={styles.severity}>CRITICAL</span>
          </div>
          <p><strong>Scenario:</strong> Graph API 400% latency spike affecting threat detection</p>
          <div className={styles.scenarioDetails}>
            <span>• Impossible travel detection delayed 45min</span>
            <span>• 12,847 sign-in events in backlog</span>
            <span>• Nation-state attribution pipeline down</span>
          </div>
          <div className={styles.scenarioTech}>
            <span>Azure Graph API</span>
            <span>Sign-in Analytics</span>
            <span>MITRE ATT&CK</span>
          </div>
        </div>

        <div 
          className={`${styles.scenarioCard} ${selectedScenario === 'linkedin-auth-cascade' ? styles.active : ''}`}
          onClick={() => loadDemoScenario('linkedin-auth-cascade')}
        >
          <div className={styles.scenarioHeader}>
            <Clock className={styles.scenarioIcon} />
            <h4>LinkedIn TI Collection Failure</h4>
            <span className={styles.severity}>HIGH</span>
          </div>
          <p><strong>Scenario:</strong> OAuth token expiration causing threat intelligence blackout</p>
          <div className={styles.scenarioDetails}>
            <span>• APT28, Lazarus Group monitoring down</span>
            <span>• 847 C2 domains unanalyzed</span>
            <span>• EU region 89% failure rate</span>
          </div>
          <div className={styles.scenarioTech}>
            <span>OAuth 2.0</span>
            <span>LinkedIn API</span>
            <span>Threat Actor Tracking</span>
          </div>
        </div>

        <div 
          className={`${styles.scenarioCard} ${selectedScenario === 'github-threat-intel' ? styles.active : ''}`}
          onClick={() => loadDemoScenario('github-threat-intel')}
        >
          <div className={styles.scenarioHeader}>
            <Search className={styles.scenarioIcon} />
            <h4>GitHub Malware Collection Down</h4>
            <span className={styles.severity}>HIGH</span>
          </div>
          <p><strong>Scenario:</strong> Rate limit exhaustion halting malware intelligence</p>
          <div className={styles.scenarioDetails}>
            <span>• 234 malware repos unmonitored</span>
            <span>• 15 new malware families missed</span>
            <span>• C2 framework detection 8h behind</span>
          </div>
          <div className={styles.scenarioTech}>
            <span>GitHub API</span>
            <span>Malware Analysis</span>
            <span>IOC Extraction</span>
          </div>
        </div>
      </div>

      <div className={styles.demoExplanation}>
        <h4>How This Demonstrates MSTIC Capabilities:</h4>
        <div className={styles.capabilityGrid}>
          <div className={styles.capability}>
            <TrendingUp className={styles.capabilityIcon} />
            <h5>Real-time Threat Intelligence</h5>
            <p>Monitors 160+ pipelines collecting data from LinkedIn, Twitter, GitHub, Azure AD for threat actor tracking, malware analysis, and C2 infrastructure discovery</p>
          </div>
          <div className={styles.capability}>
            <Brain className={styles.capabilityIcon} />
            <h5>Autonomous Investigation</h5>
            <p>AI agent automatically correlates failures, identifies root causes, and provides actionable remediation steps based on historical patterns and MSTIC expertise</p>
          </div>
          <div className={styles.capability}>
            <CheckCircle className={styles.capabilityIcon} />
            <h5>Operational Resilience</h5>
            <p>Implements circuit breakers, regional failover, and backup systems to ensure continuous threat intelligence collection for national security operations</p>
          </div>
        </div>
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

  const renderRealtimeSimulation = () => (
    <div className={styles.realtimeSimulation}>
      <div className={styles.realtimeHeader}>
        <h3>🚀 MSTIC Real-Time Agent Demonstration</h3>
        <p>Watch the AI agent handle live threat intelligence pipeline alerts in real-time</p>
        <div className={styles.interviewNote}>
          <strong>For Microsoft Interview:</strong> This demonstrates data troubleshooting, automation, and infrastructure monitoring skills
        </div>
      </div>

      <div className={styles.scenarioSelector}>
        <h4>Select a Live Scenario:</h4>
        <div className={styles.scenarioButtons}>
          {realtimeSimulationScenarios.map(scenario => (
            <button
              key={scenario.id}
              className={`${styles.scenarioButton} ${styles[scenario.severity]}`}
              onClick={() => runRealtimeSimulation(scenario.id)}
              disabled={simulationRunning}
            >
              <span className={styles.scenarioTitle}>{scenario.title}</span>
              <span className={styles.scenarioSeverity}>{scenario.severity.toUpperCase()}</span>
            </button>
          ))}
        </div>
        {simulationLogs.length > 0 && (
          <button 
            className={styles.clearButton}
            onClick={clearSimulation}
            disabled={simulationRunning}
          >
            Clear Logs
          </button>
        )}
      </div>

      <div className={styles.simulationConsole}>
        <div className={styles.consoleHeader}>
          <h4>🖥️ Live Agent Console</h4>
          {simulationRunning && (
            <div className={styles.runningIndicator}>
              <div className={styles.pulse}></div>
              SIMULATION RUNNING
              {currentStep > 0 && (
                <span className={styles.stepProgress}>
                  Step {currentStep} / {realtimeSimulationScenarios.find(s => 
                    simulationLogs.length > 0 && simulationLogs[0].id.startsWith(s.id)
                  )?.steps.length || 0}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.logContainer}>
          {simulationLogs.map((log, index) => (
            <div 
              key={log.id} 
              className={`${styles.logEntry} ${styles[log.type]} ${simulationLogs.length - 1 === index ? styles.latest : ''}`}
            >
              <div className={styles.logTimestamp}>[{log.timestamp}]</div>
              <div className={styles.logIcon}>{log.icon}</div>
              <div className={styles.logContent}>
                <div className={styles.logMessage}>{log.message}</div>
                {log.details && <div className={styles.logDetails}>{log.details}</div>}
              </div>
              <div className={`${styles.logType} ${styles[log.type]}`}>
                {log.type.toUpperCase()}
              </div>
            </div>
          ))}
          
          {simulationLogs.length === 0 && (
            <div className={styles.emptyConsole}>
              <div className={styles.emptyMessage}>
                <Brain size={48} />
                <h4>Agent Ready</h4>
                <p>Select a scenario above to see the AI agent in action</p>
                <div className={styles.capabilities}>
                  <span>🔍 Real-time Investigation</span>
                  <span>🗄️ Database Queries</span>
                  <span>📊 Log Analysis</span>
                  <span>💬 Team Notifications</span>
                  <span>⚡ Auto-remediation</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.technicalSkills}>
        <h4>🎯 Skills Demonstrated:</h4>
        <div className={styles.skillsGrid}>
          <div className={styles.skill}>
            <strong>Data Troubleshooting:</strong> Real-time pipeline diagnosis, performance analysis, root cause identification
          </div>
          <div className={styles.skill}>
            <strong>Infrastructure Monitoring:</strong> API health checks, service scaling, resource optimization
          </div>
          <div className={styles.skill}>
            <strong>Database Operations:</strong> Query optimization, log analysis, data correlation across systems
          </div>
          <div className={styles.skill}>
            <strong>Automation & Scripts:</strong> Automated remediation, intelligent alerting, workflow orchestration
          </div>
          <div className={styles.skill}>
            <strong>Communication:</strong> Slack/Teams integration, email alerts, incident escalation procedures
          </div>
          <div className={styles.skill}>
            <strong>Adaptability:</strong> Multi-platform integration, backup systems, intelligent priority handling
          </div>
        </div>
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
          <button 
            className={`${styles.howItWorksButton} ${styles.challengesButton}`}
            onClick={() => setShowChallenges(true)}
            title="Implementation Challenges"
          >
            <Shield size={16} />
            Implementation Challenges
          </button>
          <div className={styles.agentIndicator}>
            <div className={`${styles.statusDot} ${styles[agentState.status]}`}></div>
            <span>Last activity: {formatTime(agentState.lastActivity)}</span>
          </div>
        </div>
      </div>

      <div className={styles.navigation}>
        <button 
          className={selectedView === 'realtime' ? styles.active : ''}
          onClick={() => setSelectedView('realtime')}
        >
          <Activity size={16} />
          Real-time Demo
        </button>
      </div>

      <div className={styles.content}>
        {selectedView === 'realtime' && renderRealtimeSimulation()}
      </div>
      
      <HowItWorksModal 
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
        section="autonomousAgent"
      />
      
      <ChallengesModal
        isOpen={showChallenges}
        onClose={() => setShowChallenges(false)}
        section="autonomousAgent"
      />
    </div>
  );
};

export default AutonomousAgent;
